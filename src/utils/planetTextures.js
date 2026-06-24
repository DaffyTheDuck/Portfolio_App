import * as THREE from "three";

export const PLANET_TEXTURE_STYLES = {
  work: "cratered",
  projects: "bands",
  skills: "swirl",
  volunteering: "cratered",
  education: "bands",
  contact: "glow",
};

/* ---------------------------------------------------------------
   The home page IS the map: a real 3D solar system, built with
   three.js. Home is the sun at the center; every section is a
   planet orbiting it at its own distance and speed. Drag your
   gaze around with the cursor, click a planet to go there.
---------------------------------------------------------------- */


function drawPlanetPattern(ctx, w, h, light, dark, style) {
  if (style !== "glow") {
    const baseBands = 4 + Math.floor(Math.random() * 2);
    for (let i = 0; i < baseBands; i++) {
      const y = (i / baseBands) * h;
      const bh = h / baseBands;
      ctx.globalAlpha = 0.14 + Math.random() * 0.12;
      ctx.fillStyle = i % 2 === 0 ? light : dark;
      ctx.fillRect(0, y, w, bh);
    }
  }

  if (style === "bands") {
    const bandCount = 7 + Math.floor(Math.random() * 3);
    for (let i = 0; i < bandCount; i++) {
      const y = (i / bandCount) * h + (Math.random() - 0.5) * (h * 0.05);
      const bh = (h / bandCount) * (0.6 + Math.random() * 0.6);
      ctx.globalAlpha = 0.3 + Math.random() * 0.28;
      ctx.fillStyle = Math.random() > 0.5 ? light : dark;
      ctx.fillRect(0, y, w, bh);
    }
  } else if (style === "cratered") {
    for (let i = 0; i < 32; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = (6 + Math.random() * 16) * (w / 256);
      ctx.globalAlpha = 0.26 + Math.random() * 0.3;
      ctx.fillStyle = Math.random() > 0.5 ? dark : light;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (style === "swirl") {
    for (let i = 0; i < 38; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = (10 + Math.random() * 26) * (w / 256);
      ctx.globalAlpha = 0.22 + Math.random() * 0.28;
      ctx.fillStyle = Math.random() > 0.5 ? light : dark;
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 0.4, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (style === "glow") {
    const grad = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.03, w * 0.5, h * 0.5, w * 0.42);
    grad.addColorStop(0, light);
    grad.addColorStop(1, dark);
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.globalAlpha = 1;
}

export function createPlanetTexture(light, base, dark, style) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 256, 128);
  drawPlanetPattern(ctx, 256, 128, light, dark, style);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createPlanetSwatchURL(light, dark, style) {
  const canvas = document.createElement("canvas");
  canvas.width = 120;
  canvas.height = 120;
  const ctx = canvas.getContext("2d");
  drawPlanetPattern(ctx, 120, 120, light, dark, style);
  return canvas.toDataURL();
}
