import {
  AmbientLight,
  AnimationMixer,
  BackSide,
  Box3,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CircleGeometry,
  Color,
  DataTexture,
  DirectionalLight,
  DoubleSide,
  Fog,
  Group,
  HemisphereLight,
  InstancedMesh,
  MathUtils,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshToonMaterial,
  NearestFilter,
  Object3D,
  PerspectiveCamera,
  Raycaster,
  RingGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Spherical,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
  type AnimationClip,
  type Material,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";

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

type Box = { x: number; y: number; w: number; h: number };

const plots: Plot[] = [
  { id: "workshop", name: "Workshop", order: 0, x: -7.4, z: 2.8, r: 1.6, href: "#build", label: "The Workshop" },
  { id: "blinkit", name: "Blinkit", order: 1, x: -4.6, z: -0.55, r: 1.55, href: "#blinkit", label: "Blinkit" },
  { id: "bijak", name: "Bijak", order: 2, x: -1.15, z: -2.55, r: 1.8, href: "#bijak", label: "Bijak" },
  { id: "tago", name: "Tago Care", order: 3, x: 1.25, z: 2.05, r: 1.7, href: "#tago", label: "Tago Care" },
  { id: "badho", name: "Badho", order: 4, x: 4.5, z: -1.75, r: 2.5, href: "#badho", label: "Badho" },
  { id: "gobble", name: "GobbleCube", order: 5, x: 8.05, z: 2.05, r: 1.75, href: "#gobble", label: "GobbleCube" },
  { id: "watchtower", name: "Watchtower", order: 0, x: -8.7, z: -3.55, r: 1.15, href: "#islands", label: "Watchtower" },
];

const roadRaw: Array<[number, number]> = [
  [-6.5, 4.85], [-2.7, 4.95], [1.15, 4.7], [4.5, 4.65], [6.7, 4.9],
  [9.9, 4.55], [10.7, 1.7], [10.15, -1.15], [7.55, -5.05], [3.3, -5.35],
  [-0.7, -5.2], [-4.3, -4.35], [-6.7, -1.55], [-7.75, 1.55],
];

const HOME_POS = new Vector3(4.6, 12.4, 16.4);
const HOME_TARGET = new Vector3(0.7, 0.55, -0.85);
const SHOW = new Vector3(1, 1, 1);
const HIDE = new Vector3(0.001, 0.001, 0.001);

let toonRamp: DataTexture | null = null;

function islandRadius(theta: number) {
  return 12.6 + Math.sin(theta * 2) * 0.9 + Math.cos(theta * 3) * 0.42 + Math.sin(theta * 5 + 0.7) * 0.28;
}

function smooth(edge0: number, edge1: number, value: number) {
  const t = MathUtils.clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function shove(x: number, z: number, pad: number) {
  let px = x;
  let pz = z;
  for (let pass = 0; pass < 3; pass += 1) {
    for (const plot of plots) {
      const dx = px - plot.x;
      const dz = pz - plot.z;
      const dist = Math.hypot(dx, dz);
      const need = plot.r + pad;
      if (dist < need) {
        const k = need / Math.max(dist, 0.001);
        px = plot.x + dx * k;
        pz = plot.z + dz * k;
      }
    }
  }
  return [px, pz] as const;
}

function bakeRoad() {
  const points: Array<[number, number]> = [];
  const steps = 5;
  for (let i = 0; i < roadRaw.length; i += 1) {
    const a = roadRaw[i];
    const b = roadRaw[(i + 1) % roadRaw.length];
    for (let step = 0; step < steps; step += 1) {
      const t = step / steps;
      points.push(shove(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, 0.42));
    }
  }
  return points;
}

const road = bakeRoad();

function distToRoad(x: number, z: number) {
  let best = 99;
  for (let i = 0; i < road.length; i += 1) {
    const a = road[i];
    const b = road[(i + 1) % road.length];
    const dx = b[0] - a[0];
    const dz = b[1] - a[1];
    const len = dx * dx + dz * dz || 1;
    const t = MathUtils.clamp(((x - a[0]) * dx + (z - a[1]) * dz) / len, 0, 1);
    best = Math.min(best, Math.hypot(x - (a[0] + dx * t), z - (a[1] + dz * t)));
  }
  return best;
}

function heightAt(x: number, z: number) {
  const theta = Math.atan2(z, x);
  const edge = islandRadius(theta);
  const t = Math.hypot(x, z) / edge;
  const wobble = Math.sin(x * 0.55) * Math.cos(z * 0.42) * 0.04;
  const inland = 0.48 + wobble;
  let y = inland * (1 - smooth(0.66, 1, t)) + -0.02 * smooth(0.66, 1, t);
  const path = distToRoad(x, z);
  if (path < 0.78 && t < 0.86) y -= (1 - path / 0.78) * 0.04;
  return y;
}

function clearOfPlots(x: number, z: number, pad: number) {
  return plots.every((plot) => Math.hypot(x - plot.x, z - plot.z) > plot.r + pad);
}

export async function mount(frame: HTMLElement) {
  const canvas = frame.querySelector("canvas");
  const labelRoot = frame.querySelector<HTMLElement>("[data-labels]");
  if (!canvas || !labelRoot) return () => {};
  const mobile = window.matchMedia("(max-width: 800px)").matches;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const modest = mobile || memory <= 4;

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      antialias: !modest,
      alpha: false,
      powerPreference: modest ? "low-power" : "high-performance",
    });
  } catch {
    frame.dataset.mode = "still";
    return () => {};
  }
  if (!renderer.getContext()) {
    frame.dataset.mode = "still";
    renderer.dispose();
    return () => {};
  }

  const scene = new Scene();
  const camera = new PerspectiveCamera(42, 1, 0.1, 160);
  const homePos = HOME_POS.clone();
  const homeTarget = HOME_TARGET.clone();
  if (modest) {
    homePos.set(2.2, 17.6, 20.8);
    homeTarget.set(0.15, 0.25, -1.7);
    camera.fov = 49;
  }
  camera.position.copy(homePos);
  renderer.outputColorSpace = SRGBColorSpace;
  const ratioCap = Math.min(window.devicePixelRatio || 1, modest ? 1 : 1.5);
  let ratio = ratioCap;
  renderer.setPixelRatio(ratio);
  renderer.setClearColor("#f6d7b8", 1);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.rotateSpeed = mobile ? 0.65 : 0.55;
  controls.zoomSpeed = 0.65;
  controls.panSpeed = 0.45;
  controls.minPolarAngle = 0.38;
  controls.maxPolarAngle = 1.12;
  controls.minDistance = 7.5;
  controls.maxDistance = 38;
  controls.target.copy(homeTarget);
  controls.enabled = document.documentElement.dataset.intro === "done";
  canvas.style.touchAction = mobile ? "pan-y" : "none";

  scene.add(buildSky());
  const hemi = new HemisphereLight("#fff1dc", "#6a8a45", 0.82);
  const sun = new DirectionalLight("#ffc07a", 1.7);
  sun.position.set(-12, 14, 8);
  const fill = new DirectionalLight("#f0c9a2", 0.28);
  fill.position.set(8, 6, -6);
  scene.add(hemi, sun, fill, new AmbientLight("#fff4e6", 0.22));

  const land = new Group();
  scene.add(land);
  const groundMat = paint("#ffffff");
  groundMat.vertexColors = true;
  const island = buildIsland(groundMat, modest);
  land.add(island);
  const water = buildWater(modest);
  scene.add(water);
  const shade = new Mesh(
    new CircleGeometry(13.2, modest ? 28 : 48),
    new MeshBasicMaterial({ color: "#123044", transparent: true, opacity: 0.16, depthWrite: false }),
  );
  shade.rotation.x = -Math.PI / 2;
  shade.position.y = 0.01;
  shade.scale.setScalar(1.25);
  scene.add(shade);

  try {
    const loaded = await loadAssets(renderer);
    const buildings = new Map<string, Group>();
    for (const plot of plots) {
      const group = compose(plot.id, loaded.templates, modest);
      group.position.set(plot.x, heightAt(plot.x, plot.z), plot.z);
      group.userData.plot = plot;
      land.add(group);
      buildings.set(plot.id, group);
    }
    layForest(land, loaded.templates, modest);
    layRocks(land, loaded.templates, modest);
    const villagers = makeVillagers(loaded.villagerScene, loaded.clips, land, modest);
    const cart = makeCart(loaded.templates, land);
    const clouds = layClouds(scene, modest ? 2 : 4);
    const smokes = laySmoke(buildings);

    const labels = plots.map((plot) => {
      const button = document.createElement(plot.order ? "button" : "a");
      button.className = "world-label";
      button.textContent = plot.label;
      if (button instanceof HTMLAnchorElement) button.href = plot.href;
      else button.type = "button";
      button.setAttribute("aria-label", plot.order ? `${plot.label}. Open this age.` : plot.label);
      labelRoot.append(button);
      button.addEventListener("click", (event) => {
        if (button instanceof HTMLAnchorElement && plot.href.startsWith("#")) event.preventDefault();
        focusPlot(plot.id);
      });
      return { plot, el: button };
    });

    const raycaster = new Raycaster();
    const pointer = new Vector2();
    const pickables = [...buildings.values()];
    const down = { x: 0, y: 0 };
    canvas.addEventListener("pointerdown", (event) => {
      down.x = event.clientX;
      down.y = event.clientY;
    });
    canvas.addEventListener("pointerup", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (Math.hypot(event.clientX - down.x, event.clientY - down.y) > 6) return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(pickables, true)[0];
      let node: Object3D | null = hit?.object ?? null;
      while (node && !node.userData.plot) node = node.parent;
      const plot = node?.userData.plot as Plot | undefined;
      if (plot && shown(plot)) focusPlot(plot.id);
    });

    let verticalScroll = false;
    canvas.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "touch" || verticalScroll) return;
      const dx = event.clientX - down.x;
      const dy = event.clientY - down.y;
      if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx) * 1.2) {
        verticalScroll = true;
        controls.enabled = false;
      }
    });
    const releaseTouch = () => {
      if (!verticalScroll) return;
      verticalScroll = false;
      controls.enabled = document.documentElement.dataset.intro === "done";
    };
    window.addEventListener("pointerup", releaseTouch);

    const want = { position: camera.position.clone(), target: controls.target.clone() };
    let gliding = true;
    let holding = false;
    let idleTimer = 0;
    let lastAge = -1;
    let lastIntro = "";
    const clock = { t: 0, last: performance.now() };
    const spherical = new Spherical();
    const scratch = new Vector3();
    let running = true;
    let visible = true;
    let ratioTimer = 0;
    let frameDt = 0.016;

    controls.addEventListener("start", () => {
      holding = true;
      gliding = false;
      idleTimer = 0;
    });
    controls.addEventListener("end", () => {
      holding = false;
      idleTimer = 0;
    });

    function shown(plot: Plot) {
      const intro = document.documentElement.dataset.intro || "done";
      if (intro === "play" || intro === "run") return true;
      return plot.order <= Number(document.documentElement.dataset.age || 5);
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
      if (plot.id === "workshop") {
        document.getElementById("build")?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      window.dispatchEvent(new CustomEvent("mm-open-dossier", { detail: { id: plot.id } }));
    }

    function setWant(plot?: Plot) {
      if (!plot) {
        want.position.copy(homePos);
        want.target.copy(homeTarget);
        return;
      }
      const center = buildings.get(plot.id)?.getWorldPosition(new Vector3()) ?? new Vector3(plot.x, heightAt(plot.x, plot.z), plot.z);
      if (plot.id === "gobble") {
        want.target.set(center.x - 0.15, center.y + 1.55, center.z);
        want.position.set(center.x + 0.35, center.y + 3.6, center.z + 7.4);
        return;
      }
      want.target.set(center.x, center.y + 1.15, center.z);
      const outward = new Vector3(center.x, 0, center.z);
      if (outward.length() < 0.4) outward.set(0.4, 0, 1);
      outward.normalize();
      const view = new Vector3(outward.x * 0.55 + 0.2, 0, Math.abs(outward.z) * 0.35 + 0.82).normalize();
      want.position.set(center.x + view.x * 8.6, center.y + 4.6, center.z + view.z * 8.6);
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
        else if (intro === "run" || reading) setWant(plots.find((plot) => plot.order === age));
        else setWant();
      }
      lastAge = age;
      lastIntro = intro;
      const day = Number(root.style.getPropertyValue("--day") || "1");
      const dawn = new Color("#ffd2a4");
      const gold = new Color("#f0a05a");
      sun.color.copy(dawn).lerp(gold, day);
      sun.intensity = 1.45 + day * 0.28;
      sun.position.set(-14 + day * 6, 15 - day * 2, 9 - day * 4);
      const sky = new Color("#f7dcc4").lerp(new Color("#f0c09a"), day);
      scene.fog = new Fog(sky.getStyle(), 42, 96);
      renderer.setClearColor(sky, 1);
      hemi.color.copy(dawn).lerp(new Color("#ffe0b8"), day);
      const horizon = water.userData.horizon as Color | undefined;
      horizon?.copy(sky);
      for (const [id, group] of buildings) {
        const plot = plots.find((item) => item.id === id);
        if (!plot) continue;
        const on = shown(plot);
        group.scale.lerp(on ? SHOW : HIDE, on ? 0.12 : 0.2);
        group.visible = group.scale.y > 0.05;
        const ring = group.getObjectByName("ring") as Mesh | undefined;
        const current = reading && plot.order === age && plot.order > 0;
        const ringMat = ring?.material as MeshBasicMaterial | undefined;
        if (ringMat) ringMat.opacity = MathUtils.lerp(ringMat.opacity, current ? 0.55 : 0, 0.08);
      }
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
          const group = buildings.get(item.plot.id);
          if (!group) return { ...item, dist: 999, screen: null, building: null, behind: true };
          const core = group.getObjectByName("core") ?? group;
          const mark = group.getObjectByName("label-anchor");
          const anchor = mark ? mark.getWorldPosition(new Vector3()) : topPoint(core);
          const dist = camera.position.distanceTo(anchor);
          const screen = project(anchor, camera, rect);
          const building = screenBox(core, camera, rect);
          return { ...item, dist, screen, building, behind: screen == null };
        })
        .sort((a, b) => {
          const af = a.plot.order === age && a.plot.order > 0 ? 0 : 1;
          const bf = b.plot.order === age && b.plot.order > 0 ? 0 : 1;
          return af - bf || a.dist - b.dist;
        });
      const focused = ranked.find((item) => item.plot.order === age && item.plot.order > 0 && item.screen && item.building);
      const others = ranked.filter((item) => item !== focused && item.building).map((item) => item.building!);
      const placed: Box[] = [...blocked];
      let extras = 0;
      for (const item of ranked) {
        const current = item === focused;
        const allow = intro !== "play" && shown(item.plot) && !item.behind && item.dist < 34 && (current || (intro !== "run" && extras < 2));
        item.el.classList.toggle("is-focus", Boolean((reading || intro === "run") && current));
        if (!allow || !item.screen || !item.building) {
          item.el.hidden = true;
          continue;
        }
        item.el.hidden = false;
        const width = Math.max(item.el.offsetWidth, item.el.scrollWidth, 64);
        const height = Math.max(item.el.offsetHeight, 22);
        const pinned = current && item.plot.id === "gobble" && item.screen
          ? { x: item.screen.x - width / 2, y: Math.max(8, item.screen.y - height - 8), w: width, h: height }
          : null;
        const spot = pinned
          ?? (current
            ? labelAbove(item.building, rect, width, height, placed, others)
            : labelSpot(item.building, rect, width, height, placed));
        if (!spot) {
          item.el.hidden = true;
          continue;
        }
        if (!current) extras += 1;
        if (current) placed.push(padBox(item.building, 4));
        placed.push(spot);
        item.el.style.opacity = current ? "1" : "0.84";
        item.el.style.transform = `translate(${spot.x + spot.w / 2}px, ${spot.y + spot.h}px) translate(-50%, -100%)`;
      }
    }

    function resize() {
      const rect = frame.getBoundingClientRect();
      camera.aspect = Math.max(1, rect.width) / Math.max(1, rect.height);
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(ratio);
      renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height), false);
    }
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(frame);
    const watcher = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    }, { threshold: 0.02 });
    watcher.observe(frame);

    function tick(now: number) {
      if (!running) return;
      requestAnimationFrame(tick);
      const dt = Math.min(0.05, Math.max(0, (now - clock.last) / 1000));
      clock.last = now;
      clock.t += dt;
      frameDt = frameDt * 0.85 + dt * 0.15;
      if (!visible || document.hidden) return;
      syncStory();
      water.userData.spin(clock.t);
      for (const walker of villagers) walker.step(dt, clock.t);
      cart.step(clock.t);
      for (const cloud of clouds) cloud.step(dt);
      for (const puff of smokes) puff.step(dt, clock.t);
      const gobble = buildings.get("gobble");
      const crane = gobble?.userData.crane as Object3D | undefined;
      const hook = gobble?.userData.hook as Object3D | undefined;
      if (crane) crane.rotation.y = Math.sin(clock.t * 0.35) * 0.12;
      if (hook) hook.position.y = 1.45 + Math.sin(clock.t * 0.9) * 0.16;
      if (gliding && !holding) {
        controls.target.lerp(want.target, 0.12);
        camera.position.lerp(want.position, 0.1);
        if (camera.position.distanceTo(want.position) < 0.22) gliding = false;
      } else if (!holding && document.documentElement.dataset.intro === "done") {
        idleTimer += dt;
        if (idleTimer > 2.8) {
          spherical.setFromVector3(scratch.copy(camera.position).sub(controls.target));
          spherical.theta += dt * 0.055;
          camera.position.copy(controls.target).add(scratch.setFromSpherical(spherical));
        }
      }
      const reach = Math.hypot(controls.target.x, controls.target.z);
      if (reach > 7.5) {
        controls.target.x *= 7.5 / reach;
        controls.target.z *= 7.5 / reach;
      }
      controls.update();
      ratioTimer += dt;
      if (ratioTimer > 1.4) {
        ratioTimer = 0;
        const next = frameDt > 0.034 ? Math.max(modest ? 0.7 : 0.85, ratio - 0.15) : frameDt < 0.018 ? Math.min(ratioCap, ratio + 0.1) : ratio;
        if (Math.abs(next - ratio) > 0.04) {
          ratio = next;
          resize();
        }
      }
      renderer.render(scene, camera);
      frameLabels();
    }

    frame.dataset.mode = "live";
    document.documentElement.dataset.world = "live";
    requestAnimationFrame(tick);

    return () => {
      running = false;
      resizeObserver.disconnect();
      watcher.disconnect();
      window.removeEventListener("pointerup", releaseTouch);
      controls.dispose();
      renderer.dispose();
    };
  } catch (error) {
    console.error(error);
    frame.dataset.mode = "still";
    renderer.dispose();
    return () => {};
  }
}

