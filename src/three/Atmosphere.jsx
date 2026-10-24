import { useEffect, useRef } from 'react';

/**
 * Atmosphere - a real-time WebGL cinematic backdrop (three.js).
 *
 * What it honestly is: a studio void - drifting dust, two soft volumetric
 * light beams and a low red floor glow, rendered live behind/above the page's
 * real photography. It is atmosphere, not a 3D vehicle: no usable,
 * appropriately licensed 3D model of the actual catalogue cars exists, so the
 * cars stay photographs (see README / Credits).
 *
 * Engineering:
 * - three.js is loaded by dynamic import, so the main bundle stays light.
 * - Renders nothing when WebGL is unavailable; the CSS/photo base remains.
 * - Pauses off-screen and on hidden tabs; caps pixel ratio; full disposal.
 * - Reduced motion: renders one static frame, no animation loop.
 */
const mq = (q) => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(q) : { matches: false });
export const prefersReducedMotion = () => mq('(prefers-reduced-motion: reduce)').matches;

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

export default function Atmosphere({ className = '', density = 1, glow = 0.55, veil = 0 }) {
  const host = useRef(null);

  useEffect(() => {
    const el = host.current;
    if (!el || !webglAvailable()) return undefined;
    let killed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import('three');
      if (killed || !host.current) return;

      const reduced = prefersReducedMotion();
      const fine = mq('(hover: hover) and (pointer: fine)').matches;
      const DPR = Math.min(window.devicePixelRatio || 1, 1.75);

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'high-performance' });
      renderer.setPixelRatio(DPR);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.domElement.setAttribute('aria-hidden', 'true');
      renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;mix-blend-mode:screen;';
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
      camera.position.set(0, 0.4, 9);

      // --- dust particles ---
      const COUNT = Math.round(320 * density);
      const pos = new Float32Array(COUNT * 3);
      const seed = new Float32Array(COUNT);
      for (let i = 0; i < COUNT; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 22;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
        seed[i] = Math.random();
      }
      const dustGeo = new THREE.BufferGeometry();
      dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      dustGeo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
      const dustMat = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uDpr: { value: DPR } },
        vertexShader: `
          attribute float aSeed;
          uniform float uTime; uniform float uDpr;
          varying float vA;
          void main() {
            vec3 p = position;
            p.y += sin(uTime * 0.12 + aSeed * 6.2831) * 0.7 + uTime * 0.05 * (aSeed - 0.5);
            p.x += sin(uTime * 0.07 + aSeed * 12.566) * 0.9;
            p.y = mod(p.y + 6.0, 12.0) - 6.0;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            float d = -mv.z;
            gl_PointSize = (1.5 + aSeed * 2.6) * uDpr * (8.0 / max(d, 2.0));
            vA = 0.16 + aSeed * 0.22;
          }`,
        fragmentShader: `
          varying float vA;
          void main() {
            vec2 uv = gl_PointCoord - 0.5;
            float a = smoothstep(0.5, 0.05, length(uv)) * vA;
            gl_FragColor = vec4(0.85, 0.87, 0.95, a);
          }`,
      });
      const dust = new THREE.Points(dustGeo, dustMat);
      scene.add(dust);

      // --- volumetric light beams (additive gradient planes) ---
      const beamMat = (tilt, x, y, z, w, h, op) => {
        const m = new THREE.ShaderMaterial({
          transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
          uniforms: { uT: { value: 0 }, uOp: { value: op } },
          vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
          fragmentShader: `
            varying vec2 vUv; uniform float uT; uniform float uOp;
            void main(){
              float across = smoothstep(0.0, 0.42, vUv.x) * smoothstep(1.0, 0.58, vUv.x);
              float along = smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.45, vUv.y);
              float flicker = 0.85 + 0.15 * sin(uT * 0.4 + vUv.y * 3.0);
              gl_FragColor = vec4(0.75, 0.8, 1.0, across * along * uOp * flicker);
            }`,
        });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
        mesh.position.set(x, y, z);
        mesh.rotation.z = tilt;
        scene.add(mesh);
        return m;
      };
      const beams = [
        beamMat(0.42, -5.4, 2.6, -3.5, 5.5, 15, 0.10),
        beamMat(-0.36, 5.8, 2.4, -4.5, 4.5, 15, 0.075),
      ];

      // --- low floor glow (brand red, kept subtle) ---
      const glowMat = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        uniforms: { uT: { value: 0 }, uOp: { value: glow } },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `
          varying vec2 vUv; uniform float uT; uniform float uOp;
          void main(){
            float d = length(vUv - 0.5) * 2.0;
            float a = smoothstep(1.0, 0.0, d);
            a *= a;
            float pulse = 0.9 + 0.1 * sin(uT * 0.55);
            gl_FragColor = vec4(0.9, 0.04, 0.08, a * uOp * pulse);
          }`,
      });
      const pool = new THREE.Mesh(new THREE.PlaneGeometry(16, 7), glowMat);
      pool.rotation.x = -Math.PI / 2;
      pool.position.set(0, -3.1, 0);
      scene.add(pool);

      // --- size handling ---
      const size = () => {
        const w = el.clientWidth || 1; const h = el.clientHeight || 1;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      size();
      const ro = new ResizeObserver(size);
      ro.observe(el);

      // --- camera drift: container scroll progress + pointer parallax ---
      let px = 0; let py = 0; let tx = 0; let ty = 0;
      const onPointer = (e) => {
        tx = (e.clientX / window.innerWidth - 0.5) * 0.7;
        ty = (e.clientY / window.innerHeight - 0.5) * 0.45;
      };
      if (fine && !reduced) window.addEventListener('pointermove', onPointer, { passive: true });

      let visible = true;
      const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.02 });
      io.observe(el);

      const clock = new THREE.Clock();
      const frame = () => {
        const t = clock.getElapsedTime();
        const r = el.getBoundingClientRect();
        const prog = Math.max(-1, Math.min(1, (r.top + r.height / 2 - window.innerHeight / 2) / Math.max(1, window.innerHeight)));
        px += (tx - px) * 0.045;
        py += (ty - py) * 0.045;
        camera.position.x = px + prog * 0.4;
        camera.position.y = 0.4 - py - prog * 0.9;
        camera.lookAt(0, 0, 0);
        dustMat.uniforms.uTime.value = t;
        glowMat.uniforms.uT.value = t;
        beams.forEach((b) => { b.uniforms.uT.value = t; });
        dust.rotation.y = t * 0.014;
        renderer.render(scene, camera);
      };

      if (reduced) {
        frame(); // one static frame only
      } else {
        renderer.setAnimationLoop(() => { if (visible && !document.hidden) frame(); });
      }

      cleanup = () => {
        renderer.setAnimationLoop(null);
        ro.disconnect();
        io.disconnect();
        if (fine && !reduced) window.removeEventListener('pointermove', onPointer);
        dustGeo.dispose(); dustMat.dispose();
        beams.forEach((b) => b.dispose());
        pool.geometry.dispose(); glowMat.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => { killed = true; cleanup(); };
  }, [density, glow, veil]);

  return <div ref={host} className={`pointer-events-none ${className}`} aria-hidden="true" />;
}
