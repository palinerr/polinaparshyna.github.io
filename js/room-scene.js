/* Dollhouse room viewer for the landing page (three.js).
   Loads assets/models/room.glb: your textured LiDAR scan plus the sharpened objects.
   Walls facing the camera hide themselves, so you can look into the room from any side.
   Settings live in content.js under SITE.room; you shouldn't need to edit this file. */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const AX = { x: "x", y: "y", z: "z" };

export async function mountRoom(o) {
  const { stage, src, hotspots = [], scenes = [], setup = false, onOpen, onSetupHit, onScene, reduce = false } = o;
  const gltf = await new GLTFLoader().loadAsync(src);
  const root = gltf.scene;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", o.alt || "A 3D scan of the room. Drag to turn it, scroll or pinch to zoom.");
  canvas.style.cssText = "display:block;width:100%;height:100%;cursor:grab;outline:none";
  canvas.tabIndex = 0;
  stage.innerHTML = ""; stage.append(canvas);

  const scene = new THREE.Scene();
  scene.add(root);

  // nodes that hide when the camera is outside them
  const hiders = [];
  root.traverse(n => { if (n.userData && n.userData.hide) hiders.push({ node: n, ...n.userData.hide }); });
  const solid = []; root.traverse(n => { if (n.isMesh) solid.push(n); });

  // projector beam: drifting smoke particles inside the light frustum
  const beamDef = (gltf.parser.json.scenes?.[0]?.extras || {}).beam;
  let beamMat;
  if (beamDef) {
    const N = 9000, from = new THREE.Vector3(...beamDef.from), C = beamDef.corners.map(c => new THREE.Vector3(...c));
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), tmp = new THREE.Vector3(), a = new THREE.Vector3(), b = new THREE.Vector3();
    for (let i = 0; i < N; i++) {
      const t = Math.pow(Math.random(), 0.85), s = Math.random(), u = Math.random();
      a.copy(C[0]).lerp(C[3], u); b.copy(C[1]).lerp(C[2], u); tmp.copy(a).lerp(b, s);
      tmp.sub(from).multiplyScalar(t).add(from);
      const j = 0.004 + 0.02 * t;
      pos[i * 3] = tmp.x + (Math.random() - 0.5) * j; pos[i * 3 + 1] = tmp.y + (Math.random() - 0.5) * j; pos[i * 3 + 2] = tmp.z + (Math.random() - 0.5) * j;
      const k = (0.35 + 0.65 * Math.random()) * (1 - 0.5 * t);
      col[i * 3] = 0.75 * k; col[i * 3 + 1] = 0.82 * k; col[i * 3 + 2] = 0.95 * k;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    beamMat = new THREE.PointsMaterial({ size: 0.012, vertexColors: true, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending });
    const clock = { value: 0 }; beamMat.userData.clock = clock;
    beamMat.onBeforeCompile = sh => {
      sh.uniforms.uTime = clock;
      sh.vertexShader = "uniform float uTime;\n" + sh.vertexShader.replace("#include <begin_vertex>",
        "#include <begin_vertex>\n transformed += vec3(sin(uTime*0.4+position.y*9.0+position.z*3.0), sin(uTime*0.3+position.x*7.0), cos(uTime*0.35+position.x*5.0+position.y*4.0)) * 0.015;");
    };
    const pts = new THREE.Points(g, beamMat); pts.frustumCulled = false; scene.add(pts);
  }

  // camera + controls
  const camera = new THREE.PerspectiveCamera(o.fov ?? 35, 1, 0.02, 100);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.minDistance = 0.3; controls.maxDistance = 11;
  controls.maxPolarAngle = THREE.MathUtils.degToRad(86);
  controls.rotateSpeed = 0.6; controls.zoomSpeed = 0.8; controls.panSpeed = 0.6;
  controls.screenSpacePanning = true;
  // scrolling the page shouldn't zoom the room until you've clicked into it
  controls.enableZoom = false;
  const armZoom = () => { controls.enableZoom = true; };
  canvas.addEventListener("pointerdown", armZoom);
  canvas.addEventListener("touchstart", armZoom, { passive: true });
  stage.addEventListener("pointerleave", () => { controls.enableZoom = false; });

  const start = scenes[0];
  const v3 = a => new THREE.Vector3(...a);
  camera.position.copy(v3(start.position)); controls.target.copy(v3(start.target));
  if (!reduce) { // one entrance move: the room drifts in from further away
    const far = v3(start.position).sub(v3(start.target)).multiplyScalar(1.6).add(v3(start.target));
    camera.position.copy(far);
  }
  let fly = reduce ? null : { from: camera.position.clone(), to: v3(start.position), tFrom: controls.target.clone(), tTo: v3(start.target), t0: performance.now(), dur: 2200 };
  controls.autoRotate = !reduce; controls.autoRotateSpeed = 0.35;
  let lastInput = performance.now();
  controls.addEventListener("start", () => { controls.autoRotate = false; fly = null; lastInput = performance.now(); });

  function goTo(i) {
    const s = scenes[i]; if (!s) return;
    controls.autoRotate = false;
    if (reduce) { camera.position.copy(v3(s.position)); controls.target.copy(v3(s.target)); controls.update(); }
    else fly = { from: camera.position.clone(), to: v3(s.position), tFrom: controls.target.clone(), tTo: v3(s.target), t0: performance.now(), dur: 1600 };
    if (onScene) onScene(i);
  }

  // hotspots
  const layer = document.createElement("div"); layer.className = "hs-layer"; stage.append(layer);
  const spots = hotspots.map(h => {
    const b = document.createElement("button"); b.type = "button"; b.className = "hs";
    b.innerHTML = "<span></span>"; b.querySelector("span").textContent = h.label;
    b.addEventListener("click", () => onOpen && onOpen(h.link));
    layer.append(b);
    return { b, p: new THREE.Vector3(...String(h.position).trim().split(/\s+/).map(Number)), vis: true };
  });

  const resize = () => {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.fov = (o.fov ?? 35) * (w / h < 0.9 ? 1.45 : 1); camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize); ro.observe(stage); resize();

  // setup mode: click the scan to get a hotspot position
  const ray = new THREE.Raycaster(); let downAt = null;
  canvas.addEventListener("pointerdown", e => { downAt = [e.clientX, e.clientY]; });
  canvas.addEventListener("click", e => {
    if (!setup || !downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 5) return;
    const r = canvas.getBoundingClientRect();
    ray.far = Infinity;
    ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
    const hit = ray.intersectObjects(solid.filter(m => m.visible && visibleUp(m)), false)[0];
    if (hit && onSetupHit) onSetupHit(hit.point, camera.position, controls.target);
  });
  const visibleUp = n => { for (let p = n; p; p = p.parent) if (!p.visible) return false; return true; };

  const tmp = new THREE.Vector3(); let frameNo = 0, running = true;
  const io = new IntersectionObserver(([en]) => { running = en.isIntersecting; if (running) requestAnimationFrame(frame); });
  io.observe(stage);

  function frame(t) {
    if (!running || !stage.isConnected) return;
    if (fly) {
      const k = Math.min(1, (t - fly.t0) / fly.dur), e = ease(Math.max(0, k));
      camera.position.lerpVectors(fly.from, fly.to, e); controls.target.lerpVectors(fly.tFrom, fly.tTo, e);
      if (k >= 1) fly = null;
    }
    if (!reduce && !fly && !controls.autoRotate && performance.now() - lastInput > 20000 && camera.position.distanceTo(controls.target) > 4) controls.autoRotate = true;
    controls.update();
    for (const h of hiders) h.node.visible = !((camera.position[AX[h.axis]] - h.value) * h.side > 0);
    if (beamMat && !reduce) beamMat.userData.clock.value = t / 1000;
    renderer.render(scene, camera);

    const w = stage.clientWidth, hgt = stage.clientHeight; frameNo++;
    for (const s of spots) {
      tmp.copy(s.p).project(camera);
      const on = tmp.z < 1 && Math.abs(tmp.x) < 1.02 && Math.abs(tmp.y) < 1.02;
      s.b.hidden = !on;
      if (!on) continue;
      s.b.style.transform = `translate(${(tmp.x * 0.5 + 0.5) * w - 9}px, ${(-tmp.y * 0.5 + 0.5) * hgt - 9}px)`;
      if (frameNo % 12 === 0) { // dim labels that are behind something
        const dir = s.p.clone().sub(camera.position), d = dir.length();
        ray.set(camera.position, dir.normalize()); ray.far = d - 0.06;
        s.vis = !ray.intersectObjects(solid.filter(m => visibleUp(m)), false).length;
        s.b.dataset.visible = s.vis;
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return { goTo, destroy() { running = false; ro.disconnect(); io.disconnect(); controls.dispose(); renderer.dispose(); } };
}
