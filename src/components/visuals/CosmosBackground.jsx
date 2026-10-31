import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { SECTION_IDS, WAYPOINTS } from "../../data/content";
import { createPlanetMaps, createPlanetTexture, PLANET_TEXTURE_STYLES } from "../../utils/planetTextures";

/* ---------------------------------------------------------------
   One fixed WebGL scene sits behind the whole page. Every section
   is a station along a long z-axis; the camera flies from station
   to station as you scroll, so each planet slides past in real 3D
   parallax while its section is on screen.
---------------------------------------------------------------- */

const STATION_GAP = 36;
const CAMERA_DIST = 15;
const FOV = 50;

const ABOUT_STATION = { id: "about", colors: ["#FFE3B0", "#F2B872", "#7A4A1A"], ring: false, moons: 2, style: PLANET_TEXTURE_STYLES.about };
const CLOUD_TINTS = ["#6a3dff", "#ff4fa3", "#2ec8ff", "#ffb347"];
const STAR_TINTS = ["#ffffff", "#cfe3ff", "#d9c7ff", "#ffd9a8", "#a8f0ff"];

const stations = SECTION_IDS.map((id) => {
  if (id === "hero") return { id, sun: true, colors: ["#FFF3D6", "#F2B872", "#C97A2E"] };
  if (id === "about") return ABOUT_STATION;
  return { ...WAYPOINTS.find((w) => w.id === id), style: PLANET_TEXTURE_STYLES[id] };
});

function radialTexture(stops) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function cloudTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  for (let i = 0; i < 40; i++) {
    const x = 128 + (Math.random() - 0.5) * 120;
    const y = 128 + (Math.random() - 0.5) * 120;
    const r = 30 + Math.random() * 60;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(255,255,255,0.1)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function ringTexture(color) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 4;
  const ctx = c.getContext("2d");
  const base = new THREE.Color(color);
  for (let x = 0; x < 512; x++) {
    const edge = Math.min(x, 511 - x) / 40;
    const a = Math.min(1, edge) * (0.25 + 0.55 * Math.abs(Math.sin(x * 0.09) * Math.cos(x * 0.031)));
    ctx.fillStyle = `rgba(${Math.round(base.r * 255)},${Math.round(base.g * 255)},${Math.round(base.b * 255)},${a})`;
    ctx.fillRect(x, 0, 1, 4);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const atmosphereMaterial = (color) =>
  new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) } },
    vertexShader: `
      varying vec3 vN; varying vec3 vV;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 uColor; varying vec3 vN; varying vec3 vV;
      void main(){
        float d = dot(normalize(vN), normalize(vV));
        float i = smoothstep(0.0, 0.42, -d);
        gl_FragColor = vec4(uColor, i * i * 0.4);
      }`,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });

function buildPlanet(def, radius, maps) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 64, 64),
    new THREE.MeshStandardMaterial({ map: maps.map, bumpMap: maps.bump, bumpScale: maps.bump ? 2.2 : 0, roughness: def.style === "ice" ? 0.6 : 0.78, metalness: 0.05, emissive: new THREE.Color(def.colors[1]), emissiveIntensity: 0.12 })
  );
  group.add(body);
  let clouds = null;
  if (maps.clouds) {
    clouds = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 1.02, 64, 64),
      new THREE.MeshStandardMaterial({ map: maps.clouds, transparent: true, depthWrite: false, roughness: 1, emissive: 0x334455, emissiveIntensity: 0.15 })
    );
    group.add(clouds);
  }
  group.add(new THREE.Mesh(new THREE.SphereGeometry(radius * 1.12, 48, 48), atmosphereMaterial(def.colors[1])));

  const moons = [];
  if (def.ring) {
    const inner = radius * 1.35;
    const outer = radius * 2.1;
    const geo = new THREE.RingGeometry(inner, outer, 128, 1);
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const d = Math.hypot(pos.getX(i), pos.getY(i));
      uv.setXY(i, (d - inner) / (outer - inner), 0.5);
    }
    const ring = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({ map: ringTexture(def.colors[0]), side: THREE.DoubleSide, transparent: true, depthWrite: false, opacity: 0.9 })
    );
    ring.rotation.x = Math.PI / 2 - 0.42;
    ring.rotation.y = 0.18;
    group.add(ring);
  }
  for (let m = 0; m < (def.moons || 0); m++) {
    const pivot = new THREE.Group();
    pivot.rotation.x = (Math.random() - 0.5) * 0.7;
    pivot.rotation.y = Math.random() * Math.PI * 2;
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(radius * (0.14 + m * 0.03), 24, 24),
      new THREE.MeshStandardMaterial({ color: new THREE.Color(def.colors[0]).lerp(new THREE.Color("#888899"), 0.6), roughness: 0.9 })
    );
    moon.position.x = radius * (1.9 + m * 0.55);
    pivot.add(moon);
    group.add(pivot);
    moons.push({ pivot, speed: 0.35 - m * 0.08 });
  }
  return { group, body, moons, clouds };
}

