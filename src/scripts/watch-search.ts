import { searchReplay, type SearchMode } from '../data/search-replay';

const root = document.querySelector<HTMLElement>('[data-watch]');
if (root && root.dataset.ready !== '1') {
  root.dataset.ready = '1';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const qEl = root.querySelector<HTMLElement>('[data-q]')!;
  const kindEl = root.querySelector<HTMLElement>('[data-kind]')!;
  const list = root.querySelector<HTMLElement>('[data-rows]')!;
  const live = root.querySelector<HTMLElement>('[data-live]')!;
  const pauseBtn = root.querySelector<HTMLButtonElement>('[data-pause]')!;
  const modeBtns = [...root.querySelectorAll<HTMLButtonElement>('[data-mode]')];
  const queryBtns = [...root.querySelectorAll<HTMLButtonElement>('[data-qi]')];

  let qi = 0;
  let mode: SearchMode = 'hybrid';
  let paused = reduce;
  let gen = 0;
  let timer = 0;

  const byId = (id: string) => list.querySelector<HTMLElement>(`[data-id="${id}"]`);

  function paintRows(order: string[]) {
    const first = new Map<HTMLElement, DOMRect>();
    if (!reduce) [...list.children].forEach((el) => first.set(el as HTMLElement, (el as HTMLElement).getBoundingClientRect()));
    order.forEach((id) => {
      const el = byId(id);
      if (el) list.appendChild(el);
    });
    if (reduce) return;
    [...list.children].forEach((node) => {
      const el = node as HTMLElement;
      const a = first.get(el);
      if (!a) return;
      const dy = a.top - el.getBoundingClientRect().top;
      if (!dy) return;
      el.style.transition = 'none';
      el.style.transform = `translateY(${dy}px)`;
      requestAnimationFrame(() => {
        el.style.transition = 'transform .5s cubic-bezier(.2,.7,.1,1)';
        el.style.transform = '';
      });
    });
  }

  function ensureRows(index: number) {
    const item = searchReplay[index];
    const have = item.rows.every((row) => byId(row.id) && byId(row.id)!.dataset.q === String(index));
    if (have) return;
    list.replaceChildren(
      ...item.rows.map((row) => {
        const li = document.createElement('li');
        li.dataset.id = row.id;
        li.dataset.q = String(index);
        if (row.expected) li.className = 'is-expected';
        li.innerHTML = `<span class="nm"></span><span class="dt"></span>`;
        li.querySelector('.nm')!.textContent = row.name;
        li.querySelector('.dt')!.textContent = row.detail;
        return li;
      }),
    );
  }

  function announce() {
    const item = searchReplay[qi];
    const top = item.rows.find((row) => row.id === item.order[mode][0]);
    const expected = item.rows.find((row) => row.expected);
    const lead = top?.expected ? 'That is the part the benchmark expects.' : `The expected part, ${expected?.name ?? 'unknown'}, is lower in the list.`;
    live.textContent = `${item.q}. ${mode}. First row, ${top?.name ?? ''}. ${lead}`;
  }

  function sync() {
    kindEl.textContent = searchReplay[qi].kind;
    modeBtns.forEach((btn) => {
      const on = btn.dataset.mode === mode;
      btn.setAttribute('aria-checked', on ? 'true' : 'false');
      btn.tabIndex = on ? 0 : -1;
    });
    queryBtns.forEach((btn) => btn.setAttribute('aria-pressed', btn.dataset.qi === String(qi) ? 'true' : 'false'));
    pauseBtn.textContent = paused ? 'Play' : 'Pause';
    pauseBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
  }

  function type(text: string) {
    const mine = ++gen;
    if (reduce || qEl.textContent === text) {
      qEl.textContent = text;
      return Promise.resolve();
    }
    qEl.textContent = '';
    return new Promise<void>((resolve) => {
      let n = 0;
      const step = () => {
        if (mine !== gen) return resolve();
        qEl.textContent = text.slice(0, ++n);
        if (n >= text.length) resolve();
        else window.setTimeout(step, 28);
      };
      step();
    });
  }

  async function show(index: number, next: SearchMode, typed: boolean) {
    qi = index;
    mode = next;
    const item = searchReplay[qi];
    sync();
    if (typed && !reduce) list.style.opacity = '0.28';
    ensureRows(qi);
    if (typed) await type(item.q);
    else qEl.textContent = item.q;
    paintRows(item.order[mode]);
    list.style.opacity = '';
    announce();
  }

  function arm() {
    window.clearTimeout(timer);
    if (paused || reduce) return;
    timer = window.setTimeout(() => {
      void show((qi + 1) % searchReplay.length, mode, true).then(arm);
    }, 4600);
  }

  function stop() {
    paused = true;
    gen++;
    window.clearTimeout(timer);
    sync();
  }

  modeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      stop();
      void show(qi, btn.dataset.mode as SearchMode, false);
    });
  });
  root.querySelector('[role="radiogroup"]')?.addEventListener('keydown', (event) => {
    const key = (event as KeyboardEvent).key;
    const dir = key === 'ArrowRight' || key === 'ArrowDown' ? 1 : key === 'ArrowLeft' || key === 'ArrowUp' ? -1 : 0;
    if (!dir) return;
    event.preventDefault();
    const names: SearchMode[] = ['keyword', 'embedding', 'hybrid'];
    const next = names[(names.indexOf(mode) + dir + names.length) % names.length];
    stop();
    void show(qi, next, false);
    modeBtns.find((btn) => btn.dataset.mode === next)?.focus();
  });
  queryBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      stop();
      void show(Number(btn.dataset.qi), mode, true);
    });
  });
  pauseBtn.addEventListener('click', () => {
    paused = !paused;
    sync();
    if (paused) {
      gen++;
      window.clearTimeout(timer);
    } else arm();
  });

  sync();
  arm();
}
