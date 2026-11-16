import {
  AmbientLight,
  BackSide,
  Box3,
  BoxGeometry,
  CanvasTexture,
  CircleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DataTexture,
  DirectionalLight,
  DoubleSide,
  Float32BufferAttribute,
  Fog,
  Group,
  HemisphereLight,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshToonMaterial,
  NearestFilter,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  RingGeometry,
  Scene,
  SphereGeometry,
  Spherical,
  SRGBColorSpace,
  TorusGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Material,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type Plot = {
  id: string;
  name: string;
  order: number;
  x: number;
  z: number;
  r: number;
  href: string;
  label: string;
};

const Y = 0.7;
const plots: Plot[] = [
  { id: "workshop", name: "Workshop", order: 0, x: -10.6, z: 5.4, r: 1.35, href: "#build", label: "The Workshop" },
  { id: "blinkit", name: "Blinkit", order: 1, x: -7.1, z: 1.2, r: 1.65, href: "#blinkit", label: "Blinkit" },
  { id: "bijak", name: "Bijak", order: 2, x: -3.3, z: -2.0, r: 1.75, href: "#bijak", label: "Bijak" },
  { id: "tago", name: "Tago Care", order: 3, x: 0.5, z: 2.15, r: 1.65, href: "#tago", label: "Tago Care" },
  { id: "badho", name: "Badho", order: 4, x: 4.3, z: -1.35, r: 2.25, href: "#badho", label: "Badho" },
  { id: "gobble", name: "GobbleCube", order: 5, x: 8.05, z: 1.7, r: 1.95, href: "#gobble", label: "GobbleCube" },
  { id: "watchtower", name: "Watchtower", order: 0, x: 11.1, z: -4.6, r: 1.15, href: "#islands", label: "Watchtower" },
];

const road: Array<[number, number]> = [
  [-9.4, 4.2], [-5.6, 4.7], [-1.4, 4.55], [2.6, 4.7], [6.4, 4.35],
  [9.6, 2.4], [10.2, -0.6], [8.6, -3.6], [4.6, -4.5], [0.4, -4.35],
  [-3.8, -4.5], [-7.6, -3.7], [-10.2, -1.1], [-10.4, 1.8],
];

function outside(x: number, z: number, pad = 0.35) {
  return plots.every((plot) => Math.hypot(x - plot.x, z - plot.z) > plot.r + pad);
}

function gradientMap() {
  const data = new Uint8Array([
    90, 82, 74, 255,
    150, 140, 128, 255,
    205, 196, 184, 255,
    245, 238, 228, 255,
    255, 252, 247, 255,
  ]);
  const map = new DataTexture(data, 5, 1);
  map.magFilter = NearestFilter;
  map.minFilter = NearestFilter;
  map.colorSpace = SRGBColorSpace;
  map.needsUpdate = true;
  return map;
}

export function mount(frame: HTMLElement) {
  const canvas = frame.querySelector("canvas");
  const labelRoot = frame.querySelector<HTMLElement>("[data-labels]");
  if (!canvas || !labelRoot) return () => {};
  const mobile = window.matchMedia("(max-width: 800px)").matches;
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      antialias: !mobile,
      alpha: false,
      powerPreference: "high-performance",
    });
  } catch {
    frame.dataset.mode = "still";
    return () => {};
  }
  if (!renderer.getContext()) {
    frame.dataset.mode = "still";
    return () => {};
  }
  frame.dataset.mode = "live";
  document.documentElement.dataset.world = "live";

  const scene = new Scene();
  scene.fog = new Fog("#f0c48a", 36, 78);
  const camera = new PerspectiveCamera(48, 1, 0.1, 120);
  camera.position.set(8, 16, 28);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.6));
  renderer.outputColorSpace = SRGBColorSpace;

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.rotateSpeed = mobile ? 0.65 : 0.55;
  controls.zoomSpeed = 0.65;
  controls.panSpeed = 0.45;
  controls.minPolarAngle = 0.28;
  controls.maxPolarAngle = 1.12;
  controls.minDistance = 8;
  controls.maxDistance = 46;
  controls.target.set(0, 0.7, 0);
  controls.enabled = document.documentElement.dataset.intro === "done";
  canvas.style.touchAction = mobile ? "pan-y" : "none";

  const toon = gradientMap();
  const mat = (color: string) => new MeshToonMaterial({ color, gradientMap: toon });
  const grass = mat("#348a38");
  grass.vertexColors = true;

  const hemi = new HemisphereLight("#fff0dc", "#6a8f62", 0.85);
  scene.add(buildSky());
  const sun = new DirectionalLight("#ffd7a8", 1.35);
  sun.position.set(-8, 10, 4);
  const fill = new AmbientLight("#fff4e4", 0.28);
  scene.add(hemi, sun, fill);

  const land = new Group();
  scene.add(land);
  const island = buildIsland(grass);
  island.position.y = Y;
  land.add(island);
  const foam = new Mesh(
    new RingGeometry(11.15, 12.35, 80),
    new MeshBasicMaterial({ color: "#f7fbff", transparent: true, opacity: 0.5, side: DoubleSide, depthWrite: false }),
  );
  foam.rotation.x = -Math.PI / 2;
  foam.position.y = 0.12;
  land.add(foam);
  const water = buildWater();
  scene.add(water);
  const shadow = new Mesh(
    new CircleGeometry(13, 40),
    new MeshBasicMaterial({ color: "#062033", transparent: true, opacity: 0.35 }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.04;
  scene.add(shadow);

  const buildings = new Map<string, Group>();
  for (const plot of plots) {
    const group = buildPlot(plot, mat);
    group.position.set(plot.x, Y, plot.z);
    group.userData.plot = plot;
    land.add(group);
    buildings.set(plot.id, group);
  }
  layRoad(land, mat("#c6a15a"));
  layTrees(land, mat);
  const walkers = layPeople(land, mat);
  const cart = layCart(land, mat);
  const birds = layBirds(scene);
  const smokes = laySmoke(land);
  const clouds = layClouds(scene);

  const labels = plots.map((plot) => {
    const button = document.createElement(plot.order ? "button" : "a");
    button.className = "world-label";
    button.textContent = plot.label;
    if (button instanceof HTMLAnchorElement) button.href = plot.href;
    else button.type = "button";
    button.setAttribute("aria-label", plot.order ? `${plot.label}. Open this age.` : plot.label);
    labelRoot.append(button);
    button.addEventListener("click", (event) => {
      if (button instanceof HTMLAnchorElement && plot.href.startsWith("#")) {
        event.preventDefault();
      }
      focusPlot(plot.id);
    });
    return { plot, el: button, shown: false };
  });

  const raycaster = new Raycaster();
  const pointer = new Vector2();
  const pickables = [...buildings.values()];
  canvas.addEventListener("pointerup", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const moved = Math.hypot(event.clientX - down.x, event.clientY - down.y);
    if (moved > 6) return;
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(pickables, true)[0];
    let node: { userData: { plot?: Plot } } | null = hit?.object ?? null;
    while (node && !node.userData.plot && "parent" in node) node = (node as Mesh).parent;
    const plot = node?.userData.plot;
    if (plot && shown(plot)) focusPlot(plot.id);
  });
  const down = { x: 0, y: 0 };
  canvas.addEventListener("pointerdown", (event) => {
    down.x = event.clientX;
    down.y = event.clientY;
  });

  let verticalScroll = false;
  canvas.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "touch") return;
    verticalScroll = false;
    down.x = event.clientX;
    down.y = event.clientY;
  });
  canvas.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "touch" || verticalScroll) return;
    const dx = event.clientX - down.x;
    const dy = event.clientY - down.y;
    if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx) * 1.2) {
      verticalScroll = true;
      controls.enabled = false;
    }
  });
  window.addEventListener("pointerup", () => {
    if (!verticalScroll) return;
    verticalScroll = false;
    controls.enabled = document.documentElement.dataset.intro === "done";
  });

  const want = { position: camera.position.clone(), target: controls.target.clone() };
  let gliding = true;
  let holding = false;
  let idle = 0;
  let lastAge = -1;
  let lastIntro = "";
  const clock = { t: 0, last: performance.now() };
  const spherical = new Spherical();
  const scratch = new Vector3();
  let running = true;
  let visible = true;

  controls.addEventListener("start", () => {
    holding = true;
    gliding = false;
    idle = 0;
  });
  controls.addEventListener("end", () => {
    holding = false;
    idle = 0;
  });

  function shown(plot: Plot) {
    const age = Number(document.documentElement.dataset.age || 5);
    return plot.order <= age;
  }

  function focusPlot(id: string) {
    const plot = plots.find((item) => item.id === id);
    if (!plot) return;
    holding = false;
    gliding = true;
    setWant(plot);
    if (plot.id === "watchtower") {
      document.getElementById("islands")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    window.dispatchEvent(new CustomEvent("mm-open-dossier", { detail: { id: plot.id } }));
  }

  function setWant(plot?: Plot) {
    if (!plot) {
      want.position.set(8, 16, 28);
      want.target.set(0, 0.7, 0);
      return;
    }
    const center = buildings.get(plot.id)?.getWorldPosition(new Vector3()) ?? new Vector3(plot.x, Y, plot.z);
    want.target.set(center.x, center.y + 0.9, center.z);
    const outward = new Vector3(center.x, 0, center.z);
    if (outward.length() < 0.4) outward.set(1, 0, 1);
    outward.normalize();
    want.position.set(center.x + outward.x * 7.2, center.y + 4.6, center.z + outward.z * 7.2);
  }

  function syncStory() {
    const root = document.documentElement;
    const intro = root.dataset.intro || "done";
    const age = Number(root.dataset.age || 5);
    const reading = document.querySelector(".pin")?.classList.contains("is-reading") ?? false;
    controls.enabled = intro === "done" && !verticalScroll;
    if (intro !== lastIntro || (intro !== "done" && age !== lastAge) || (reading && age !== lastAge)) {
      gliding = true;
      holding = false;
      if (intro === "play" || age <= 0) setWant();
      else if (intro === "run") setWant(plots.find((plot) => plot.order === age));
      else if (reading) setWant(plots.find((plot) => plot.order === age));
      else setWant();
    }
    lastAge = age;
    lastIntro = intro;
    const day = Number(root.style.getPropertyValue("--day") || "1");
    const dawn = new Color("#ffd8b0");
    const gold = new Color("#ff9a3c");
    sun.color.copy(dawn).lerp(gold, day);
    sun.intensity = 1.15 + day * 0.35;
    sun.position.set(-10 + day * 16, 11 - day * 4, 6 - day * 8);
    const skyDawn = new Color("#f6dcc4");
    const skyGold = new Color("#f3c49a");
    const sky = skyDawn.lerp(skyGold, day);
    scene.fog = new Fog(sky.getStyle(), 48, 110);
    renderer.setClearColor(sky, 1);
    hemi.color.copy(dawn).lerp(new Color("#ffe0b0"), day);
    for (const [id, group] of buildings) {
      const plot = plots.find((item) => item.id === id)!;
      const on = shown(plot);
      const scale = on ? 1 : 0.001;
      group.scale.lerp(new Vector3(scale, scale, scale), on ? 0.12 : 0.2);
      group.visible = group.scale.y > 0.05;
      const ring = group.getObjectByName("ring") as Mesh | undefined;
      const current = reading && plot.order === age && plot.order > 0;
      const ringMat = ring?.material as MeshBasicMaterial | undefined;
      if (ringMat) ringMat.opacity = MathUtils.lerp(ringMat.opacity, current ? 0.9 : 0, 0.08);
    }
  }

  function blockedZones(rect: DOMRect) {
    const zones: Array<{ x: number; y: number; w: number; h: number }> = [];
    const banner = document.querySelector<HTMLElement>(".isl-banner");
    if (banner && !banner.hidden) {
      const box = relativeBox(banner, rect);
      if (box.w > 8 && box.h > 8) zones.push(padBox(box, 10));
    }
    const veil = document.querySelector<HTMLElement>(".veil");
    if (veil) {
      const style = getComputedStyle(veil);
      if (style.visibility !== "hidden" && Number(style.opacity) > 0.05) {
        const box = relativeBox(veil, rect);
        if (box.h > 8) zones.push(box);
      }
    }
    return zones;
  }

  function screenBox(group: Group, rect: DOMRect) {
    const bounds = new Box3().setFromObject(group);
    if (bounds.isEmpty()) return null;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    const point = new Vector3();
    const xs = [bounds.min.x, bounds.max.x];
    const ys = [bounds.min.y, bounds.max.y];
    const zs = [bounds.min.z, bounds.max.z];
    for (const x of xs) for (const y of ys) for (const z of zs) {
      point.set(x, y, z).project(camera);
      if (point.z > 1) return null;
      const sx = (point.x * 0.5 + 0.5) * rect.width;
      const sy = (-point.y * 0.5 + 0.5) * rect.height;
      minX = Math.min(minX, sx);
      maxX = Math.max(maxX, sx);
      minY = Math.min(minY, sy);
      maxY = Math.max(maxY, sy);
    }
    return { x: minX, y: minY, w: Math.max(18, maxX - minX), h: Math.max(18, maxY - minY) };
  }

  function labelSpot(
    building: { x: number; y: number; w: number; h: number },
    rect: DOMRect,
    width: number,
    height: number,
    placed: Array<{ x: number; y: number; w: number; h: number }>,
    required: boolean,
  ) {
    const cx = building.x + building.w / 2;
    const candidates = [
      { x: cx, y: building.y - 16 },
      { x: cx, y: building.y - 44 },
      { x: building.x - width * 0.2, y: building.y - 16 },
      { x: building.x + building.w + width * 0.2, y: building.y - 16 },
    ];
    if (required) {
      for (let y = 18; y < Math.min(rect.height * 0.42, building.y); y += 30) {
        candidates.push({ x: 24 + width / 2, y: y + height }, { x: rect.width - 24 - width / 2, y: y + height });
      }
    }
    const keepOff = padBox(building, 8);
    for (const candidate of candidates) {
      const box = { x: candidate.x - width / 2, y: candidate.y - height, w: width, h: height };
      if (box.x < 6 || box.y < 6 || box.x + box.w > rect.width - 6 || box.y + box.h > rect.height - 6) continue;
      if (overlaps(box, keepOff)) continue;
      if (placed.some((other) => overlaps(box, other))) continue;
      return box;
    }
    return null;
  }

  function frameLabels() {
    const rect = frame.getBoundingClientRect();
    const root = document.documentElement;
    const intro = root.dataset.intro || "done";
    const age = Number(root.dataset.age || 5);
    const reading = document.querySelector(".pin")?.classList.contains("is-reading") ?? false;
    const blocked = blockedZones(rect);
    const ranked = labels
      .map((item) => {
        const group = buildings.get(item.plot.id)!;
        const anchor = group.getWorldPosition(new Vector3());
        const dist = camera.position.distanceTo(anchor);
        const building = screenBox(group, rect);
        return { ...item, anchor, dist, building, behind: building == null };
      })
      .sort((a, b) => {
        const af = a.plot.order === age && a.plot.order > 0 ? 0 : 1;
        const bf = b.plot.order === age && b.plot.order > 0 ? 0 : 1;
        return af - bf || a.dist - b.dist;
      });
    const focused = ranked.find((item) => item.plot.order === age && item.plot.order > 0 && item.building);
    const placed: Array<{ x: number; y: number; w: number; h: number }> = [
      ...blocked,
      ...(focused?.building ? [padBox(focused.building, 8)] : []),
    ];
    let extras = 0;
    for (const item of ranked) {
      const current = item.plot.order === age && item.plot.order > 0;
      const allow =
        intro !== "play" &&
        shown(item.plot) &&
        !item.behind &&
        item.dist < 32 &&
        (current || (intro !== "run" && extras < 2));
      item.el.classList.toggle("is-focus", Boolean((reading || intro === "run") && current));
      if (!allow || !item.building) {
        item.el.hidden = true;
        continue;
      }
      item.el.hidden = false;
      const width = Math.max(item.el.offsetWidth, item.el.scrollWidth, 64);
      const height = Math.max(item.el.offsetHeight, 22);
      const spot = labelSpot(item.building, rect, width, height, placed, current);
      if (!spot) {
        item.el.hidden = true;
        continue;
      }
      if (!current) extras += 1;
      item.el.hidden = false;
      placed.push(spot);
      item.el.style.opacity = current ? "1" : "0.82";
      item.el.style.transform = `translate(${spot.x + spot.w / 2}px, ${spot.y + spot.h}px) translate(-50%, -100%)`;
    }
  }

  function resize() {
    const rect = frame.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(frame);

  const watcher = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  }, { threshold: 0.02 });
  watcher.observe(frame);
  document.addEventListener("visibilitychange", onHide);
  function onHide() {
    visible = document.visibilityState === "visible" && visible;
  }

  function tick(now: number) {
    if (!running) return;
    requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - clock.last) / 1000);
    clock.last = now;
    clock.t += dt;
    if (!visible || document.hidden) return;
    syncStory();
    water.userData.spin(clock.t);
    for (const walker of walkers) walker.step(dt, clock.t);
    cart.step(clock.t);
    for (const bird of birds) bird.step(clock.t);
    for (const puff of smokes) puff.step(dt);
    for (const cloud of clouds) cloud.step(dt);
    if (gliding && !holding) {
      controls.target.lerp(want.target, 0.12);
      camera.position.lerp(want.position, 0.1);
      if (camera.position.distanceTo(want.position) < 0.2) gliding = false;
    } else if (!holding && document.documentElement.dataset.intro === "done") {
      idle += dt;
      if (idle > 2.8) {
        spherical.setFromVector3(scratch.copy(camera.position).sub(controls.target));
        spherical.theta += dt * 0.07;
        camera.position.copy(controls.target).add(scratch.setFromSpherical(spherical));
      }
    }
    const limit = 7;
    const reach = Math.hypot(controls.target.x, controls.target.z);
    if (reach > limit) {
      controls.target.x *= limit / reach;
      controls.target.z *= limit / reach;
    }
    controls.update();
    renderer.render(scene, camera);
    frameLabels();
  }
  requestAnimationFrame(tick);

  return () => {
    running = false;
    resizeObserver.disconnect();
    watcher.disconnect();
    document.removeEventListener("visibilitychange", onHide);
    controls.dispose();
    renderer.dispose();
  };
}