function gradientMap() {
  if (toonRamp) return toonRamp;
  const data = new Uint8Array([
    72, 64, 58, 255,
    128, 118, 108, 255,
    186, 176, 162, 255,
    226, 218, 206, 255,
    255, 250, 244, 255,
  ]);
  toonRamp = new DataTexture(data, 5, 1);
  toonRamp.magFilter = NearestFilter;
  toonRamp.minFilter = NearestFilter;
  toonRamp.needsUpdate = true;
  return toonRamp;
}

function paint(color: string, map?: MeshToonMaterial["map"]) {
  return new MeshToonMaterial({ color, map: map ?? null, gradientMap: gradientMap() });
}

async function loadAssets(renderer: WebGLRenderer) {
  const ktx2 = new KTX2Loader().setTranscoderPath("/basis/");
  ktx2.detectSupport(renderer);
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).setKTX2Loader(ktx2);
  const [island, villager] = await Promise.all([
    loader.loadAsync("/models/island.glb"),
    loader.loadAsync("/models/villager.glb"),
  ]);
  const templates = new Map<string, Object3D>();
  for (const child of island.scene.children) templates.set(child.name, child);
  return { templates, villagerScene: villager.scene, clips: villager.animations };
}

function compose(id: string, templates: Map<string, Object3D>, modest: boolean) {
  const group = new Group();
  const add = (name: string, height: number, x = 0, y = 0, z = 0, rot = 0, footprint?: number) => {
    const mesh = prop(templates, name, height, footprint);
    mesh.position.x += x;
    mesh.position.y += y;
    mesh.position.z += z;
    mesh.rotation.y += rot;
    group.add(mesh);
    return mesh;
  };
  if (id === "blinkit") {
    add("house", 2.05, 0, 0, 0, 0.35).name = "core";
    add("boxLarge", 0.48, 0.15, 0, 1.15, 0.2);
    add("box", 0.36, 0.55, 0.48, 1.12, 0.4);
    add("box", 0.34, -0.35, 0, 1.2, -0.3);
    add("barrel", 0.46, 1.05, 0, 0.85);
    if (!modest) add("lantern", 0.48, 0.72, 1.35, 0.95);
  } else if (id === "bijak") {
    add("market", 2.25, 0, 0, 0, -0.4).name = "core";
    add("stall", 1.25, 1.35, 0, 0.85, 0.5);
    add("cart", 0.82, -1.45, 0, 0.55, 0.9);
    add("barrel", 0.4, 1.15, 0, -0.15);
    add("box", 0.32, -1.05, 0, -0.35, 0.2);
    add("box", 0.3, 0.85, 0, 1.15, -0.4);
  } else if (id === "tago") {
    add("barracks", 2.15, 0, 0, 0, 0.25).name = "core";
    add("well", 1.05, 1.45, 0, 0.95);
    if (!modest) add("lantern", 0.42, -1.15, 0.9, 0.7);
  } else if (id === "badho") {
    add("castle", 4.55).name = "core";
    add("cart", 0.95, 2.25, 0, 1.65, 0.45);
    if (!modest) add("cart", 0.82, -2.15, 0, 1.35, -0.55);
    add("barrel", 0.5, 1.85, 0, -0.4);
    add("boxLarge", 0.58, -1.7, 0, -0.55, 0.2);
    add("box", 0.36, 2.05, 0.42, 1.15);
  } else if (id === "gobble") {
    scaffold(group, templates);
  } else if (id === "workshop") {
    add("lumbermill", 2.35, 0, 0, 0, 0.85).name = "core";
    add("barrel", 0.48, 1.15, 0, 0.55);
    add("box", 0.38, 1.25, 0, -0.15);
    add("box", 0.32, -1.05, 0, 0.7, 0.4);
    const fire = new Mesh(new SphereGeometry(0.14, 8, 6), new MeshBasicMaterial({ color: "#ff8a3c" }));
    fire.position.set(0.15, 0.42, 0.85);
    fire.name = "fire";
    group.add(fire);
  } else {
    add("watchtower", 2.7).name = "core";
  }
  const ring = new Mesh(
    new RingGeometry(id === "badho" ? 1.85 : 1.15, id === "badho" ? 2.2 : 1.42, 28),
    new MeshBasicMaterial({ color: "#f0d78c", transparent: true, opacity: 0, side: DoubleSide, depthWrite: false }),
  );
  ring.name = "ring";
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.045;
  group.add(ring);
  const shadow = new Mesh(new CircleGeometry(id === "badho" ? 2.35 : id === "gobble" ? 1.7 : 1.4, 18), contactShadow());
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.03;
  shadow.position.x = 0.18;
  group.add(shadow);
  if (!group.getObjectByName("label-anchor")) {
    group.updateMatrixWorld(true);
    const core = group.getObjectByName("core") ?? group;
    const box = new Box3().setFromObject(core);
    const anchor = new Object3D();
    anchor.name = "label-anchor";
    anchor.position.set(0, box.max.y - group.position.y + 0.28, 0);
    group.add(anchor);
  }
  return group;
}

