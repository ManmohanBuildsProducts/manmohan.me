const root = document.documentElement;
const reduce =
  root.dataset.motion === "reduce" ||
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!root.classList.contains("js")) {
  root.classList.add("js");
  root.dataset.motion = reduce ? "reduce" : "ok";
  root.dataset.age = reduce ? "5" : "0";
  root.dataset.fog = "";
}

const articles = [...document.querySelectorAll<HTMLElement>("[data-age-card]")];
const max = articles.length;
const advanceBtn = document.querySelector<HTMLButtonElement>("[data-advance]");
const replayBtn = document.querySelector<HTMLButtonElement>("[data-replay]");
const statusEl = document.querySelector<HTMLElement>("[data-status]");
const live = document.querySelector<HTMLElement>("[data-live]");
const banner = document.querySelector<HTMLElement>("[data-banner]");
const bubble = document.querySelector<HTMLElement>("[data-bubble]");
const stage = document.querySelector<HTMLElement>(".stage");
const motionOk = !reduce;

let age = reduce ? 0 : Number(root.dataset.age || 0);
let replaying = false;
let lockUntil = 0;
let bannerTimer = 0;
let replayTimers: number[] = [];

function behavior(): ScrollBehavior {
  return motionOk ? "smooth" : "auto";
}

function articleByOrder(order: number) {
  return articles.find((card) => Number(card.dataset.order) === order);
}

function syncStage() {
  if (!stage || window.innerWidth >= 1100) return;
  root.style.setProperty("--stage-h", `${stage.offsetHeight + 10}px`);
}

function updateQueue() {
  document.querySelectorAll<HTMLElement>("[data-queue]").forEach((link) => {
    const n = Number(link.dataset.queue);
    const on = reduce || n <= age;
    link.classList.toggle("is-on", on);
    link.classList.toggle("is-now", n === age && age > 0);
    if (n === age && age > 0) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });
}

function updateStatus() {
  if (!statusEl) return;
  if (age <= 0) {
    statusEl.textContent = reduce ? "All five ages are on the island." : "Five plots marked.";
    return;
  }
  const card = articleByOrder(age);
  if (!card) return;
  statusEl.textContent = `Age ${card.dataset.numeral} of V · ${card.dataset.name}`;
}

function updateAdvance() {
  if (!advanceBtn) return;
  if (age >= max) {
    advanceBtn.disabled = true;
    advanceBtn.textContent = "Ages raised";
    return;
  }
  const next = articleByOrder(age + 1) ?? articles[age];
  advanceBtn.disabled = false;
  advanceBtn.textContent = "Advance age";
  advanceBtn.removeAttribute("aria-label");
}

function highlight(order: number) {
  articles.forEach((card) => {
    card.classList.toggle("is-current", Number(card.dataset.order) === order && order > 0);
  });
}

function announce(card: HTMLElement) {
  if (!live) return;
  const kicker = card.dataset.bannerKicker ?? "";
  const title = card.dataset.bannerTitle ?? "";
  const line = card.dataset.bannerLine ?? "";
  live.textContent = `${kicker}. ${title}. ${line}`;
}

function fillKicker(el: HTMLElement, text: string) {
  const match = text.match(/^(.*?\b)(IV|III|II|V|I)(\b.*)$/);
  el.replaceChildren();
  if (!match) {
    el.textContent = text;
    return;
  }
  el.append(match[1]);
  const numeral = document.createElement("span");
  numeral.className = "banner-num";
  numeral.textContent = match[2];
  el.append(numeral, match[3]);
}