export function CosmosBackground({ hold = null, theme = "dark" }) {
  const hostRef = useRef(null);
  const themeRef = useRef(theme);
  const applyThemeRef = useRef(null);
  themeRef.current = theme;
  const holdRef = useRef(hold);
  const refreshRef = useRef(null);
  holdRef.current = hold;

  // a detail page pins the camera at its section's planet; redraw once for reduced-motion users
  useEffect(() => {
    if (refreshRef.current) refreshRef.current();
  }, [hold]);

  useEffect(() => {
    if (applyThemeRef.current) applyThemeRef.current(theme);
  }, [theme]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compact = window.innerWidth < 760 || (navigator.hardwareConcurrency || 8) <= 4;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !compact, powerPreference: "high-performance" });
    } catch {
      return; // no WebGL: the CSS gradient on the page stays as the backdrop
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.className = "pf-cosmos-canvas";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#05030d");
    scene.fog = new THREE.FogExp2(0x05030d, 0.009);
    const camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, 0.1, 600);

    let composer = null;
    let bloom = null;
    if (!compact) {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.5, 0.6, 0.85);
      composer.addPass(bloom);
      composer.addPass(new OutputPass());
    }

    /* lighting */
    const ambient = new THREE.AmbientLight(0x8d94c8, 0.7);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xfff1de, 2.6);
    key.position.set(-0.7, 0.55, 1);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x7a6dff, 1.4);
    rim.position.set(0.9, -0.3, -1);
    scene.add(rim);

    /* star field */
    const lastZ = -STATION_GAP * (stations.length - 1);
    const starCount = compact ? 1800 : 4200;
    const sPos = new Float32Array(starCount * 3);
    const sCol = new Float32Array(starCount * 3);
    const sPar = new Float32Array(starCount * 3);
    const tint = new THREE.Color();
    for (let i = 0; i < starCount; i++) {
      sPos[i * 3] = (Math.random() - 0.5) * 220;
      sPos[i * 3 + 1] = (Math.random() - 0.5) * 140;
      sPos[i * 3 + 2] = 30 - Math.random() * (30 - lastZ + 90);
      tint.set(STAR_TINTS[Math.floor(Math.random() * STAR_TINTS.length)]);
      sCol.set([tint.r, tint.g, tint.b], i * 3);
      sPar.set([0.6 + Math.random() * 1.8, 0.6 + Math.random() * 2.2, Math.random() * 6.28], i * 3);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
    starGeo.setAttribute("aColor", new THREE.BufferAttribute(sCol, 3));
    starGeo.setAttribute("aParams", new THREE.BufferAttribute(sPar, 3));
    const starMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uPx: { value: renderer.getPixelRatio() }, uDark: { value: 0 } },
      vertexShader: `
        attribute vec3 aColor; attribute vec3 aParams;
        uniform float uTime; uniform float uPx;
        varying vec3 vC; varying float vA;
        void main(){
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = clamp(aParams.x * uPx * (70.0 / -mv.z), 1.0, 9.0 * uPx);
          gl_Position = projectionMatrix * mv;
          vC = aColor;
          vA = 0.55 + 0.45 * sin(uTime * aParams.y + aParams.z);
        }`,
      fragmentShader: `
        uniform float uDark;
        varying vec3 vC; varying float vA;
        void main(){
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d);
          vec3 c = mix(vC * (1.0 + a), vec3(0.28, 0.22, 0.55), uDark);
          gl_FragColor = vec4(c, a * vA * mix(1.0, 0.7, uDark));
        }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.Points(starGeo, starMat));

    /* nebula clouds */
    const cloudTex = cloudTexture();
    const clouds = [];
    stations.forEach((st, i) => {
      const count = compact ? 1 : 3;
      for (let c = 0; c < count; c++) {
        const col = c === 0 ? st.colors[1] : CLOUD_TINTS[(i + c) % CLOUD_TINTS.length];
        const sprite = new THREE.Sprite(
          new THREE.SpriteMaterial({ map: cloudTex, color: new THREE.Color(col), transparent: true, opacity: 0.05 + Math.random() * 0.05, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, rotation: Math.random() * 6.28 })
        );
        const size = 80 + Math.random() * 70;
        sprite.scale.set(size, size, 1);
        sprite.position.set((Math.random() - 0.5) * 90, (Math.random() - 0.5) * 50, -i * STATION_GAP + (Math.random() - 0.5) * 40 - 30);
        scene.add(sprite);
        clouds.push({ sprite, spin: (Math.random() - 0.5) * 0.03, opacity: sprite.material.opacity });
      }
    });

    /* planets, one per station (the hero station is the sun system) */
    const glowTex = radialTexture([[0, "rgba(255,236,200,1)"], [0.25, "rgba(255,190,110,0.55)"], [1, "rgba(255,140,60,0)"]]);
    const textures = {};
    const bodies = [];
    stations.forEach((st, i) => {
      if (st.sun) return;
      const maps = createPlanetMaps(st.colors[0], st.colors[1], st.colors[2], st.style, st.id);
      textures[st.id] = maps.map;
      const radius = 2.0 + ((i * 7) % 5) * 0.17;
      const built = buildPlanet(st, radius, maps);
      built.group.rotation.z = (i % 2 ? -1 : 1) * 0.18;
      built.idx = i;
      built.baseY = Math.sin(i * 1.7) * 1.2;
      built.side = i % 2 ? 1 : -1;
      built.z = -i * STATION_GAP;
      scene.add(built.group);
      bodies.push(built);
    });

    /* hero: sun + miniature solar system */
    const system = new THREE.Group();
    scene.add(system);
    const sunTex = createPlanetTexture("#FFF3D6", "#F2B872", "#C97A2E", "glow");
    const sun = new THREE.Mesh(new THREE.SphereGeometry(0.55, 48, 48), new THREE.MeshBasicMaterial({ map: sunTex, color: new THREE.Color(1.9, 1.6, 1.2) }));
    system.add(sun);
    const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.9 }));
    sunGlow.scale.set(4.2, 4.2, 1);
    sun.add(sunGlow);
    const sunLight = new THREE.PointLight(0xffe2b8, 40, 18, 1.6);
    sun.add(sunLight);

    const miniPlanets = WAYPOINTS.slice(1).map((wp, i) => {
      const size = 0.2 + (i % 3 === 0 ? 0.07 : 0.035);
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(size, 32, 32),
        new THREE.MeshStandardMaterial({ map: textures[wp.id], roughness: 0.7, emissive: new THREE.Color(wp.colors[1]), emissiveIntensity: 0.18 })
      );
      mesh.add(new THREE.Mesh(new THREE.SphereGeometry(size * 1.35, 24, 24), atmosphereMaterial(wp.colors[1])));
      const radius = 1.3 + i * 0.58;
      const pts = [];
      for (let a = 0; a <= 96; a++) pts.push(new THREE.Vector3(Math.cos((a / 96) * 6.2832) * radius, 0, Math.sin((a / 96) * 6.2832) * radius));
      const orbit = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: new THREE.Color(wp.colors[1]), transparent: true, opacity: 0.5 }));
      system.add(orbit);
      system.add(mesh);
      return { mesh, radius, speed: 0.55 / Math.pow(radius, 1.5), angle: i * 2.399 };
    });
    system.rotation.x = 0.95;
    system.rotation.z = -0.2;

    /* light or dark sky */
    function applyTheme(t) {
      const light = t === "light";
      const sky = light ? "#ebe8ff" : "#05030d";
      scene.background.set(sky);
      scene.fog.color.set(sky);
      starMat.uniforms.uDark.value = light ? 1 : 0;
      starMat.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
      starMat.needsUpdate = true;
      clouds.forEach((c) => {
        c.sprite.material.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
        c.sprite.material.opacity = light ? c.opacity * 2.4 : c.opacity;
        c.sprite.material.needsUpdate = true;
      });
      if (bloom) bloom.enabled = !light;
      ambient.intensity = light ? 1.15 : 0.7;
      if (reducedMotion) step(0, true);
    }
    applyThemeRef.current = applyTheme;

    /* layout depends on aspect ratio */
    let aspect = window.innerWidth / window.innerHeight;
    let systemBase = 1;
    function layout() {
      aspect = window.innerWidth / window.innerHeight;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (composer) composer.setSize(window.innerWidth, window.innerHeight);
      const halfW = Math.tan((FOV * Math.PI) / 360) * CAMERA_DIST * aspect;
      const narrow = aspect < 1.15;
      const fit = Math.min(1, Math.max(0.5, aspect / 1.6));
      bodies.forEach((b) => {
        b.group.position.set(b.side * halfW * (narrow ? 0.38 : 0.6), b.baseY + (narrow ? 1.5 : 0), b.z);
        b.fit = fit;
      });
      if (narrow) {
        system.position.set(0, 3.6, 0);
        systemBase = 0.62;
      } else {
        // centre the system in the free space right of the hero card (minus the star-map rail)
        const card = document.querySelector(".pf-hero-content");
        const cardRight = card ? card.getBoundingClientRect().right : window.innerWidth * 0.45;
        const freeCentre = (cardRight + window.innerWidth - 90) / 2;
        system.position.set(((freeCentre / window.innerWidth) * 2 - 1) * halfW, 0.2, 0);
        systemBase = Math.min(1.05, fit * 1.1);
      }
    }
    layout();

    /* section tops -> continuous station index */
    const sectionEls = SECTION_IDS.map((id) => document.getElementById(id));
    const smooth = (x) => x * x * (3 - 2 * x);
    // Section positions are measured only when the layout changes, not on every frame.
    let tops = [];
    function measureTops() {
      tops = sectionEls.map((el) => (el && el.offsetParent !== null ? el.getBoundingClientRect().top + window.scrollY : 0));
    }
    measureTops();
    const layoutWatcher = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measureTops) : null;
    if (layoutWatcher) layoutWatcher.observe(document.body);
    function targetStation() {
      if (holdRef.current != null) return holdRef.current;
      const y = window.scrollY + window.innerHeight * 0.2;
      let idx = 0;
      for (let i = 0; i < tops.length; i++) if (tops[i] <= y) idx = i;
      if (idx >= tops.length - 1) return tops.length - 1;
      const frac = (y - tops[idx]) / Math.max(1, tops[idx + 1] - tops[idx]);
      return idx + smooth(Math.min(1, Math.max(0, (frac - 0.25) / 0.5)));
    }

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    function onMouse(e) {
      mouse.tx = e.clientX / window.innerWidth - 0.5;
      mouse.ty = e.clientY / window.innerHeight - 0.5;
      if (reducedMotion) requestAnimationFrame(() => step(0, true));
    }

    let station = targetStation();
    let fov = FOV;
    let elapsed = 0;
    function step(dt, snap) {
      const adt = Math.min(dt, 0.05);
      elapsed += adt;
      const target = targetStation();
      const prev = station;
      station = snap ? target : station + (target - station) * (1 - Math.exp(-dt * 5));
      mouse.x += (mouse.tx - mouse.x) * (snap ? 1 : 1 - Math.exp(-dt * 4));
      mouse.y += (mouse.ty - mouse.y) * (snap ? 1 : 1 - Math.exp(-dt * 4));

      const z = CAMERA_DIST - STATION_GAP * station;
      // leaving the hero, steer toward the sun and let the system swell past the camera
      const steer = Math.sin(Math.PI * Math.min(1, station)) * 0.75;
      const cx = (Math.sin(station * 1.3) * 1.4 + mouse.x * 2.2) * (1 - steer) + system.position.x * steer;
      const cy = (Math.cos(station * 0.9) * 0.6 - mouse.y * 1.4) * (1 - steer) + system.position.y * steer;
      const zoom = smooth(Math.min(1, Math.max(0, station)));
      system.scale.setScalar(systemBase * (1 + zoom * 2.6));
      system.visible = station < 0.95;
      camera.position.set(cx, cy, z);
      camera.lookAt(cx * 0.35, cy * 0.35, z - 12);

      const speed = dt > 0 ? Math.abs(station - prev) / dt : 0;
      const wantFov = FOV + Math.min(speed * 5, 16);
      fov += (wantFov - fov) * (snap ? 1 : 1 - Math.exp(-dt * 6));
      if (Math.abs(camera.fov - fov) > 0.01) {
        camera.fov = fov;
        camera.updateProjectionMatrix();
      }
      if (bloom) bloom.strength = 0.5 + Math.min(speed * 0.25, 0.5);

      starMat.uniforms.uTime.value = elapsed;
      bodies.forEach((b) => {
        const near = Math.min(1, Math.max(0, (1 - Math.abs(b.idx - station)) / 0.55));
        b.group.visible = near > 0.01;
        b.group.scale.setScalar(b.fit * smooth(near));
      });
      if (!snap || adt > 0) {
        bodies.forEach((b, i) => {
          b.body.rotation.y += adt * (0.05 + (i % 3) * 0.02);
          if (b.clouds) b.clouds.rotation.y += adt * 0.075;
          b.group.position.y = b.baseY + (aspect < 1.15 ? 1.5 : 0) + Math.sin(elapsed * 0.4 + i) * 0.18;
          b.moons.forEach((m) => (m.pivot.rotation.y += adt * m.speed));
        });
        miniPlanets.forEach((p) => {
          p.angle += p.speed * adt;
          p.mesh.position.set(Math.cos(p.angle) * p.radius, 0, Math.sin(p.angle) * p.radius);
          p.mesh.rotation.y += adt * 0.6;
        });
        sun.rotation.y += adt * 0.1;
        sunGlow.material.opacity = 0.8 + Math.sin(elapsed * 1.6) * 0.1;
        clouds.forEach((c) => {
          // only clouds near the camera are drawn; the rest would just cost fill rate
          const dz = camera.position.z - c.sprite.position.z;
          c.sprite.visible = dz > -30 && dz < 150;
          if (c.sprite.visible) c.sprite.material.rotation += c.spin * adt;
        });
      }
      if (composer) composer.render();
      else renderer.render(scene, camera);
    }

    applyTheme(themeRef.current);

    refreshRef.current = () => {
      if (reducedMotion) step(0, true);
    };

    let frameId = 0;
    let last = performance.now();
    function loop(now) {
      const dt = Math.min((now - last) / 1000, 0.3);
      last = now;
      step(dt, false);
      frameId = requestAnimationFrame(loop);
    }

    const onResize = () => {
      layout();
      if (reducedMotion) step(0, true);
    };
    const onScroll = () => requestAnimationFrame(() => step(0, true));
    window.addEventListener("resize", onResize);
    window.addEventListener("load", measureTops);
    window.addEventListener("mousemove", onMouse, { passive: true });
    if (reducedMotion) {
      window.addEventListener("scroll", onScroll, { passive: true });
      step(0, true);
    } else {
      frameId = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", measureTops);
      if (layoutWatcher) layoutWatcher.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouse);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        const mats = obj.material ? (Array.isArray(obj.material) ? obj.material : [obj.material]) : [];
        mats.forEach((m) => {
          if (m.map) m.map.dispose();
          m.dispose();
        });
      });
      if (composer) composer.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={hostRef} className="pf-cosmos" aria-hidden="true" />;
}