function scaffold(group: Group, templates: Map<string, Object3D>) {
  const core = new Group();
  core.name = "core";
  group.add(core);
  const post = (x: number, z: number, height = 2.45) => {
    const pole = sized(templates, "poles", 0.14, height, 0.14);
    pole.position.set(x, 0, z);
    core.add(pole);
  };
  post(-0.78, -0.52);
  post(0.78, -0.52);
  post(-0.78, 0.52);
  post(0.78, 0.52);
  const deck = (y: number) => {
    const plank = sized(templates, "planks", 1.9, 0.06, 1.25);
    plank.position.set(0, y, 0);
    core.add(plank);
  };
  deck(1.05);
  deck(2.05);
  const mast = sized(templates, "poles", 0.14, 3.05, 0.14);
  mast.position.set(1.05, 0, 0.15);
  core.add(mast);
  const crane = sized(templates, "planks", 1.15, 0.07, 0.12);
  crane.position.set(0.42, 2.62, 0);
  core.add(crane);
  group.userData.crane = crane;
  const hook = sized(templates, "box", 0.28, 0.28, 0.28);
  hook.position.set(0.12, 1.55, 0.05);
  core.add(hook);
  group.userData.hook = hook;
  for (const [x, z] of [[-0.28, 0.05], [0.22, -0.18]] as Array<[number, number]>) {
    const box = sized(templates, "boxLarge", 0.46, 0.38, 0.46);
    box.position.set(x, 0, z);
    core.add(box);
  }
  core.updateMatrixWorld(true);
  const top = new Box3().setFromObject(core);
  const anchor = new Object3D();
  anchor.name = "label-anchor";
  anchor.position.set(0, top.max.y + 0.3, 0);
  group.add(anchor);
}