function showBanner(card: HTMLElement) {
  announce(card);
  if (!motionOk || !banner) {
    if (card.dataset.speaker) showPerson(card.dataset.speaker);
    return;
  }
  if (bubble) bubble.hidden = true;
  const k = banner.querySelector<HTMLElement>("[data-banner-k]");
  const t = banner.querySelector<HTMLElement>("[data-banner-t]");
  const d = banner.querySelector<HTMLElement>("[data-banner-d]");
  if (k) fillKicker(k, card.dataset.bannerKicker ?? "");
  if (t) t.textContent = card.dataset.bannerTitle ?? "";
  if (d) d.textContent = card.dataset.bannerLine ?? "";
  banner.classList.toggle("wonder", card.dataset.wonder === "true");
  banner.hidden = false;
  banner.classList.remove("on");
  const frame = document.querySelector(".isl-frame");
  frame?.classList.remove("age-flash");
  void banner.offsetWidth;
  banner.classList.add("on");
  frame?.classList.add("age-flash");
  window.clearTimeout(bannerTimer);
  bannerTimer = window.setTimeout(() => {
    banner.hidden = true;
    banner.classList.remove("on");
    if (card.dataset.speaker) showPerson(card.dataset.speaker);
  }, card.dataset.wonder === "true" ? 2700 : 1650);
}

function positionBubble() {
  if (!bubble || bubble.hidden) return;
  bubble.classList.remove("side");
  bubble.style.left = "34%";
  bubble.style.top = "11%";
  bubble.style.transform = "translate(-50%, 0)";
}

function showPerson(id: string) {
  if (!bubble) return;
  const card = document.getElementById(`person-${id}`);
  if (!card) return;
  bubble.textContent = card.dataset.line ?? "";
  bubble.dataset.for = id;
  bubble.hidden = false;
  document.querySelectorAll(".speaking").forEach((el) => el.classList.remove("speaking"));
  document.querySelector(`.isl-npc[data-id="${id}"]`)?.classList.add("speaking");
  positionBubble();
}

function hideBubble() {
  if (!bubble) return;
  bubble.hidden = true;
  delete bubble.dataset.for;
  document.querySelectorAll(".speaking").forEach((el) => el.classList.remove("speaking"));
}

function paint(order: number) {
  if (!reduce) root.dataset.age = String(order);
  age = order;
  updateQueue();
  updateStatus();
  updateAdvance();
  highlight(order);
}

function rise(order: number) {
  if (!motionOk) return;
  document.querySelectorAll(".rising").forEach((el) => el.classList.remove("rising"));
  const era = document.querySelector<SVGGElement>(`.isl-era[data-order="${order}"]`);
  if (!era) return;
  const card = articleByOrder(order);
  if (card?.dataset.wonder === "true") era.classList.add("wonder-rise");
  era.classList.add("rising");
  window.setTimeout(() => era.classList.remove("rising", "wonder-rise"), 1400);
}

function applyAge(order: number, withBanner: boolean) {
  const prev = age;
  const next = Math.max(0, Math.min(max, order));
  paint(next);
  if (withBanner && next > prev && next > 0) {
    const card = articleByOrder(next);
    if (!card) return;
    rise(next);
    showBanner(card);
  }
  if (next === 0) hideBubble();
}

function scrollToEl(el: HTMLElement | null) {
  if (!el) return;
  lockUntil = performance.now() + (motionOk ? 800 : 40);
  el.scrollIntoView({ behavior: behavior(), block: "start" });
}

function visibleOrder() {
  const line = window.innerHeight * (window.innerWidth >= 1100 ? 0.7 : 0.78);
  for (const card of articles) {
    const rect = card.getBoundingClientRect();
    if (rect.top <= line && rect.bottom >= line) return Number(card.dataset.order);
  }
  return 0;
}

function stopReplay() {
  replaying = false;
  replayTimers.forEach((id) => window.clearTimeout(id));
  replayTimers = [];
}

function openFog(id: string) {
  const open = new Set((root.dataset.fog || "").split(" ").filter(Boolean));
  open.add(id);
  root.dataset.fog = [...open].join(" ");
  document.querySelectorAll<HTMLElement>(`[data-scout="${id}"]`).forEach((el) => {
    el.setAttribute("aria-pressed", "true");
    if (el instanceof HTMLButtonElement) el.textContent = "Scouted";
  });
  if (live) live.textContent = "Agent experiments. Scouted. It gets built as the experiments ship.";
}

