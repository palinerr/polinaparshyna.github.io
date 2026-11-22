/* Site behaviour. Content is in content.js; you shouldn't need to edit this file. */
{
  const S = window.SITE, P = window.PROJECTS || [], W = window.WRITING || [];
  const $ = (q, el = document) => el.querySelector(q);
  const $$ = (q, el = document) => [...el.querySelectorAll(q)];
  const esc = (s = "") => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- basics ---------- */
  document.title = `${S.name} | Architecture portfolio`;
  $$("[data-name]").forEach(el => (el.textContent = S.name));
  $$("[data-location]").forEach(el => (el.textContent = S.location));
  $("[data-role]").textContent = S.role;
  $("[data-statement]").textContent = S.statement;
  const avail = $("[data-availability]");
  if (S.availability) avail.textContent = S.availability; else avail.closest("li").hidden = true;
  $("#initials").textContent = S.initials || S.name.split(/\s+/).map(w => w[0]).join("").slice(0, 3).toUpperCase();
  $("#initials").setAttribute("aria-label", `${S.name}, back to the top`);
  $("#year").textContent = new Date().getFullYear();

  /* ---------- missing images show which file they expect ---------- */
  document.addEventListener("error", ev => {
    const im = ev.target;
    if (!(im instanceof HTMLImageElement) || im.dataset.missing || !im.getAttribute("src")) return;
    // try other common extensions before giving up (01.jpg -> 01.png -> 01.jpeg -> 01.webp)
    const exts = [".jpg", ".png", ".jpeg", ".webp", ".JPG", ".PNG"], src = im.getAttribute("src");
    const m = src.match(/\.(jpg|png|jpeg|webp|JPG|PNG)$/);
    if (m) {
      const tried = (im.dataset.tried || "." + m[1]).split(",");
      const next = exts.find(e => !tried.includes(e));
      if (next) { im.dataset.tried = [...tried, next].join(","); im.dataset.orig ||= src; im.src = src.slice(0, -m[0].length) + next; return; }
    }
    im.dataset.missing = "1"; im.hidden = true;
    const box = document.createElement("div");
    box.className = "missing";
    box.textContent = `Add image: ${im.dataset.orig || im.getAttribute("src")}`;
    im.after(box);
  }, true);

  /* ---------- project grid ---------- */
  const SPAN = { full: 12, large: 7, small: 5 };
  const hasTypes = p => new Set((p.blocks || []).filter(b => b.type !== "embed" || b.src).map(b => b.type).map(t => (t === "embed" ? "video" : t)));
  const hasLabel = { video: "Film", model: "3D model" };

  const groupsOf = [...new Set(P.map(p => p.group).filter(Boolean))];
  const filters = [["all", "Everything"], ...groupsOf.map(g => ["g:" + g, g]),
    ...(P.some(p => hasTypes(p).has("video")) ? [["video", "With film"]] : []),
    ...(P.some(p => hasTypes(p).has("model")) ? [["model", "With 3D model"]] : [])];
  $(".filters").innerHTML = filters.map(([k, l], i) => `<button type="button" class="chip" aria-pressed="${i === 0}" data-filter="${esc(k)}">${esc(l)}</button>`).join("");
  const join = (...a) => a.filter(Boolean).join(", ");

  function renderGrid(filter = "all") {
    const list = P.filter(p => filter === "all" || (filter.startsWith("g:") ? p.group === filter.slice(2) : hasTypes(p).has(filter)));
    // Work out column spans so every row is filled edge to edge.
    const spans = list.map(p => SPAN[p.size] || 6);
    let used = 0;
    for (let i = 0; i < spans.length; i++) {
      if (used + spans[i] > 12) used = 0;
      used += spans[i];
      const next = spans[i + 1];
      if (used < 12 && (next === undefined || used + next > 12)) { spans[i] += 12 - used; used = 0; }
      else if (used === 12) used = 0;
    }
    $("#grid").innerHTML = list.map((p, i) => {
      const has = [...hasTypes(p)].filter(t => hasLabel[t]).map(t => `<span class="tag">${hasLabel[t]}</span>`).join("");
      return `<li class="card" data-size="${spans[i] === 12 ? "full" : esc(p.size)}" style="--span:${spans[i]}">
        <a href="#${esc(p.slug)}">
          <div class="media">${p.coverVideo
            ? `<video src="${esc(p.coverVideo)}" poster="${esc(p.cover)}" muted loop playsinline ${reduce ? "" : "autoplay"} preload="metadata" aria-hidden="true"></video>`
            : `<img src="${esc(p.cover)}" alt="" loading="lazy" decoding="async">`}</div>
          <div class="info">
            <h3>${esc(p.title)}</h3><span class="year">${esc(p.year)}</span>
            <span class="sub">${esc(join(p.place, p.kind))}</span>
            ${has ? `<span class="has">${has}</span>` : ""}
          </div>
        </a></li>`;
    }).join("");
    $("#empty").hidden = list.length > 0;
  }
  renderGrid();
  $$(".chip").forEach(b => b.addEventListener("click", () => {
    $$(".chip").forEach(c => c.setAttribute("aria-pressed", c === b));
    renderGrid(b.dataset.filter);
  }));

  /* ---------- writing ---------- */
  $("#essays").innerHTML = W.map(e => `<li><a href="${e.url ? esc(e.url) : "#" + esc(e.slug)}"${e.url ? ' target="_blank" rel="noopener"' : ""}>
      <span class="year">${esc(e.year)}</span><span class="t">${esc(e.title)}</span><span class="w">${esc(e.where)}</span>
      <span class="s">${esc(e.summary)}</span></a></li>`).join("");
  if (!W.length) $("#writing").hidden = true;

  /* ---------- about ---------- */
  if (S.portrait) $("#portrait").src = S.portrait; else $("#portrait").hidden = true;
  $("#aboutText").innerHTML = (S.about || []).map(t => `<p>${esc(t)}</p>`).join("");
  $("#experience").innerHTML = (S.experience || []).map(x => `<li><span>${esc(x.years)}</span><span>${esc(x.what)}</span><span>${esc(x.where)}</span></li>`).join("");
  $("#skills").textContent = S.skills || "";
  if (S.cv) $("#cvLink").href = S.cv; else $("#cvLink").hidden = true;

  /* ---------- contact ---------- */
  const email = $("#email");
  email.textContent = S.email; email.href = `mailto:${S.email}`;
  $("#links").innerHTML = (S.links || []).map(l => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a></li>`).join("");
  const toast = $("#toast");
  let tt;
  const say = m => { toast.textContent = m; toast.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove("show"), 2600); };
  $("#copyEmail").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(S.email); say("Email address copied"); }
    catch { say(`Copy didn't work here. The address is ${S.email}`); }
  });


  /* ---------- menu ---------- */
  const menu = $("#menu"), q = $("#q");
  const groups = [
    ...(groupsOf.length ? groupsOf : ["Work"]).map(g => ({ name: g, items: P.filter(p => !groupsOf.length || p.group === g)
      .map(p => ({ label: p.title, href: "#" + p.slug, find: [p.title, p.place, p.kind, p.year, p.summary, p.group].join(" ") })) })),
    { name: "Writing", items: W.map(e => ({ label: e.title, href: e.url || "#" + e.slug, ext: !!e.url, find: [e.title, e.where, e.year, e.summary].join(" ") })) },
    { name: "Me", items: [
      { label: "The room", href: "#room" }, { label: "All work", href: "#work" }, { label: "About", href: "#about" }, { label: "Contact", href: "#contact" },
      ...(S.cv ? [{ label: "CV (PDF)", href: S.cv, ext: true }] : []),
      ...(S.links || []).map(l => ({ label: l.label, href: l.url, ext: true })),
    ].map(i => ({ ...i, find: i.label })) },
  ].filter(g => g.items.length);
  $("#menuLists").innerHTML = groups.map(g => `<section class="menu-group"><h2>${esc(g.name)}</h2><nav class="cells" aria-label="${esc(g.name)}">${
    g.items.map(i => `<a href="${esc(i.href)}" data-find="${esc(i.find.toLowerCase())}"${i.ext ? ' target="_blank" rel="noopener"' : ""}>${esc(i.label)}</a>`).join("")
  }</nav></section>`).join("");
  const filterMenu = () => {
    const t = q.value.trim().toLowerCase();
    let any = false;
    $$(".menu-group", menu).forEach(g => {
      let n = 0;
      $$("a", g).forEach(a => { const ok = !t || a.dataset.find.includes(t); a.hidden = !ok; n += ok; });
      g.hidden = !n; any ||= n > 0;
    });
    $("#menuEmpty").hidden = any;
  };
  q.addEventListener("input", filterMenu);
  $("#search").addEventListener("submit", ev => { ev.preventDefault(); const first = $("a:not([hidden])", menu); if (first) first.click(); });
  const openMenu = () => { menu.showModal(); document.body.style.overflow = "hidden"; q.focus(); };
  const closeMenu = () => { menu.close(); document.body.style.overflow = ""; };
  $("#openMenu").addEventListener("click", openMenu);
  $("#closeMenu").addEventListener("click", closeMenu);
  menu.addEventListener("cancel", ev => { ev.preventDefault(); closeMenu(); });
  menu.addEventListener("click", ev => { const a = ev.target.closest("a"); if (a && !a.target) closeMenu(); });

  /* ---------- viewer ---------- */
  const viewer = $("#viewer"), body = $("#viewerBody");
  let openedInside = false, returnY = 0;

  function block(b) {
    const cap = b.caption ? `<figcaption>${esc(b.caption)}</figcaption>` : "";
    switch (b.type) {
      case "text": return `<p class="b b-text">${esc(b.body)}</p>`;
      case "heading": return `<h2 class="b b-heading">${esc(b.body)}</h2>`;
      case "image": return `<figure class="b b-image${b.wide ? " wide" : ""}"><img src="${esc(b.src)}" alt="${esc(b.alt || b.caption || "")}" loading="lazy">${cap}</figure>`;
      case "pair": return `<figure class="b b-pair"><div class="pair">${(b.images || []).map(s => `<img src="${esc(s)}" alt="" loading="lazy">`).join("")}</div>${cap}</figure>`;
      case "video": return `<figure class="b b-video"><video controls playsinline preload="metadata"${b.poster ? ` poster="${esc(b.poster)}"` : ""}><source src="${esc(b.src)}" type="video/mp4"></video>${cap}</figure>`;
      case "embed": return `<figure class="b b-embed"><div class="frame">${b.src
        ? `<iframe src="${esc(b.src)}" title="${esc(b.caption || "Film")}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe>`
        : `<div class="placeholder" style="position:absolute;inset:0">Add a Vimeo or YouTube embed link to this block in content.js</div>`}</div>${cap}</figure>`;
      case "model": return `<figure class="b b-model"><model-viewer src="${esc(b.src)}" alt="${esc(b.caption || "3D model")}" camera-controls touch-action="pan-y" auto-rotate auto-rotate-delay="1500" rotation-per-second="12deg" shadow-intensity="1" exposure="1.05" environment-image="neutral" interaction-prompt="auto"></model-viewer>${cap}</figure>`;
      default: return "";
    }
  }

  let mvLoading;
  function needModelViewer() {
    if (customElements.get("model-viewer") || mvLoading) return;
    mvLoading = true;
    const urls = [
      "https://cdn.jsdelivr.net/npm/@google/model-viewer@4.0.0/dist/model-viewer.min.js",
      "https://unpkg.com/@google/model-viewer@4.0.0/dist/model-viewer.min.js",
    ];
    const tryLoad = i => {
      const s = document.createElement("script");
      s.type = "module"; s.src = urls[i];
      s.onerror = () => {
        s.remove();
        if (urls[i + 1]) tryLoad(i + 1);
        else $$("model-viewer", body).forEach(m => m.outerHTML = `<div class="model-wait placeholder">The 3D viewer couldn't load. Check your connection and reopen this project.</div>`);
      };
      document.head.append(s);
    };
    tryLoad(0);
  }

  /* ---------- story layout (projects with story: true) ---------- */
  const fig = (src, cap, alt, cls = "") => `<figure class="s-fig ${cls}"><img src="${esc(src)}" alt="${esc(alt || "")}" loading="lazy" decoding="async">${cap ? `<figcaption>${esc(cap)}</figcaption>` : ""}</figure>`;
  function item(it, p) {
    if (it.head) return `<header class="s-head"><span class="s-num" aria-hidden="true">${esc(p.number || "")}</span><h1 class="s-title" id="v-title">${esc(p.title)}</h1>
      <div class="s-subs">${(p.sub || []).map(l => `<p>${esc(l)}</p>`).join("")}</div></header>`;
    if (it.h) return `<h2 class="s-h">${esc(it.h)}</h2>`;
    if (it.sub) return `<p class="s-sub">${esc(it.sub)}</p>`;
    if (it.lead) return `<p class="s-lead">${esc(it.lead)}</p>`;
    if (it.p) return `<p class="s-p">${esc(it.p)}</p>`;
    if (it.note) return it.link ? `<a class="s-note" href="${esc(it.link)}">${esc(it.note)}</a>` : `<p class="s-note">${esc(it.note)}</p>`;
    if (it.accent) return `<p class="s-accent">${esc(it.accent)}</p>`;
    if (it.video) return `<figure class="s-fig"><video src="${esc(it.video)}" ${it.poster ? `poster="${esc(it.poster)}"` : ""} muted loop playsinline ${reduce ? "controls" : "autoplay"} aria-label="${esc(it.alt || it.cap || "Film")}"></video>${it.cap ? `<figcaption>${esc(it.cap)}</figcaption>` : ""}</figure>`;
    if (it.img) return fig(it.img, it.cap, it.alt, it.small ? "small" : "");
    if (it.list) return `<ul class="s-list">${it.list.map(x => `<li>${esc(x)}</li>`).join("")}</ul>`;
    if (it.ol) return `<ol class="s-ol">${it.ol.map(x => `<li>${esc(x)}</li>`).join("")}</ol>`;
    if (it.steps) return `<ol class="s-steps${it.vertical ? " v" : ""}">${it.steps.map(([t, d]) => `<li><strong>${esc(t)}</strong>${d ? `<span>${esc(d)}</span>` : ""}</li>`).join("")}</ol>`;
    if (it.cards) return `<div class="s-cards">${it.cards.map(c => `<div class="s-card"><h3>${esc(c.title)}</h3>${fig(c.img, c.cap, c.alt)}<p>${esc(c.p)}</p></div>`).join("")}</div>`;
    if (it.scale) return `<div class="s-scale">${[["Variable", it.scale.variable], ["Outcome", it.scale.outcome]].map(([k, [a, b]], i) =>
      `<span class="k">${k}:</span><span>${esc(a)}</span>${i === 0 ? '<span class="line" aria-hidden="true"></span>' : '<span aria-hidden="true"></span>'}<span>${esc(b)}</span>`).join("")}</div>`;
    if (it.embed) return `<figure class="s-fig"><div class="frame"><iframe src="${esc(it.embed)}" title="${esc(it.cap || "Film")}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>${it.cap ? `<figcaption>${esc(it.cap)}</figcaption>` : ""}</figure>`;
    return "";
  }
  function storyHTML(p) {
    const i = P.indexOf(p), next = P[(i + 1) % P.length];
    const rows = (p.blocks || []).map(b => {
      if (b.type === "full") return `<div class="s-full">${fig(b.src, b.cap, b.alt)}</div>`;
      if (b.type === "row") return `<section class="s-row" style="--cols:${esc(b.ratio || "1fr 1fr")}">${b.cols.map(col =>
        `<div class="s-col${col.some(x => x.head) ? " has-head" : ""}">${col.map(x => item(x, p)).join("")}</div>`).join("")}</section>`;
      return block(b);
    }).join("");
    return `<div class="story">${rows}</div>
      ${P.length > 1 ? `<nav class="p-next" aria-label="Next project"><span>Next project</span><a href="#${esc(next.slug)}">${esc(next.title)}</a></nav>` : ""}`;
  }

  function projectHTML(p) {
    if (p.story) return storyHTML(p);
    const i = P.indexOf(p), next = P[(i + 1) % P.length];
    const facts = Object.entries({ Year: p.year, Place: p.place, Type: p.kind, ...(p.facts || {}) }).filter(([, v]) => v)
      .map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("");
    return `<h1 class="p-title" id="v-title">${esc(p.title)}</h1>
      <div class="p-intro"><p class="p-summary">${esc(p.summary)}</p><dl class="p-facts">${facts}</dl></div>
      <div class="blocks">${(p.blocks || []).map(block).join("")}</div>
      ${P.length > 1 ? `<nav class="p-next" aria-label="Next project"><span>Next project</span><a href="#${esc(next.slug)}">${esc(next.title)}</a></nav>` : ""}`;
  }
  function essayHTML(e) {
    return `<div class="essay"><p class="where">${esc(e.where)}, ${esc(e.year)}</p><h1 id="v-title">${esc(e.title)}</h1>
      ${(e.body || []).map(t => `<p>${esc(t)}</p>`).join("")}</div>`;
  }

  function route() {
    const id = decodeURIComponent(location.hash.slice(1));
    const p = P.find(x => x.slug === id), e = W.find(x => x.slug === id);
    if (!p && !e) { if (viewer.open) shut(false); openedInside = false; return; }
    body.innerHTML = p ? projectHTML(p) : essayHTML(e);
    viewer.classList.toggle("is-story", !!(p && p.story));
    $$("video", body).forEach(v => (v.querySelector("source") || v).addEventListener("error", () => {
      v.outerHTML = `<div class="placeholder" style="aspect-ratio:16/9;background:var(--ground)">This film is missing. Put the .mp4 in assets/films and check the file name in content.js</div>`;
    }));
    if (p && p.blocks.some(b => b.type === "model")) needModelViewer();
    if (!viewer.open) { returnY = scrollY; viewer.showModal(); document.body.style.overflow = "hidden"; }
    viewer.scrollTop = 0;
    $("#close").focus({ preventScroll: true });
  }
  function shut(updateHash = true) {
    $$("video", body).forEach(v => v.pause());
    viewer.close();
    document.body.style.overflow = "";
    if (updateHash) {
      if (openedInside) history.back();
      else try { history.replaceState(null, "", location.pathname + location.search); } catch { location.hash = "work"; }
    }
    openedInside = false;
    scrollTo({ top: returnY, behavior: "instant" });
  }
  document.addEventListener("click", ev => {
    const a = ev.target.closest('a[href^="#"]');
    if (a && (P.some(p => "#" + p.slug === a.getAttribute("href")) || W.some(w => "#" + w.slug === a.getAttribute("href")))) openedInside = true;
  });
  $("#close").addEventListener("click", () => shut());
  viewer.addEventListener("cancel", ev => { ev.preventDefault(); shut(); });

  /* ---------- landing: the room ---------- */
  const R = S.room || {}, stage = $("#stage"), toggle = $("#roomToggle"), hint = $("#roomHint");
  const setup = /[?&]setup\b/.test(location.search);
  if (R.background) document.documentElement.style.setProperty("--ground", R.background);
  if (R.dark) $("#room").classList.add("is-dark");
  if (matchMedia("(hover: none)").matches) document.documentElement.classList.add("touch");

  function setupPanel(line) {
    let panel = $(".setup-panel");
    if (!panel) { panel = document.createElement("div"); panel.className = "setup-panel"; document.body.append(panel); }
    panel.innerHTML = `<strong>Hotspot placed.</strong> Paste this line into the hotspots list in content.js, then change the name and link.<code>${esc(line)}</code>`;
    navigator.clipboard?.writeText(line).then(() => say("Hotspot line copied"), () => {});
  }
  function showPoints() {
    hint.textContent = "Loading the room…";
    if (R.video) { toggle.textContent = "Watch the film"; toggle.hidden = false; }
    import(new URL("js/room-points.js", document.baseURI).href).then(m => m.mountPoints({
      stage, src: R.points, hotspots: R.hotspots || [], setup, reduce, view: R.view, pointSize: R.pointSize,
      alt: `A point-cloud scan of ${S.name}'s room. Drag to look around.`,
      onOpen: go,
      onSetupHit: p => { const f = n => Math.round(n * 1000) / 1000; setupPanel(`{ label: "Name", link: "#project-slug", position: "${f(p.x)} ${f(p.y)} ${f(p.z)}" },`); },
    })).then(() => {
      hint.textContent = setup ? "Setup mode: click on the scan to place a link" :
        (document.documentElement.classList.contains("touch") ? "Drag to look around. Tap a label to open it." : "Drag to look around. Click a dot to open it.");
    }).catch(err => { console.error(err); hint.textContent = "The 3D room couldn’t load. Check your internet connection, or the points file name in content.js."; });
  }
  // fallback film when the 3D room can't run (no WebGL, a load error, or a very slow connection)
  function showFallbackFilm() {
    const F = R.fallbackVideo; if (!F || $("video", stage)) return;
    const src = matchMedia("(max-width: 700px)").matches && F.small ? F.small : F.src;
    stage.innerHTML = `<video src="${esc(src)}" ${F.poster ? `poster="${esc(F.poster)}"` : ""} ${reduce ? "" : "autoplay"} muted loop playsinline aria-label="A film moving through ${esc(S.name)}'s room"></video>`;
    $("#sceneNav").hidden = true; hint.textContent = reduce ? "Press play to move through the room." : "";
    if (reduce) $("video", stage).controls = true;
  }
  const hasWebGL = (() => { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; } })();
  function showRoom() {
    if (!hasWebGL) return showFallbackFilm();
    hint.textContent = "Loading the room…";
    let loaded = false;
    setTimeout(() => { if (!loaded) showFallbackFilm(); }, R.fallbackAfter || 15000);
    const nav = $("#sceneNav"); let viewer;
    const mark = i => $$(".scene-nav button", nav).forEach((btn, j) => btn.setAttribute("aria-pressed", i === j));
    import(new URL("js/room-scene.js", document.baseURI).href).then(m => m.mountRoom({
      stage, src: R.scene, hotspots: R.hotspots || [], scenes: R.scenes || [], setup, reduce, fov: R.fov,
      alt: `A 3D scan of ${S.name}'s room. Drag to turn it, scroll or pinch to zoom, or pick a scene.`,
      onOpen: go, onScene: mark,
      onSetupHit: (p, cam, tgt) => { const f = n => Math.round(n * 1000) / 1000, v = a => `[${f(a.x)}, ${f(a.y)}, ${f(a.z)}]`;
        setupPanel(`{ label: "Name", link: "#project-slug", position: "${f(p.x)} ${f(p.y)} ${f(p.z)}" },\n// this view as a scene: { label: "Name", position: ${v(cam)}, target: ${v(tgt)} },`); },
    })).then(v => {
      viewer = v; loaded = true;
      if ($("video", stage)) { v.destroy(); return; }   // the film already took over
      nav.innerHTML = (R.scenes || []).map((sc, i) => `<button type="button" aria-pressed="${i === 0}">${esc(sc.label)}</button>`).join("");
      $$("button", nav).forEach((btn, i) => btn.addEventListener("click", () => viewer.goTo(i)));
      nav.hidden = !(R.scenes || []).length;
      hint.textContent = setup ? "Setup mode: click on the room to place a link or save a view" :
        (document.documentElement.classList.contains("touch") ? "Drag to turn the room, pinch to zoom, or pick a scene." : "Drag to turn the room, click then scroll to zoom, or pick a scene.");
    }).catch(err => { console.error(err); loaded = true; if (R.fallbackVideo) showFallbackFilm(); else hint.textContent = "The 3D room couldn’t load. Check your internet connection, or the scene file name in content.js."; });
  }
  function showModel() {
    if (R.scene) return showRoom();
    if (R.points) return showPoints();
    if (!R.model) return;
    needModelViewer();
    const spots = (R.hotspots || []).map((h, i) =>
      `<button type="button" class="hs" slot="hotspot-${i}" data-position="${esc(h.position)}" data-normal="${esc(h.normal || "0 1 0")}" data-link="${esc(h.link)}" data-visibility-attribute="visible"><span>${esc(h.label)}</span></button>`).join("");
    stage.innerHTML = `<model-viewer id="roomModel" src="${esc(R.model)}" alt="A 3D scan of ${esc(S.name)}'s room. Drag to look around."
      ${R.poster ? `poster="${esc(R.poster)}"` : ""} camera-controls touch-action="pan-y" disable-pan
      auto-rotate auto-rotate-delay="3000" rotation-per-second="8deg" interaction-prompt="none"
      camera-orbit="${esc(R.cameraOrbit || "35deg 70deg auto")}" min-camera-orbit="auto 20deg auto" max-camera-orbit="auto 95deg auto"
      shadow-intensity="0.6" exposure="1" environment-image="neutral">${spots}</model-viewer>`;
    hint.textContent = setup ? "Setup mode: click on the scan to place a link" : (document.documentElement.classList.contains("touch") ? "Drag to look around. Tap a label to open it." : "Drag to look around. Click a dot to open it.");
    if (R.video) { toggle.textContent = "Watch the film"; toggle.hidden = false; }
    const mv = $("#roomModel");
    $$(".hs", stage).forEach(b => b.addEventListener("click", () => go(b.dataset.link)));
    if (setup) mv.addEventListener("click", ev => {
      if (ev.target.closest(".hs")) return;
      const hit = mv.positionAndNormalFromPoint(ev.clientX, ev.clientY);
      if (!hit) return;
      const f = n => Math.round(n * 1000) / 1000;
      const line = `{ label: "Name", link: "#project-slug", position: "${f(hit.position.x)} ${f(hit.position.y)} ${f(hit.position.z)}", normal: "${f(hit.normal.x)} ${f(hit.normal.y)} ${f(hit.normal.z)}" },`;
      setupPanel(line);
      mv.autoRotate = false;
    });
  }
  function showVideo() {
    stage.innerHTML = `<video src="${esc(R.video)}" ${R.poster ? `poster="${esc(R.poster)}"` : ""} autoplay muted loop playsinline aria-label="A film moving through ${esc(S.name)}'s room"></video>`;
    hint.textContent = "";
    if (R.model) { toggle.textContent = "Enter the room"; toggle.hidden = false; }
    if (reduce) $("video", stage).removeAttribute("autoplay");
  }
  function go(link = "") {
    if (link.startsWith("#")) { openedInside = true; location.hash = link.slice(1); }
    else if (link) location.href = link;
  }
  toggle.addEventListener("click", () => ($("video", stage) ? showModel() : showVideo()));
  if (R.video && !setup) showVideo(); else showModel();
  addEventListener("hashchange", route);
  route();
}