function sized(templates: Map<string, Object3D>, name: string, xSize: number, ySize: number, zSize: number) {
  const source = templates.get(name);
  if (!source) return new Group();
  const obj = source.clone(true);
  toonize(obj);
  obj.position.set(0, 0, 0);
  obj.rotation.set(0, 0, 0);
  obj.scale.set(1, 1, 1);
  obj.updateMatrixWorld(true);
  const size = new Box3().setFromObject(obj).getSize(new Vector3());
  obj.scale.set(
    xSize / Math.max(size.x, 0.001),
    ySize / Math.max(size.y, 0.001),
    zSize / Math.max(size.z, 0.001),
  );
  settle(obj);
  return obj;
}

function prop(templates: Map<string, Object3D>, name: string, height: number, footprint?: number) {
  const source = templates.get(name);
  if (!source) return new Group();
  const mesh = source.clone(true);
  toonize(mesh);
  fit(mesh, height, footprint);
  return mesh;
}

function settle(obj: Object3D) {
  obj.updateMatrixWorld(true);
  const box = new Box3().setFromObject(obj);
  obj.position.x -= (box.min.x + box.max.x) / 2;
  obj.position.z -= (box.min.z + box.max.z) / 2;
  obj.position.y -= box.min.y;
}

function fit(obj: Object3D, height: number, footprint?: number) {
  obj.position.set(0, 0, 0);
  obj.rotation.set(0, 0, 0);
  obj.scale.set(1, 1, 1);
  obj.updateMatrixWorld(true);
  const size = new Box3().setFromObject(obj).getSize(new Vector3());
  obj.scale.setScalar(height / Math.max(size.y, 0.001));
  if (footprint) {
    obj.updateMatrixWorld(true);
    const foot = new Box3().setFromObject(obj).getSize(new Vector3());
    const wide = Math.max(foot.x, foot.z);
    if (wide > footprint) {
      const k = footprint / wide;
      obj.scale.x *= k;
      obj.scale.z *= k;
    }
  }
  settle(obj);
}

