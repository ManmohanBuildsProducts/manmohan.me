const root = document.documentElement;
const reduce =
  root.dataset.motion === "reduce" ||
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!root.classList.contains("js")) {
  root.classList.add("js");
  root.dataset.motion = reduce ? "reduce" : "ok";
  root.dataset.age = reduce ? "5" : "1";
  root.dataset.fog = "";
}

const articles = [...document.querySelectorAll<HTMLElement>("[data-age-card]")];
const max = articles.length;
const live = document.querySelector<HTMLElement>("[data-live]");
const banner = document.querySelector<HTMLElement>("[data-banner]");
const ambient = document.querySelector<HTMLElement>("[data-ambient]");
const waves = document.querySelector<SVGGElement>(".waves");
const clouds = document.querySelector<SVGGElement>(".clouds");
const motionOk = !reduce;

let age = reduce ? max : Number(root.dataset.age || 0);
let primed = false;
let bannerTimer = 0;

function articleByOrder(order: number) {
  return articles.find((card) => Number(card.dataset.order) === order);
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

function showBanner(card: HTMLElement, hold?: number) {
  announce(card);
  if (!motionOk || !banner) return;
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
  const ms = hold ?? (card.dataset.wonder === "true" ? 2400 : 1500);
  bannerTimer = window.setTimeout(() => {
    banner.hidden = true;
    banner.classList.remove("on");
  }, ms);
}

function rise(order: number) {
  if (!motionOk) return;
  document.querySelectorAll(".rising").forEach((el) => el.classList.remove("rising"));
  const era = document.querySelector<SVGGElement>(`.isl-era[data-order="${order}"]`);
  const card = articleByOrder(order);
  if (!era) return;
  if (card?.dataset.wonder === "true") era.classList.add("wonder-rise");
  era.classList.add("rising");
  window.setTimeout(() => era.classList.remove("rising", "wonder-rise"), 1200);
}

function syncAmbient(_order: number) {
  if (!ambient) return;
  ambient.hidden = true;
}

function mountSprites(order: number) {
  document.querySelectorAll<SVGImageElement>("image[data-src]").forEach((img) => {
    const host = img.closest<SVGElement>("[data-order]");
    const need = Number(host?.getAttribute("data-order") || 0);
    if (need <= order && !img.getAttribute("href")) img.setAttribute("href", img.dataset.src || "");
  });
}

function setDay(value: number) {
  const next = Math.max(0, Math.min(1, value));
  root.style.setProperty("--day", next.toFixed(3));
}

function dayFromScroll() {
  if (root.dataset.intro !== "play" && window.scrollY < window.innerHeight * 0.22) return 1;
  const first = articles[0];
  const last = articles[articles.length - 1];
  if (!first || !last) return 1;
  const focus = window.innerHeight * 0.74;
  const a = first.getBoundingClientRect().top;
  const b = last.getBoundingClientRect().top;
  if (Math.abs(b - a) < 1) return 1;
  return (focus - a) / (b - a);
}

function paint(order: number) {
  const next = Math.max(0, Math.min(max, order));
  if (!reduce) root.dataset.age = String(next);
  age = next;
  highlight(next);
  syncAmbient(next);
  mountSprites(next);
  setDay(introActive() ? next / Math.max(1, max) : dayFromScroll());
}

function applyAge(order: number, withBanner: boolean, hold?: number) {
  const prev = age;
  paint(order);
  if (withBanner && order > prev && order > 0) {
    const card = articleByOrder(order);
    if (!card) return;
    rise(order);
    showBanner(card, hold);
  }
}

function ageFromScroll() {
  if (root.dataset.intro !== "play" && window.scrollY < window.innerHeight * 0.22) return max;
  const line = window.innerHeight * 0.42;
  let current = 1;
  for (const card of articles) {
    const heading = card.querySelector("h3");
    const y = (heading ?? card).getBoundingClientRect().top;
    if (y <= line) current = Number(card.dataset.order);
  }
  return current;
}

function syncFog() {
  const section = document.getElementById("islands");
  if (!section) return;
  const top = section.getBoundingClientRect().top;
  if (top < window.innerHeight * 0.78) root.dataset.fog = "agents";
  else if ((root.dataset.fog || "").includes("agents")) root.dataset.fog = "";
}

function syncParallax() {
  if (!motionOk) return;
  const shift = Math.round(window.scrollY * 0.05);
  waves?.setAttribute("transform", `translate(${shift * 0.35} ${shift})`);
  clouds?.setAttribute("transform", `translate(${-shift * 0.7} 0)`);
}

function syncReading() {
  const pin = document.querySelector(".pin");
  const first = articles[0];
  if (!pin || !first) return;
  const reading = first.getBoundingClientRect().top < window.innerHeight * 0.82;
  pin.classList.toggle("is-reading", reading);
}

function introActive() {
  return root.dataset.intro === "play" || root.dataset.intro === "run";
}

let introLock = introActive();
const introTimers: number[] = [];
const INTRO_KEY = "mm-island-intro";

function endIntro() {
  if (!introActive()) return;
  introTimers.forEach((timer) => window.clearTimeout(timer));
  introTimers.length = 0;
  introLock = false;
  root.dataset.intro = "done";
  try {
    sessionStorage.setItem(INTRO_KEY, "1");
  } catch {
    /* private mode */
  }
  if (banner) {
    banner.hidden = true;
    banner.classList.remove("on");
  }
  paint(max);
  if (window.scrollY > 0) window.scrollTo(0, 0);
}

function playIntro() {
  if (!introLock || reduce) return;
  const titleHold = 1700;
  const step = 880;
  for (let order = 1; order <= max; order += 1) {
    introTimers.push(
      window.setTimeout(() => {
        if (!introLock) return;
        if (order === 1) root.dataset.intro = "run";
        applyAge(order, true, 760);
      }, titleHold + (order - 1) * step),
    );
  }
  introTimers.push(window.setTimeout(endIntro, titleHold + max * step));
}

function onScroll() {
  syncParallax();
  syncFog();
  syncReading();
  if (introLock) return;
  setDay(dayFromScroll());
  if (reduce) {
    highlight(ageFromScroll());
    return;
  }
  const next = ageFromScroll();
  if (!primed) {
    paint(next);
    primed = true;
    return;
  }
  if (next !== age) applyAge(next, next > age);
}

let ticking = false;
window.addEventListener(
  "scroll",
  () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      onScroll();
    });
  },
  { passive: true },
);

document.querySelector(".isl-svg")?.addEventListener("click", (event) => {
  const target = event.target as Element | null;
  const scout = target?.closest<HTMLElement>("[data-scout]");
  if (!scout) return;
  event.preventDefault();
  root.dataset.fog = "agents";
  document.getElementById("island-agents")?.focus({ preventScroll: false });
});

document.querySelector("[data-skip-intro]")?.addEventListener("click", (event) => {
  event.preventDefault();
  endIntro();
});

window.addEventListener("keydown", (event) => {
  if (!introLock || event.key === "Tab") return;
  endIntro();
});

window.addEventListener("pointerdown", (event) => {
  if (!introLock) return;
  const target = event.target as Element | null;
  if (target?.closest("[data-skip-intro]")) return;
  endIntro();
});

window.addEventListener(
  "wheel",
  () => {
    if (!introLock) return;
    endIntro();
  },
  { passive: true },
);

window.addEventListener(
  "touchmove",
  () => {
    if (!introLock) return;
    endIntro();
  },
  { passive: true },
);

if (introLock) playIntro();
else requestAnimationFrame(onScroll);
