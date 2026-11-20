// Campus map dimensions in SVG units, and view boxes that zoom in on a lot.
export const MAP_WIDTH = 1000;
export const MAP_HEIGHT = 612;

// Crops the map to a box around one lot, keeping the given width:height aspect and staying on the map.
export function getFocusViewBox(lot, aspect = 2) {
  const xs = lot.coordinates.points.map(([x]) => x);
  const ys = lot.coordinates.points.map(([, y]) => y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const lotW = Math.max(...xs) - minX;
  const lotH = Math.max(...ys) - minY;

  const width = Math.min(MAP_WIDTH, Math.max(260, lotW * 2.4, lotH * 2.4 * aspect));
  const height = Math.min(MAP_HEIGHT, width / aspect);
  const clamp = (v, max) => Math.min(Math.max(v, 0), max);
  const x = clamp(minX + lotW / 2 - width / 2, MAP_WIDTH - width);
  const y = clamp(minY + lotH / 2 - height / 2, MAP_HEIGHT - height);

  return [x, y, width, height].map((v) => Math.round(v * 10) / 10).join(' ');
}