function toneOf(material: { color?: Color; name?: string }) {
  const name = (material.name || "").toLowerCase();
  if (name.includes("grass")) return new Color("#6f9a3a");
  if (name.includes("water")) return new Color("#79b4ba");
  if (name.includes("stone")) return new Color("#d9c7a6");
  if (name.includes("white")) return new Color("#f4e6cc");
  if (material.color) return material.color.clone();
  return new Color("#c4a574");
}

function toonize(root: Object3D) {
  const ramp = gradientMap();
  root.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh) return;
    const source = mesh.material as Material | Material[];
    const list = Array.isArray(source) ? source : [source];
    const next = list.map((material) => {
      const colored = material as Material & { color?: Color; map?: MeshToonMaterial["map"]; name?: string };
      return new MeshToonMaterial({
        color: colored.map ? new Color("#ffffff") : toneOf(colored),
        map: colored.map ?? null,
        gradientMap: ramp,
      });
    });
    mesh.material = Array.isArray(source) ? next : next[0];
    mesh.castShadow = false;
    mesh.receiveShadow = false;
  });
}

function layForest(land: Group, templates: Map<string, Object3D>, modest: boolean) {
  const names = modest ? ["treeA", "pine"] : ["treeA", "treeB", "treeC", "pine"];
  const count = modest ? 9 : 18;
  const spots: Array<[number, number, number]> = [];
  for (let i = 0; i < count * 2 && spots.length < count; i += 1) {
    const theta = (i / (count * 2)) * Math.PI * 2 + (i % 3) * 0.17;
    const edge = islandRadius(theta);
    const radius = edge * (0.48 + (i % 5) * 0.07);
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;
    if (clearOfPlots(x, z, 0.7) && distToRoad(x, z) > 0.9) spots.push([x, z, 0.85 + (i % 5) * 0.08]);
  }
  names.forEach((name, nameIndex) => {
    const source = templates.get(name);
    if (!source) return;
    const chosen = spots.filter((_, index) => index % names.length === nameIndex);
    if (!chosen.length) return;
    const sample = source.clone(true);
    toonize(sample);
    fit(sample, name === "pine" ? 2.35 : 2.9);
    sample.updateMatrixWorld(true);
    instanceAt(land, sample, chosen.map(([x, z, s]) => ({ x, y: heightAt(x, z), z, s, rot: x * 1.7 })));
  });
}

function layRocks(land: Group, templates: Map<string, Object3D>, modest: boolean) {
  const source = templates.get("rocksSmall") ?? templates.get("stone");
  if (!source) return;
  const count = modest ? 5 : 10;
  const spots: Array<[number, number, number]> = [];
  for (let i = 0; i < count; i += 1) {
    const theta = (i / count) * Math.PI * 2 + 0.35;
    const edge = islandRadius(theta);
    const radius = edge * (0.9 + (i % 3) * 0.025);
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;
    if (clearOfPlots(x, z, 0.3)) spots.push([x, z, 0.7 + (i % 3) * 0.18]);
  }
  const sample = source.clone(true);
  toonize(sample);
  fit(sample, 0.48);
  sample.updateMatrixWorld(true);
  instanceAt(land, sample, spots.map(([x, z, s]) => ({ x, y: Math.max(0.02, heightAt(x, z) - 0.04), z, s, rot: z })));
}

function instanceAt(land: Group, sample: Object3D, spots: Array<{ x: number; y: number; z: number; s: number; rot: number }>) {
  const meshes: Mesh[] = [];
  sample.traverse((node) => {
    const mesh = node as Mesh;
    if (mesh.isMesh) meshes.push(mesh);
  });
  for (const mesh of meshes) {
    const geo = mesh.geometry.clone();
    geo.applyMatrix4(mesh.matrixWorld);
    const inst = new InstancedMesh(geo, mesh.material as Material, spots.length);
    spots.forEach((spot, index) => {
      const matrix = new Matrix4().makeRotationY(spot.rot);
      matrix.scale(new Vector3(spot.s, spot.s, spot.s));
      matrix.setPosition(spot.x, spot.y, spot.z);
      inst.setMatrixAt(index, matrix);
    });
    inst.instanceMatrix.needsUpdate = true;
    land.add(inst);
  }
}

