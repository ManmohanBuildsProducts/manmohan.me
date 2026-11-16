/**
 * Packs the CC0 island models into two meshopt GLBs.
 * Sources (not committed): Kenney Fantasy Town, Nature, and Survival kits,
 * KayKit Medieval Builder Pack, Quaternius Animated Human. All CC0.
 *
 * Run from a machine that already unpacked those packs:
 *   NODE_PATH=/tmp/node_modules node scripts/pack-island.mjs
 */
import { readFileSync } from "node:fs";
import { Document, NodeIO } from "@gltf-transform/core";
import { EXTMeshoptCompression, KHRMaterialsUnlit, KHRMeshQuantization, KHRTextureTransform } from "@gltf-transform/extensions";
import { center, copyToDocument, dedup, meshopt, prune, quantize, unpartition, weld } from "@gltf-transform/functions";
import { MeshoptEncoder } from "meshoptimizer";

const root = "/tmp/assets";
const parts = [
  ["house", `${root}/kaykit/Models/objects/gltf/house.gltf.glb`],
  ["market", `${root}/kaykit/Models/objects/gltf/market.gltf.glb`],
  ["castle", `${root}/kaykit/Models/objects/gltf/castle.gltf.glb`],
  ["barracks", `${root}/kaykit/Models/objects/gltf/barracks.gltf.glb`],
  ["lumbermill", `${root}/kaykit/Models/objects/gltf/lumbermill.gltf.glb`],
  ["watchtower", `${root}/kaykit/Models/objects/gltf/watchtower.gltf.glb`],
  ["well", `${root}/kaykit/Models/objects/gltf/well.gltf.glb`],
  ["treeA", `${root}/kaykit/Models/objects/gltf/detail_treeA.gltf.glb`],
  ["treeB", `${root}/kaykit/Models/objects/gltf/detail_treeB.gltf.glb`],
  ["treeC", `${root}/kaykit/Models/objects/gltf/detail_treeC.gltf.glb`],
  ["rocks", `${root}/kaykit/Models/objects/gltf/detail_rocks.gltf.glb`],
  ["rocksSmall", `${root}/kaykit/Models/objects/gltf/detail_rocks_small.gltf.glb`],
  ["cart", `${root}/fantasy/Models/GLB format/cart.glb`],
  ["stall", `${root}/fantasy/Models/GLB format/stall.glb`],
  ["poles", `${root}/fantasy/Models/GLB format/poles.glb`],
  ["planks", `${root}/fantasy/Models/GLB format/planks.glb`],
  ["lantern", `${root}/fantasy/Models/GLB format/lantern.glb`],
  ["road", `${root}/fantasy/Models/GLB format/road.glb`],
  ["box", `${root}/survival/Models/GLB format/box.glb`],
  ["boxLarge", `${root}/survival/Models/GLB format/box-large.glb`],
  ["barrel", `${root}/survival/Models/GLB format/barrel.glb`],
  ["pine", `${root}/nature/Models/GLTF format/tree_pineSmallA.glb`],
  ["stone", `${root}/nature/Models/GLTF format/rock_smallFlatB.glb`],
];

function warm(factor) {
  const [r, g, b, a] = factor ?? [0.7, 0.6, 0.4, 1];
  const y = 0.3 * r + 0.59 * g + 0.11 * b;
  const foliage = g > r * 1.12 && g > b * 1.05;
  const water = b > r * 1.25 && b > g * 0.95 && !foliage;
  if (foliage) return [0.18 + y * 0.28, 0.38 + y * 0.42, 0.12 + y * 0.08, a];
  if (water) return [0.12, 0.4, 0.58, a];
  return [
    Math.min(1, 0.16 + y * 1.05),
    Math.min(1, 0.08 + y * 0.72),
    Math.min(1, 0.03 + y * 0.38),
    a,
  ];
}

await MeshoptEncoder.ready;
const io = new NodeIO()
  .registerExtensions([KHRMeshQuantization, EXTMeshoptCompression, KHRTextureTransform, KHRMaterialsUnlit])
  .registerDependencies({ "meshopt.encoder": MeshoptEncoder });

const island = new Document();
const scene = island.createScene("Island");

for (const [name, path] of parts) {
  const src = await io.read(path);
  for (const material of src.getRoot().listMaterials()) {
    material.setBaseColorFactor(warm(material.getBaseColorFactor()));
    material.setRoughnessFactor(1);
    material.setMetallicFactor(0);
  }
  await src.transform(center({ pivot: "below" }));
  const srcScene = src.getRoot().listScenes()[0];
  const wrapper = island.createNode(name);
  scene.addChild(wrapper);
  for (const child of srcScene.listChildren()) {
    const map = copyToDocument(island, src, [child]);
    const copied = map.get(child);
    if (copied) wrapper.addChild(copied);
  }
  console.log("packed", name);
}

await island.transform(
  dedup(),
  prune(),
  weld({ tolerance: 0.0001 }),
  quantize(),
  unpartition(),
  meshopt({ encoder: MeshoptEncoder }),
);
await io.write("/workspace/public/models/island.glb", island);

const human = await io.read("/tmp/assets/human.gltf");
for (const anim of human.getRoot().listAnimations()) {
  const short = anim.getName().split("|").pop() ?? anim.getName();
  if (!["Idle", "Walk", "Working"].includes(short)) anim.dispose();
  else anim.setName(short);
}
const cloth = readFileSync("/tmp/assets/human/Animated Human by @Quaternius/Blend/Textures/ClothedLightSkin.png");
for (const material of human.getRoot().listMaterials()) {
  const texture = human.createTexture("cloth").setImage(cloth).setMimeType("image/png");
  material.setBaseColorTexture(texture);
  material.setBaseColorFactor([1, 1, 1, 1]);
  material.setRoughnessFactor(1);
  material.setMetallicFactor(0);
}
await human.transform(prune(), quantize(), unpartition());
await io.write("/tmp/assets/villager-raw.glb", human);
console.log("villager raw written");
