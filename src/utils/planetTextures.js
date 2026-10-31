import * as THREE from "three";

export const PLANET_TEXTURE_STYLES = {
  about: "gas",
  work: "rocky",
  projects: "gas",
  skills: "swirl",
  volunteering: "desert",
  education: "terran",
  contact: "ice",
};

/* ---------------------------------------------------------------
   Procedural planet surfaces. Everything is generated at runtime
   from seeded fractal noise, so there are no image assets and each
   planet keeps the same look on every visit. The noise wraps
   horizontally, so the texture has no seam when mapped on a sphere.
---------------------------------------------------------------- */

const W = 768;
const H = 384;

function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

function makeNoise(seed) {
  const lattice = (ix, iy) => {
    let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ seed;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const smooth = (t) => t * t * (3 - 2 * t);
  // value noise, periodic in x with the given lattice period
  function noise(x, y, period) {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = smooth(x - x0);
    const fy = smooth(y - y0);
    const xa = ((x0 % period) + period) % period;
    const xb = (xa + 1) % period;
    const a = lattice(xa, y0) * (1 - fx) + lattice(xb, y0) * fx;
    const b = lattice(xa, y0 + 1) * (1 - fx) + lattice(xb, y0 + 1) * fx;
    return a * (1 - fy) + b * fy;
  }
  function fbm(x, y, period, octaves = 5) {
    let sum = 0;
    let amp = 0.5;
    let norm = 0;
    let p = period;
    for (let o = 0; o < octaves; o++) {
      sum += amp * noise(x, y, p);
      norm += amp;
      x *= 2;
      y *= 2;
      p *= 2;
      amp *= 0.5;
    }
    return sum / norm;
  }
  return { noise, fbm };
}

function hexToRgb(hex) {
  const c = new THREE.Color(hex);
  return [c.r * 255, c.g * 255, c.b * 255];
}

// three-stop ramp: dark -> base -> light, t in 0..1
function makeRamp(light, base, dark) {
  const d = hexToRgb(dark);
  const b = hexToRgb(base);
  const l = hexToRgb(light);
  return (t, out) => {
    t = Math.min(1, Math.max(0, t));
    const [from, to, k] = t < 0.5 ? [d, b, t * 2] : [b, l, (t - 0.5) * 2];
    out[0] = from[0] + (to[0] - from[0]) * k;
    out[1] = from[1] + (to[1] - from[1]) * k;
    out[2] = from[2] + (to[2] - from[2]) * k;
  };
}

function newCanvas() {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  return c;
}

function toTexture(canvas, srgb = true) {
  const t = new THREE.CanvasTexture(canvas);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  t.wrapS = THREE.RepeatWrapping;
  t.needsUpdate = true;
  return t;
}

function craterLayer(ctxs, rand, count, minR, maxR) {
  for (let i = 0; i < count; i++) {
    const x = rand() * W;
    const y = H * 0.08 + rand() * H * 0.84;
    const r = minR + Math.pow(rand(), 2.2) * (maxR - minR);
    for (const [ctx, kind] of ctxs) {
      for (const dx of [0, -W, W]) {
        const g = ctx.createRadialGradient(x + dx - r * 0.25, y - r * 0.25, r * 0.1, x + dx, y, r);
        if (kind === "color") {
          g.addColorStop(0, "rgba(0,0,0,0.38)");
          g.addColorStop(0.78, "rgba(0,0,0,0.18)");
          g.addColorStop(0.92, "rgba(255,255,255,0.22)");
          g.addColorStop(1, "rgba(255,255,255,0)");
        } else {
          g.addColorStop(0, "rgba(0,0,0,0.85)");
          g.addColorStop(0.8, "rgba(0,0,0,0.4)");
          g.addColorStop(0.93, "rgba(255,255,255,0.8)");
          g.addColorStop(1, "rgba(128,128,128,0)");
        }
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x + dx, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

// per-style pixel generators: fill rgb, return a height-like value 0..1
const GENERATORS = {
  rocky({ fbm }, x, y, ramp, rgb) {
    const nx = (x / W) * 4;
    const ny = (y / H) * 2;
    const h = fbm(nx, ny, 4, 6);
    const ridge = 1 - Math.abs(fbm(nx * 2.5 + 9, ny * 2.5, 10, 4) * 2 - 1);
    const v = h * 0.75 + ridge * 0.25;
    ramp(0.1 + v * 0.95, rgb);
    return v;
  },
  desert({ fbm }, x, y, ramp, rgb) {
    const nx = (x / W) * 3;
    const ny = (y / H) * 1.5;
    const warp = fbm(nx * 2, ny * 2, 6, 3) * 1.6;
    const dunes = 0.5 + 0.5 * Math.sin((ny * 7 + warp * 4 + fbm(nx, ny, 3, 4) * 3) * Math.PI);
    const grain = fbm(nx * 6, ny * 6, 18, 3);
    const v = dunes * 0.6 + grain * 0.4;
    ramp(0.15 + v * 0.85, rgb);
    return v;
  },
  gas({ fbm }, x, y, ramp, rgb) {
    const nx = (x / W) * 3;
    const v = y / H;
    const turb = fbm(nx * 2, v * 9, 6, 5);
    const wob = (fbm(nx, v * 3, 3, 4) - 0.5) * 0.09;
    const bands = 0.5 + 0.5 * Math.sin((v + wob + turb * 0.045) * Math.PI * 13);
    const fine = fbm(nx * 5, v * 40, 15, 3);
    const t = bands * 0.62 + fine * 0.3 + (turb - 0.5) * 0.35;
    ramp(0.05 + t, rgb);
    return t;
  },
  swirl({ fbm }, x, y, ramp, rgb) {
    const nx = (x / W) * 3;
    const ny = (y / H) * 1.5;
    const qx = fbm(nx, ny, 3, 4);
    const qy = fbm(nx + 5.2, ny + 1.3, 3, 4);
    const rx = fbm(nx + 4 * qx + 1.7, ny + 4 * qy + 9.2, 3, 5);
    ramp(-0.15 + rx * 1.6 + (qx - 0.5) * 0.5, rgb);
    return rx;
  },
  terran({ fbm }, x, y, ramp, rgb) {
    const nx = (x / W) * 4;
    const ny = (y / H) * 2;
    const h = fbm(nx, ny, 4, 6) * 0.85 + fbm(nx * 3, ny * 3, 12, 3) * 0.15;
    const lat = Math.abs(y / H - 0.5) * 2;
    const sea = 0.5;
    if (lat > 0.88 + (fbm(nx * 4, ny, 16, 3) - 0.5) * 0.12) {
      rgb[0] = 238;
      rgb[1] = 246;
      rgb[2] = 250;
      return 0.7;
    }
    if (h < sea) {
      const depth = (sea - h) / sea;
      ramp(0.16 + (1 - depth) * 0.3, rgb); // deep -> shallow
      rgb[0] *= 0.8;
      rgb[2] = Math.min(255, rgb[2] * 1.25 + 30);
      return 0.15;
    }
    const e = (h - sea) / (1 - sea);
    ramp(0.6 + e * 0.6, rgb);
    return 0.3 + e * 0.7;
  },
  ice({ fbm }, x, y, ramp, rgb) {
    const nx = (x / W) * 3;
    const ny = (y / H) * 1.5;
    const base = fbm(nx, ny, 3, 5);
    const crack = 1 - Math.abs(fbm(nx * 3 + 4, ny * 3, 9, 5) * 2 - 1);
    const v = 0.45 + base * 0.5 - Math.pow(crack, 14) * 0.45;
    ramp(v + 0.12, rgb);
    return v;
  },
};

const HEIGHT_STYLES = new Set(["rocky", "desert", "ice"]);
const CRATERED = new Set(["rocky", "ice"]);

/** Returns { map, bump, clouds } textures (bump / clouds may be null). */
export function createPlanetMaps(light, base, dark, style, seedKey = style) {
  const seed = hashSeed(seedKey + base);
  const noise = makeNoise(seed);
  const rand = mulberry(seed ^ 0x9e3779b9);
  const gen = GENERATORS[style] || GENERATORS.rocky;
  const ramp = makeRamp(light, base, dark);

  const color = newCanvas();
  const cctx = color.getContext("2d");
  const img = cctx.createImageData(W, H);
  const hasBump = HEIGHT_STYLES.has(style);
  const bump = hasBump ? newCanvas() : null;
  const bctx = hasBump ? bump.getContext("2d") : null;
  const bimg = hasBump ? bctx.createImageData(W, H) : null;
  const rgb = [0, 0, 0];

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const v = gen(noise, x, y, ramp, rgb);
      const i = (y * W + x) * 4;
      img.data[i] = rgb[0];
      img.data[i + 1] = rgb[1];
      img.data[i + 2] = rgb[2];
      img.data[i + 3] = 255;
      if (hasBump) {
        const g = Math.min(255, Math.max(0, v * 255));
        bimg.data[i] = bimg.data[i + 1] = bimg.data[i + 2] = g;
        bimg.data[i + 3] = 255;
      }
    }
  }
  cctx.putImageData(img, 0, 0);
  if (hasBump) bctx.putImageData(bimg, 0, 0);

  if (CRATERED.has(style)) {
    const layers = hasBump ? [[cctx, "color"], [bctx, "bump"]] : [[cctx, "color"]];
    craterLayer(layers, rand, style === "rocky" ? 70 : 28, 5, style === "rocky" ? 46 : 36);
  }

  if (style === "gas") {
    // one big storm
    const sx = W * (0.25 + rand() * 0.5);
    const sy = H * (0.58 + rand() * 0.1);
    const g = cctx.createRadialGradient(sx, sy, 2, sx, sy, 70);
    g.addColorStop(0, light);
    g.addColorStop(0.45, "rgba(255,255,255,0.22)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    cctx.save();
    cctx.translate(sx, sy);
    cctx.scale(1.7, 0.85);
    cctx.translate(-sx, -sy);
    cctx.fillStyle = g;
    cctx.beginPath();
    cctx.arc(sx, sy, 70, 0, Math.PI * 2);
    cctx.fill();
    cctx.restore();
  }

  let clouds = null;
  if (style === "terran") {
    const cc = newCanvas();
    const cx = cc.getContext("2d");
    const cimg = cx.createImageData(W, H);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const n = noise.fbm((x / W) * 5 + 20, (y / H) * 2.5 + 7, 5, 6);
        const a = Math.min(1, Math.max(0, (n - 0.5) * 3.2));
        const i = (y * W + x) * 4;
        cimg.data[i] = cimg.data[i + 1] = cimg.data[i + 2] = 255;
        cimg.data[i + 3] = a * 215;
      }
    }
    cx.putImageData(cimg, 0, 0);
    clouds = toTexture(cc);
  }

  return { map: toTexture(color), bump: bump ? toTexture(bump, false) : null, clouds };
}

/** Mottled glowing surface, used for the sun. */
export function createPlanetTexture(light, base, dark) {
  const canvas = newCanvas();
  const ctx = canvas.getContext("2d");
  const noise = makeNoise(hashSeed("sun"));
  const img = ctx.createImageData(W, H);
  const ramp = makeRamp(light, base, dark);
  const rgb = [0, 0, 0];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const t = noise.fbm((x / W) * 6, (y / H) * 3, 6, 5);
      ramp(0.45 + t * 0.7, rgb);
      const i = (y * W + x) * 4;
      img.data[i] = rgb[0];
      img.data[i + 1] = rgb[1];
      img.data[i + 2] = rgb[2];
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return toTexture(canvas);
}
