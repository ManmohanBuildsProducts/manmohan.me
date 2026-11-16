import {
  AmbientLight,
  AnimationMixer,
  BackSide,
  Box3,
  CanvasTexture,
  CircleGeometry,
  Color,
  DataTexture,
  DirectionalLight,
  DoubleSide,
  Float32BufferAttribute,
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

const Y = 0.7;
const plots: Plot[] = [
  { id: "workshop", name: "Workshop", order: 0, x: -10.2, z: 4.6, r: 1.7, href: "#build", label: "The Workshop" },
  { id: "blinkit", name: "Blinkit", order: 1, x: -6.6, z: 1.15, r: 1.7, href: "#blinkit", label: "Blinkit" },
  { id: "bijak", name: "Bijak", order: 2, x: -2.7, z: -1.7, r: 1.9, href: "#bijak", label: "Bijak" },
  { id: "tago", name: "Tago Care", order: 3, x: 1.15, z: 2.35, r: 1.85, href: "#tago", label: "Tago Care" },
  { id: "badho", name: "Badho", order: 4, x: 4.7, z: -1.15, r: 2.55, href: "#badho", label: "Badho" },
  { id: "gobble", name: "GobbleCube", order: 5, x: 8.15, z: 2.15, r: 2.05, href: "#gobble", label: "GobbleCube" },
  { id: "watchtower", name: "Watchtower", order: 0, x: 10.4, z: -3.7, r: 1.2, href: "#islands", label: "Watchtower" },
];

const road: Array<[number, number]> = [
  [-8.6, 3.5], [-5.2, 4.15], [-1.2, 4.05], [2.5, 4.2], [6.2, 3.9],
  [9.2, 2.15], [9.7, -0.4], [8.2, -3.15], [4.4, -4.15], [0.2, -4.05],
  [-3.6, -4.05], [-7.2, -3.2], [-9.4, -0.7], [-9.5, 1.5],
];

let toonRamp: DataTexture | null = null;

export async function mount(frame: HTMLElement) {
  const canvas = frame.querySelector("canvas");
  const labelRoot = frame.querySelector<HTMLElement>("[data-labels]");
  if (!canvas || !labelRoot) return () => {};
  const mobile = window.matchMedia("(max-width: 800px)").matches;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency ?? 8;
  const modest = mobile || memory <= 4 || cores <= 4;

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
  const camera = new PerspectiveCamera(46, 1, 0.1, 140);
  camera.position.set(8, 15.5, 26);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, modest ? 1 : 1.5));
  renderer.setClearColor("#f6dcc4", 1);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.rotateSpeed = mobile ? 0.65 : 0.55;
  controls.zoomSpeed = 0.65;
  controls.panSpeed = 0.45;
  controls.minPolarAngle = 0.32;
  controls.maxPolarAngle = 1.08;
  controls.minDistance = 8;
  controls.maxDistance = 46;
  controls.target.set(0, 0.8, 0);
  controls.enabled = document.documentElement.dataset.intro === "done";
  canvas.style.touchAction = mobile ? "pan-y" : "none";

  scene.add(buildSky());
  const hemi = new HemisphereLight("#fff1dc", "#6d8a55", 0.9);
  const sun = new DirectionalLight("#ffd7a8", 1.45);
  sun.position.set(-8, 12, 6);
  scene.add(hemi, sun, new AmbientLight("#fff6ea", 0.32));

  const land = new Group();
  scene.add(land);
  const grass = paint("#3c8f3e");
  grass.vertexColors = true;
  const island = buildIsland(grass);
  island.position.y = Y;
  land.add(island);
  const foam = buildFoam();
  land.add(foam.mesh);
  const water = buildWater();
  scene.add(water);
  const shade = new Mesh(
    new CircleGeometry(12.4, modest ? 24 : 40),
    new MeshBasicMaterial({ color: "#062033", transparent: true, opacity: 0.28 }),
  );
  shade.rotation.x = -Math.PI / 2;
  shade.position.y = 0.02;
  scene.add(shade);

  try {
    const loaded = await loadAssets(renderer);
    const buildings = new Map<string, Group>();
    for (const plot of plots) {
      const group = compose(plot.id, loaded.templates, modest);
      group.position.set(plot.x, Y, plot.z);
      group.userData.plot = plot;
      land.add(group);
      buildings.set(plot.id, group);
    }
    layRoad(land, loaded.templates);
    layForest(land, loaded.templates, modest);
    layRocks(land, loaded.templates, modest);
    const villagers = makeVillagers(loaded.villagerScene, loaded.clips, land, modest);
    const cart = makeCart(loaded.templates, land);
    const clouds = layClouds(scene, modest ? 3 : 5);
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
      window.dispatchEvent(new CustomEvent("mm-open-dossier", { detail: { id: plot.id } }));
    }

    function setWant(plot?: Plot) {
      if (!plot) {
        want.position.set(8, 15.5, 26);
        want.target.set(0, 0.8, 0);
        return;
      }
      const center = buildings.get(plot.id)?.getWorldPosition(new Vector3()) ?? new Vector3(plot.x, Y, plot.z);
      want.target.set(center.x, center.y + 1.1, center.z);
      const outward = new Vector3(center.x, 0, center.z);
      if (outward.length() < 0.4) outward.set(1, 0, 1);
      outward.normalize();
      want.position.set(center.x + outward.x * 7.4, center.y + 4.4, center.z + outward.z * 7.4);
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
      const dawn = new Color("#ffd8b0");
      const gold = new Color("#f0a05a");
      sun.color.copy(dawn).lerp(gold, day);
      sun.intensity = 1.2 + day * 0.28;
      sun.position.set(-11 + day * 16, 12 - day * 3, 7 - day * 8);
      const sky = new Color("#f7e0c8").lerp(new Color("#f3c9a2"), day);
      scene.fog = new Fog(sky.getStyle(), 50, 112);
      renderer.setClearColor(sky, 1);
      hemi.color.copy(dawn).lerp(new Color("#ffe6c2"), day);
      for (const [id, group] of buildings) {
        const plot = plots.find((item) => item.id === id)!;
        const on = shown(plot);
        group.scale.lerp(new Vector3(on ? 1 : 0.001, on ? 1 : 0.001, on ? 1 : 0.001), on ? 0.12 : 0.2);
        group.visible = group.scale.y > 0.05;
        const ring = group.getObjectByName("ring") as Mesh | undefined;
        const current = reading && plot.order === age && plot.order > 0;
        const ringMat = ring?.material as MeshBasicMaterial | undefined;
        if (ringMat) ringMat.opacity = MathUtils.lerp(ringMat.opacity, current ? 0.85 : 0, 0.08);
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
          const group = buildings.get(item.plot.id)!;
          const core = group.getObjectByName("core") ?? group;
          const anchor = topPoint(core);
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
        const spot = current
          ? labelAbove(item.building, rect, width, height, placed, others)
          : labelSpot(item.building, rect, width, height, placed);
        if (!spot) {
          item.el.hidden = true;
          continue;
        }
        if (!current) extras += 1;
        if (current && item.building) placed.push(padBox(item.building, 4));
        placed.push(spot);
        item.el.style.opacity = current ? "1" : "0.84";
        item.el.style.transform = `translate(${spot.x + spot.w / 2}px, ${spot.y + spot.h}px) translate(-50%, -100%)`;
      }
    }

    function resize() {
      const rect = frame.getBoundingClientRect();
      camera.aspect = Math.max(1, rect.width) / Math.max(1, rect.height);
      camera.updateProjectionMatrix();
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
      const dt = Math.min(0.05, (now - clock.last) / 1000);
      clock.last = now;
      clock.t += dt;
      if (!visible || document.hidden) return;
      syncStory();
      water.userData.spin(clock.t);
      foam.spin(clock.t);
      for (const walker of villagers) walker.step(dt, clock.t);
      cart.step(clock.t);
      for (const cloud of clouds) cloud.step(dt);
      for (const puff of smokes) puff.step(dt);
      if (gliding && !holding) {
        controls.target.lerp(want.target, 0.12);
        camera.position.lerp(want.position, 0.1);
        if (camera.position.distanceTo(want.position) < 0.25) gliding = false;
      } else if (!holding && document.documentElement.dataset.intro === "done") {
        idleTimer += dt;
        if (idleTimer > 2.8) {
          spherical.setFromVector3(scratch.copy(camera.position).sub(controls.target));
          spherical.theta += dt * 0.06;
          camera.position.copy(controls.target).add(scratch.setFromSpherical(spherical));
        }
      }
      const reach = Math.hypot(controls.target.x, controls.target.z);
      if (reach > 8) {
        controls.target.x *= 8 / reach;
        controls.target.z *= 8 / reach;
      }
      controls.update();
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
    78, 70, 62, 255,
    132, 122, 110, 255,
    186, 174, 158, 255,
    230, 220, 206, 255,
    255, 250, 244, 255,
  ]);
  toonRamp = new DataTexture(data, 5, 1);
  toonRamp.magFilter = NearestFilter;
  toonRamp.minFilter = NearestFilter;
  toonRamp.colorSpace = SRGBColorSpace;
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
  const add = (name: string, height: number, x = 0, y = 0, z = 0, rot = 0) => {
    const mesh = prop(templates, name, height);
    mesh.position.set(x, y, z);
    mesh.rotation.y = rot;
    group.add(mesh);
    return mesh;
  };
  if (id === "blinkit") {
    add("house", 2.35).name = "core";
    add("box", 0.42, 1.15, 0, 0.85, 0.4);
    add("boxLarge", 0.55, 1.35, 0, 0.35, -0.2);
    add("barrel", 0.48, -1.2, 0, 0.9);
    if (!modest) add("lantern", 0.55, 0.7, 1.5, 1.05);
  } else if (id === "bijak") {
    add("market", 2.55).name = "core";
    add("stall", 1.15, 1.45, 0, 0.2, 0.6);
    add("cart", 0.85, -1.55, 0, 0.35, 0.8);
    add("barrel", 0.42, 1.15, 0, -0.7);
    add("box", 0.36, -1.15, 0, -0.55, 0.3);
  } else if (id === "tago") {
    add("barracks", 2.15, 0, 0, 0, 0.4).name = "core";
    add("well", 1.15, 1.55, 0, 0.85);
  } else if (id === "badho") {
    add("castle", 4.35).name = "core";
    add("cart", 0.95, 2.15, 0, 1.15, 0.5);
    if (!modest) add("cart", 0.8, -2.05, 0, 0.7, -0.4);
    add("barrel", 0.5, 1.7, 0, -1.2);
    add("boxLarge", 0.6, -1.6, 0, -1.15, 0.2);
  } else if (id === "gobble") {
    scaffold(group, templates);
  } else if (id === "workshop") {
    add("lumbermill", 2.45, 0, 0, 0, 0.7).name = "core";
    add("barrel", 0.46, 1.2, 0, 0.4);
    add("box", 0.4, 1.35, 0, -0.15);
  } else {
    add("watchtower", 3.3).name = "core";
  }
  const ring = new Mesh(
    new RingGeometry(id === "badho" ? 1.7 : 1.2, id === "badho" ? 2.05 : 1.5, 28),
    new MeshBasicMaterial({ color: "#f0d78c", transparent: true, opacity: 0, side: DoubleSide, depthWrite: false }),
  );
  ring.name = "ring";
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.04;
  group.add(ring);
  const shadow = new Mesh(new CircleGeometry(id === "badho" ? 2.1 : 1.45, 16), contactShadow());
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.03;
  group.add(shadow);
  if (!group.getObjectByName("label-anchor")) {
    group.updateMatrixWorld(true);
    const box = new Box3().setFromObject(group);
    const anchor = new Object3D();
    anchor.name = "label-anchor";
    anchor.position.set(0, box.max.y - group.position.y + 0.15, 0);
    group.add(anchor);
  }
  return group;
}

