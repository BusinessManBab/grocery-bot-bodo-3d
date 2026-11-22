// Shared by terrain, road workers, museum geometry and truck-height checks.
// Coordinates follow the frozen Olav V gate centreline through Luftfartsmuseet.
export const MUSEUM_UNDERPASS = {
  centre: [1441378, 6727598],
  road: [[1441198, 6727595], [1441306, 6727600], [1441419, 6727597], [1441562, 6727578]],
  depthMetres: 3,
  flatHalfMetres: 18,
  rampMetres: 70,
  roadHalfMetres: 13,
  bankMetres: 12,
  soffitMetres: 7,
  roofMetres: 11,
};

export function museumUnderpass(wx, wy) {
  const M = 1 / 1.113, cfg = MUSEUM_UNDERPASS;
  const points = cfg.road.map(([x, y]) => [wx(x), wy(y)]);
  const segments = [];
  let chain = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i], length = Math.hypot(b[0] - a[0], b[1] - a[1]);
    segments.push({ a, dx: (b[0] - a[0]) / length, dz: (b[1] - a[1]) / length, length, chain });
    chain += length;
  }
  const nearest = (x, z) => {
    let best = { distance: Infinity };
    for (const s of segments) {
      const t = Math.max(0, Math.min(s.length, (x - s.a[0]) * s.dx + (z - s.a[1]) * s.dz));
      const distance = Math.hypot(x - s.a[0] - s.dx * t, z - s.a[1] - s.dz * t);
      if (distance < best.distance) best = { distance, along: s.chain + t, dx: s.dx, dz: s.dz };
    }
    return best;
  };
  const cx = wx(cfg.centre[0]), cz = wy(cfg.centre[1]), centre = nearest(cx, cz);
  const smooth = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
  const depthAt = (x, z) => {
    if (Math.abs(x - cx) > 150 * M || Math.abs(z - cz) > 80 * M) return 0;
    const n = nearest(x, z), along = Math.abs(n.along - centre.along);
    const longitudinal = 1 - smooth((along - cfg.flatHalfMetres * M) / (cfg.rampMetres * M));
    const lateral = 1 - smooth((n.distance - cfg.roadHalfMetres * M) / (cfg.bankMetres * M));
    return cfg.depthMetres * M * longitudinal * lateral;
  };
  // Local u follows the road; v crosses the road between the museum's two wings.
  const at = (u, v) => [cx + centre.dx * u - centre.dz * v, cz + centre.dz * u + centre.dx * v];
  // Overview sprites are deliberately exaggerated elsewhere. Ease back to their
  // close-up physical size before entering the passage, even at the city zoom.
  const truckGrow = (grow, x, z) => {
    const n = nearest(x, z), along = Math.abs(n.along - centre.along);
    const weight = (1 - smooth((along - 30 * M) / (50 * M)))
      * (1 - smooth((n.distance - cfg.roadHalfMetres * M) / (10 * M)));
    return grow + (Math.min(grow, .16) - grow) * weight;
  };
  return { ...cfg, cx, cz, at, depthAt, nearest, truckGrow };
}