function makeVillagers(source: Object3D, clips: AnimationClip[], land: Group, modest: boolean) {
  const find = (name: string) => clips.find((clip) => clip.name === name || clip.name.endsWith(name));
  const walkClip = find("Walk");
  const idleClip = find("Idle");
  const workClip = find("Working") ?? idleClip;
  const curve = road.map(([x, z]) => new Vector3(x, heightAt(x, z), z));
  const count = modest ? 3 : 5;
  const tints = ["#ffffff", "#fff0e0", "#f3e2c4", "#ffe8d4", "#f7f1e6"];
  const spawn = (height: number, tint: string) => {
    const holder = new Group();
    const model = cloneSkinned(source);
    toonize(model);
    tintMesh(model, tint);
    fit(model, height);
    holder.add(model);
    land.add(holder);
    return { holder, model };
  };
  const walkers = Array.from({ length: count }, (_, index) => {
    const { holder, model } = spawn(0.96, tints[index % tints.length]);
    const mixer = new AnimationMixer(model);
    if (walkClip) mixer.clipAction(walkClip).play();
    const era = [1, 2, 3, 4, 4][index] ?? 4;
    return {
      step(dt: number, t: number) {
        const intro = document.documentElement.dataset.intro || "done";
        const age = Number(document.documentElement.dataset.age || 5);
        holder.visible = intro === "play" || intro === "run" || era <= age;
        mixer.update(dt);
        if (!holder.visible || curve.length < 2) return;
        const u = (((t * 0.045 + index / count) % 1) + 1) % 1;
        const f = u * curve.length;
        const i = Math.floor(f) % curve.length;
        const n = (i + 1) % curve.length;
        const span = f - Math.floor(f);
        const a = curve[i];
        const b = curve[n];
        if (!a || !b) return;
        const x = a.x + (b.x - a.x) * span;
        const z = a.z + (b.z - a.z) * span;
        const [sx, sz] = shove(x, z, 0.28);
        holder.position.set(sx, heightAt(sx, sz), sz);
        const ahead = (u + 0.02) % 1;
        const af = ahead * curve.length;
        const ai = Math.floor(af) % curve.length;
        const an = (ai + 1) % curve.length;
        const aspan = af - Math.floor(af);
        const pa = curve[ai];
        const pb = curve[an];
        if (!pa || !pb) return;
        const [ax, az] = shove(pa.x + (pb.x - pa.x) * aspan, pa.z + (pb.z - pa.z) * aspan, 0.28);
        holder.lookAt(ax, holder.position.y, az);
      },
    };
  });
  const posted = modest
    ? [{ era: 1, x: -4.55, z: 1.45 }, { era: 4, x: 4.5, z: 1.35 }]
    : [
        { era: 1, x: -4.55, z: 1.45 },
        { era: 2, x: -3.15, z: -2.15 },
        { era: 3, x: 2.85, z: 2.15 },
        { era: 4, x: 4.5, z: 1.35 },
      ];
  const idlers = posted.map((spot, index) => {
    const [x, z] = shove(spot.x, spot.z, 0.35);
    const { holder, model } = spawn(0.96, tints[(index + 2) % tints.length]);
    holder.position.set(x, heightAt(x, z), z);
    const home = plots.find((plot) => plot.order === spot.era) ?? plots[1];
    holder.lookAt(home.x, holder.position.y, home.z);
    const mixer = new AnimationMixer(model);
    if (idleClip) mixer.clipAction(idleClip).play();
    return {
      step(dt: number) {
        const intro = document.documentElement.dataset.intro || "done";
        const age = Number(document.documentElement.dataset.age || 5);
        holder.visible = intro === "play" || intro === "run" || spot.era <= age;
        mixer.update(dt);
      },
    };
  });
  const crew = modest ? [[6.15, 2.35]] : [[6.15, 2.35], [8.05, 4.15]];
  const builders = crew.map(([x, z], index) => {
    const [sx, sz] = shove(x, z, 0.2);
    const { holder, model } = spawn(0.96, index ? "#f6e4cc" : "#fff6ea");
    holder.position.set(sx, heightAt(sx, sz), sz);
    holder.lookAt(8.05, holder.position.y, 2.05);
    const mixer = new AnimationMixer(model);
    if (workClip) mixer.clipAction(workClip).play();
    return {
      step(dt: number) {
        const intro = document.documentElement.dataset.intro || "done";
        const age = Number(document.documentElement.dataset.age || 5);
        holder.visible = intro === "play" || intro === "run" || age >= 5;
        mixer.update(dt);
      },
    };
  });
  return [...walkers, ...idlers, ...builders];
}

function tintMesh(root: Object3D, hex: string) {
  const tint = new Color(hex);
  root.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh) return;
    const material = mesh.material as MeshToonMaterial;
    material.color.multiply(tint);
  });
}

function makeCart(templates: Map<string, Object3D>, land: Group) {
  const cart = prop(templates, "cart", 0.78);
  land.add(cart);
  const path = [
    [-5.6, 4.15], [-2.4, 4.25], [1.3, 4.15], [4.6, 4.05],
  ].map(([x, z]) => {
    const [sx, sz] = shove(x, z, 0.5);
    return new Vector3(sx, heightAt(sx, sz), sz);
  });
  return {
    step(t: number) {
      const intro = document.documentElement.dataset.intro || "done";
      const age = Number(document.documentElement.dataset.age || 5);
      cart.visible = intro === "play" || intro === "run" || age >= 2;
      if (!cart.visible || path.length < 2) return;
      const scaled = ((Math.sin(t * 0.18) + 1) / 2) * (path.length - 1);
      const i = MathUtils.clamp(Math.floor(scaled), 0, path.length - 2);
      const span = MathUtils.clamp(scaled - i, 0, 1);
      const a = path[i];
      const b = path[i + 1];
      if (!a || !b) return;
      cart.position.lerpVectors(a, b, span);
      cart.position.y = heightAt(cart.position.x, cart.position.z);
      const next = path[Math.min(path.length - 1, i + 1)];
      if (next) cart.lookAt(next.x, cart.position.y, next.z);
    },
  };
}

