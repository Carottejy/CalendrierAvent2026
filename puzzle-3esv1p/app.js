(() => {
  'use strict';

  const CLE = 'puzzle-v1';
  const NIVEAUX = [3, 4, 6, 8];
  const $ = (id) => document.getElementById(id);
  const table = $('table');
  const plateau = $('plateau');

  // ================= Sauvegarde =================
  function lire() {
    try { return JSON.parse(localStorage.getItem(CLE)) || {}; } catch (e) { return {}; }
  }
  function ecrire(d) {
    try { localStorage.setItem(CLE, JSON.stringify(d)); } catch (e) { /* stockage indisponible */ }
  }
  function sauver() {
    const d = lire();
    d.courant = partie.n;
    d.parties = d.parties || {};
    d.parties[partie.n] = partie;
    ecrire(d);
  }

  // ================= Image =================
  const image = new Image();
  const imageChargee = new Promise((ok, ko) => { image.onload = ok; image.onerror = ko; });
  image.src = 'image.jpg';

  // ================= Partie =================
  let partie = null;   // { n, bords: {h, v}, pieces: [{r, c, x, y, posee}], coups, ms, dernier, fini }
  let pieces = [];     // éléments canvas, même ordre que partie.pieces
  let geo = null;      // { S, cell, pad, ox, oy, W, H }
  let zMax = 10;

  function nouvellePartie(n) {
    const signe = () => (Math.random() < 0.5 ? 1 : -1);
    const h = []; const v = [];
    for (let r = 0; r < n; r++) {
      h.push([]); v.push([]);
      for (let c = 0; c < n; c++) { h[r].push(signe()); v[r].push(signe()); }
    }
    const liste = [];
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) liste.push({ r, c, x: 0, y: 0, posee: false });
    partie = { n, bords: { h, v }, pieces: liste, coups: 0, ms: 0, dernier: 0, fini: false };
    calculerGeometrie();
    disperser(partie.pieces);
    sauver();
  }

  // ================= Géométrie =================
  function calculerGeometrie() {
    const W = table.clientWidth;
    const H = table.clientHeight;
    const S = Math.floor(Math.min(W - 24, H * 0.6, 640));
    const cell = S / partie.n;
    geo = { W, H, S, cell, pad: cell * 0.34, ox: (W - S) / 2, oy: Math.min(14, H * 0.03) };
    Object.assign(plateau.style, { left: `${geo.ox}px`, top: `${geo.oy}px`, width: `${S}px`, height: `${S}px` });
  }

  // Place les pièces au hasard autour du plateau (en unités de case, relatives au plateau)
  function disperser(liste) {
    const { W, H, S, cell, ox, oy } = geo;
    for (const p of liste) {
      if (p.posee) continue;
      let x; let y;
      for (let essai = 0; essai < 60; essai++) {
        x = 4 + Math.random() * Math.max(1, W - cell - 8);
        y = 4 + Math.random() * Math.max(1, H - cell - 8);
        const cx = x + cell / 2; const cy = y + cell / 2;
        const dansPlateau = cx > ox - cell * 0.3 && cx < ox + S + cell * 0.3 && cy > oy - cell * 0.3 && cy < oy + S + cell * 0.3;
        if (!dansPlateau) break;
      }
      p.x = (x - ox) / cell;
      p.y = (y - oy) / cell;
    }
  }

  // ================= Dessin des pièces =================
  function cotes(p) {
    const { h, v } = partie.bords;
    const n = partie.n;
    return {
      haut: p.r === 0 ? 0 : -h[p.r][p.c],
      droite: p.c === n - 1 ? 0 : v[p.r][p.c + 1],
      bas: p.r === n - 1 ? 0 : h[p.r + 1][p.c],
      gauche: p.c === 0 ? 0 : -v[p.r][p.c],
    };
  }

  // Un bord, parcouru dans le sens horaire ; s = +1 tenon vers l'extérieur, -1 creux, 0 droit
  function bord(ctx, x1, y1, x2, y2, s) {
    if (!s) { ctx.lineTo(x2, y2); return; }
    const L = Math.hypot(x2 - x1, y2 - y1);
    const dx = (x2 - x1) / L; const dy = (y2 - y1) / L;
    const nx = dy; const ny = -dx;
    const pt = (t, k) => [x1 + dx * t * L + nx * k * L * s, y1 + dy * t * L + ny * k * L * s];
    ctx.lineTo(...pt(0.35, 0));
    ctx.bezierCurveTo(...pt(0.40, 0), ...pt(0.42, 0.10), ...pt(0.38, 0.16));
    ctx.bezierCurveTo(...pt(0.33, 0.25), ...pt(0.42, 0.32), ...pt(0.50, 0.32));
    ctx.bezierCurveTo(...pt(0.58, 0.32), ...pt(0.67, 0.25), ...pt(0.62, 0.16));
    ctx.bezierCurveTo(...pt(0.58, 0.10), ...pt(0.60, 0), ...pt(0.65, 0));
    ctx.lineTo(x2, y2);
  }

  function contour(ctx, p, a) {
    const k = cotes(p);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    bord(ctx, 0, 0, a, 0, k.haut);
    bord(ctx, a, 0, a, a, k.droite);
    bord(ctx, a, a, 0, a, k.bas);
    bord(ctx, 0, a, 0, 0, k.gauche);
    ctx.closePath();
  }

  function dessinerPieces() {
    pieces.forEach((e) => e.remove());
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const { cell, pad, S } = geo;
    const taille = cell + 2 * pad;
    pieces = partie.pieces.map((p) => {
      const cv = document.createElement('canvas');
      cv.className = 'piece';
      cv.width = Math.ceil(taille * dpr);
      cv.height = Math.ceil(taille * dpr);
      cv.style.width = `${taille}px`;
      cv.style.height = `${taille}px`;
      const ctx = cv.getContext('2d', { willReadFrequently: true });
      ctx.scale(dpr, dpr);
      ctx.translate(pad, pad);
      contour(ctx, p, cell);
      ctx.save();
      ctx.clip();
      ctx.drawImage(image, -p.c * cell, -p.r * cell, S, S);
      ctx.restore();
      // léger relief
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(0,0,0,.4)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.save();
      ctx.translate(-0.7, -0.7);
      ctx.strokeStyle = 'rgba(255,240,215,.35)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.restore();
      cv.dpr = dpr;
      table.append(cv);
      return cv;
    });
    partie.pieces.forEach((p, i) => {
      pieces[i].classList.toggle('posee', p.posee);
      pieces[i].style.zIndex = p.posee ? 1 : ++zMax;
      placer(i);
    });
  }

  function placer(i) {
    const p = partie.pieces[i];
    const { cell, pad, ox, oy } = geo;
    pieces[i].style.transform = `translate(${ox + p.x * cell - pad}px, ${oy + p.y * cell - pad}px)`;
  }

  // ================= Glisser-déposer =================
  let prise = null;

  function pieceSous(px, py) {
    const { cell, pad, ox, oy } = geo;
    const candidats = partie.pieces
      .map((p, i) => ({ p, i, z: +pieces[i].style.zIndex }))
      .filter(({ p }) => !p.posee)
      .sort((a, b) => b.z - a.z);
    for (const { p, i } of candidats) {
      const lx = px - (ox + p.x * cell - pad);
      const ly = py - (oy + p.y * cell - pad);
      if (lx < 0 || ly < 0 || lx > cell + 2 * pad || ly > cell + 2 * pad) continue;
      const cv = pieces[i];
      const a = cv.getContext('2d').getImageData(Math.floor(lx * cv.dpr), Math.floor(ly * cv.dpr), 1, 1).data[3];
      if (a > 20) return i;
    }
    // doigt imprécis : la pièce dont le centre est le plus proche
    let meilleur = -1; let dist = cell * 0.6;
    for (const { p, i } of candidats) {
      const d = Math.hypot(px - (ox + (p.x + 0.5) * cell), py - (oy + (p.y + 0.5) * cell));
      if (d < dist) { dist = d; meilleur = i; }
    }
    return meilleur;
  }

  function point(ev) {
    const r = table.getBoundingClientRect();
    return { x: ev.clientX - r.left, y: ev.clientY - r.top };
  }

  table.addEventListener('pointerdown', (ev) => {
    if (partie.fini || prise) return;
    const m = point(ev);
    const i = pieceSous(m.x, m.y);
    if (i < 0) return;
    const p = partie.pieces[i];
    const { cell, ox, oy } = geo;
    prise = { i, id: ev.pointerId, dx: m.x - (ox + p.x * cell), dy: m.y - (oy + p.y * cell) };
    pieces[i].style.zIndex = ++zMax;
    pieces[i].classList.add('prise');
    table.setPointerCapture(ev.pointerId);
    chrono();
  });

  table.addEventListener('pointermove', (ev) => {
    if (!prise || ev.pointerId !== prise.id) return;
    const m = point(ev);
    const { cell, ox, oy, W, H } = geo;
    const p = partie.pieces[prise.i];
    const x = Math.max(-cell * 0.4, Math.min(W - cell * 0.6, m.x - prise.dx));
    const y = Math.max(-cell * 0.4, Math.min(H - cell * 0.6, m.y - prise.dy));
    p.x = (x - ox) / cell;
    p.y = (y - oy) / cell;
    placer(prise.i);
  });

  function lacher(ev) {
    if (!prise || ev.pointerId !== prise.id) return;
    const i = prise.i;
    prise = null;
    const p = partie.pieces[i];
    const cv = pieces[i];
    cv.classList.remove('prise');
    partie.coups += 1;
    if (Math.abs(p.x - p.c) < 0.3 && Math.abs(p.y - p.r) < 0.3) {
      p.x = p.c; p.y = p.r; p.posee = true;
      cv.classList.add('posee', 'clic');
      cv.style.zIndex = 1;
      placer(i);
      if (navigator.vibrate) navigator.vibrate(12);
    }
    chrono();
    majCompteur();
    sauver();
    if (partie.pieces.every((x) => x.posee)) victoire();
  }
  table.addEventListener('pointerup', lacher);
  table.addEventListener('pointercancel', lacher);

  // Temps de jeu : on additionne les écarts entre deux gestes (pauses de plus de 2 min ignorées)
  function chrono() {
    const t = Date.now();
    if (partie.dernier && t - partie.dernier < 120000) partie.ms += t - partie.dernier;
    partie.dernier = t;
  }

  // ================= Interface =================
  function majCompteur() {
    const poses = partie.pieces.filter((p) => p.posee).length;
    $('compteur').textContent = `${poses} / ${partie.pieces.length}`;
    document.querySelectorAll('#niveaux button').forEach((b) => {
      b.setAttribute('aria-pressed', String(+b.dataset.n === partie.n));
    });
  }

  function victoire(animation = true) {
    partie.fini = true;
    sauver();
    plateau.classList.add('fini');
    table.classList.add('termine');
    const s = Math.round(partie.ms / 1000);
    const temps = s >= 60 ? `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s` : `${s} s`;
    $('bilan').textContent = `${partie.pieces.length} pièces assemblées en ${temps}`;
    $('plus-dur').hidden = partie.n === NIVEAUX[NIVEAUX.length - 1];
    $('victoire').hidden = false;
    if (!animation) return;
    const coeurs = $('coeurs');
    for (let k = 0; k < 36; k++) {
      const c = document.createElement('span');
      c.textContent = ['🧡', '💛', '🤎', '❤️', '🦊', '🐻'][k % 6];
      c.style.left = `${Math.random() * 100}%`;
      c.style.animationDuration = `${3 + Math.random() * 3}s`;
      c.style.animationDelay = `${Math.random() * 1.5}s`;
      c.style.setProperty('--dx', `${(Math.random() - 0.5) * 120}px`);
      c.style.setProperty('--r', `${(Math.random() - 0.5) * 120}deg`);
      coeurs.append(c);
      setTimeout(() => c.remove(), 8000);
    }
  }

  function charger(n, recommencer = false) {
    $('victoire').hidden = true;
    plateau.classList.remove('fini');
    table.classList.remove('termine');
    const sauvee = (lire().parties || {})[n];
    if (sauvee && !recommencer && !sauvee.fini) {
      partie = sauvee;
      calculerGeometrie();
    } else {
      nouvellePartie(n);
    }
    dessinerPieces();
    majCompteur();
    sauver();
  }

  $('niveaux').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (b && +b.dataset.n !== partie.n) charger(+b.dataset.n);
  });
  $('melanger').addEventListener('click', () => {
    if (partie.fini) return;
    disperser(partie.pieces);
    partie.pieces.forEach((p, i) => { if (!p.posee) placer(i); });
    sauver();
  });
  $('apercu').addEventListener('click', () => {
    const actif = plateau.classList.toggle('fantome');
    $('apercu').setAttribute('aria-pressed', String(actif));
    const d = lire(); d.fantome = actif; ecrire(d);
  });
  $('rejouer').addEventListener('click', () => charger(partie.n, true));
  $('plus-dur').addEventListener('click', () => {
    const suivant = NIVEAUX[NIVEAUX.indexOf(partie.n) + 1] || partie.n;
    charger(suivant, true);
  });

  // Rotation ou redimensionnement : on recalcule la taille des pièces
  let minuterie;
  window.addEventListener('resize', () => {
    clearTimeout(minuterie);
    minuterie = setTimeout(() => {
      if (!partie) return;
      const ancien = geo.W + 'x' + geo.H;
      calculerGeometrie();
      if (ancien !== geo.W + 'x' + geo.H) {
        // garder les pièces libres à l'écran
        partie.pieces.forEach((p) => {
          if (p.posee) return;
          const x = geo.ox + p.x * geo.cell; const y = geo.oy + p.y * geo.cell;
          if (x < -geo.cell / 2 || y < -geo.cell / 2 || x > geo.W - geo.cell / 2 || y > geo.H - geo.cell / 2) disperser([p]);
        });
        dessinerPieces();
      }
    }, 200);
  });

  // ================= Démarrage =================
  imageChargee.then(() => {
    const d = lire();
    if (d.fantome) { plateau.classList.add('fantome'); $('apercu').setAttribute('aria-pressed', 'true'); }
    const n = NIVEAUX.includes(d.courant) ? d.courant : 4;
    const sauvee = (d.parties || {})[n];
    if (sauvee && sauvee.fini) {
      partie = sauvee;
      calculerGeometrie();
      dessinerPieces();
      majCompteur();
      victoire(false);
    } else {
      charger(n);
    }
  });
})();