function scaffold(group: Group, templates: Map<string, Object3D>) {
  const frame = prop(templates, "poles", 2.8);
  frame.name = "core";
  group.add(frame);
  const deck = prop(templates, "planks", 0.1);
  deck.position.y = 1.25;
  group.add(deck);
  const crane = prop(templates, "poles", 1.5);
  crane.rotation.z = -0.7;
  crane.position.set(1.15, 1.7, 0);
  group.add(crane);
  const hook = prop(templates, "box", 0.28);
  hook.position.set(1.7, 1.15, 0.2);
  group.add(hook);
  const anchor = new Object3D();
  anchor.name = "label-anchor";
  anchor.position.set(0, 3.05, 0);
  group.add(anchor);
}

function prop(templates: Map<string, Object3D>, name: string, height: number) {
  const source = templates.get(name);
  if (!source) return new Group();
  const mesh = source.clone(true);
  toonize(mesh);
  fit(mesh, height);
  return mesh;
}

function fit(obj: Object3D, height: number) {
  obj.position.set(0, 0, 0);
  obj.rotation.set(0, 0, 0);
  obj.scale.set(1, 1, 1);
  obj.updateMatrixWorld(true);
  const box = new Box3().setFromObject(obj);
  const size = box.getSize(new Vector3());
  obj.scale.setScalar(height / Math.max(size.y, 0.001));
  obj.updateMatrixWorld(true);
  const grounded = new Box3().setFromObject(obj);
  obj.position.y -= grounded.min.y;
  obj.position.x -= (grounded.min.x + grounded.max.x) / 2;
  obj.position.z -= (grounded.min.z + grounded.max.z) / 2;
}