function overlaps(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function padBox(box: { x: number; y: number; w: number; h: number }, n: number) {
  return { x: box.x - n, y: box.y - n, w: box.w + n * 2, h: box.h + n * 2 };
}

function relativeBox(el: HTMLElement, frameRect: DOMRect) {
  const rect = el.getBoundingClientRect();
  return { x: rect.left - frameRect.left, y: rect.top - frameRect.top, w: rect.width, h: rect.height };
}

function buildIsland(material: MeshToonMaterial) {
  const geo = new CircleGeometry(11.6, 72);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors: number[] = [];
  const tint = new Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const radius = Math.hypot(x, z) / 11.6;
    const sand = radius > 0.72;
    tint.set(sand ? (i % 3 === 0 ? "#efd48a" : "#e2bc62") : i % 2 ? "#3c9a42" : "#2f8636");
    colors.push(tint.r, tint.g, tint.b);
    if (!sand) pos.setY(i, Math.sin(x * 1.4) * Math.cos(z * 1.1) * 0.07);
  }
  geo.setAttribute("color", new Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return new Mesh(geo, material);
}

function buildWater() {
    const geo = new CircleGeometry(48, 64);
  geo.rotateX(-Math.PI / 2);
  const mesh = new Mesh(
    geo,
    new MeshToonMaterial({ color: "#2f86c4", transparent: true, opacity: 0.96 }),
  );
  mesh.position.y = -0.08;
  mesh.userData.spin = (t: number) => {
    mesh.position.y = -0.08 + Math.sin(t * 0.6) * 0.03;
  };
  return mesh;
}

function buildPlot(plot: Plot, mat: (color: string) => MeshToonMaterial) {
  const group = new Group();
  const add = (mesh: Mesh, x = 0, y = 0, z = 0) => {
    mesh.position.set(x, y, z);
    mesh.castShadow = false;
    group.add(mesh);
    return mesh;
  };
  if (plot.id === "blinkit") hut(add, mat);
  else if (plot.id === "bijak") stall(add, mat);
  else if (plot.id === "tago") cottage(add, mat);
  else if (plot.id === "badho") dome(add, mat);
  else if (plot.id === "gobble") scaffold(add, mat);
  else if (plot.id === "workshop") hut(add, mat, true);
  else tower(add, mat);
  const ring = new Mesh(
    new RingGeometry(plot.r * 0.72, plot.r * 0.92, 28),
    new MeshBasicMaterial({ color: "#f0d78c", transparent: true, opacity: 0, side: DoubleSide }),
  );
  ring.name = "ring";
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.03;
  group.add(ring);
  const shade = new Mesh(new CircleGeometry(plot.r * 1.25, 18), contactShadow());
  shade.rotation.x = -Math.PI / 2;
  shade.position.y = 0.015;
  group.add(shade);
  return group;
}

let sharedShadow: MeshBasicMaterial | null = null;
function contactShadow() {
  if (!sharedShadow) {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grd = ctx.createRadialGradient(32, 32, 2, 32, 32, 32);
      grd.addColorStop(0, "rgba(42, 24, 10, 0.55)");
      grd.addColorStop(0.6, "rgba(42, 24, 10, 0.16)");
      grd.addColorStop(1, "rgba(42, 24, 10, 0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, 64, 64);
    }
    const map = new CanvasTexture(canvas);
    map.colorSpace = SRGBColorSpace;
    sharedShadow = new MeshBasicMaterial({ map, transparent: true, depthWrite: false });
  }
  return sharedShadow;
}

function buildSky() {
  const geo = new SphereGeometry(78, 20, 12);
  const pos = geo.attributes.position;
  const colors: number[] = [];
  const zenith = new Color("#d5e9f2");
  const mid = new Color("#f6dcc6");
  const horizon = new Color("#f0c49a");
  const tint = new Color();
  for (let i = 0; i < pos.count; i++) {
    const height = MathUtils.clamp((pos.getY(i) / 78 + 0.2) / 1.05, 0, 1);
    tint.copy(horizon).lerp(mid, Math.min(1, height * 1.5)).lerp(zenith, Math.max(0, height - 0.35));
    colors.push(tint.r, tint.g, tint.b);
  }
  geo.setAttribute("color", new Float32BufferAttribute(colors, 3));
  return new Mesh(geo, new MeshBasicMaterial({ vertexColors: true, side: BackSide, fog: false }));
}

type Add = (mesh: Mesh, x?: number, y?: number, z?: number) => Mesh;

function hut(add: Add, mat: (color: string) => MeshToonMaterial, chimney = true) {
  add(new Mesh(new CylinderGeometry(1.15, 1.28, 1.2, 8), mat("#6b442c")), 0, 0.6, 0);
  const roof = add(new Mesh(new ConeGeometry(1.6, 0.95, 8), mat("#c4a15a")), 0, 1.5, 0);
  roof.rotation.y = 0.2;
  for (let i = 0; i < 3; i++) {
    const tile = add(new Mesh(new TorusGeometry(1.22 - i * 0.32, 0.045, 4, 12), mat(i % 2 ? "#a88840" : "#d7b56a")), 0, 1.18 + i * 0.22, 0);
    tile.rotation.x = Math.PI / 2;
  }
  add(new Mesh(new PlaneGeometry(0.46, 0.62), mat("#2a1c12")), 0.12, 0.42, 1.24);
  add(new Mesh(new PlaneGeometry(0.28, 0.22), mat("#f3e2b0")), -0.45, 0.72, 1.22);
  if (chimney) {
    add(new Mesh(new CylinderGeometry(0.1, 0.13, 0.5, 6), mat("#5c4638")), 0.72, 1.75, -0.15);
    add(new Mesh(new SphereGeometry(0.08, 6, 5), new MeshBasicMaterial({ color: "#f4efe6", transparent: true, opacity: 0.45 })), 0.72, 2.1, -0.15).name = "chimney";
  }
  add(new Mesh(new BoxGeometry(0.34, 0.28, 0.32), mat("#a56b3c")), 1.35, 0.16, 0.45);
  add(new Mesh(new BoxGeometry(0.24, 0.2, 0.22), mat("#c4a574")), 1.55, 0.12, 0.12);
}

function stall(add: Add, mat: (color: string) => MeshToonMaterial) {
  add(new Mesh(new BoxGeometry(2.1, 0.55, 1.25), mat("#8d5a32")), 0, 0.32, 0);
  add(new Mesh(new BoxGeometry(2.2, 0.08, 1.4), mat("#a56b3c")), 0, 0.62, 0);
  const cloth = add(new Mesh(new BoxGeometry(2.15, 0.05, 1.35), mat("#f4ead4")), 0, 1.42, 0.05);
  cloth.rotation.x = -0.18;
  for (let i = 0; i < 6; i++) {
    add(new Mesh(new PlaneGeometry(0.32, 0.42), mat(i % 2 ? "#f7f1e4" : "#c4473a")), -0.85 + i * 0.34, 1.12, 0.62);
  }
  add(new Mesh(new SphereGeometry(0.2, 8, 6), mat("#e6d2a8")), -0.45, 0.82, 0.15);
  add(new Mesh(new SphereGeometry(0.16, 8, 6), mat("#6aa84f")), 0.4, 0.78, 0.1);
  add(new Mesh(new CylinderGeometry(0.05, 0.05, 1.15, 5), mat("#5c3a22")), -0.95, 0.85, -0.5);
  add(new Mesh(new CylinderGeometry(0.05, 0.05, 1.15, 5), mat("#5c3a22")), 0.95, 0.85, -0.5);
  add(new Mesh(new BoxGeometry(0.28, 0.22, 0.28), mat("#c4a574")), 1.25, 0.14, 0.35);
}

function cottage(add: Add, mat: (color: string) => MeshToonMaterial) {
  add(new Mesh(new CylinderGeometry(1.05, 1.18, 1.25, 8), mat("#e4d2ae")), 0, 0.62, 0);
  add(new Mesh(new ConeGeometry(1.5, 0.9, 8), mat("#a35448")), 0, 1.55, 0);
  for (let i = 0; i < 3; i++) {
    const tile = add(new Mesh(new TorusGeometry(1.15 - i * 0.28, 0.04, 4, 12), mat("#8d4038")), 0, 1.22 + i * 0.2, 0);
    tile.rotation.x = Math.PI / 2;
  }
  add(new Mesh(new PlaneGeometry(0.36, 0.55), mat("#5c3a22")), 0, 0.42, 1.16);
  add(new Mesh(new PlaneGeometry(0.28, 0.24), mat("#f4e2bc")), 0.55, 0.78, 1.12);
  add(new Mesh(new CylinderGeometry(0.08, 0.1, 0.4, 5), mat("#6b5344")), -0.55, 1.7, -0.2);
  add(new Mesh(new SphereGeometry(0.16, 7, 5), mat("#3f8f4a")), 0.9, 0.18, 0.75);
  add(new Mesh(new SphereGeometry(0.1, 6, 5), mat("#d45d78")), 1.02, 0.26, 0.58);
}

function dome(add: Add, mat: (color: string) => MeshToonMaterial) {
  add(new Mesh(new CylinderGeometry(1.85, 2.05, 0.35, 10), mat("#e7d3a4")), 0, 0.18, 0);
  add(new Mesh(new CylinderGeometry(1.55, 1.7, 0.85, 10), mat("#f0e2bc")), 0, 0.7, 0);
  add(new Mesh(new CylinderGeometry(1.2, 1.35, 0.55, 10), mat("#f7edd2")), 0, 1.3, 0);
  const domeMesh = add(new Mesh(new SphereGeometry(1.02, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat("#e6b325")), 0, 1.55, 0);
  domeMesh.scale.y = 0.8;
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    add(new Mesh(new PlaneGeometry(0.22, 0.36), mat("#8a6a3a")), Math.cos(angle) * 1.45, 0.7, Math.sin(angle) * 1.45);
  }
  add(new Mesh(new TorusGeometry(0.32, 0.05, 6, 16), mat("#f6e7a8")), 0, 2.28, 0);
  add(new Mesh(new CylinderGeometry(0.06, 0.08, 0.35, 6), mat("#f6e7a8")), 0, 2.5, 0);
}

function scaffold(add: Add, mat: (color: string) => MeshToonMaterial) {
  add(new Mesh(new CylinderGeometry(1.35, 1.5, 0.7, 6), mat("#cbb892")), 0, 0.35, 0);
  add(new Mesh(new CylinderGeometry(0.9, 1.05, 1.1, 5), mat("#d9c7a1")), -0.2, 1.15, 0.1);
  for (const [x, z] of [[-1.1, -1.1], [1.1, -1.1], [-1.1, 1.1], [1.1, 1.1]] as const) {
    add(new Mesh(new CylinderGeometry(0.05, 0.05, 2.3, 4), mat("#a67c52")), x, 1.15, z);
  }
  add(new Mesh(new CylinderGeometry(0.05, 0.05, 2.4, 4), mat("#8d5a32")), 0, 2.35, 0).rotation.z = Math.PI / 2;
  add(new Mesh(new ConeGeometry(0.12, 0.35, 4), mat("#6b442c")), 1.15, 2.45, 0);
  const arm = add(new Mesh(new CylinderGeometry(0.08, 0.08, 0.7, 5), mat("#c4a574")), 0.9, 1.15, 1.15);
  arm.name = "hammer";
}

function tower(add: Add, mat: (color: string) => MeshToonMaterial) {
  add(new Mesh(new CylinderGeometry(0.45, 0.7, 2.4, 6), mat("#8a6a48")), 0, 1.2, 0);
  add(new Mesh(new CylinderGeometry(0.7, 0.55, 0.35, 6), mat("#6b442c")), 0, 2.45, 0);
  add(new Mesh(new ConeGeometry(0.4, 0.55, 6), mat("#a35448")), 0, 2.85, 0);
}

function layRoad(scene: Object3D, material: Material) {
  for (let i = 0; i < road.length; i++) {
    const a = road[i];
    const b = road[(i + 1) % road.length];
    const dx = b[0] - a[0];
    const dz = b[1] - a[1];
    const length = Math.hypot(dx, dz);
    const mesh = new Mesh(new PlaneGeometry(length, 0.72), material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = -Math.atan2(dz, dx);
    mesh.position.set((a[0] + b[0]) / 2, Y + 0.025, (a[1] + b[1]) / 2);
    scene.add(mesh);
  }
}

function layTrees(scene: Object3D, mat: (color: string) => MeshToonMaterial) {
  const spots: Array<[number, number]> = [
    [-8.8, 2.6], [-5.5, 2.4], [-2.2, 3.2], [1.6, 3.5], [6.2, 2.8], [8.8, -0.4],
    [6.8, -2.8], [2.2, -2.6], [-1.6, -2.4], [-6.2, -1.6], [-4.2, 0.6], [9.4, 3.6],
  ];
  for (const [x, z] of spots) {
    if (!outside(x, z, 0.2) || Math.hypot(x, z) > 10.4) continue;
    const tree = new Group();
    tree.position.set(x, Y, z);
    const trunk = new Mesh(new CylinderGeometry(0.08, 0.12, 0.55, 5), mat("#6b442c"));
    trunk.position.y = 0.28;
    const leaf = new Mesh(new ConeGeometry(0.42, 0.9, 6), mat(x + z > 0 ? "#2f7a32" : "#3e8f3a"));
    leaf.position.y = 0.9;
    tree.add(trunk, leaf);
    scene.add(tree);
  }
}

function person(mat: (color: string) => MeshToonMaterial, shirt: string) {
  const group = new Group();
  const legL = new Mesh(new CylinderGeometry(0.045, 0.05, 0.32, 5), mat("#3e342c"));
  legL.position.set(-0.07, 0.16, 0);
  const legR = legL.clone();
  legR.position.x = 0.07;
  const torso = new Mesh(new BoxGeometry(0.28, 0.36, 0.16), mat(shirt));
  torso.position.y = 0.5;
  const head = new Mesh(new SphereGeometry(0.12, 8, 6), mat("#efd0a8"));
  head.position.y = 0.8;
  const armL = new Mesh(new BoxGeometry(0.07, 0.26, 0.07), mat(shirt));
  armL.position.set(-0.18, 0.5, 0);
  const armR = armL.clone();
  armR.position.x = 0.18;
  group.add(legL, legR, torso, head, armL, armR);
  return group;
}

function layPeople(scene: Object3D, mat: (color: string) => MeshToonMaterial) {
  const shirts = ["#c45a4a", "#d9822b", "#4f8fbf", "#7b5ea7", "#b8892b", "#2f8f83", "#a56b3c"];
  const curve = road.map(([x, z]) => new Vector3(x, Y, z));
  const walkers = shirts.map((shirt, index) => {
    const mesh = person(mat, shirt);
    scene.add(mesh);
    const era = index < 1 ? 1 : index < 2 ? 2 : index < 3 ? 3 : index < 6 ? 4 : 5;
    return {
      mesh,
      era,
      offset: index / shirts.length,
      step(dt: number, t: number) {
        const age = Number(document.documentElement.dataset.age || 5);
        mesh.visible = era <= age;
        if (!mesh.visible) return;
        const u = (t * 0.025 + this.offset) % 1;
        const count = curve.length;
        const f = u * count;
        const i = Math.floor(f) % count;
        const n = (i + 1) % count;
        const k = f - Math.floor(f);
        mesh.position.lerpVectors(curve[i], curve[n], k);
        mesh.position.y = Y;
        mesh.lookAt(curve[n].x, Y, curve[n].z);
        mesh.position.y = Y + Math.abs(Math.sin(t * 6 + index)) * 0.05;
      },
    };
  });
  const builders = [
    [9.7, 3.35],
    [7.55, 3.9],
  ].map(([x, z], index) => {
    const mesh = person(mat, "#8d5a32");
    mesh.position.set(x, Y, z);
    mesh.lookAt(8.05, Y, 1.7);
    const hammer = new Mesh(new CylinderGeometry(0.03, 0.03, 0.28, 4), mat("#c4a574"));
    hammer.position.set(0.18, 0.62, 0);
    mesh.add(hammer);
    scene.add(mesh);
    return {
      mesh,
      era: 5,
      offset: 0,
      step(_dt: number, t: number) {
        const age = Number(document.documentElement.dataset.age || 5);
        mesh.visible = age >= 5;
        hammer.rotation.z = Math.sin(t * 6 + index) * 0.8;
        mesh.position.y = Y + Math.abs(Math.sin(t * 6 + index)) * 0.03;
      },
    };
  });
  return [...walkers, ...builders];
}

function layCart(scene: Object3D, mat: (color: string) => MeshToonMaterial) {
  const group = new Group();
  const bed = new Mesh(new CylinderGeometry(0.28, 0.32, 0.22, 6), mat("#8d5a32"));
  bed.scale.z = 1.6;
  const sack = new Mesh(new SphereGeometry(0.14, 7, 5), mat("#f0ddb8"));
  sack.position.y = 0.18;
  const wheelL = new Mesh(new TorusGeometry(0.1, 0.03, 5, 10), mat("#2a2118"));
  wheelL.position.set(-0.22, -0.02, 0);
  const wheelR = wheelL.clone();
  wheelR.position.x = 0.22;
  group.add(bed, sack, wheelL, wheelR);
  scene.add(group);
  const path = [new Vector3(-4.4, Y + 0.16, 0.55), new Vector3(-1.2, Y + 0.16, 0.15), new Vector3(2.0, Y + 0.16, 0.45), new Vector3(5.6, Y + 0.16, 1.55)];
  return {
    step(t: number) {
      const age = Number(document.documentElement.dataset.age || 5);
      group.visible = age >= 4;
      if (!group.visible) return;
      const u = (Math.sin(t * 0.18) + 1) / 2;
      const scaled = u * (path.length - 1);
      const i = Math.min(path.length - 2, Math.floor(scaled));
      const k = scaled - i;
      group.position.lerpVectors(path[i], path[i + 1], k);
      const next = path[Math.min(path.length - 1, i + 1)];
      group.rotation.y = Math.atan2(next.x - group.position.x, next.z - group.position.z);
      wheelL.rotation.x = t * 2;
      wheelR.rotation.x = t * 2;
    },
  };
}

function layBirds(scene: Scene) {
  return [0, 1, 2].map((index) => {
    const bird = new Mesh(
      new PlaneGeometry(0.34, 0.08),
      new MeshBasicMaterial({ color: "#f7fbff", side: DoubleSide }),
    );
    scene.add(bird);
    return {
      step(t: number) {
        const a = t * 0.25 + index * 2.1;
        const radius = 7 + index;
        bird.position.set(Math.cos(a) * radius, 4.2 + index * 0.35 + Math.sin(t + index) * 0.15, Math.sin(a) * radius * 0.7);
        bird.rotation.y = -a;
        bird.rotation.z = Math.sin(t * 8 + index) * 0.4;
      },
    };
  });
}

function laySmoke(scene: Object3D) {
  const spots = [new Vector3(-7.1 + 0.7, Y + 2.05, 1.2 - 0.2), new Vector3(-10.6 + 0.7, Y + 2.05, 5.4 - 0.2)];
  return spots.flatMap((origin, originIndex) =>
    [0, 1, 2].map((i) => {
      const puff = new Mesh(
        new SphereGeometry(0.12, 6, 5),
        new MeshBasicMaterial({ color: "#f4efe6", transparent: true, opacity: 0.4 }),
      );
      scene.add(puff);
      const state = { life: i * 0.8 + originIndex };
      return {
        step(dt: number) {
          const age = Number(document.documentElement.dataset.age || 5);
          const on = originIndex === 1 || age >= 1;
          state.life += dt;
          if (state.life > 2.4) state.life = 0;
          const k = state.life / 2.4;
          puff.visible = on;
          puff.position.copy(origin);
          puff.position.y += k * 1.1;
          puff.scale.setScalar(0.4 + k);
          (puff.material as MeshBasicMaterial).opacity = on ? (1 - k) * 0.45 : 0;
        },
      };
    }),
  );
}

function layClouds(scene: Scene) {
  return [0, 1].map((index) => {
    const cloud = new Mesh(
      new SphereGeometry(0.8, 8, 6),
      new MeshBasicMaterial({ color: "#fffaf2", transparent: true, opacity: 0.85 }),
    );
    cloud.scale.set(1.8, 0.45, 1);
    scene.add(cloud);
    return {
      step(dt: number) {
        cloud.userData.x = (cloud.userData.x ?? -16 + index * 14) + dt * 0.35;
        if (cloud.userData.x > 18) cloud.userData.x = -18;
        cloud.position.set(cloud.userData.x as number, 6.2 + index * 0.4, -6 - index * 2);
      },
    };
  });
}
