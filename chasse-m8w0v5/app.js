(() => {
  'use strict';

  // ================= Réglages =================
  const CLE = 'chasse-v1';
  const RAYON_ZONE = 15;          // mètres
  const ECART_MIN = 3.2;          // distance minimale entre deux créatures (m)
  const PORTEE_MIN = 5;           // portée de capture minimale (m)
  const PORTEE_MAX = 9;           // portée de capture maximale (m) quand le GPS est imprécis
  const GRELOTS_DEPART = 3;
  const ACTIVES = 3;              // créatures réveillées en même temps : il faut parcourir la zone
  const BRUISSEMENT = 12;         // en dessous de cette distance (m), une créature cachée fait bouger les buissons

  const $ = (id) => document.getElementById(id);

  // ================= Sauvegarde =================
  function lire() {
    try { return JSON.parse(localStorage.getItem(CLE)) || {}; } catch (e) { return {}; }
  }
  let etat = Object.assign({ centre: null, captures: {}, deplacees: {}, grelots: GRELOTS_DEPART, jourGrelot: null, intro: false, marche: 0 }, lire());
  function sauver() {
    try { localStorage.setItem(CLE, JSON.stringify(etat)); } catch (e) { /* stockage indisponible */ }
  }

  // Le centre de la zone arrive par le lien du QR code : …/#c=lat,lng (jamais envoyé au serveur)
  const params = new URLSearchParams(location.hash.slice(1));
  const DEMO = params.has('demo');
  if (params.get('c')) {
    const [lat, lng] = params.get('c').split(',').map(Number);
    if (isFinite(lat) && isFinite(lng)) {
      const change = !etat.centre || Math.abs(etat.centre.lat - lat) > 1e-6 || Math.abs(etat.centre.lng - lng) > 1e-6;
      if (change) { etat.centre = { lat, lng }; etat.deplacees = {}; }
      sauver();
    }
    if (!DEMO) history.replaceState(null, '', location.pathname);
  }

  // Un grelot de plus chaque jour
  const aujourdhui = () => new Date().toLocaleDateString('fr-CA');
  function recharger() {
    const j = aujourdhui();
    if (!etat.jourGrelot) etat.jourGrelot = j;
    const jours = Math.round((Date.parse(j) - Date.parse(etat.jourGrelot)) / 86400000);
    if (jours > 0) { etat.grelots = Math.min(9, etat.grelots + jours); etat.jourGrelot = j; }
    sauver();
  }

  // ================= Positions des créatures =================
  function prng(graine) {
    return () => {
      graine = (graine + 0x6D2B79F5) | 0;
      let t = Math.imul(graine ^ (graine >>> 15), 1 | graine);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  let positions = [];
  let ordre = [];      // ordre de réveil des créatures (les légendaires à la fin)
  let traces = [];     // décalage des buissons qui bougent, pour ne pas trahir la position exacte
  function calculerPositions() {
    const c = etat.centre;
    const graine = c ? Math.round(c.lat * 1e5) * 31 + Math.round(c.lng * 1e5) : 2026;
    const r = prng(graine);
    positions = [];
    let essais = 0;
    while (positions.length < CREATURES.length && essais++ < 20000) {
      const d = 2 + Math.sqrt(r()) * (RAYON_ZONE - 3);
      const a = r() * Math.PI * 2;
      const p = [Math.cos(a) * d, Math.sin(a) * d];
      const ecart = essais > 5000 ? ECART_MIN / 2 : ECART_MIN;
      if (positions.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) >= ecart)) positions.push(p);
    }
    for (const i in etat.deplacees) positions[i] = etat.deplacees[i];
    const melange = CREATURES.map((_, i) => i);
    for (let k = melange.length - 1; k > 0; k--) { const j = Math.floor(r() * (k + 1)); [melange[k], melange[j]] = [melange[j], melange[k]]; }
    const rang = { commun: 0, rare: 1, legendaire: 2 };
    ordre = melange.map((i, k) => [i, k + rang[CREATURES[i].rarete] * 8]).sort((x, y) => x[1] - y[1]).map((x) => x[0]);
    traces = CREATURES.map(() => [(r() - 0.5) * 4, (r() - 0.5) * 4]);
  }

  // ================= GPS =================
  let joueur = null;       // { x, y } en mètres (x vers l'est, y vers le nord) depuis le centre
  let precision = null;    // mètres
  const historique = [];
  let surveillance = null;

  function versMetres(lat, lng) {
    const c = etat.centre;
    return {
      x: (lng - c.lng) * 111320 * Math.cos(c.lat * Math.PI / 180),
      y: (lat - c.lat) * 110540,
    };
  }

  function lancerGPS() {
    if (DEMO) {
      joueur = joueur || { x: 0, y: -6 };
      precision = 4;
      majEtat();
      return;
    }
    if (!('geolocation' in navigator)) { $('etat-gps').textContent = 'Ton téléphone ne donne pas accès à la position 😕'; return; }
    if (surveillance != null) return;
    surveillance = navigator.geolocation.watchPosition((pos) => {
      if (!etat.centre) return;
      const m = versMetres(pos.coords.latitude, pos.coords.longitude);
      historique.push({ ...m, acc: Math.max(pos.coords.accuracy, 1), t: Date.now() });
      while (historique.length > 1 && Date.now() - historique[0].t > 6000) historique.shift();
      // moyenne pondérée par la précision des dernières mesures (lisse les sauts du GPS)
      let sx = 0; let sy = 0; let sw = 0;
      const t = Date.now();
      for (const h of historique) { const w = Math.exp(-(t - h.t) / 2500) / (h.acc * h.acc); sx += h.x * w; sy += h.y * w; sw += w; }
      const nouveau = { x: sx / sw, y: sy / sw };
      if (joueur) compterPas(nouveau, pos.coords.accuracy);
      joueur = nouveau;
      precision = pos.coords.accuracy;
      majEtat();
    }, (err) => {
      $('etat-gps').textContent = err.code === 1
        ? 'Autorise l\'accès à ta position dans les réglages du navigateur pour jouer 📍'
        : 'Position introuvable pour l\'instant… Essaie de te rapprocher d\'une fenêtre ou de sortir 🌤️';
    }, { enableHighAccuracy: true, maximumAge: 1500, timeout: 20000 });
  }

  // Distance parcourue (on ignore les petits sauts du GPS)
  let dernierPas = null;
  function compterPas(p, acc) {
    if (!dernierPas) { dernierPas = p; return; }
    const d = Math.hypot(p.x - dernierPas.x, p.y - dernierPas.y);
    if (d >= Math.max(2, acc * 0.4) && d < 30) {
      etat.marche += d;
      dernierPas = p;
      sauver();
    }
  }

  const portee = () => Math.min(PORTEE_MAX, Math.max(PORTEE_MIN, (precision || 6) * 0.7));
  const restantes = () => CREATURES.map((_, i) => i).filter((i) => !etat.captures[i]);
  const actives = () => ordre.filter((i) => !etat.captures[i]).slice(0, ACTIVES);
  const distance = (i) => Math.hypot(positions[i][0] - joueur.x, positions[i][1] - joueur.y);
  const detection = () => portee() + 3;
  const visible = (i) => !!joueur && distance(i) <= detection();
  const apparues = new Set();

  function majEtat() {
    const el = $('etat-gps');
    $('compte').textContent = Object.keys(etat.captures).length;
    majRadar();
    if (!joueur) return;
    const loin = Math.hypot(joueur.x, joueur.y);
    if (loin > RAYON_ZONE + 25) {
      el.textContent = `Tu es à ${Math.round(loin)} m de la zone de chasse. Rapproche-toi ! 🧭`;
      return;
    }
    const reveil = actives();
    if (!reveil.length) { el.textContent = 'Toutes les créatures sont dans ta hotte ! 🎉'; return; }
    // nouvelle apparition ?
    for (const i of reveil) {
      if (visible(i) && !apparues.has(i)) {
        apparues.add(i);
        if (navigator.vibrate) navigator.vibrate([40, 40, 40]);
        toast('Une créature sauvage apparaît ! ✨');
      }
      if (!visible(i)) apparues.delete(i);
    }
    const vues = reveil.filter(visible);
    const aPortee = vues.filter((i) => distance(i) <= portee());
    if (aPortee.length) {
      el.textContent = aPortee.length > 1 ? `✨ ${aPortee.length} créatures sont là ! Touche-en une.` : '✨ Une créature est là ! Touche-la sur la carte.';
    } else if (vues.length) {
      el.textContent = 'Tu la vois ? Avance encore un peu vers elle 👀';
    } else if (reveil.some((i) => distance(i) < BRUISSEMENT)) {
      el.textContent = 'Ça bouge dans les buissons… 🍃 Cherche tout autour !';
    } else {
      const m = Math.round(etat.marche);
      el.textContent = `Promène-toi dans la zone pour trouver des créatures 🌲${m >= 10 ? ` · ${m} m parcourus` : ''}`;
    }
  }

  // Radar : silhouettes des créatures réveillées, avec des empreintes selon la distance
  function majRadar() {
    const radar = $('radar');
    const liste = actives();
    if (!joueur || !liste.length) { radar.replaceChildren(); return; }
    liste.sort((x, y) => distance(x) - distance(y));
    radar.replaceChildren(...liste.map((i) => {
      const d = distance(i);
      const det = detection();
      const pas = visible(i) ? '✨' : d < det + 4 ? '👣' : d < det + 9 ? '👣👣' : '👣👣👣';
      const s = document.createElement('div');
      s.className = `radar-case${visible(i) ? ' vue' : ''}`;
      s.innerHTML = `<img src="${images[i].src}" alt=""><span>${pas}</span>`;
      return s;
    }));
  }

  // ================= Carte =================
  const canvas = $('carte');
  const ctx = canvas.getContext('2d');
  let vue = null; // { cx, cy, echelle (px par mètre) }
  const images = CREATURES.map((c, i) => {
    const img = new Image();
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(dessinerCreature(c, `m${i}`))}`;
    return img;
  });

  // Fond OpenStreetMap (si en ligne)
  const tuiles = new Map();
  const Z = 19;
  function tuile(x, y) {
    const k = `${x}/${y}`;
    if (!tuiles.has(k)) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => { img.ok = true; };
      img.src = `https://tile.openstreetmap.org/${Z}/${x}/${y}.png`;
      tuiles.set(k, img);
    }
    return tuiles.get(k);
  }

  function dimensionner() {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = canvas.clientWidth; const h = canvas.clientHeight;
    const utile = Math.min(w, h - 150);
    vue = { cx: w / 2, cy: 70 + (h - 150) / 2, echelle: (utile / 2) / (RAYON_ZONE + 4) };
  }
  const ecran = (x, y) => [vue.cx + x * vue.echelle, vue.cy - y * vue.echelle];

  function dessinerCarte(t) {
    const w = canvas.clientWidth; const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#e4edf5';
    ctx.fillRect(0, 0, w, h);

    // tuiles OSM, éclaircies façon « neige »
    if (etat.centre) {
      const c = etat.centre;
      const n = 2 ** Z;
      const fx = (c.lng + 180) / 360 * n;
      const rad = c.lat * Math.PI / 180;
      const fy = (1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2 * n;
      const mParPx = 156543.03392 * Math.cos(rad) / n;
      const taille = 256 * mParPx * vue.echelle;
      const tx0 = Math.floor(fx); const ty0 = Math.floor(fy);
      const portee2 = Math.ceil(Math.max(w, h) / taille / 2) + 1;
      ctx.save();
      ctx.globalAlpha = 0.55;
      for (let dx = -portee2; dx <= portee2; dx++) {
        for (let dy = -portee2; dy <= portee2; dy++) {
          const img = tuile(tx0 + dx, ty0 + dy);
          if (!img.ok) continue;
          const px = vue.cx + (tx0 + dx - fx) * taille;
          const py = vue.cy + (ty0 + dy - fy) * taille;
          ctx.drawImage(img, px, py, taille + 0.5, taille + 0.5);
        }
      }
      ctx.restore();
      ctx.fillStyle = 'rgba(235, 244, 252, .35)';
      ctx.fillRect(0, 0, w, h);
    }

    // zone de chasse
    const [zx, zy] = ecran(0, 0);
    ctx.beginPath();
    ctx.arc(zx, zy, RAYON_ZONE * vue.echelle, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    ctx.fill();
    ctx.setLineDash([8, 8]);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(230, 57, 70, .7)';
    ctx.stroke();
    ctx.setLineDash([]);

    // joueur
    if (joueur) {
      const [px, py] = ecran(joueur.x, joueur.y);
      ctx.beginPath();
      ctx.arc(px, py, portee() * vue.echelle, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(69, 123, 157, .12)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(69, 123, 157, .45)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      const pulse = 9 + Math.sin(t / 300) * 2;
      ctx.beginPath(); ctx.arc(px, py, pulse + 5, 0, Math.PI * 2); ctx.fillStyle = 'rgba(29, 120, 255, .2)'; ctx.fill();
      ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2); ctx.fillStyle = '#1d78ff'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.stroke();
    }

    // créatures réveillées : visibles seulement de près, sinon les buissons bougent
    const taille = Math.max(34, Math.min(52, vue.echelle * 2.6));
    if (joueur) {
      for (const i of actives()) {
        const d = distance(i);
        if (!visible(i)) {
          if (d < BRUISSEMENT) {
            const [x, y] = ecran(positions[i][0] + traces[i][0], positions[i][1] + traces[i][1]);
            const k = Math.sin(t / 140 + i * 3);
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(k * 0.25);
            ctx.font = `${Math.round(taille * 0.6)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalAlpha = 0.65 + 0.35 * Math.abs(k);
            ctx.fillText('🍃', -taille * 0.15, 0);
            ctx.fillText('🍃', taille * 0.18, taille * 0.12);
            ctx.restore();
          }
          continue;
        }
        const [x, y] = ecran(...positions[i]);
        const proche = d <= portee();
        const saut = proche ? Math.abs(Math.sin(t / 220 + i)) * 8 : Math.sin(t / 600 + i) * 2;
        ctx.beginPath();
        ctx.ellipse(x, y + taille * 0.42, taille * 0.32, taille * 0.1, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,.15)';
        ctx.fill();
        if (proche) {
          ctx.beginPath();
          ctx.arc(x, y, taille * 0.62, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 212, 59, .35)';
          ctx.fill();
        }
        ctx.save();
        ctx.globalAlpha = proche ? 1 : 0.8;
        if (images[i].complete) ctx.drawImage(images[i], x - taille / 2, y - taille / 2 - saut, taille, taille);
        ctx.restore();
      }
    }
  }

  function boucle(t) {
    if (!$('ecran-carte').hidden) dessinerCarte(t);
    requestAnimationFrame(boucle);
  }

  // Toucher la carte : choisir une créature (ou se déplacer en mode démo)
  canvas.addEventListener('pointerup', (ev) => {
    const r = canvas.getBoundingClientRect();
    const sx = ev.clientX - r.left; const sy = ev.clientY - r.top;
    const taille = Math.max(34, Math.min(52, vue.echelle * 2.6));
    let choix = -1; let meilleur = taille * 0.75;
    for (const i of actives().filter(visible)) {
      const [x, y] = ecran(...positions[i]);
      const d = Math.hypot(sx - x, sy - y);
      if (d < meilleur) { meilleur = d; choix = i; }
    }
    if (choix >= 0) {
      if (!joueur) { toast('On attend encore ta position… 📍'); return; }
      const d = distance(choix);
      if (d <= portee()) ouvrirCapture(choix);
      else toast(`Trop loin ! Approche-toi encore d'environ ${Math.max(1, Math.round(d - portee()))} m 👣`);
      return;
    }
    if (DEMO) {
      joueur = { x: (sx - vue.cx) / vue.echelle, y: -(sy - vue.cy) / vue.echelle };
      majEtat();
    }
  });

  let minuterieToast;
  function toast(texte, duree = 2600) {
    const t = $('toast');
    t.textContent = texte;
    t.hidden = false;
    t.style.animation = 'none'; void t.offsetWidth; t.style.animation = '';
    clearTimeout(minuterieToast);
    minuterieToast = setTimeout(() => { t.hidden = true; }, duree);
  }

  // ================= Grelot : attire la créature la plus proche =================
  function majGrelots() {
    $('nb-grelots').textContent = etat.grelots;
    $('btn-grelot').disabled = etat.grelots <= 0 || !restantes().length;
  }
  $('btn-grelot').addEventListener('click', () => {
    if (!joueur) { toast('On attend encore ta position… 📍'); return; }
    if (etat.grelots <= 0) { toast('Plus de grelot pour aujourd\'hui. Un nouveau arrive demain 🔔'); return; }
    const reste = actives();
    if (!reste.length) return;
    const i = reste.reduce((a, b) => (distance(a) < distance(b) ? a : b));
    if (distance(i) <= portee() * 0.8) { toast('Une créature est déjà juste à côté de toi ! 👀'); return; }
    const a = Math.random() * Math.PI * 2;
    positions[i] = [joueur.x + Math.cos(a) * 1.5, joueur.y + Math.sin(a) * 1.5];
    etat.deplacees[i] = positions[i];
    etat.grelots -= 1;
    sauver();
    $('btn-grelot').classList.add('sonne');
    setTimeout(() => $('btn-grelot').classList.remove('sonne'), 1600);
    toast('Ding ding ! Une créature accourt vers toi… 🔔');
    majGrelots();
    majEtat();
  });

  // ================= Capture =================
  let enCours = null; // { i, x, dir, t0, k }
  let flux = null;
  const video = $('video');

  async function ouvrirCamera() {
    if (flux || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return !!flux;
    try {
      flux = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      video.srcObject = flux;
      await video.play().catch(() => {});
      return true;
    } catch (e) {
      return false;
    }
  }
  function fermerCamera() {
    if (flux) flux.getTracks().forEach((t) => t.stop());
    flux = null;
    video.srcObject = null;
  }

  async function ouvrirCapture(i) {
    const c = CREATURES[i];
    const rar = RARETES[c.rarete];
    enCours = { i, x: 0, dir: 1, t0: performance.now(), k: 1, lance: false };
    $('creature-capture').innerHTML = dessinerCreature(c, `cap${i}`);
    $('creature-capture').className = 'creature-capture';
    $('info-capture').textContent = `${rar.nom} ✦ n°${i + 1}`;
    $('info-capture').style.color = rar.couleur;
    $('consigne-capture').textContent = 'Lance la boule de neige vers le haut !';
    reinitBoule();
    $('ecran-carte').hidden = true;
    $('ecran-capture').hidden = false;
    $('decor').classList.remove('cache');
    if (await ouvrirCamera()) $('decor').classList.add('cache');
    requestAnimationFrame(animerCapture);
  }

  function fermerCapture() {
    enCours = null;
    fermerCamera();
    $('ecran-capture').hidden = true;
    $('ecran-carte').hidden = false;
    majEtat();
    majGrelots();
  }
  $('btn-retour').addEventListener('click', fermerCapture);

  // La créature se balance et l'anneau de visée rétrécit en boucle
  function animerCapture(t) {
    if (!enCours) return;
    const c = CREATURES[enCours.i];
    const v = RARETES[c.rarete].vitesse;
    const zone = $('zone-creature').clientWidth;
    const amplitude = zone * 0.22;
    const s = (t - enCours.t0) / 1000;
    if (!enCours.fige) {
      enCours.x = Math.sin(s * 1.1 * v) * amplitude * (0.6 + 0.4 * Math.sin(s * 0.37));
      const saut = Math.max(0, Math.sin(s * 2.4 * v)) ** 6 * 26;
      const el = $('creature-capture');
      el.style.transform = `translateX(calc(-50% + ${enCours.x}px)) translateY(${-saut}px)`;
      $('cible').style.transform = `translateX(calc(-50% + ${enCours.x}px)) translateY(${-saut}px)`;
      enCours.k = 0.35 + 0.65 * (1 - ((s * 0.6) % 1));
      $('cible').style.setProperty('--k', enCours.k.toFixed(3));
      $('cible').style.setProperty('--anneau', enCours.k > 0.7 ? '#51cf66' : enCours.k > 0.5 ? '#fcc419' : '#ff6b6b');
    }
    requestAnimationFrame(animerCapture);
  }

  // Geste de lancer
  const boule = $('boule');
  let geste = null;
  function reinitBoule() {
    boule.style.transition = 'none';
    boule.style.transform = '';
    boule.style.opacity = '1';
    boule.className = 'boule';
  }
  boule.addEventListener('pointerdown', (ev) => {
    if (!enCours || enCours.lance) return;
    geste = { id: ev.pointerId, pts: [{ x: ev.clientX, y: ev.clientY, t: performance.now() }], x0: ev.clientX, y0: ev.clientY };
    boule.setPointerCapture(ev.pointerId);
  });
  boule.addEventListener('pointermove', (ev) => {
    if (!geste || ev.pointerId !== geste.id) return;
    geste.pts.push({ x: ev.clientX, y: ev.clientY, t: performance.now() });
    if (geste.pts.length > 6) geste.pts.shift();
    boule.style.transform = `translate(${ev.clientX - geste.x0}px, ${ev.clientY - geste.y0}px)`;
  });
  boule.addEventListener('pointerup', (ev) => {
    if (!geste || ev.pointerId !== geste.id) return;
    const a = geste.pts[0];
    const b = { x: ev.clientX, y: ev.clientY, t: performance.now() };
    const dt = Math.max(16, b.t - a.t);
    const vx = (b.x - a.x) / dt; const vy = (b.y - a.y) / dt;
    const depart = { x: ev.clientX - geste.x0, y: ev.clientY - geste.y0 };
    geste = null;
    if (vy > -0.35) { boule.style.transition = 'transform .25s'; boule.style.transform = ''; return; } // pas assez vers le haut
    lancer(vx / -vy, depart);
  });

  function lancer(pente, depart) {
    enCours.lance = true;
    const rb = boule.getBoundingClientRect();
    const rc = $('creature-capture').getBoundingClientRect();
    const xb = rb.left + rb.width / 2; const yb = rb.top + rb.height / 2;
    const yc = rc.top + rc.height * 0.55;
    const montee = yb - yc;
    const xArrivee = xb + pente * montee;
    const dx = xArrivee - xb;
    const debut = performance.now();
    const duree = 600;
    function vol(t) {
      const k = Math.min(1, (t - debut) / duree);
      const x = depart.x + (dx - depart.x) * k;
      const y = depart.y + (-montee - depart.y) * k - Math.sin(k * Math.PI) * 90;
      boule.style.transform = `translate(${x}px, ${y}px) scale(${1 - 0.55 * k}) rotate(${k * 360}deg)`;
      if (k < 1) requestAnimationFrame(vol); else arrivee(xArrivee);
    }
    requestAnimationFrame(vol);
  }

  function arrivee(xArrivee) {
    const rc = $('creature-capture').getBoundingClientRect();
    const centre = rc.left + rc.width / 2;
    const touche = Math.abs(xArrivee - centre) < rc.width * 0.38;
    if (!touche) {
      poof(xArrivee, rc.top + rc.height * 0.6, '💨');
      $('consigne-capture').textContent = auHasard(['Raté ! Réessaie 💪', 'Presque !', 'Elle a esquivé !']);
      boule.style.transition = 'opacity .2s'; boule.style.opacity = '0';
      setTimeout(() => { reinitBoule(); enCours.lance = false; }, 500);
      return;
    }
    // touchée : la créature est aspirée dans la boule
    enCours.fige = true;
    const c = CREATURES[enCours.i];
    const bonus = 1 + (1 - enCours.k) * 0.7;
    const reussi = Math.random() < Math.min(0.97, RARETES[c.rarete].chance * bonus);
    $('consigne-capture').textContent = enCours.k < 0.5 ? 'Excellent lancer ! ✨' : enCours.k < 0.7 ? 'Joli lancer !' : 'Touchée !';
    poof(centre, rc.top + rc.height * 0.5, '❄️');
    $('creature-capture').classList.add('aspiree');
    const rb = boule.getBoundingClientRect();
    const secousses = reussi ? 3 : 1 + Math.floor(Math.random() * 3);
    let n = 0;
    setTimeout(function secouer() {
      if (!enCours) return;
      boule.classList.remove('secoue'); void boule.offsetWidth; boule.classList.add('secoue');
      if (navigator.vibrate) navigator.vibrate(20);
      n += 1;
      if (n < secousses) { setTimeout(secouer, 800); return; }
      setTimeout(() => (reussi ? capture() : evasion(rb)), 800);
    }, 500);
  }

  function evasion(rb) {
    poof(rb.left + rb.width / 2, rb.top, '💥');
    $('creature-capture').classList.remove('aspiree');
    $('consigne-capture').textContent = auHasard(['Oh non, elle s\'est échappée ! Encore une fois !', 'Elle était presque attrapée…', 'Argh ! Relance vite !']);
    reinitBoule();
    enCours.fige = false;
    enCours.lance = false;
  }

  function capture() {
    const i = enCours.i;
    etat.captures[i] = Date.now();
    delete etat.deplacees[i];
    sauver();
    if (navigator.vibrate) navigator.vibrate([30, 60, 30]);
    confettis();
    afficherFiche(i, true);
    fermerCapture();
  }

  function poof(x, y, texte) {
    const p = document.createElement('div');
    p.className = 'poof';
    p.textContent = texte;
    p.style.left = `${x}px`; p.style.top = `${y}px`;
    document.body.append(p);
    setTimeout(() => p.remove(), 800);
  }
  function confettis() {
    const box = document.createElement('div');
    box.className = 'confettis';
    for (let k = 0; k < 40; k++) {
      const s = document.createElement('span');
      s.textContent = ['❄️', '⭐', '🎁', '✨', '❤️'][k % 5];
      s.style.left = `${Math.random() * 100}%`;
      s.style.animationDuration = `${2.5 + Math.random() * 2.5}s`;
      s.style.animationDelay = `${Math.random() * 0.8}s`;
      s.style.setProperty('--dx', `${(Math.random() - 0.5) * 120}px`);
      s.style.setProperty('--r', `${(Math.random() - 0.5) * 360}deg`);
      box.append(s);
    }
    document.body.append(box);
    setTimeout(() => box.remove(), 6000);
  }
  const auHasard = (l) => l[Math.floor(Math.random() * l.length)];

  // ================= Fiche et hotte =================
  let apresFiche = null;
  function afficherFiche(i, nouvelle) {
    const c = CREATURES[i];
    const rar = RARETES[c.rarete];
    $('fiche-bandeau').textContent = nouvelle ? 'Capturée !' : `n°${i + 1} / 24`;
    $('fiche-image').innerHTML = dessinerCreature(c, `f${i}`);
    $('fiche-nom').textContent = c.nom;
    $('fiche-rarete').textContent = rar.nom;
    $('fiche-rarete').style.background = rar.couleur;
    $('fiche-desc').textContent = c.desc;
    const d = new Date(etat.captures[i]);
    $('fiche-date').textContent = `Attrapée le ${d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    $('fiche-ok').textContent = nouvelle ? 'Dans ma hotte !' : 'Fermer';
    apresFiche = nouvelle && !restantes().length ? () => { $('fin').hidden = false; confettis(); } : null;
    $('fiche').hidden = false;
  }
  $('fiche-ok').addEventListener('click', () => {
    $('fiche').hidden = true;
    if (apresFiche) { const f = apresFiche; apresFiche = null; f(); }
  });

  function ouvrirHotte() {
    const g = $('grille');
    g.replaceChildren();
    CREATURES.forEach((c, i) => {
      const connue = !!etat.captures[i];
      const b = document.createElement('button');
      b.className = `case ${connue ? c.rarete : 'inconnue'}`;
      b.innerHTML = `<span class="num">${i + 1}</span>${dessinerCreature(c, `h${i}`)}<span>${connue ? c.nom : '???'}</span>`;
      if (connue) b.addEventListener('click', () => afficherFiche(i, false));
      g.append(b);
    });
    $('compte-hotte').textContent = `${Object.keys(etat.captures).length}/24`;
    $('ecran-carte').hidden = true;
    $('ecran-hotte').hidden = false;
  }
  $('btn-hotte').addEventListener('click', ouvrirHotte);
  $('btn-fermer-hotte').addEventListener('click', () => { $('ecran-hotte').hidden = true; $('ecran-carte').hidden = false; });
  $('btn-fin').addEventListener('click', () => { $('fin').hidden = true; ouvrirHotte(); });

  // ================= Démarrage =================
  function demarrer() {
    calculerPositions();
    recharger();
    dimensionner();
    majGrelots();
    majEtat();
    lancerGPS();
  }

  $('btn-commencer').addEventListener('click', () => {
    etat.intro = true;
    sauver();
    $('intro').hidden = true;
    if (!etat.centre && !DEMO) { $('sans-centre').hidden = false; return; }
    demarrer();
  });

  $('btn-ici').addEventListener('click', () => {
    $('btn-ici').textContent = 'Localisation…';
    navigator.geolocation.getCurrentPosition((pos) => {
      etat.centre = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      sauver();
      $('sans-centre').hidden = true;
      demarrer();
    }, () => {
      $('btn-ici').textContent = 'Les faire apparaître ici';
      alert('Impossible d\'obtenir ta position. Vérifie que la localisation est autorisée.');
    }, { enableHighAccuracy: true, timeout: 20000 });
  });

  // outils de test (mode démo uniquement)
  if (DEMO) window.__chasse = { positions: () => positions, ecran: (i) => ecran(...positions[i]), etat: () => etat, actives };

  window.addEventListener('resize', () => { if (vue) dimensionner(); });
  requestAnimationFrame(boucle);

  dimensionner();
  calculerPositions();
  if (!etat.intro) $('intro').hidden = false;
  else if (!etat.centre && !DEMO) $('sans-centre').hidden = false;
  else demarrer();
})();
