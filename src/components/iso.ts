/** 2:1 isometric projection. Lighting in the drawings comes from the top left. */

export const OX = 540;
export const OY = 168;
export const HW = 36;
export const HH = 18;

export function iso(gx: number, gy: number, ox = OX, oy = OY) {
  return {
    x: Math.round((ox + (gx - gy) * HW) * 10) / 10,
    y: Math.round((oy + (gx + gy) * HH) * 10) / 10,
  };
}

export function inside(gx: number, gy: number) {
  const dx = (gx - 7.2) / 7.15;
  const dy = (gy - 5.35) / 5.25;
  return dx * dx + dy * dy < 1;
}

export type Tile = { gx: number; gy: number; kind: "sand" | "grass"; shade: number; x: number; y: number };

export function terrain(): Tile[] {
  const tiles: Tile[] = [];
  for (let gy = 0; gy <= 12; gy++) {
    for (let gx = 0; gx <= 15; gx++) {
      if (!inside(gx, gy)) continue;
      const edge =
        !inside(gx + 0.85, gy) ||
        !inside(gx - 0.85, gy) ||
        !inside(gx, gy + 0.85) ||
        !inside(gx, gy - 0.85);
      const p = iso(gx, gy);
      tiles.push({ gx, gy, kind: edge ? "sand" : "grass", shade: (gx * 3 + gy) % 3, ...p });
    }
  }
  tiles.sort((a, b) => a.gx + a.gy - (b.gx + b.gy) || a.gx - b.gx);
  return tiles;
}

export function diamond(cx: number, cy: number, hw = HW, hh = HH) {
  return `${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}`;
}

/** Grid anchors for buildings and people. Screen position comes from iso(). */
export const anchor: Record<string, [number, number]> = {
  blinkit: [3.1, 6.3],
  bijak: [5.2, 5.2],
  tago: [7.15, 4.15],
  badho: [8.9, 2.85],
  gobble: [11.15, 4.7],
  workshop: [2.5, 7.7],
  watchtower: [12.15, 2.55],
  picker: [2.2, 7.15],
  trader: [4.3, 6.15],
  carer: [6.3, 5.35],
  kirana1: [7.6, 4.15],
  seller2: [8.3, 4.35],
  seller1: [9.7, 4.05],
  kirana2: [10.3, 5.55],
  jarvis: [11.7, 5.7],
  coach: [3.7, 7.85],
  builder: [1.7, 8.15],
  scout: [12.15, 2.55],
};

export function at(id: string) {
  const pair = anchor[id];
  if (!pair) return { x: OX, y: OY };
  return iso(pair[0], pair[1]);
}
