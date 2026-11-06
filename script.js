/* Portfolio — Mohamed Taha Mazzir · v2
   Tout le site fonctionne sans ce script : il ajoute le mouvement.
   - nuage de particules (Three.js) qui change de forme selon la section
   - texte géant ajusté à la largeur
   - manifeste qui s'allume au défilement, chiffres qui se brouillent
   - projets en défilement horizontal, pile d'outils physique (Matter.js)
   Aucun traceur, aucun cookie. */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FINE = window.matchMedia("(pointer: fine)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ======================================================== Texte géant */
  function prepareFit() {
    $$(".fit").forEach(function (el) {
      if (!el.firstElementChild) {
        var s = document.createElement("span");
        s.className = "fit-in";
        s.style.display = "inline-block";
        s.textContent = el.textContent;
        el.textContent = "";
        el.appendChild(s);
      }
    });
  }
  function fitAll() {
    var giant = [];
    $$(".fit").forEach(function (el) {
      var child = el.firstElementChild;
      if (!child) return;
      var fs = parseFloat(getComputedStyle(el).fontSize) || 100;
      var w = child.offsetWidth, avail = el.clientWidth;
      if (w > 0 && avail > 0 && Math.abs(w - avail * 0.99) > 1.5) {
        fs = fs * avail * 0.99 / w;
        el.style.fontSize = fs.toFixed(2) + "px";
      }
      if (el.closest(".giant")) giant.push([el, fs]);
    });
    /* Le nom du héros ne dépasse pas ~62 % de la hauteur d'écran : les deux lignes
       réduisent du même facteur pour garder leurs bords alignés. */
    if (giant.length) {
      var total = giant.reduce(function (s, g) { return s + g[1] * 0.8; }, 0);
      var r = Math.min(1, (window.innerHeight * 0.62) / total);
      if (r < 1) giant.forEach(function (g) { g[0].style.fontSize = (g[1] * r).toFixed(2) + "px"; });
    }
  }
  /* Le texte du sceau fait exactement le tour du cercle, quelle que soit la police chargée. */
  function fitSeal() {
    var t = $(".seal text");
    if (!t || !t.getComputedTextLength) return;
    t.style.letterSpacing = "";
    var L = t.getComputedTextLength(), n = t.textContent.length, C = 2 * Math.PI * 74;
    if (!L || !n) return;
    var ls = parseFloat(getComputedStyle(t).letterSpacing) || 0;
    t.style.letterSpacing = (ls + (C - L) / n - 0.05).toFixed(2) + "px";
  }
  function refit() {
    $$(".fit").forEach(function (el) { el.style.fontSize = ""; });
    fitAll();
    fitSeal();
  }
  prepareFit();
  fitAll();
  fitSeal();
  if (document.fonts) {
    if (document.fonts.ready) document.fonts.ready.then(refit);
    if (document.fonts.addEventListener) document.fonts.addEventListener("loadingdone", refit);
  }
  window.addEventListener("load", refit);
  [400, 1200, 3000].forEach(function (t) { setTimeout(refit, t); });

  /* ======================================================== Menu */
  var burger = $("#burger"), menu = $("#menu");
  function setMenu(open) {
    if (!menu || !burger) return;
    menu.hidden = !open;
    burger.setAttribute("aria-expanded", String(open));
    burger.textContent = open ? "Fermer" : "Menu";
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (burger) burger.addEventListener("click", function () { setMenu(menu.hidden); });
  if (menu) menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu && !menu.hidden) setMenu(false); });

  /* Lien actif */
  if ("IntersectionObserver" in window) {
    var navLinks = {};
    $$(".nav-links a").forEach(function (a) { navLinks[a.getAttribute("href").slice(1)] = a; });
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = navLinks[en.target.id];
        if (a) a.classList.toggle("is-active", en.isIntersecting);
      });
    }, { rootMargin: "-50% 0px -50% 0px" });
    Object.keys(navLinks).forEach(function (id) { var s = document.getElementById(id); if (s) navIO.observe(s); });
  }

  /* ======================================================== Curseur */
  var cursor = $("#cursor");
  if (cursor && FINE && !REDUCED) {
    root.classList.add("has-cursor");
    var cx = -100, cy = -100, tx = -100, ty = -100;
    window.addEventListener("pointermove", function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
    document.addEventListener("pointerover", function (e) {
      cursor.classList.toggle("big", !!e.target.closest("a, button, .hunt-grid article, .proj, .pills li, .num, .portrait"));
    });
    (function loop() {
      cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22;
      cursor.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,0)";
      requestAnimationFrame(loop);
    })();
  }

  /* ======================================================== Manifeste */
  var manifesto = $("#manifesto");
  var words = [];
  if (manifesto && !REDUCED) {
    var parts = manifesto.textContent.split(" ");
    manifesto.textContent = "";
    parts.forEach(function (w, i) {
      var s = document.createElement("span");
      s.className = "w";
      s.textContent = w;
      manifesto.appendChild(s);
      if (i < parts.length - 1) manifesto.appendChild(document.createTextNode(" "));
      words.push(s);
    });
  }
  function updateManifesto() {
    if (!words.length) return;
    var r = manifesto.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.25), 0, 1);
    var n = Math.round(p * words.length);
    for (var i = 0; i < words.length; i++) words[i].classList.toggle("on", i < n);
  }

  /* ======================================================== Chiffres brouillés */
  if ("IntersectionObserver" in window && !REDUCED) {
    var scrIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        scrIO.unobserve(en.target);
        scramble(en.target);
      });
    }, { threshold: 0.6 });
    $$("[data-scramble]").forEach(function (el) { scrIO.observe(el); });
  }
  function scramble(el) {
    var final = el.textContent, t0 = performance.now(), dur = 900;
    (function step(now) {
      var k = (now - t0) / dur;
      if (k >= 1) { el.textContent = final; return; }
      var settled = Math.floor(k * final.length);
      var out = "";
      for (var i = 0; i < final.length; i++) {
        var ch = final[i];
        out += (i < settled || !/\d/.test(ch)) ? ch : String(Math.floor(Math.random() * 10));
      }
      el.textContent = out;
      requestAnimationFrame(step);
    })(t0);
  }

  /* ======================================================== Accordéon */
  $$(".acc-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".acc-item");
      var open = !item.classList.contains("open");
      item.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
    });
  });

  /* ======================================================== Copier l'e-mail */
  var copyBtn = $("#copy");
  if (copyBtn) copyBtn.addEventListener("click", function () {
    var mail = "mtaha.mazzir@gmail.com";
    var ok = function () { copyBtn.textContent = "Copiée ✓"; setTimeout(function () { copyBtn.textContent = "Copier l'adresse"; }, 1800); };
    var fallback = function () {
      var r = document.createRange(); r.selectNodeContents($("#mail"));
      var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
      copyBtn.textContent = "Sélectionnée, faites Ctrl+C";
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(mail).then(ok, fallback);
      else fallback();
    } catch (e) { fallback(); }
  });

  /* ======================================================== Projets : défilement horizontal */
  var hs = $("#projets"), track = $("#hs-track");
  var hsOn = false, hsDist = 0;
  function setupHS() {
    if (!hs || !track) return;
    var want = window.innerWidth >= 900 && !REDUCED;
    if (!want) {
      if (hsOn) { hs.classList.remove("is-pinned"); hs.style.height = ""; track.style.transform = ""; hsOn = false; }
      return;
    }
    hs.classList.add("is-pinned");
    hsOn = true;
    var last = track.lastElementChild;
    var pad = parseFloat(getComputedStyle(track).paddingRight) || 0;
    var full = last.offsetLeft + last.offsetWidth + pad;
    hsDist = Math.max(0, full - window.innerWidth);
    hs.style.height = (hsDist + window.innerHeight) + "px";
    updateHS();
  }
  function updateHS() {
    if (!hsOn) return;
    var r = hs.getBoundingClientRect();
    var span = hs.offsetHeight - window.innerHeight;
    var p = span > 0 ? clamp(-r.top / span, 0, 1) : 0;
    track.style.transform = "translate3d(" + (-p * hsDist).toFixed(1) + "px,0,0)";
  }

  /* ======================================================== Défilement */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      updateManifesto();
      updateHS();
      if (cloud) cloud.pick();
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  var rzT;
  window.addEventListener("resize", function () {
    clearTimeout(rzT);
    rzT = setTimeout(function () { refit(); setupHS(); updateManifesto(); if (cloud) cloud.resize(); if (pile) pile.resize(); }, 120);
  });

  /* ======================================================== Pile physique */
  var pile = null;
  function startPile() {
    var box = $("#box");
    if (!box || pile || !window.Matter || REDUCED) return;
    var M = window.Matter;
    var items = $$("#pills li");
    var br = box.getBoundingClientRect();
    var W = box.clientWidth, H = box.clientHeight;

    var rects = items.map(function (li) {
      var r = li.getBoundingClientRect();
      return { x: r.left - br.left - box.clientLeft, y: r.top - br.top - box.clientTop, w: r.width, h: r.height };
    });
    box.classList.add("physics");

    var engine = M.Engine.create();
    engine.gravity.y = 1.1;
    var bodies = items.map(function (li, i) {
      var r = rects[i];
      li.style.transform = "translate(" + r.x + "px," + r.y + "px)";
      var b = M.Bodies.rectangle(r.x + r.w / 2, r.y + r.h / 2, r.w, r.h, {
        chamfer: { radius: r.h / 2 - 1 }, restitution: 0.45, friction: 0.08, frictionAir: 0.012, density: 0.0018
      });
      M.Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.06);
      M.Body.setVelocity(b, { x: (Math.random() - 0.5) * 3, y: Math.random() * -2 });
      b._w = r.w; b._h = r.h;
      return b;
    });
    var T = 400;
    var walls = [
      M.Bodies.rectangle(W / 2, H + T / 2, W * 3, T, { isStatic: true }),
      M.Bodies.rectangle(-T / 2, H / 2, T, H * 4, { isStatic: true }),
      M.Bodies.rectangle(W + T / 2, H / 2, T, H * 4, { isStatic: true }),
      M.Bodies.rectangle(W / 2, -T / 2 - 400, W * 3, T, { isStatic: true })
    ];
    M.Composite.add(engine.world, bodies.concat(walls));

    if (FINE) {
      var mouse = M.Mouse.create(box);
      ["mousewheel", "DOMMouseScroll"].forEach(function (ev) { box.removeEventListener(ev, mouse.mousewheel); });
      box.removeEventListener("touchmove", mouse.mousemove);
      box.removeEventListener("touchstart", mouse.mousedown);
      box.removeEventListener("touchend", mouse.mouseup);
      var mc = M.MouseConstraint.create(engine, { mouse: mouse, constraint: { stiffness: 0.18, damping: 0.1, render: { visible: false } } });
      M.Composite.add(engine.world, mc);
      M.Events.on(mc, "startdrag", function () { box.classList.add("dragging"); });
      M.Events.on(mc, "enddrag", function () { box.classList.remove("dragging"); });
      box.addEventListener("mouseleave", function (e) { mouse.mouseup(e); box.classList.remove("dragging"); });
    } else {
      box.addEventListener("pointerdown", function (e) {
        var li = e.target.closest("li");
        if (!li) return;
        var b = bodies[items.indexOf(li)];
        if (b) {
          M.Body.setVelocity(b, { x: (Math.random() - 0.5) * 10, y: -14 - Math.random() * 6 });
          M.Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.4);
        }
      });
    }

    var visible = true, last = performance.now();
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) { last = performance.now(); } }).observe(box);
    }
    (function loop(now) {
      requestAnimationFrame(loop);
      if (!visible) return;
      var dt = Math.min(32, now - last); last = now;
      M.Engine.update(engine, dt || 16.7);
      for (var i = 0; i < bodies.length; i++) {
        var b = bodies[i];
        items[i].style.transform = "translate(" + (b.position.x - b._w / 2).toFixed(1) + "px," + (b.position.y - b._h / 2).toFixed(1) + "px) rotate(" + b.angle.toFixed(3) + "rad)";
      }
    })(last);

    pile = {
      shake: function () {
        bodies.forEach(function (b) {
          M.Body.setVelocity(b, { x: (Math.random() - 0.5) * 18, y: -12 - Math.random() * 14 });
          M.Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.5);
        });
      },
      resize: function () {
        W = box.clientWidth; H = box.clientHeight;
        M.Body.setPosition(walls[0], { x: W / 2, y: H + T / 2 });
        M.Body.setPosition(walls[1], { x: -T / 2, y: H / 2 });
        M.Body.setPosition(walls[2], { x: W + T / 2, y: H / 2 });
        bodies.forEach(function (b) {
          M.Body.setPosition(b, { x: clamp(b.position.x, b._w / 2, W - b._w / 2), y: clamp(b.position.y, -300, H - b._h / 2) });
        });
      }
    };
  }
  var shakeBtn = $("#shake");
  if (shakeBtn) {
    if (REDUCED || !window.Matter) shakeBtn.hidden = true;
    shakeBtn.addEventListener("click", function () {
      if (!pile) startPile();
      setTimeout(function () { if (pile) pile.shake(); }, pile ? 0 : 60);
    });
  }
  if ("IntersectionObserver" in window) {
    var boxEl = $("#box");
    if (boxEl) {
      var pileIO = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { pileIO.disconnect(); setTimeout(startPile, 250); }
      }, { threshold: 0.45 });
      pileIO.observe(boxEl);
    }
  }

  /* ======================================================== Nuage de particules */
  var cloud = null;
  (function initCloud() {
    var canvas = $("#cloud");
    if (!canvas) return;
    var THREE = window.THREE;
    var ok = !!THREE;
    var renderer;
    if (ok) {
      try {
        renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
      } catch (e) { ok = false; }
    }
    if (!ok) { canvas.style.display = "none"; return; }

    var small = window.innerWidth < 760;
    var N = small ? 3800 : 7000;
    var PR = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(PR);
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.z = 6;
    var group = new THREE.Group();
    scene.add(group);

    /* ---- Formes ---- */
    function rnd(a, b) { return a + Math.random() * (b - a); }
    function sphere() {
      var a = new Float32Array(N * 3), g = Math.PI * (3 - Math.sqrt(5));
      for (var i = 0; i < N; i++) {
        var y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), t = g * i, k = rnd(0.97, 1.03);
        a[i * 3] = Math.cos(t) * r * k; a[i * 3 + 1] = y * k; a[i * 3 + 2] = Math.sin(t) * r * k;
      }
      return a;
    }
    function helix() {
      var a = new Float32Array(N * 3);
      for (var i = 0; i < N; i++) {
        var t = rnd(-2.4, 2.4), q = Math.random(), ph = t * 2.6, R = 0.48;
        if (q < 0.84) {
          var off = q < 0.42 ? 0 : Math.PI;
          a[i * 3] = t; a[i * 3 + 1] = Math.cos(ph + off) * R + rnd(-0.03, 0.03); a[i * 3 + 2] = Math.sin(ph + off) * R + rnd(-0.03, 0.03);
        } else {
          var tt = Math.round(t * 4) / 4, p2 = tt * 2.6, s = rnd(-1, 1);
          a[i * 3] = tt + rnd(-0.01, 0.01); a[i * 3 + 1] = Math.cos(p2) * R * s; a[i * 3 + 2] = Math.sin(p2) * R * s;
        }
      }
      return a;
    }
    function dust() {
      var a = new Float32Array(N * 3);
      for (var i = 0; i < N; i++) { a[i * 3] = rnd(-2.6, 2.6); a[i * 3 + 1] = rnd(-1.5, 1.5); a[i * 3 + 2] = rnd(-1.2, 1.2); }
      return a;
    }
    /* Silhouette dessinée sur un canevas : renvoie les pixels du contour et du remplissage,
       en coordonnées monde (unit = taille en pixels d'une unité). */
    function silhouette(draw, S, unit) {
      var c = document.createElement("canvas"); c.width = c.height = S;
      var x = c.getContext("2d"); draw(x, S);
      var d = x.getImageData(0, 0, S, S).data, edge = [], fill = [];
      var on = function (px, py) { return px >= 0 && py >= 0 && px < S && py < S && d[(py * S + px) * 4 + 3] > 128; };
      for (var py = 0; py < S; py++) for (var px = 0; px < S; px++) if (on(px, py)) {
        var X = (px - S / 2) / unit, Y = -(py - S / 2) / unit;
        if (!on(px + 1, py) || !on(px - 1, py) || !on(px, py + 1) || !on(px, py - 1)) edge.push(X, Y); else fill.push(X, Y);
      }
      return { edge: edge, fill: fill };
    }
    /* Remplit a[from..to) avec une silhouette extrudée : deux faces nettes + les flancs. */
    function extrude(a, from, to, sil, depth, fillShare) {
      var ne = sil.edge.length / 2, nf = sil.fill.length / 2;
      for (var i = from; i < to; i++) {
        var q = Math.random(), j, X, Y, Z;
        if (q < fillShare && nf) { j = Math.floor(Math.random() * nf); X = sil.fill[j * 2]; Y = sil.fill[j * 2 + 1]; Z = depth; }
        else {
          j = Math.floor(Math.random() * ne); X = sil.edge[j * 2]; Y = sil.edge[j * 2 + 1];
          Z = q < fillShare + (1 - fillShare) * 0.78 ? (Math.random() < 0.5 ? depth : -depth) : rnd(-depth, depth);
        }
        a[i * 3] = X; a[i * 3 + 1] = Y; a[i * 3 + 2] = Z;
      }
    }

    /* ---- Projet phare : un cadenas 3D et une clé qui essaie de l'ouvrir. ---- */
    var KEY_FROM = Math.floor(N * 0.76), KS = 0.62;
    var LOCK_SIL = null, KEY_SIL = null, LOCK_BASE = null, KEY_BASE = null;
    function lockSil() {
      return LOCK_SIL || (LOCK_SIL = silhouette(function (x, S) {
        var U = 92, cx = S / 2, cy = S / 2;
        x.fillStyle = "#000"; x.strokeStyle = "#000";
        // anse
        x.lineWidth = 0.17 * U;
        x.beginPath(); x.arc(cx, cy - 0.12 * U, 0.42 * U, Math.PI, 0); x.lineTo(cx + 0.42 * U, cy + 0.12 * U);
        x.moveTo(cx - 0.42 * U, cy - 0.12 * U); x.lineTo(cx - 0.42 * U, cy + 0.12 * U); x.stroke();
        // corps
        var X0 = cx - 0.68 * U, Y0 = cy + 0.06 * U, W = 1.36 * U, H = 1.02 * U, r = 0.16 * U;
        x.beginPath(); x.moveTo(X0 + r, Y0); x.arcTo(X0 + W, Y0, X0 + W, Y0 + H, r); x.arcTo(X0 + W, Y0 + H, X0, Y0 + H, r);
        x.arcTo(X0, Y0 + H, X0, Y0, r); x.arcTo(X0, Y0, X0 + W, Y0, r); x.fill();
        // serrure
        x.globalCompositeOperation = "destination-out";
        x.beginPath(); x.arc(cx, cy + 0.48 * U, 0.11 * U, 0, Math.PI * 2); x.fill();
        x.fillRect(cx - 0.045 * U, cy + 0.5 * U, 0.09 * U, 0.26 * U);
      }, 240, 92));
    }
    function keySil() {
      return KEY_SIL || (KEY_SIL = silhouette(function (x, S) {
        var U = 92, cx = S / 2, cy = S / 2;
        x.fillStyle = "#000"; x.strokeStyle = "#000";
        // clé à plat, pointe à gauche (x = -1.05), anneau à droite
        x.lineWidth = 0.09 * U;
        x.beginPath(); x.arc(cx + 0.78 * U, cy, 0.24 * U, 0, Math.PI * 2); x.stroke();
        x.fillRect(cx - 1.05 * U, cy - 0.045 * U, 1.6 * U, 0.09 * U);
        x.fillRect(cx - 0.98 * U, cy + 0.04 * U, 0.1 * U, 0.2 * U);
        x.fillRect(cx - 0.8 * U, cy + 0.04 * U, 0.08 * U, 0.14 * U);
        x.fillRect(cx - 0.64 * U, cy + 0.04 * U, 0.1 * U, 0.22 * U);
      }, 240, 92));
    }
    /* La clé suit l'axe z (vers l'écran). tip = position de la pointe, roll = rotation sur son axe. */
    function lockScene(tip, roll, burst, swing) {
      // mêmes points d'une étape à l'autre : le cadenas reste net et la clé bouge d'un bloc
      if (!LOCK_BASE) {
        LOCK_BASE = new Float32Array(N * 3); extrude(LOCK_BASE, 0, KEY_FROM, lockSil(), 0.16, 0.1);
        KEY_BASE = new Float32Array(N * 3); extrude(KEY_BASE, KEY_FROM, N, keySil(), 0.035, 0.15);
      }
      var a = new Float32Array(LOCK_BASE), k = KEY_BASE;
      for (var i = KEY_FROM; i < N; i++) {
        var kx = k[i * 3], ky = k[i * 3 + 1], kz = k[i * 3 + 2];
        // axe long de la clé (x du dessin) -> z ; épaisseur -> x
        var lz = (kx + 1.05) * KS, lx = kz, ly = ky * KS;
        var c = Math.cos(roll), s = Math.sin(roll);
        var rx = lx * c - ly * s, ry = lx * s + ly * c;
        var sw = swing || 0, cs = Math.cos(sw), sn = Math.sin(sw);
        var X = tip[0] + rx * cs + lz * sn, Y = tip[1] + ry, Z = tip[2] - rx * sn + lz * cs;
        if (burst) {
          var u = rnd(0, Math.PI * 2), v = Math.acos(rnd(-1, 1)), R = 0.25 + Math.pow(Math.random(), 0.7) * 1.05;
          X = tip[0] + 0.35 + Math.sin(v) * Math.cos(u) * R * 1.25; Y = tip[1] + Math.cos(v) * R * 0.8; Z = 0.5 + Math.sin(v) * Math.sin(u) * R * 0.5;
        }
        a[i * 3] = X; a[i * 3 + 1] = Y; a[i * 3 + 2] = Z;
      }
      return a;
    }
    var HOLE = [0, -0.48, 0.05];

    function fromCanvas(draw, depth) {
      var S = 220, c = document.createElement("canvas"); c.width = c.height = S;
      var x = c.getContext("2d");
      draw(x, S);
      var d = x.getImageData(0, 0, S, S).data, pts = [], edge = [];
      var on = function (px, py) { return px >= 0 && py >= 0 && px < S && py < S && d[(py * S + px) * 4 + 3] > 128; };
      for (var py = 0; py < S; py += 1) for (var px = 0; px < S; px += 1) if (on(px, py)) {
        pts.push(px, py);
        if (!on(px + 2, py) || !on(px - 2, py) || !on(px, py + 2) || !on(px, py - 2)) edge.push(px, py);
      }
      var a = new Float32Array(N * 3), n = pts.length / 2, ne = edge.length / 2;
      if (!n) return sphere();
      for (var i = 0; i < N; i++) {
        if (ne && Math.random() < 0.45) {
          var e = Math.floor(Math.random() * ne);
          a[i * 3] = (edge[e * 2] + Math.random() - S / 2) / (S * 0.42);
          a[i * 3 + 1] = -(edge[e * 2 + 1] + Math.random() - S / 2) / (S * 0.42);
          a[i * 3 + 2] = rnd(-depth, depth) * 0.6;
          continue;
        }
        var j = Math.floor(Math.random() * n);
        a[i * 3] = (pts[j * 2] + Math.random() - S / 2) / (S * 0.42);
        a[i * 3 + 1] = -(pts[j * 2 + 1] + Math.random() - S / 2) / (S * 0.42);
        a[i * 3 + 2] = rnd(-depth, depth);
      }
      return a;
    }
    function at() {
      return fromCanvas(function (x, S) {
        x.fillStyle = "#000"; x.textAlign = "center"; x.textBaseline = "middle";
        x.font = "bold 210px Arial, Helvetica, sans-serif";
        x.fillText("@", S / 2, S / 2 + 6);
      }, 0.14);
    }
    /* Galaxie en spirale : un noyau dense et trois bras qui s'enroulent. Elle tourne sur elle-même. */
    function galaxy() {
      var a = new Float32Array(N * 3), g = function () { return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5; };
      for (var i = 0; i < N; i++) {
        var q = Math.random(), x, y, z;
        if (q < 0.16) {
          var u = rnd(0, Math.PI * 2), v = Math.acos(rnd(-1, 1)), rr = 0.22 * Math.pow(Math.random(), 1.6);
          x = rr * Math.sin(v) * Math.cos(u); y = rr * Math.cos(v) * 0.55; z = rr * Math.sin(v) * Math.sin(u);
        } else {
          var r = 0.12 + Math.pow(Math.random(), 0.7) * 1.15, arm = (i % 3) * (Math.PI * 2 / 3);
          var th = arm + r * 2.8 + g() * (0.28 / (r + 0.25));
          x = Math.cos(th) * r; z = Math.sin(th) * r; y = g() * 0.05 * (1.3 - r);
          if (q > 0.93) { x += g() * 0.12; z += g() * 0.12; }   // étoiles éparses entre les bras
        }
        a[i * 3] = x; a[i * 3 + 1] = y; a[i * 3 + 2] = z;
      }
      return a;
    }

    /* Bouclier : contour épais, liseré intérieur et coche, extrudé et légèrement bombé. */
    function shield() {
      var sil = silhouette(function (x, S) {
        var U = 92, cx = S / 2, cy = S / 2, P = function (X, Y) { return [cx + X * U, cy - Y * U]; };
        var outline = function (k) {
          var p = function (X, Y) { var q = P(X * k, Y * k + (1 - k) * 0.12); return q; }, a;
          x.beginPath();
          a = p(0, 1.12); x.moveTo(a[0], a[1]);
          var c1 = p(0.45, 0.92), e1 = p(0.95, 0.98); x.quadraticCurveTo(c1[0], c1[1], e1[0], e1[1]);
          var c2 = p(1.0, -0.2), e2 = p(0, -1.18); x.quadraticCurveTo(c2[0], c2[1], e2[0], e2[1]);
          var c3 = p(-1.0, -0.2), e3 = p(-0.95, 0.98); x.quadraticCurveTo(c3[0], c3[1], e3[0], e3[1]);
          var c4 = p(-0.45, 0.92), e4 = p(0, 1.12); x.quadraticCurveTo(c4[0], c4[1], e4[0], e4[1]);
          x.closePath();
        };
        x.fillStyle = "#000"; x.strokeStyle = "#000"; x.lineJoin = "round"; x.lineCap = "round";
        outline(1); x.fill();
        x.globalCompositeOperation = "destination-out";
        outline(0.84); x.fill();
        x.globalCompositeOperation = "source-over";
        x.lineWidth = 2.6; outline(0.72); x.stroke();
        x.lineWidth = 0.17 * U;
        var a = P(-0.36, 0.0), b = P(-0.08, -0.3), c = P(0.42, 0.34);
        x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.lineTo(c[0], c[1]); x.stroke();
      }, 240, 92);
      var a = new Float32Array(N * 3);
      extrude(a, 0, N, sil, 0.1, 0.32);
      for (var i = 0; i < N; i++) {
        var X = a[i * 3], Y = a[i * 3 + 1], b = 1 - (X / 1.05) * (X / 1.05) - (Y / 1.3) * (Y / 1.3);
        a[i * 3 + 2] += 0.22 * Math.sqrt(Math.max(0, b));
      }
      return a;
    }

    function lk(pts) { return { pts: pts, spin: 0, wob: 0.12, yaw: 0.5 }; }
    var K1 = lockScene(HOLE, 0, false);
    var SHAPES = {
      sphere: { pts: sphere(), spin: 1 },
      galaxy: { pts: galaxy(), spin: 0.55, tilt: 1.05 },
      shield: { pts: shield(), spin: 0, wob: 0.5 },
      k0: lk(lockScene([1.25, 0.3, 0.5], 1.2, false, 1.15)),
      k1: lk(K1),
      k2: lk(lockScene(HOLE, 0.55, false)),
      k3: lk(K1),
      k4: lk(lockScene(HOLE, 0, true)),
      helix: { pts: helix(), spin: 0.6, axis: "x" },
      dust: { pts: dust(), spin: 0.3 },
      at: { pts: at(), spin: 0 }
    };
    /* La clé approche, entre, essaie de tourner… accès refusé : le cadenas tremble et la clé part en poussière. */
    SHAPES.lockseq = { pts: SHAPES.k0.pts, seq: [["k0", 1700], ["k1", 1500], ["k2", 650], ["k3", 380, "shake"], ["k4", 1500, "bump"]], still: "k0" };

    /* ---- Géométrie ---- */
    var cur = new Float32Array(N * 3), seeds = new Float32Array(N), sizes = new Float32Array(N), speed = new Float32Array(N);
    var start = SHAPES.dust.pts;
    for (var i = 0; i < N; i++) {
      cur[i * 3] = start[i * 3] * 2.2; cur[i * 3 + 1] = start[i * 3 + 1] * 2.2; cur[i * 3 + 2] = start[i * 3 + 2] * 2 + 2;
      seeds[i] = Math.random(); sizes[i] = 0.45 + Math.pow(Math.random(), 2.2) * 1.2;
      speed[i] = REDUCED ? 1 : rnd(0.03, 0.075);
    }
    if (REDUCED) cur.set(SHAPES.sphere.pts);
    var geo = new THREE.BufferGeometry();
    var posAttr = new THREE.BufferAttribute(cur, 3);
    posAttr.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute("position", posAttr);
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

    var uniforms = {
      uTime: { value: 0 }, uSize: { value: small ? 3.4 : 3.9 }, uAlpha: { value: 1 },
      uMouse: { value: new THREE.Vector2(9, 9) }, uAspect: { value: 1 }, uPR: { value: PR }, uMotion: { value: REDUCED ? 0 : 1 }
    };
    var mat = new THREE.ShaderMaterial({
      uniforms: uniforms, transparent: true, depthWrite: false, depthTest: false, premultipliedAlpha: true,
      vertexShader: [
        "attribute float aSeed; attribute float aSize;",
        "uniform float uTime; uniform float uSize; uniform vec2 uMouse; uniform float uAspect; uniform float uPR; uniform float uMotion;",
        "varying float vA;",
        "void main(){",
        "  vec3 p = position;",
        "  p += uMotion * 0.02 * vec3(sin(uTime*0.9 + aSeed*40.0), cos(uTime*0.7 + aSeed*31.0), sin(uTime*0.8 + aSeed*17.0));",
        "  vec4 mv = modelViewMatrix * vec4(p, 1.0);",
        "  vec4 clip = projectionMatrix * mv;",
        "  vec2 ndc = clip.xy / clip.w;",
        "  vec2 d = ndc - uMouse; d.x *= uAspect;",
        "  float dist = length(d);",
        "  float f = smoothstep(0.34, 0.0, dist) * uMotion;",
        "  vec2 dir = d / max(dist, 0.0001); dir.x /= uAspect;",
        "  ndc += dir * f * 0.13;",
        "  clip.xy = ndc * clip.w;",
        "  gl_Position = clip;",
        "  gl_PointSize = uSize * aSize * uPR * (6.0 / -mv.z);",
        "  vA = 0.5 + 0.5 * min(aSize, 1.0);",
        "}"
      ].join("\n"),
      fragmentShader: [
        "uniform float uAlpha; varying float vA;",
        "void main(){",
        "  vec2 c = gl_PointCoord - 0.5; float d = length(c);",
        "  if (d > 0.5) discard;",
        "  float a = smoothstep(0.5, 0.15, d) * uAlpha * vA;",
        "  gl_FragColor = vec4(vec3(a), a);",
        "}"
      ].join("\n")
    });
    var points = new THREE.Points(geo, mat);
    group.add(points);

    /* ---- État ---- */
    var sections = $$("[data-shape]");
    var state = { shape: "sphere", sec: null, bump: 0, shake: 0, setAt: 0, anchor: null, ax: 0.5, ay: 0.5, cx: 0.2, cy: 0, scale: 1, alpha: 1 };
    var live = { cx: 0.2, cy: 0, scale: 0.6, alpha: 0 };
    var visW = 1, visH = 1;
    var mouse = { x: 9, y: 9, tx: 9, ty: 9 };
    var t0 = performance.now(), spinY = 0;

    function angDiff(a, b) { var d = a - b; return Math.atan2(Math.sin(d), Math.cos(d)); }
    function resize() {
      var w = window.innerWidth, h = window.innerHeight;
      small = w < 760;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      uniforms.uAspect.value = w / h;
      visH = 2 * Math.tan((camera.fov * Math.PI / 180) / 2) * camera.position.z;
      visW = visH * camera.aspect;
    }
    var seqT = 0;
    function setShape(shape) {
      if (shape === state.shape) return;
      state.target = SHAPES[shape].pts;
      state.shape = shape;
      state.setAt = performance.now();
      if (REDUCED) { cur.set(state.target); posAttr.needsUpdate = true; }
    }
    function runSeq(seq, i, sec) {
      if (state.sec !== sec) return;
      var st = seq[i];
      setShape(st[0]);
      if (st[2] === "shake") state.shake = 1;
      if (st[2] === "bump") state.bump = 1;
      seqT = setTimeout(function () { runSeq(seq, (i + 1) % seq.length, sec); }, st[1]);
    }
    function pick() {
      var mid = window.innerHeight * 0.5, best = null;
      for (var i = 0; i < sections.length; i++) {
        var r = sections[i].getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) { best = sections[i]; break; }
      }
      if (!best) return;
      var d = best.dataset;
      if (best !== state.sec) {
        state.sec = best;
        clearTimeout(seqT);
        var name = SHAPES[d.shape] ? d.shape : "sphere", cfg = SHAPES[name];
        if (cfg.seq) { if (REDUCED) setShape(cfg.still); else runSeq(cfg.seq, 0, best); }
        else setShape(name);
        state.anchor = d.anchor ? document.querySelector(d.anchor) : null;
        state.ax = parseFloat(d.ax) || 0.5;
        state.ay = parseFloat(d.ay) || 0.5;
      }
      state.cx = parseFloat(d.cx) || 0;
      state.cy = parseFloat(d.cy) || 0;
      state.scale = parseFloat(d.scale) || 1;
      state.alpha = d.alpha !== undefined ? parseFloat(d.alpha) : 1;
    }
    state.target = SHAPES.sphere.pts;

    window.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = -(e.clientY / window.innerHeight) * 2 + 1;
    }, { passive: true });
    document.addEventListener("mouseleave", function () { mouse.tx = 9; mouse.ty = 9; });

    function frame(now) {
      requestAnimationFrame(frame);
      var t = (now - t0) / 1000;
      uniforms.uTime.value = t;

      // morphing
      var tgt = state.target;
      if (!REDUCED) {
        for (var i = 0, n = N * 3; i < n; i += 3) {
          var s = speed[i / 3];
          cur[i] += (tgt[i] - cur[i]) * s;
          cur[i + 1] += (tgt[i + 1] - cur[i + 1]) * s;
          cur[i + 2] += (tgt[i + 2] - cur[i + 2]) * s;
        }
        posAttr.needsUpdate = true;
      }

      // placement
      var sh = SHAPES[state.shape];
      var k = REDUCED ? 1 : 0.05;
      var wantCx = small ? 0 : state.cx, wantCy = state.cy, wantA = small ? state.alpha * 0.42 : state.alpha, wantS = small ? state.scale * 0.92 : state.scale;
      if (state.anchor) {
        // la forme reste collée à un élément de la page (l'empreinte sur la photo)
        var ar = state.anchor.getBoundingClientRect();
        wantCx = (ar.left + ar.width * state.ax) / window.innerWidth - 0.5;
        wantCy = 0.5 - (ar.top + ar.height * state.ay) / window.innerHeight;
        wantA = state.alpha; wantS = state.scale;
        if (!REDUCED) k = 0.22;
      }
      live.cx += (wantCx - live.cx) * k;
      live.cy += (wantCy - live.cy) * k;
      live.scale += (wantS - live.scale) * (REDUCED ? 1 : 0.05);
      live.alpha += (wantA - live.alpha) * (REDUCED ? 1 : 0.04);
      var offX = 0, offY = 0;
      if (!REDUCED) {
        if (sh.fly) { offX = Math.sin(t * 0.55) * 0.045; offY = Math.sin(t * 1.1) * 0.03; }
        state.shake *= 0.93;
        offX += Math.sin(t * 70) * 0.012 * state.shake;
      }
      group.position.set((live.cx + offX) * visW, (live.cy + offY) * visH, 0);
      var base = Math.min(visH, visW * 0.9) * 0.36;
      state.bump *= 0.9;
      group.scale.setScalar(base * live.scale * (1 + 0.07 * Math.sin(Math.min(state.bump, 1) * Math.PI)));
      uniforms.uAlpha.value = live.alpha;
      // l'empreinte passe au-dessus de la photo, une fois formée
      var over = sh.over && (REDUCED || now - state.setAt > 650);
      if (over !== state.isOver) { state.isOver = over; canvas.style.zIndex = over ? "3" : ""; }

      // rotation
      if (!REDUCED) {
        spinY += 0.0028 * sh.spin;
        mouse.x += (mouse.tx - mouse.x) * 0.08;
        mouse.y += (mouse.ty - mouse.y) * 0.08;
        var mx = Math.abs(mouse.x) > 2 ? 0 : mouse.x, my = Math.abs(mouse.y) > 2 ? 0 : mouse.y;
        var wob = sh.spin ? spinY : Math.sin(t * 0.5) * (sh.wob || 0.35);
        if (sh.scroll) wob = -(window.scrollY || 0) * 0.0032 + t * 0.06;
        group.rotation.y += angDiff((sh.axis === "x" ? 0 : wob) + (sh.yaw || 0) + mx * 0.35, group.rotation.y) * 0.06;
        group.rotation.x += angDiff((sh.axis === "x" ? spinY * 1.4 : (sh.tilt || 0)) + (sh.fly ? Math.sin(t * 1.1) * 0.08 : 0) - my * 0.25, group.rotation.x) * 0.06;
        group.rotation.z += ((sh.fly ? Math.cos(t * 0.55) * 0.14 : 0) - group.rotation.z) * 0.06;
        uniforms.uMouse.value.set(mouse.x, mouse.y);
      }
      renderer.render(scene, camera);
    }

    resize();
    pick();
    requestAnimationFrame(frame);
    cloud = { pick: pick, resize: resize };
  })();

  /* ======================================================== Démarrage */
  setupHS();
  updateManifesto();
  window.addEventListener("load", function () { setupHS(); updateManifesto(); });
})();
