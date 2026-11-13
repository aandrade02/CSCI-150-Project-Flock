// Label layout for polygon parking lots on the campus map.
// Lots are { points: [[x, y], ...], label: { x, y } } in the map's SVG units.

// Length of the chord through the polygon along a horizontal line y = at
// (or a vertical line x = at when `vertical`), for the stretch containing `around`.
function polygonChord(points, at, around, vertical) {
  const hits = [];
  points.forEach((p, i) => {
    const q = points[(i + 1) % points.length];
    const [a0, a1] = vertical ? [p[0], p[1]] : [p[1], p[0]];
    const [b0, b1] = vertical ? [q[0], q[1]] : [q[1], q[0]];
    if ((a0 <= at) !== (b0 <= at)) hits.push(a1 + ((at - a0) / (b0 - a0)) * (b1 - a1));
  });
  hits.sort((m, n) => m - n);
  for (let i = 0; i + 1 < hits.length; i += 2) {
    if (around >= hits[i] && around <= hits[i + 1]) return hits[i + 1] - hits[i];
  }
  return 0;
}

export function getLotLabelLayout({ points, label }) {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const width = Math.max(...xs) - Math.min(...xs);
  const height = Math.max(...ys) - Math.min(...ys);
  const narrowest = Math.min(width, height);

  // Replaces the old `width < 48` rule: test the polygon's narrowest dimension.
  const small = narrowest < 48;
  // Strip lots too thin for two stacked lines (e.g. P18 along Barstow) put the
  // code and the status side by side on one line instead.
  const inline = narrowest < 16;
  // Tall, thin lots read bottom-to-top so both lines fit.
  const vertical = inline ? height > width : small && height > 1.4 * width && width < 40;

  let sizes;
  if (inline) {
    sizes = { codeSize: 8, statusSize: 7, codeDy: 3, statusDy: 3, codeDx: -2, statusDx: 2, codeAnchor: 'end', statusAnchor: 'start' };
  } else if (small) {
    sizes = { codeSize: 9, statusSize: 7.5, codeDy: -2, statusDy: 7.5, codeDx: 0, statusDx: 0, codeAnchor: 'middle', statusAnchor: 'middle' };
  } else {
    sizes = { codeSize: 13, statusSize: 10, codeDy: -4, statusDy: 11, codeDx: 0, statusDx: 0, codeAnchor: 'middle', statusAnchor: 'middle' };
  }

  // Returns a textLength that squeezes a line to fit inside the polygon,
  // or undefined when the line already fits at its natural width.
  const fitLength = (text, size, dy) => {
    const mid = dy - size * 0.35; // middle of the glyphs relative to the baseline
    const room = vertical
      ? polygonChord(points, label.x + mid, label.y, true)
      : polygonChord(points, label.y + mid, label.x, false);
    // Inline lines each get half the chord, either side of the label point.
    const available = inline ? room / 2 - 5 : room - 6;
    const natural = String(text).length * size * 0.6;
    return natural > available ? Math.max(available, 1) : undefined;
  };

  return {
    ...sizes,
    fitLength,
    transform: vertical ? `rotate(-90 ${label.x} ${label.y})` : undefined,
  };
}