function toonize(root: Object3D) {
  const ramp = gradientMap();
  root.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh) return;
    const source = mesh.material;
    const list = Array.isArray(source) ? source : [source];
    const next = list.map((material) => {
      const colored = material as Material & { color?: Color; map?: MeshToonMaterial["map"] };
      const mat = new MeshToonMaterial({
        color: colored.map ? new Color("#ffffff") : colored.color ? colored.color.clone() : new Color("#c4a574"),
        map: colored.map ?? null,
        gradientMap: ramp,
      });
      return mat;
    });
    mesh.material = Array.isArray(source) ? next : next[0];
    mesh.castShadow = false;
    mesh.receiveShadow = false;
  });
}

function layForest(land: Group, templates: Map<string, Object3D>, modest: boolean) {
  const names = modest ? ["treeA", "treeC"] : ["treeA", "treeB", "treeC", "pine"];
  const spots: Array<[number, number, number]> = [
    [-8.2, 1.2, 1], [-5.6, 2.6, 0.9], [-3.2, 3.6, 1.1], [0.4, 4.7, 0.85], [3.6, 4.55, 1],
    [6.8, 3.3, 0.95], [8.6, 0.4, 1.05], [7.2, -2.4, 0.9], [3.0, -3.4, 1], [-1.0, -3.0, 0.85],
    [-4.8, -2.4, 1.1], [-7.8, -1.1, 0.9], [-4.4, 0.5, 0.8], [6.0, -0.8, 1],
  ];
  const used = spots.filter(([x, z], index) => clearOfPlots(x, z, 0.85) && Math.hypot(x, z) < 10.3 && (!modest || index % 2 === 0));
  for (const name of names) {
    const source = templates.get(name);
    if (!source) continue;
    const sample = source.clone(true);
    toonize(sample);
    fit(sample, name === "pine" ? 1.65 : 2.1);
    sample.updateMatrixWorld(true);
    const chosen = used.filter((_, index) => index % names.length === names.indexOf(name));
    if (!chosen.length) continue;
    const meshes: Mesh[] = [];
    sample.traverse((node) => {
      const mesh = node as Mesh;
      if (mesh.isMesh) meshes.push(mesh);
    });
    for (const mesh of meshes) {
      const geo = mesh.geometry.clone();
      geo.applyMatrix4(mesh.matrixWorld);
      const inst = new InstancedMesh(geo, mesh.material as Material, chosen.length);
      chosen.forEach(([x, z, s], index) => {
        const matrix = new Matrix4().makeRotationY(index * 1.3);
        matrix.scale(new Vector3(s, s, s));
        matrix.setPosition(x, Y, z);
        inst.setMatrixAt(index, matrix);
      });
      inst.instanceMatrix.needsUpdate = true;
      land.add(inst);
    }
  }
}

