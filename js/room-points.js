/* Point-cloud room viewer for the landing page (three.js).
   Loads a .bin (made by Claude from your photos) or a .ply (exported from Polycam, Scaniverse, etc.).
   You shouldn't need to edit this file: settings live in content.js under SITE.room. */

const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

function parseBin(buf) {
  const n = new DataView(buf).getUint32(0, true);
  const pos = new Float32Array(buf, 4, n * 3);
  const col = new Uint8Array(buf, 4 + n * 12, n * 3);
  return { pos, col, n };
}

function parsePLY(buf) {
  const bytes = new Uint8Array(buf);
  const headEnd = (() => {
    const s = new TextDecoder().decode(bytes.subarray(0, Math.min(bytes.length, 65536)));
    const i = s.indexOf("end_header");
    return s.slice(0, i).length + "end_header".length + (s[i + 10] === "\r" ? 2 : 1);
  })();
  const header = new TextDecoder().decode(bytes.subarray(0, headEnd));
  const lines = header.split(/\r?\n/);
  const format = (lines.find(l => l.startsWith("format")) || "").split(" ")[1];
  let n = 0, props = [], inVertex = false, skipBefore = 0;
  const elements = [];
  for (const l of lines) {
    const p = l.trim().split(/\s+/);
    if (p[0] === "element") { inVertex = p[1] === "vertex"; elements.push({ name: p[1], count: +p[2], props: [] }); if (inVertex) n = +p[2]; }
    else if (p[0] === "property") {
      const el = elements[elements.length - 1];
      if (p[1] === "list") el.props.push({ list: true, ct: p[2], it: p[3], name: p[4] });
      else el.props.push({ type: p[1], name: p[2] });
    }
  }
  if (elements[0] && elements[0].name !== "vertex") skipBefore = 1; // rare; not supported for binary
  props = (elements.find(e => e.name === "vertex") || { props: [] }).props;
  const size = { char: 1, uchar: 1, int8: 1, uint8: 1, short: 2, ushort: 2, int16: 2, uint16: 2, int: 4, uint: 4, int32: 4, uint32: 4, float: 4, float32: 4, double: 8, float64: 8 };
  const idx = name => props.findIndex(p => p.name === name);
  const ix = idx("x"), iy = idx("y"), iz = idx("z");
  const ir = [idx("red"), idx("r"), idx("diffuse_red")].find(i => i >= 0);
  const ig = [idx("green"), idx("g"), idx("diffuse_green")].find(i => i >= 0);
  const ib = [idx("blue"), idx("b"), idx("diffuse_blue")].find(i => i >= 0);
  const pos = new Float32Array(n * 3), col = new Uint8Array(n * 3).fill(200);
  if (format === "ascii") {
    const rows = new TextDecoder().decode(bytes.subarray(headEnd)).split(/\r?\n/);
    for (let i = 0; i < n; i++) {
      const v = rows[i].trim().split(/\s+/).map(Number);
      pos[i * 3] = v[ix]; pos[i * 3 + 1] = v[iy]; pos[i * 3 + 2] = v[iz];
      if (ir !== undefined) { const k = props[ir].type.startsWith("f") ? 255 : 1; col[i * 3] = v[ir] * k; col[i * 3 + 1] = v[ig] * k; col[i * 3 + 2] = v[ib] * k; }
    }
  } else {
    const le = format !== "binary_big_endian";
    const dv = new DataView(buf, headEnd);
    const offs = []; let stride = 0;
    for (const p of props) { offs.push(stride); stride += size[p.type]; }
    const rd = (o, t) => {
      switch (t) {
        case "float": case "float32": return dv.getFloat32(o, le);
        case "double": case "float64": return dv.getFloat64(o, le);
        case "uchar": case "uint8": return dv.getUint8(o);
        case "char": case "int8": return dv.getInt8(o);
        case "ushort": case "uint16": return dv.getUint16(o, le);
        case "short": case "int16": return dv.getInt16(o, le);
        case "uint": case "uint32": return dv.getUint32(o, le);
        default: return dv.getInt32(o, le);
      }
    };
    for (let i = 0; i < n; i++) {
      const b = i * stride;
      pos[i * 3] = rd(b + offs[ix], props[ix].type); pos[i * 3 + 1] = rd(b + offs[iy], props[iy].type); pos[i * 3 + 2] = rd(b + offs[iz], props[iz].type);
      if (ir !== undefined) {
        const k = props[ir].type.startsWith("f") || props[ir].type.startsWith("d") ? 255 : 1;
        col[i * 3] = rd(b + offs[ir], props[ir].type) * k; col[i * 3 + 1] = rd(b + offs[ig], props[ig].type) * k; col[i * 3 + 2] = rd(b + offs[ib], props[ib].type) * k;
      }
    }
  }
  return { pos, col, n };
}

