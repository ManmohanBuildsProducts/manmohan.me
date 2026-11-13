import { existsSync } from "node:fs";
import { join } from "node:path";

/** Public URL for a sprite file, or "" when the file is not in public/sprites yet. */
export function sprite(file: string) {
  return existsSync(join(process.cwd(), "public", "sprites", file)) ? `/sprites/${file}` : "";
}

/**
 * Painted sprites. Each slot is independent: an empty string keeps the vector stand-in.
 * Drop WebP files in public/sprites using these names.
 */
export const sprites = {
  terrain: {
    grass: sprite("tile-grass.webp"),
    sand: sprite("tile-sand.webp"),
    water: sprite("tile-water.webp"),
  },
  trees: [sprite("tree-b.webp"), sprite("tree-a.webp")],
  rocks: sprite("rocks.webp"),
  buildings: {
    blinkit: sprite("age1-blinkit.webp"),
    bijak: sprite("age2-bijak.webp"),
    tago: sprite("age3-tagocare.webp"),
    badho: sprite("age4-badho-wonder.webp"),
    gobble: sprite("age5-gobblecube-scaffold.webp"),
    workshop: sprite("workshop.webp"),
    watchtower: sprite("watchtower.webp"),
  } as Record<string, string>,
  villagers: {
    picker: { stand: sprite("picker.webp") },
    trader: { stand: sprite("trader.webp") },
    carer: { stand: sprite("caregiver.webp") },
    kirana1: { stand: sprite("kirana.webp"), walk: sprite("kirana-walk.webp") },
    kirana2: { stand: sprite("kirana.webp") },
    seller1: { stand: sprite("seller.webp"), walk: sprite("seller-walk.webp") },
    seller2: { stand: sprite("seller.webp") },
    jarvis: { stand: sprite("foreman.webp") },
    coach: { stand: sprite("herald.webp") },
    scout: { stand: sprite("scout.webp") },
    builder: { stand: sprite("builder.webp"), walk: sprite("builder-walk.webp") },
  } as Record<string, { stand: string; walk?: string }>,
};

/** First view only: open island, workshop, watchtower, and the people already on it. */
export const preloadedSprites = [
  sprites.terrain.grass,
  sprites.terrain.sand,
  sprites.terrain.water,
  sprites.trees[0],
  sprites.trees[1],
  sprites.rocks,
  sprites.buildings.workshop,
  sprites.buildings.watchtower,
  sprites.villagers.coach.stand,
  sprites.villagers.builder.stand,
  sprites.villagers.builder.walk,
  sprites.villagers.scout.stand,
].filter(Boolean);