function layRocks(land: Group, templates: Map<string, Object3D>, modest: boolean) {
  const spots: Array<[number, number]> = [
    [-9.4, -2.2], [-6.6, -4.7], [1.6, -5.2], [7.8, -4.3], [10.3, 1.2], [-9.9, 3.4], [4.6, 5.3], [-2.4, 5.5],
  ];
  const count = modest ? 4 : spots.length;
  const source = templates.get("rocksSmall") ?? templates.get("stone");
  if (!source) return;
  const sample = source.clone(true);
  toonize(sample);
  fit(sample, 0.55);
  sample.updateMatrixWorld(true);
  const meshes: Mesh[] = [];
  sample.traverse((node) => {
    const mesh = node as Mesh;
    if (mesh.isMesh) meshes.push(mesh);
  });
  for (const mesh of meshes) {
    const geo = mesh.geometry.clone();
    geo.applyMatrix4(mesh.matrixWorld);
    const inst = new InstancedMesh(geo, mesh.material as Material, count);
    for (let index = 0; index < count; index++) {
      const [x, z] = spots[index];
      const matrix = new Matrix4().makeRotationY(index * 0.7);
      matrix.setPosition(x, Y - 0.02, z);
      inst.setMatrixAt(index, matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
    land.add(inst);
  }
}

function layRoad(land: Group, templates: Map<string, Object3D>) {
  const source = templates.get("road");
  if (!source) return;
  const sample = source.clone(true);
  toonize(sample);
  fit(sample, 0.06);
  sample.updateMatrixWorld(true);
  const matrices: Matrix4[] = [];
  for (let i = 0; i < road.length; i++) {
    const a = road[i];
    const b = road[(i + 1) % road.length];
    const matrix = new Matrix4().makeRotationY(Math.atan2(b[0] - a[0], b[1] - a[1]));
    matrix.setPosition((a[0] + b[0]) / 2, Y + 0.035, (a[1] + b[1]) / 2);
    matrices.push(matrix);
  }
  const meshes: Mesh[] = [];
  sample.traverse((node) => {
    const mesh = node as Mesh;
    if (mesh.isMesh) meshes.push(mesh);
  });
  for (const mesh of meshes) {
    const geo = mesh.geometry.clone();
    geo.applyMatrix4(mesh.matrixWorld);
    const inst = new InstancedMesh(geo, mesh.material as Material, matrices.length);
    matrices.forEach((matrix, index) => inst.setMatrixAt(index, matrix));
    inst.instanceMatrix.needsUpdate = true;
    land.add(inst);
  }
}

function makeVillagers(source: Object3D, clips: AnimationClip[], land: Group, modest: boolean) {
  const find = (name: string) => clips.find((clip) => clip.name === name || clip.name.endsWith(name));
  const walkClip = find("Walk");
  const workClip = find("Working") ?? find("Idle");
  const curve = road.map(([x, z]) => new Vector3(x, Y, z));
  const count = modest ? 4 : 7;
  const walkers = Array.from({ length: count }, (_, index) => {
    const holder = new Group();
    const model = cloneSkinned(source);
    toonize(model);
    fit(model, 0.92);
    model.rotation.y = Math.PI;
    holder.add(model);
    land.add(holder);
    const mixer = new AnimationMixer(model);
    if (walkClip) mixer.clipAction(walkClip).play();
    const era = index < 1 ? 1 : index < 2 ? 2 : index < 3 ? 3 : index < 6 ? 4 : 5;
    return {
      step(dt: number, t: number) {
        const age = Number(document.documentElement.dataset.age || 5);
        holder.visible = era <= age;
        mixer.update(dt);
        if (!holder.visible) return;
        const u = (t * 0.03 + index / count) % 1;
        const f = u * curve.length;
        const i = Math.floor(f) % curve.length;
        const n = (i + 1) % curve.length;
        holder.position.lerpVectors(curve[i], curve[n], f - Math.floor(f));
        holder.position.y = Y;
        holder.lookAt(curve[n].x, Y, curve[n].z);
      },
    };
  });
  const crew = modest ? [[8.95, 3.3]] : [[8.95, 3.3], [7.25, 3.15]];
  const builders = crew.map(([x, z]) => {
    const holder = new Group();
    const model = cloneSkinned(source);
    toonize(model);
    fit(model, 0.92);
    model.rotation.y = Math.PI;
    holder.add(model);
    holder.position.set(x, Y, z);
    holder.lookAt(8.15, Y, 2.15);
    land.add(holder);
    const mixer = new AnimationMixer(model);
    if (workClip) mixer.clipAction(workClip).play();
    return {
      step(dt: number) {
        holder.visible = Number(document.documentElement.dataset.age || 5) >= 5;
        mixer.update(dt);
        holder.position.y = Y;
      },
    };
  });
  return [...walkers, ...builders];
}

function makeCart(templates: Map<string, Object3D>, land: Group) {
  const cart = prop(templates, "cart", 0.72);
  land.add(cart);
  const path = [new Vector3(-4.4, Y, 0.15), new Vector3(-1.2, Y, -0.25), new Vector3(2.2, Y, 0.1), new Vector3(6.5, Y, 0.9)];
  return {
    step(t: number) {
      const age = Number(document.documentElement.dataset.age || 5);
      cart.visible = age >= 2;
      if (!cart.visible) return;
      const scaled = ((Math.sin(t * 0.16) + 1) / 2) * (path.length - 1);
      const i = Math.min(path.length - 2, Math.floor(scaled));
      cart.position.lerpVectors(path[i], path[i + 1], scaled - i);
      const next = path[Math.min(path.length - 1, i + 1)];
      cart.lookAt(next.x, cart.position.y, next.z);
    },
  };
}

function clearOfPlots(x: number, z: number, pad: number) {
  return plots.every((plot) => Math.hypot(x - plot.x, z - plot.z) > plot.r + pad);
}

function buildIsland(material: MeshToonMaterial) {
  const geo = new CircleGeometry(11.4, 64);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors: number[] = [];
  const tint = new Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const radius = Math.hypot(x, z) / 11.4;
    const sand = radius > 0.78;
    tint.set(sand ? (i % 3 === 0 ? "#f0d59a" : "#e4c27a") : i % 2 ? "#3f9444" : "#327c38");
    colors.push(tint.r, tint.g, tint.b);
    if (!sand) pos.setY(i, Math.sin(x * 1.3) * Math.cos(z * 1.05) * 0.05);
  }
  geo.setAttribute("color", new Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return new Mesh(geo, material);
}

function buildWater() {
  const geo = new CircleGeometry(46, 40);
  geo.rotateX(-Math.PI / 2);
  const mesh = new Mesh(
    geo,
    new ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        uniform float uTime;
        varying float vWave;
        void main() {
          vec3 p = position;
          float w = sin(p.x * 0.22 + uTime * 0.7) * cos(p.z * 0.18 + uTime * 0.55);
          p.y += w * 0.16;
          vWave = w;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        varying float vWave;
        void main() {
          float f = smoothstep(-1.0, 1.0, vWave);
          vec3 deep = vec3(0.11, 0.32, 0.48);
          vec3 crest = vec3(0.35, 0.62, 0.74);
          gl_FragColor = vec4(mix(deep, crest, f), 0.96);
        }
      `,
    }),
  );
  mesh.position.y = -0.12;
  mesh.userData.spin = (t: number) => {
    (mesh.material as ShaderMaterial).uniforms.uTime.value = t;
  };
  return mesh;
}

function buildFoam() {
  const mesh = new Mesh(
    new RingGeometry(10.85, 12.15, 72),
    new MeshBasicMaterial({ color: "#f4fbff", transparent: true, opacity: 0.45, side: DoubleSide, depthWrite: false }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.1;
  return {
    mesh,
    spin(t: number) {
      const mat = mesh.material as MeshBasicMaterial;
      mat.opacity = 0.32 + Math.sin(t * 1.3) * 0.12;
      mesh.scale.setScalar(1 + Math.sin(t * 0.8) * 0.012);
    },
  };
}

function buildSky() {
  const geo = new SphereGeometry(80, 18, 10);
  const pos = geo.attributes.position;
  const colors: number[] = [];
  const zenith = new Color("#d7ebf4");
  const mid = new Color("#f6dcc4");
  const horizon = new Color("#f0c196");
  const tint = new Color();
  for (let i = 0; i < pos.count; i++) {
    const height = MathUtils.clamp((pos.getY(i) / 80 + 0.18) / 1.05, 0, 1);
    tint.copy(horizon).lerp(mid, Math.min(1, height * 1.4)).lerp(zenith, Math.max(0, height - 0.4));
    colors.push(tint.r, tint.g, tint.b);
  }
  geo.setAttribute("color", new Float32BufferAttribute(colors, 3));
  return new Mesh(geo, new MeshBasicMaterial({ vertexColors: true, side: BackSide, fog: false }));
}

function layClouds(scene: Scene, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const cloud = new Mesh(new SphereGeometry(1.05 + index * 0.12, 8, 6), new MeshBasicMaterial({ color: "#fffaf3", transparent: true, opacity: 0.82 }));
    cloud.scale.set(1.8, 0.55, 1);
    cloud.position.set(-8 + index * 5, 7.4 + (index % 2) * 0.4, -3 + index);
    scene.add(cloud);
    return {
      step(dt: number) {
        cloud.position.x += dt * 0.15;
        if (cloud.position.x > 18) cloud.position.x = -18;
      },
    };
  });
}

function laySmoke(buildings: Map<string, Group>) {
  return ["blinkit", "workshop"].flatMap((id) => {
    const host = buildings.get(id);
    if (!host) return [];
    const puff = new Mesh(new SphereGeometry(0.12, 6, 5), new MeshBasicMaterial({ color: "#f7f1e6", transparent: true, opacity: 0.35, depthWrite: false }));
    puff.position.set(0.4, 2.5, 0.2);
    host.add(puff);
    return [{
      step(dt: number) {
        puff.position.y += dt * 0.22;
        puff.scale.addScalar(dt * 0.35);
        const mat = puff.material as MeshBasicMaterial;
        mat.opacity -= dt * 0.1;
        if (mat.opacity <= 0.02) {
          puff.position.y = 2.4;
          puff.scale.setScalar(1);
          mat.opacity = 0.35;
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
    grd.addColorStop(0, "rgba(42, 24, 10, 0.5)");
    grd.addColorStop(0.6, "rgba(42, 24, 10, 0.16)");
    grd.addColorStop(1, "rgba(42, 24, 10, 0)");
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
  return new Vector3((bounds.min.x + bounds.max.x) / 2, bounds.max.y, (bounds.min.z + bounds.max.z) / 2);
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
