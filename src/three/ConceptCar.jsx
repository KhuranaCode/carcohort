import { useEffect, useRef } from 'react';

const DEFAULT_URL = './models/vehicles/thar.glb';

/** Licensed CC BY 4.0 vehicle models (see src/three/models.js for the roster
 * and per-model attribution). Scroll turns the model; reduced motion renders
 * a static frame. GLBs are meshopt-compressed - the decoder is wired below.
 */
export default function ConceptCar({ progressRef, autoSpin = false, className = '', modelUrl = DEFAULT_URL }) {
  const host = useRef(null);

  useEffect(() => {
    let dead = false;
    let cleanup = () => {};
    (async () => {
      const THREE = await import('three');
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      const { MeshoptDecoder } = await import('three/examples/jsm/libs/meshopt_decoder.module.js');
      const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
      if (dead || !host.current) return;
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      } catch {
        return; // no WebGL - CSS gradient behind the host carries the section
      }
      const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.toneMapping = THREE.NeutralToneMapping;
      renderer.toneMappingExposure = 1.3;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      host.current.appendChild(renderer.domElement);
      renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';

      // loading / static-fallback status pill (11.8 MB model: the studio
      // scene renders immediately and the page never blocks on the fetch)
      const status = document.createElement('p');
      status.textContent = 'Loading interactive 3D demo…';
      status.style.cssText = 'position:absolute;left:50%;bottom:18%;transform:translateX(-50%);z-index:3;margin:0;padding:6px 14px;border-radius:999px;background:rgba(8,8,10,.6);color:rgba(255,255,255,.6);font:600 10px/1.4 system-ui,sans-serif;letter-spacing:.18em;text-transform:uppercase;white-space:nowrap';
      host.current.appendChild(status);

      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x08080a, 9, 26);
      const pmrem = new THREE.PMREMGenerator(renderer);
      const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = env;

      const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 80);
      camera.position.set(5.6, 1.5, 6.1);
      camera.lookAt(0, 0.6, 0);

      // studio light rig
      const key = new THREE.DirectionalLight(0xffffff, 2.6);
      key.position.set(4, 6, 3);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.left = key.shadow.camera.bottom = -6;
      key.shadow.camera.right = key.shadow.camera.top = 6;
      key.shadow.radius = 6;
      key.shadow.bias = -0.0004;
      const rim = new THREE.SpotLight(0xff2a1e, 38, 26, Math.PI / 5, 0.55, 1.6);
      rim.position.set(-5.5, 2.8, -4.5);
      const fill = new THREE.DirectionalLight(0x9db4ff, 0.65);
      fill.position.set(-3, 3, 5);
      const under = new THREE.PointLight(0xff2a1e, 2.6, 4.5, 1.8);
      under.position.set(0, 0.12, 0);
      const hemi = new THREE.HemisphereLight(0x9aa4bb, 0x2a1518, 0.85);
      // chase light: keeps the camera-facing side of the car readable on
      // every turntable angle without lifting the whole stage
      const chase = new THREE.PointLight(0xfff2e8, 26, 22, 1.7);
      camera.add(chase);
      scene.add(camera);
      scene.add(key, rim, fill, under, hemi);

      // paper theme: transparent shadow-catcher floor (no dark disc)
      const floor = new THREE.Mesh(
        new THREE.CircleGeometry(30, 48),
        new THREE.ShadowMaterial({ color: 0x0f0f12, opacity: 0.3 })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);
      const glowCv = document.createElement('canvas');
      glowCv.width = glowCv.height = 256;
      const g = glowCv.getContext('2d');
      const grad = g.createRadialGradient(128, 128, 8, 128, 128, 128);
      grad.addColorStop(0, 'rgba(255,42,30,0.10)');
      grad.addColorStop(0.55, 'rgba(255,42,30,0.03)');
      grad.addColorStop(1, 'rgba(255,42,30,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, 256, 256);
      const glowTex = new THREE.CanvasTexture(glowCv);
      const glow = new THREE.Mesh(
        new THREE.CircleGeometry(3.6, 40),
        new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
      );
      glow.rotation.x = -Math.PI / 2;
      glow.position.y = 0.012;
      scene.add(glow);

      // sizing
      const el = host.current;
      const fit = () => {
        const w = el.clientWidth || 1;
        const h = el.clientHeight || 1;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        // narrow (portrait) viewports: pull the camera back so the whole car fits
        const dist = Math.min(2.8, Math.max(1, 1.18 / camera.aspect));
        camera.position.set(5.6 * dist, 1.5 * Math.min(dist, 1.3), 6.1 * dist);
        chase.intensity = 38 * Math.pow(dist, 1.7);
        camera.lookAt(0, 0.6, 0);
        camera.updateProjectionMatrix();
      };
      fit();
      const ro = new ResizeObserver(fit);
      ro.observe(el);

      // turntable state
      const car = new THREE.Group();
      scene.add(car);
      let loaded = false;
      let wheels = [];

      // model loads only when the section nears the viewport
      const startLoad = () => {
          try {
        const loader = new GLTFLoader();
        loader.setMeshoptDecoder(MeshoptDecoder);
        loader.load(modelUrl, (gltf) => {
          if (dead) return;
          const model = gltf.scene;
          // normalise: centre on origin, ground at y=0, length along x
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const centre = box.getCenter(new THREE.Vector3());
          if (size.z > size.x) model.rotation.y = Math.PI / 2;
          model.position.x -= centre.x;
          model.position.z -= centre.z;
          model.position.y -= box.min.y;
          const scale = 4.6 / Math.max(size.x, size.z);
          model.scale.setScalar(scale);
          model.traverse((o) => {
            if (o.isMesh) {
              o.castShadow = true;
              (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
                if (!m) return;
                if ('envMapIntensity' in m) m.envMapIntensity = 1.55;
                // art-direction fit: obsidian studio - keep the paint, temper the rest
                if (/glass|windshield|window|canopy/i.test(m.name)) {
                  if (m.color) m.color.setHex(0x0b0d12);
                  if ('transmission' in m) m.transmission = Math.min(m.transmission || 0, 0.35);
                  if (m.attenuationColor) m.attenuationColor.setHex(0x10141c);
                  m.opacity = Math.min(m.opacity || 1, 0.92);
                  m.transparent = true;
                  if ('roughness' in m) m.roughness = 0.08;
                }
              });
            }
          });
          // wheel/rim materials render chalk-white under the bright studio env
          // (metallic surfaces mirroring RoomEnvironment) - replace every
          // matching mesh's material outright, no shared-instance dedupe.
          const tireM = new THREE.MeshStandardMaterial({ color: 0x131315, metalness: 0.1, roughness: 0.92, envMapIntensity: 0.18 });
          const rimM = new THREE.MeshStandardMaterial({ color: 0x3a3d44, metalness: 0.75, roughness: 0.38, envMapIntensity: 0.22 });
          model.traverse((o) => {
            if (!o.isMesh) return;
            const swap = (m) => {
              if (!m || !m.name) return m;
              if (/tire|tyre|rubber/i.test(m.name)) return tireM;
              if (/powdercoat|rim|wheel|brake|disc/i.test(m.name)) return rimM;
              return m;
            };
            o.material = Array.isArray(o.material) ? o.material.map(swap) : swap(o.material);
          });
          car.add(model);
          // guess wheel nodes for the idle spin (names vary; harmless if empty)
          wheels = [];
          model.traverse((o) => { if (/wheel|tire|tyre/i.test(o.name) && o.parent !== model) wheels.push(o); });
          loaded = true;
          status.remove();
        }, undefined, () => { status.textContent = 'Static preview - interactive 3D model unavailable'; });
        } catch { status.textContent = 'Static preview - interactive 3D model unavailable'; }
      };
      // start the model fetch shortly after mount (IO delivery is unreliable
      // in some embedded/headless contexts, so do not gate loading on it)
      const loadTimer = setTimeout(startLoad, 1200);

      // animation
      let raf = 0;
      let visible = true;
      let shown = reduced ? 0.62 : 0;
      const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.02 });
      io.observe(el);
      const onVis = () => { visible = !document.hidden; };
      document.addEventListener('visibilitychange', onVis);

      const tick = () => {
        raf = requestAnimationFrame(tick);
        if (!visible) return;
        if (reduced) {
          // static frame only - no motion at all
          car.rotation.y = 0.62 * Math.PI * 2;
          renderer.render(scene, camera);
          return;
        }
        let target = progressRef ? progressRef.current : 0;
        if (autoSpin) {
          // unpinned (mobile/touch): the section's travel through the
          // viewport is the turntable - car stays put, scroll turns it
          const r = host.current.getBoundingClientRect();
          const vh = window.innerHeight || 1;
          target = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
        }
        shown += (target - shown) * 0.12;
        car.rotation.y = shown * Math.PI * 2;
        renderer.render(scene, camera);
      };
      raf = requestAnimationFrame(tick);

      cleanup = () => {
        status.remove();
        cancelAnimationFrame(raf);
        io.disconnect();
        clearTimeout(loadTimer);
        ro.disconnect();
        document.removeEventListener('visibilitychange', onVis);
        scene.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) {
            (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
              Object.keys(m).forEach((k) => { if (m[k] && m[k].isTexture) m[k].dispose(); });
              m.dispose();
            });
          }
        });
        env.dispose();
        pmrem.dispose();
        renderer.dispose();
        if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      };
    })();
    return () => { dead = true; cleanup(); };
  }, [modelUrl]);

  return <div ref={host} className={className} aria-hidden="true" />;
}
