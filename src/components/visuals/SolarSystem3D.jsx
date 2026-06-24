import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { WAYPOINTS } from "../../data/content";
import { createPlanetTexture, PLANET_TEXTURE_STYLES } from "../../utils/planetTextures";

export function SolarSystem3D({ onNavigate }) {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const onNavigateRef = useRef(onNavigate);
  onNavigateRef.current = onNavigate;
  const [hover, setHover] = useState(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = container.clientWidth || 1;
    let height = container.clientHeight || 1;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    function applyCameraDistance() {
      const stacked = width < 760;
      let scale;
      if (stacked) {
        // This now renders in its own dedicated, roughly-square block —
        // it doesn't need the aggressive pullback the old full-height
        // overlay required to avoid clipping.
        scale = Math.max(1, 1.1 / Math.max(width / height, 0.7));
      } else {
        const breakpointScale = width < 1000 ? 1.15 : 1;
        const aspectGuard = Math.max(1, 1.45 / Math.max(width / height, 0.6));
        scale = breakpointScale * aspectGuard;
      }
      camera.position.set(0, 6.2 * scale, 9.8 * scale);
      camera.lookAt(0, 0, 0);
    }
    applyCameraDistance();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    scene.add(new THREE.AmbientLight(0x9aa5c0, 0.9));

    const sunTexture = createPlanetTexture("#FFF3D6", "#F2B872", "#C97A2E", "glow");
    const sun = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 24), new THREE.MeshBasicMaterial({ map: sunTexture, color: 0xffffff }));
    sun.userData = { id: "hero", label: "Home" };
    const halo = new THREE.Mesh(new THREE.SphereGeometry(0.62, 24, 24), new THREE.MeshBasicMaterial({ color: 0xf2b872, transparent: true, opacity: 0.18 }));
    sun.add(halo);
    const sunLight = new THREE.PointLight(0xfff0d8, 2.2, 16, 2);
    sun.add(sunLight);
    group.add(sun);

    const planetData = WAYPOINTS.slice(1).map((wp, i) => ({
      id: wp.id,
      label: wp.label,
      light: wp.colors[0],
      color: wp.colors[1],
      dark: wp.colors[2],
      radius: 1.2 + i * 0.56,
      size: 0.2 + (i % 3 === 0 ? 0.06 : 0.03),
      speed: 0.22 - i * 0.022,
      spin: 0.3 + Math.random() * 0.4,
      angle: (i / 6) * Math.PI * 2,
      ring: !!wp.ring,
      pulse: !!wp.pulse,
    }));

    const planets = planetData.map((def) => {
      const texture = createPlanetTexture(def.light, def.color, def.dark, PLANET_TEXTURE_STYLES[def.id] || "cratered");
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(def.size, 28, 28),
        new THREE.MeshStandardMaterial({ map: texture, color: 0xffffff, roughness: 0.65, metalness: 0.08, emissive: def.color, emissiveIntensity: 0.1 })
      );
      mesh.userData = { id: def.id, label: def.label };
      mesh.position.set(def.radius * Math.cos(def.angle), 0, def.radius * Math.sin(def.angle));
      group.add(mesh);

      if (def.ring) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(def.size * 1.5, def.size * 2, 40),
          new THREE.MeshBasicMaterial({ color: def.color, transparent: true, opacity: 0.4, side: THREE.DoubleSide })
        );
        ring.rotation.x = Math.PI / 2.3;
        mesh.add(ring);
      }
      if (def.pulse) {
        const haloP = new THREE.Mesh(new THREE.SphereGeometry(def.size * 1.6, 16, 16), new THREE.MeshBasicMaterial({ color: 0xbfe8ff, transparent: true, opacity: 0.25 }));
        mesh.add(haloP);
        mesh.userData.haloP = haloP;
      }

      const curvePts = [];
      for (let a = 0; a <= 64; a++) {
        const t = (a / 64) * Math.PI * 2;
        curvePts.push(new THREE.Vector3(def.radius * Math.cos(t), 0, def.radius * Math.sin(t)));
      }
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(curvePts);
      const orbitLine = new THREE.LineLoop(orbitGeo, new THREE.LineBasicMaterial({ color: 0x8a93a8, transparent: true, opacity: 0.22 }));
      group.add(orbitLine);

      return { mesh, def };
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const clickables = [sun, ...planets.map((p) => p.mesh)];

    function setPointerFromEvent(e, rect) {
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function handleMove(e) {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width - 0.5,
        y: (e.clientY - rect.top) / rect.height - 0.5,
      };
      setPointerFromEvent(e, rect);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickables, false);
      if (hits.length) {
        container.style.cursor = "pointer";
        setHover({ label: hits[0].object.userData.label, x: e.clientX - rect.left, y: e.clientY - rect.top });
      } else {
        container.style.cursor = "default";
        setHover(null);
      }
    }

    function handleClick(e) {
      const rect = container.getBoundingClientRect();
      setPointerFromEvent(e, rect);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickables, false);
      if (hits.length) onNavigateRef.current(hits[0].object.userData.id);
    }

    function handleLeave() {
      setHover(null);
      container.style.cursor = "default";
    }

    container.addEventListener("mousemove", handleMove);
    container.addEventListener("click", handleClick);
    container.addEventListener("mouseleave", handleLeave);

    function handleResize() {
      width = container.clientWidth || 1;
      height = container.clientHeight || 1;
      camera.aspect = width / height;
      applyCameraDistance();
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener("resize", handleResize);

    let frameId;
    const clock = new THREE.Clock();
    let autoRotate = 0;
    let elapsedTotal = 0;

    function animate() {
      const delta = clock.getDelta();
      elapsedTotal += delta;
      autoRotate += delta * 0.06;

      planets.forEach(({ mesh, def }) => {
        def.angle += def.speed * delta;
        mesh.position.set(def.radius * Math.cos(def.angle), 0, def.radius * Math.sin(def.angle));
        mesh.rotation.y += def.spin * delta;
        if (def.pulse && mesh.userData.haloP) {
          mesh.userData.haloP.scale.setScalar(1 + Math.sin(elapsedTotal * 2) * 0.25);
        }
      });

      group.rotation.y += (autoRotate + mouseRef.current.x * 0.6 - group.rotation.y) * 0.04;
      group.rotation.x += (mouseRef.current.y * -0.25 - group.rotation.x) * 0.04;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    }

    if (reducedMotion) {
      renderer.render(scene, camera);
    } else {
      frameId = requestAnimationFrame(animate);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handleMove);
      container.removeEventListener("click", handleClick);
      container.removeEventListener("mouseleave", handleLeave);
      if (frameId) cancelAnimationFrame(frameId);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
          materials.forEach((m) => {
            if (m.map) m.map.dispose();
            m.dispose();
          });
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div ref={containerRef} className="pf-solar-3d">
      {hover && (
        <span className="pf-solar-3d-tooltip" style={{ left: hover.x, top: hover.y }}>
          {hover.label}
        </span>
      )}
    </div>
  );
}