function closeFog() {
  root.dataset.fog = "";
  document.querySelectorAll<HTMLElement>("[data-scout]").forEach((el) => {
    el.setAttribute("aria-pressed", "false");
    if (el instanceof HTMLButtonElement) el.textContent = "Scout the fog";
  });
}

function replay() {
  stopReplay();
  closeFog();
  hideBubble();
  if (banner) banner.hidden = true;
  if (reduce) {
    paint(0);
    highlight(0);
    if (live) live.textContent = "Replayed. All five ages stay on the island.";
    document.getElementById("ages")?.scrollIntoView({ behavior: "auto", block: "start" });
    return;
  }
  replaying = true;
  applyAge(0, false);
  document.querySelector(".saga")?.scrollIntoView({ behavior: behavior(), block: "center" });
  let wait = 650;
  articles.forEach((card, index) => {
    const hold = card.dataset.wonder === "true" ? 2500 : 1350;
    replayTimers.push(
      window.setTimeout(() => {
        if (!replaying) return;
        applyAge(index + 1, true);
      }, wait),
    );
    wait += hold;
  });
  replayTimers.push(
    window.setTimeout(() => {
      replaying = false;
    }, wait + 200),
  );
}

advanceBtn?.addEventListener("click", () => {
  stopReplay();
  if (age >= max) return;
  const next = age + 1;
  applyAge(next, true);
  scrollToEl(articleByOrder(next) ?? null);
});

replayBtn?.addEventListener("click", replay);

document.querySelector(".isl-svg")?.addEventListener("click", (event) => {
  const target = event.target as Element | null;
  if (!target) return;
  const scout = target.closest<HTMLElement>("[data-scout]");
  if (scout) {
    event.preventDefault();
    stopReplay();
    openFog(scout.dataset.scout || "agents");
    return;
  }
  const era = target.closest<SVGGElement>(".isl-era");
  if (era) {
    event.preventDefault();
    stopReplay();
    const order = Number(era.dataset.order);
    if (!reduce && order > age) applyAge(order, true);
    else highlight(order);
    scrollToEl(document.getElementById(era.dataset.id || ""));
    return;
  }
  const npc = target.closest<SVGGraphicsElement>(".isl-npc");
  if (npc?.dataset.id) {
    event.preventDefault();
    showPerson(npc.dataset.id);
  }
});

document.querySelectorAll<HTMLAnchorElement>("[data-queue]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    stopReplay();
    const order = Number(link.dataset.queue);
    if (!reduce && order > age) applyAge(order, true);
    else {
      const card = articleByOrder(order);
      if (reduce) {
        paint(order);
        if (card) announce(card);
      } else highlight(order);
    }
    scrollToEl(articleByOrder(order) ?? null);
  });
});

document.querySelectorAll<HTMLButtonElement>("button[data-scout]").forEach((button) => {
  button.addEventListener("click", () => {
    stopReplay();
    const id = button.dataset.scout || "agents";
    openFog(id);
    scrollToEl(stage);
  });
});

window.addEventListener(
  "scroll",
  () => {
    if (replaying || performance.now() < lockUntil) return;
    const seen = visibleOrder();
    if (seen > age) applyAge(seen, true);
  },
  { passive: true },
);

window.addEventListener("resize", () => {
  syncStage();
  positionBubble();
}, { passive: true });

window.addEventListener(
  "wheel",
  () => {
    if (replaying) stopReplay();
  },
  { passive: true },
);

const hash = location.hash.replace("#", "");
if (hash) {
  const card = articles.find((item) => item.id === hash);
  if (card) {
    const order = Number(card.dataset.order);
    if (!reduce && order > age) applyAge(order, false);
    else highlight(order);
  }
  if (hash.startsWith("person-")) showPerson(hash.slice("person-".length));
}

requestAnimationFrame(() => {
  syncStage();
  const seen = visibleOrder();
  if (!hash && seen > age) applyAge(seen, false);
  updateQueue();
  updateStatus();
  updateAdvance();
});