function buildIsland(material: MeshToonMaterial, modest: boolean) {
  const segs = modest ? 48 : 80;
  const rings = modest ? 16 : 24;
  const positions: number[] = [];
  const colors: number[] = [];
  const grassA = new Color("#86a84e");
  const grassB = new Color("#6f9440");
  const grassC = new Color("#9bb85a");
  const sandA = new Color("#f0d7a4");
  const sandB = new Color("#e4c184");
  const dirt = new Color("#c9a15c");
  const tint = new Color();
  const push = (x: number, z: number) => {
    const y = heightAt(x, z);
    const theta = Math.atan2(z, x);
    const t = Math.hypot(x, z) / islandRadius(theta);
    const n = hash(x, z);
    if (t > 0.78) tint.copy(n > 0.5 ? sandA : sandB);
    else if (n > 0.66) tint.copy(grassC);
    else if (n > 0.33) tint.copy(grassA);
    else tint.copy(grassB);
    const path = distToRoad(x, z);
    if (path < 0.9 && t < 0.84) tint.lerp(dirt, (1 - path / 0.9) * 0.88);
    let shade = 1;
    for (const plot of plots) {
      const d = Math.hypot(x - plot.x, z - plot.z);
      const reach = plot.r * 0.95;
      if (d < reach) shade *= 0.58 + 0.42 * (d / reach);
    }
    shade *= 1 - smooth(0.9, 1, t) * 0.18;
    tint.multiplyScalar(shade);
    positions.push(x, y, z);
    colors.push(tint.r, tint.g, tint.b);
  };
  push(0, 0);
  for (let ring = 1; ring <= rings; ring += 1) {
    for (let s = 0; s < segs; s += 1) {
      const theta = (s / segs) * Math.PI * 2;
      const radius = (ring / rings) * islandRadius(theta);
      push(Math.cos(theta) * radius, Math.sin(theta) * radius);
    }
  }
  const indices: number[] = [];
  for (let s = 0; s < segs; s += 1) indices.push(0, 1 + ((s + 1) % segs), 1 + s);
  for (let ring = 1; ring < rings; ring += 1) {
    const row = 1 + (ring - 1) * segs;
    const next = 1 + ring * segs;
    for (let s = 0; s < segs; s += 1) {
      const s2 = (s + 1) % segs;
      indices.push(row + s, row + s2, next + s2, row + s, next + s2, next + s);
    }
  }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
  geo.setAttribute("color", new BufferAttribute(new Float32Array(colors), 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return new Mesh(geo, material);
}

function hash(x: number, z: number) {
  const n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function buildWater(modest: boolean) {
  const geo = new CircleGeometry(50, modest ? 32 : 64);
  geo.rotateX(-Math.PI / 2);
  const horizon = new Color("#f3c9a2");
  const mesh = new Mesh(
    geo,
    new ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uHorizon: { value: horizon } },
      vertexShader: `
        uniform float uTime;
        varying float vWave;
        varying vec3 vWorld;
        void main() {
          vec4 world = modelMatrix * vec4(position, 1.0);
          float w = sin(world.x * 0.33 + uTime * 0.85) * cos(world.z * 0.27 + uTime * 0.62);
          w += sin(world.x * 0.12 - world.z * 0.09 + uTime * 0.4) * 0.65;
          world.y += w * 0.07;
          vWave = w;
          vWorld = world.xyz;
          gl_Position = projectionMatrix * viewMatrix * world;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uHorizon;
        varying float vWave;
        varying vec3 vWorld;
        float coast(float theta) {
          return 12.6 + sin(theta * 2.0) * 0.9 + cos(theta * 3.0) * 0.42 + sin(theta * 5.0 + 0.7) * 0.28;
        }
        void main() {
          float theta = atan(vWorld.z, vWorld.x);
          float into = coast(theta) - length(vWorld.xz);
          float depth = clamp(-into / 9.0, 0.0, 1.0);
          vec3 shallow = vec3(0.45, 0.74, 0.76);
          vec3 deep = vec3(0.11, 0.38, 0.55);
          vec3 col = mix(shallow, deep, smoothstep(0.0, 0.7, depth));
          col += vec3(0.03, 0.045, 0.04) * vWave * (1.0 - depth);
          float band = smoothstep(-1.25, -0.4, into) * smoothstep(0.18, -0.2, into);
          float ripple = 0.4 + 0.6 * sin(theta * 9.0 - uTime * 2.0);
          col = mix(col, vec3(0.95, 0.98, 0.97), band * ripple * 0.72);
          float far = smoothstep(16.0, 46.0, length(vWorld.xz));
          col = mix(col, uHorizon, far);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    }),
  );
  mesh.position.y = 0.03;
  mesh.userData.horizon = horizon;
  mesh.userData.spin = (t: number) => {
    (mesh.material as ShaderMaterial).uniforms.uTime.value = t;
  };
  return mesh;
}

function buildSky() {
  const geo = new SphereGeometry(90, 24, 14);
  const pos = geo.attributes.position;
  const colors: number[] = [];
  const zenith = new Color("#b9d7ea");
  const mid = new Color("#f6dcc6");
  const horizon = new Color("#f0b98a");
  const sun = new Color("#ffe3b4");
  const sunDir = new Vector3(-0.55, 0.32, 0.42).normalize();
  const tint = new Color();
  const dir = new Vector3();
  for (let i = 0; i < pos.count; i += 1) {
    dir.set(pos.getX(i), pos.getY(i), pos.getZ(i)).normalize();
    const height = MathUtils.clamp((dir.y + 0.08) / 1.05, 0, 1);
    tint.copy(horizon).lerp(mid, Math.min(1, height * 1.35)).lerp(zenith, Math.max(0, height - 0.35));
    const glow = Math.pow(Math.max(0, dir.dot(sunDir)), 16);
    tint.lerp(sun, glow);
    colors.push(tint.r, tint.g, tint.b);
  }
  geo.setAttribute("color", new BufferAttribute(new Float32Array(colors), 3));
  return new Mesh(geo, new MeshBasicMaterial({ vertexColors: true, side: BackSide, fog: false }));
}

function layClouds(scene: Scene, count: number) {
  const puff = new SphereGeometry(1, 8, 6);
  const mat = new MeshBasicMaterial({ color: "#fff8ef", transparent: true, opacity: 0.9, depthWrite: false, fog: false });
  return Array.from({ length: count }, (_, index) => {
    const cloud = new Group();
    const bits: Array<[number, number, number, number]> = [[0, 0, 0, 1.15], [0.95, 0.12, 0.08, 0.78], [-0.9, 0.05, -0.05, 0.7], [0.3, 0.32, -0.15, 0.55]];
    for (const [x, y, z, s] of bits) {
      const mesh = new Mesh(puff, mat);
      mesh.position.set(x, y, z);
      mesh.scale.setScalar(s);
      cloud.add(mesh);
    }
    cloud.position.set(-11 + index * 7.2, 6.4 + (index % 2) * 0.55, -5.2 - index);
    cloud.scale.setScalar(1.15);
    scene.add(cloud);
    return {
      step(dt: number) {
        cloud.position.x += dt * 0.18;
        if (cloud.position.x > 20) cloud.position.x = -20;
      },
    };
  });
}

function laySmoke(buildings: Map<string, Group>) {
  return ["workshop", "blinkit"].flatMap((id) => {
    const host = buildings.get(id);
    if (!host) return [];
    const puff = new Mesh(
      new SphereGeometry(0.12, 6, 5),
      new MeshBasicMaterial({ color: "#f7f1e6", transparent: true, opacity: 0.35, depthWrite: false }),
    );
    puff.position.set(id === "workshop" ? 0.2 : 0.35, id === "workshop" ? 2.15 : 2.2, 0.15);
    host.add(puff);
    const fire = host.getObjectByName("fire") as Mesh | undefined;
    return [{
      step(dt: number, t: number) {
        puff.position.y += dt * 0.22;
        puff.scale.addScalar(dt * 0.35);
        const mat = puff.material as MeshBasicMaterial;
        mat.opacity -= dt * 0.08;
        if (mat.opacity <= 0.02) {
          puff.position.y = id === "workshop" ? 2.05 : 2.15;
          puff.scale.setScalar(1);
          mat.opacity = 0.32;
        }
        if (fire) {
          const s = 0.85 + Math.sin(t * 7) * 0.12;
          fire.scale.setScalar(s);
        }
      },
    }];
  });
}

let sharedShadow: MeshBasicMaterial | null = null;
function contactShadow() {
  if (sharedShadow) return sharedShadow;
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const grd = ctx.createRadialGradient(32, 32, 2, 32, 32, 32);
    grd.addColorStop(0, "rgba(48, 28, 14, 0.45)");
    grd.addColorStop(0.55, "rgba(48, 28, 14, 0.16)");
    grd.addColorStop(1, "rgba(48, 28, 14, 0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 64, 64);
  }
  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  sharedShadow = new MeshBasicMaterial({ map, transparent: true, depthWrite: false });
  return sharedShadow;
}

function topPoint(object: Object3D) {
  const bounds = new Box3().setFromObject(object);
  return new Vector3((bounds.min.x + bounds.max.x) / 2, bounds.max.y + 0.2, (bounds.min.z + bounds.max.z) / 2);
}

function project(point: Vector3, camera: PerspectiveCamera, rect: DOMRect) {
  const projected = point.clone().project(camera);
  if (projected.z > 1) return null;
  return { x: (projected.x * 0.5 + 0.5) * rect.width, y: (-projected.y * 0.5 + 0.5) * rect.height };
}

function screenBox(group: Object3D, camera: PerspectiveCamera, rect: DOMRect): Box | null {
  const bounds = new Box3().setFromObject(group);
  if (bounds.isEmpty()) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const point = new Vector3();
  for (const x of [bounds.min.x, bounds.max.x]) {
    for (const y of [bounds.min.y, bounds.max.y]) {
      for (const z of [bounds.min.z, bounds.max.z]) {
        point.set(x, y, z).project(camera);
        if (point.z > 1) return null;
        const sx = (point.x * 0.5 + 0.5) * rect.width;
        const sy = (-point.y * 0.5 + 0.5) * rect.height;
        minX = Math.min(minX, sx);
        maxX = Math.max(maxX, sx);
        minY = Math.min(minY, sy);
        maxY = Math.max(maxY, sy);
      }
    }
  }
  return { x: minX, y: minY, w: Math.max(18, maxX - minX), h: Math.max(18, maxY - minY) };
}

function labelAbove(building: Box, rect: DOMRect, width: number, height: number, placed: Box[], others: Box[]) {
  const cx = building.x + building.w / 2;
  const candidates: Box[] = [];
  for (let y = building.y - height - 8; y < building.y + building.h * 0.35; y += 18) {
    for (const x of [cx, building.x - width * 0.15, building.x + building.w + width * 0.15]) {
      const box = { x: x - width / 2, y: Math.max(8, y), w: width, h: height };
      if (box.x < 6 || box.x + box.w > rect.width - 6) continue;
      candidates.push(box);
    }
  }
  const clear = (box: Box) => !placed.some((other) => overlaps(box, other)) && !others.some((other) => overlaps(box, other));
  return candidates.find(clear) ?? candidates.find((box) => !placed.some((other) => overlaps(box, other))) ?? candidates[0] ?? null;
}

function labelSpot(building: Box, rect: DOMRect, width: number, height: number, placed: Box[]) {
  const cx = building.x + building.w / 2;
  const candidates = [
    { x: cx, y: building.y - 12 },
    { x: cx, y: building.y - 40 },
    { x: building.x - 8, y: building.y - 8 },
    { x: building.x + building.w + 8, y: building.y - 8 },
  ];
  const keepOff = padBox(building, 8);
  for (const candidate of candidates) {
    const box = { x: candidate.x - width / 2, y: candidate.y - height, w: width, h: height };
    if (box.x < 6 || box.y < 6 || box.x + box.w > rect.width - 6 || box.y + box.h > rect.height - 6) continue;
    if (overlaps(box, keepOff) || placed.some((other) => overlaps(box, other))) continue;
    return box;
  }
  return null;
}

function blockedZones(rect: DOMRect) {
  const zones: Box[] = [];
  const banner = document.querySelector<HTMLElement>(".isl-banner");
  if (banner && !banner.hidden) {
    const box = relativeBox(banner, rect);
    if (box.w > 8 && box.h > 8) zones.push(padBox(box, 12));
  }
  const veil = document.querySelector<HTMLElement>(".veil");
  if (veil) {
    const style = getComputedStyle(veil);
    if (style.visibility !== "hidden" && Number(style.opacity) > 0.05) {
      const box = relativeBox(veil, rect);
      if (box.h > 8) zones.push(box);
    }
  }
  const skip = document.querySelector<HTMLElement>("[data-skip-intro]");
  if (skip && getComputedStyle(skip).display !== "none") {
    const box = relativeBox(skip, rect);
    if (box.w > 8 && box.h > 8) zones.push(padBox(box, 8));
  }
  const top = document.querySelector<HTMLElement>(".top");
  if (top) {
    const box = relativeBox(top, rect);
    if (box.h > 8) zones.push(box);
  }
  return zones;
}

function overlaps(a: Box, b: Box) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
function padBox(box: Box, n: number): Box {
  return { x: box.x - n, y: box.y - n, w: box.w + n * 2, h: box.h + n * 2 };
}
function relativeBox(el: HTMLElement, frameRect: DOMRect): Box {
  const rect = el.getBoundingClientRect();
  return { x: rect.left - frameRect.left, y: rect.top - frameRect.top, w: rect.width, h: rect.height };
}