function parsePCL2(buf) {
  const dv = new DataView(buf); let off = 8; const layers = [];
  const count = dv.getUint32(4, true);
  for (let L = 0; L < count; L++) {
    const n = dv.getUint32(off, true), additive = dv.getUint8(off + 4), animate = dv.getUint8(off + 5), size = dv.getUint16(off + 6, true) / 100;
    off += 8;
    const lo = [0, 1, 2].map(i => dv.getFloat32(off + i * 4, true)), hi = [3, 4, 5].map(i => dv.getFloat32(off + i * 4, true));
    off += 24;
    const q = new Uint16Array(buf.slice(off, off + n * 6)); off += n * 6;
    const col = new Uint8Array(buf, off, n * 3); off += n * 3; off += (4 - (n * 9) % 4) % 4;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n * 3; i++) { const k = i % 3; pos[i] = lo[k] + (q[i] / 65535) * (hi[k] - lo[k]); }
    layers.push({ pos, col: new Uint8Array(col), n, additive, animate, size });
  }
  return layers;
}

export async function mountPoints(o) {
  const { stage, src, hotspots = [], setup = false, onOpen, onSetupHit, reduce = false } = o;
  const THREE = await import(THREE_URL);
  const res = await fetch(src);
  if (!res.ok) throw new Error(`Couldn't load ${src} (${res.status})`);
  const buf = await res.arrayBuffer();
  const magic = new TextDecoder().decode(new Uint8Array(buf, 0, 4));
  let layers = magic === "PCL2" ? parsePCL2(buf) : [{ ...(/\.ply$/i.test(src) ? parsePLY(buf) : parseBin(buf)), additive: 0, animate: 0, size: 1 }];

  // fewer points on small screens
  const small = matchMedia("(max-width: 700px)").matches;
  if (small) layers = layers.map(l => {
    if (l.n < 120000) return l;
    const step = 2, m = Math.floor(l.n / step), p2 = new Float32Array(m * 3), c2 = new Uint8Array(m * 3);
    for (let i = 0; i < m; i++) for (let k = 0; k < 3; k++) { p2[i * 3 + k] = l.pos[i * step * 3 + k]; c2[i * 3 + k] = l.col[i * step * 3 + k]; }
    return { ...l, pos: p2, col: c2, n: m, size: l.size * 1.3 };
  });

  const scene = new THREE.Scene();
  const clock = { value: 0 };
  const clouds = [], geos = [], mats = [];
  const bb = new THREE.Box3();
  for (const l of layers) {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(l.pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(l.col, 3, true));
    g.computeBoundingBox(); if (!l.additive) bb.union(g.boundingBox);
    const m = new THREE.PointsMaterial({ size: (o.pointSize ?? 0.011) * l.size, vertexColors: true, sizeAttenuation: true,
      transparent: !!l.additive, opacity: l.additive ? 0.55 : 1, depthWrite: !l.additive,
      blending: l.additive ? THREE.AdditiveBlending : THREE.NormalBlending });
    if (l.animate) m.onBeforeCompile = sh => {
      sh.uniforms.uTime = clock;
      sh.vertexShader = "uniform float uTime;\n" + sh.vertexShader.replace("#include <begin_vertex>",
        "#include <begin_vertex>\n transformed += vec3(sin(uTime*0.35+position.y*9.0+position.z*3.0), sin(uTime*0.25+position.x*7.0)*0.6+0.4*sin(uTime*0.6+position.z*11.0), cos(uTime*0.3+position.x*5.0+position.y*4.0)) * 0.018;");
    };
    const pts = new THREE.Points(g, m); pts.frustumCulled = false;
    scene.add(pts); clouds.push(pts); geos.push(g); mats.push(m);
  }
  const cloud = clouds[0];
  const size = new THREE.Vector3(), center = new THREE.Vector3();
  bb.getSize(size); bb.getCenter(center);

  const v = o.view || {};
  const target = new THREE.Vector3(...(v.target || [center.x, bb.min.y + size.y * 0.35, center.z]));
  let yaw = THREE.MathUtils.degToRad(v.yaw ?? 0), pitch = THREE.MathUtils.degToRad(v.pitch ?? 14);
  let dist = v.distance ?? Math.max(size.x, size.z) * 0.62;
  const yaw0 = yaw, minD = dist * 0.45, maxD = dist * (v.maxZoomOut ?? 1.8);
  const yawLimit = THREE.MathUtils.degToRad(v.yawLimit ?? 70);

  const camera = new THREE.PerspectiveCamera(v.fov ?? 52, 1, 0.02, 100);
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  stage.innerHTML = "";
  const canvas = renderer.domElement;
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", o.alt || "A point-cloud scan of the room. Drag to look around.");
  canvas.style.cssText = "display:block;width:100%;height:100%;touch-action:pan-y;cursor:grab";
  stage.append(canvas);

  // hotspots
  const layer = document.createElement("div");
  layer.className = "hs-layer";
  stage.append(layer);
  const spots = hotspots.map(h => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "hs";
    b.innerHTML = `<span></span>`; b.querySelector("span").textContent = h.label;
    b.addEventListener("click", () => onOpen && onOpen(h.link));
    layer.append(b);
    return { b, p: new THREE.Vector3(...String(h.position).trim().split(/\s+/).map(Number)) };
  });

  const resize = () => {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    // keep the whole room in view on tall phone screens
    camera.fov = (v.fov ?? 52) * (w / h < 0.9 ? 1.35 : 1);
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize); ro.observe(stage); resize();

  // drag to look around, wheel or pinch to zoom
  let drag = null, lastInput = -1e9, moved = 0;
  const pointers = new Map();
  canvas.addEventListener("pointerdown", e => { pointers.set(e.pointerId, e); drag = { x: e.clientX, y: e.clientY }; moved = 0; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = "grabbing"; });
  canvas.addEventListener("pointermove", e => {
    if (!pointers.has(e.pointerId)) return;
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d0 = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      pointers.set(e.pointerId, e);
      const [c, d] = [...pointers.values()];
      const d1 = Math.hypot(c.clientX - d.clientX, c.clientY - d.clientY);
      dist = THREE.MathUtils.clamp(dist * d0 / d1, minD, maxD); lastInput = performance.now(); return;
    }
    pointers.set(e.pointerId, e);
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag = { x: e.clientX, y: e.clientY };
    moved += Math.abs(dx) + Math.abs(dy);
    yaw = THREE.MathUtils.clamp(yaw - dx * 0.006, yaw0 - yawLimit, yaw0 + yawLimit);
    pitch = THREE.MathUtils.clamp(pitch + dy * 0.004, THREE.MathUtils.degToRad(-5), THREE.MathUtils.degToRad(80));
    lastInput = performance.now();
  });
  const up = e => { pointers.delete(e.pointerId); if (!pointers.size) { drag = null; canvas.style.cursor = "grab"; } };
  canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up);
  canvas.addEventListener("wheel", e => { if (!e.ctrlKey && !o.wheelZoom) return; e.preventDefault(); dist = THREE.MathUtils.clamp(dist * (1 + e.deltaY * 0.001), minD, maxD); lastInput = performance.now(); }, { passive: false });
  // keyboard: arrow keys look around when the canvas has focus
  canvas.tabIndex = 0;
  canvas.addEventListener("keydown", e => {
    const k = { ArrowLeft: [0.08, 0], ArrowRight: [-0.08, 0], ArrowUp: [0, -0.06], ArrowDown: [0, 0.06] }[e.key];
    if (!k) return; e.preventDefault();
    yaw = THREE.MathUtils.clamp(yaw + k[0], yaw0 - yawLimit, yaw0 + yawLimit);
    pitch = THREE.MathUtils.clamp(pitch + k[1], THREE.MathUtils.degToRad(-5), THREE.MathUtils.degToRad(80));
    lastInput = performance.now();
  });

  // setup mode: click a point to get its position for a hotspot
  const ray = new THREE.Raycaster(); ray.params.Points.threshold = Math.max(size.x, size.z) * 0.006;
  canvas.addEventListener("click", e => {
    if (!setup || moved > 6) return;
    const r = canvas.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
    const hit = ray.intersectObjects(clouds.filter((c, i) => !layers[i].additive))[0];
    if (hit && onSetupHit) onSetupHit(hit.point);
  });

  const tmp = new THREE.Vector3();
  let running = true;
  const io = new IntersectionObserver(([en]) => { running = en.isIntersecting; if (running) requestAnimationFrame(frame); });
  io.observe(stage);
  function frame(t) {
    if (!running || !stage.isConnected) return;
    if (!reduce) clock.value = t / 1000;
    // slow drift when nobody is touching it
    const idle = !reduce && performance.now() - lastInput > 4000;
    const y = idle ? yaw + Math.sin(t * 0.00012) * 0.0003 : yaw;
    if (idle) yaw = THREE.MathUtils.clamp(y, yaw0 - yawLimit, yaw0 + yawLimit);
    camera.position.set(target.x + dist * Math.sin(yaw) * Math.cos(pitch), target.y + dist * Math.sin(pitch), target.z + dist * Math.cos(yaw) * Math.cos(pitch));
    camera.lookAt(target);
    renderer.render(scene, camera);
    const w = stage.clientWidth, h = stage.clientHeight;
    for (const s of spots) {
      tmp.copy(s.p).project(camera);
      const vis = tmp.z < 1 && Math.abs(tmp.x) < 1.05 && Math.abs(tmp.y) < 1.05;
      s.b.style.transform = `translate(${(tmp.x * 0.5 + 0.5) * w - 8}px, ${(-tmp.y * 0.5 + 0.5) * h - 8}px)`;
      s.b.hidden = !vis;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return { destroy() { running = false; ro.disconnect(); io.disconnect(); renderer.dispose(); geos.forEach(g => g.dispose()); mats.forEach(m => m.dispose()); } };
}
