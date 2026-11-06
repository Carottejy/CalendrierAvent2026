(() => {
  'use strict';

  // ================= Réglages =================
  const CLE = 'renard-v1';
  // Évolution des jauges, en points par heure
  const TAUX = {
    eveille: { ventre: -3, bonheur: -2, pelage: -1.5, energie: -3 },
    dort: { ventre: -1.5, bonheur: -0.5, pelage: -0.5, energie: 20 },
  };
  const PLANCHER = 10; // avec le temps, une jauge ne descend jamais plus bas
  const NOURRITURES = [
    { id: 'myrtilles', emoji: '🫐', nom: 'Myrtilles', ventre: 12, bonheur: 3 },
    { id: 'pomme', emoji: '🍎', nom: 'Pomme', ventre: 16, bonheur: 3 },
    { id: 'oeuf', emoji: '🥚', nom: 'Œuf', ventre: 22, bonheur: 4 },
    { id: 'poisson', emoji: '🐟', nom: 'Poisson', ventre: 30, bonheur: 5 },
    { id: 'poulet', emoji: '🍗', nom: 'Poulet', ventre: 35, bonheur: 5 },
    { id: 'biscuit', emoji: '🍪', nom: 'Friandise', ventre: 6, bonheur: 12 },
  ];
  const TENUES = [
    { id: 'echarpe', emoji: '🧣', nom: 'Écharpe' },
    { id: 'bonnet', emoji: '🎅', nom: 'Bonnet', tete: true },
    { id: 'noeud', emoji: '🎀', nom: 'Nœud' },
    { id: 'fleurs', emoji: '🌸', nom: 'Fleurs', tete: true },
  ];
  // Emplacements possibles des feuilles coincées dans le pelage (coordonnées du renard)
  const NOEUDS = [[166, 262], [236, 258], [150, 322], [254, 318], [302, 284], [330, 236], [214, 300], [184, 128], [246, 160], [282, 312]];
  const ASTUCES = {
    caresser: 'Caresse-le du bout du doigt',
    brosser: 'Frotte son pelage pour enlever les feuilles',
    jouer: 'Touche la neige pour lancer la balle',
  };

  // ================= État =================
  const $ = (id) => document.getElementById(id);
  const svg = $('svg');
  const scene = $('scene');
  const renard = $('renard');
  const pos = $('pos');

  function lire() {
    try { return JSON.parse(localStorage.getItem(CLE)); } catch (e) { return null; }
  }
  let etat = lire();
  function sauver() {
    etat.maj = Date.now();
    try { localStorage.setItem(CLE, JSON.stringify(etat)); } catch (e) { /* stockage indisponible */ }
  }
  const borne = (v) => Math.max(0, Math.min(100, v));

  // Fait évoluer les jauges selon le temps écoulé depuis la dernière visite,
  // par pas de 10 minutes : s'il s'épuise en ton absence, il fait la sieste tout seul.
  function vieillir() {
    if (!etat) return;
    const maintenant = Date.now();
    let reste = Math.max(0, (maintenant - etat.maj) / 3600000);
    const pas = 1 / 6;
    let tours = 0;
    while (reste > 0 && tours++ < 10000) {
      const h = Math.min(pas, reste);
      reste -= h;
      const taux = etat.dort ? TAUX.dort : TAUX.eveille;
      for (const k in taux) {
        const v = etat.stats[k] + taux[k] * h;
        etat.stats[k] = taux[k] < 0 ? Math.max(Math.min(etat.stats[k], PLANCHER), v) : borne(v);
      }
      if (etat.dort && etat.stats.energie >= 100) etat.dort = false;
      else if (!etat.dort && etat.stats.energie <= PLANCHER) etat.dort = true;
    }
    etat.maj = maintenant;
  }

  function modifier(changements) {
    for (const k in changements) etat.stats[k] = borne(etat.stats[k] + changements[k]);
    sauver();
    afficherJauges();
    humeur();
  }

  // ================= Coordonnées =================
  function versRenard(ev) {
    const p = svg.createSVGPoint();
    p.x = ev.clientX; p.y = ev.clientY;
    return p.matrixTransform(renard.getScreenCTM().inverse());
  }
  function versScene(ev) {
    const p = svg.createSVGPoint();
    p.x = ev.clientX; p.y = ev.clientY;
    return p.matrixTransform(svg.getScreenCTM().inverse());
  }
  // point du renard (ou de la scène) -> pixels dans la zone .scene
  function versEcran(x, y, element = renard) {
    const p = svg.createSVGPoint();
    p.x = x; p.y = y;
    const q = p.matrixTransform(element.getScreenCTM());
    const r = scene.getBoundingClientRect();
    return { x: q.x - r.left, y: q.y - r.top };
  }
  function surLeRenard(p) {
    if (etat.dort) return p.x > 80 && p.x < 350 && p.y > 235 && p.y < 365;
    const tete = (p.x - 200) ** 2 + ((p.y - 160) / 1.05) ** 2 < 78 ** 2;
    const oreilles = p.y > 55 && p.y < 135 && ((p.x > 144 && p.x < 192) || (p.x > 208 && p.x < 256));
    const corps = p.x > 118 && p.x < 284 && p.y > 205 && p.y < 350;
    const queue = p.x > 230 && p.x < 356 && p.y > 190 && p.y < 340;
    return tete || oreilles || corps || queue;
  }

  // ================= Effets visuels =================
  const effets = $('effets');
  function particule(x, y, texte, cls = '') {
    const e = document.createElement('span');
    e.className = `particule ${cls}`;
    e.textContent = texte;
    e.style.left = `${x}px`;
    e.style.top = `${y}px`;
    e.style.setProperty('--dx', `${(Math.random() - 0.5) * 50}px`);
    effets.append(e);
    setTimeout(() => e.remove(), 2500);
  }

  const bulle = $('bulle');
  let minuterieBulle;
  function dire(texte, duree = 2600) {
    const p = etat.dort ? versEcran(170, 236) : versEcran(200, 48);
    bulle.textContent = texte;
    bulle.style.left = `${Math.min(Math.max(p.x, 90), scene.clientWidth - 90)}px`;
    bulle.style.top = `${Math.max(p.y, 110)}px`;
    bulle.hidden = false;
    bulle.style.animation = 'none';
    void bulle.offsetWidth;
    bulle.style.animation = '';
    clearTimeout(minuterieBulle);
    minuterieBulle = setTimeout(() => { bulle.hidden = true; }, duree);
  }

  const minuteries = {};
  function temporaire(cls, ms) {
    svg.classList.add(cls);
    clearTimeout(minuteries[cls]);
    minuteries[cls] = setTimeout(() => svg.classList.remove(cls), ms);
  }
  const auHasard = (liste) => liste[Math.floor(Math.random() * liste.length)];
  const vibrer = (ms) => { if (navigator.vibrate) navigator.vibrate(ms); };

  // ================= Affichage =================
  function afficherJauges() {
    document.querySelectorAll('.jauge').forEach((j) => {
      const v = etat.stats[j.dataset.stat];
      j.querySelector('i').style.width = `${v}%`;
      j.classList.toggle('basse', v < 25);
      j.classList.toggle('moyenne', v >= 25 && v < 50);
    });
  }

  function afficherNoeuds() {
    const g = $('noeuds');
    const n = Math.min(NOEUDS.length, Math.round((100 - etat.stats.pelage) / 10));
    if (g.childElementCount === n) return;
    g.replaceChildren();
    for (let i = 0; i < n; i++) {
      const [x, y] = NOEUDS[i];
      const f = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      f.setAttribute('transform', `translate(${x} ${y}) rotate(${(i * 47) % 360})`);
      f.dataset.i = i;
      f.innerHTML = '<path d="M-8 0 Q0 -7 8 0 Q0 7 -8 0Z" fill="#9a6a33"/><path d="M-9 0 L8 0" stroke="#5e3b1a" stroke-width="1.5"/><path d="M2 0 L6 -5" stroke="#5e3b1a" stroke-width="1.2"/>';
      g.append(f);
    }
  }

  function afficherTenues() {
    TENUES.forEach((t) => svg.classList.toggle(`porte-${t.id}`, etat.tenues.includes(t.id)));
  }

  function humeur() {
    const s = etat.stats;
    svg.classList.toggle('endormi', etat.dort);
    svg.classList.toggle('triste', !etat.dort && Math.min(s.ventre, s.bonheur, s.energie) < 25);
    afficherNoeuds();
    document.querySelector('[data-action="dormir"]').lastChild.textContent = etat.dort ? 'Réveil' : 'Dodo';
    document.querySelector('[data-action="dormir"] span').textContent = etat.dort ? '☀️' : '🌙';
  }

  function ciel() {
    const h = new Date().getHours();
    const jour = h >= 8 && h < 18;
    svg.classList.toggle('jour', jour);
    $('ciel-haut').setAttribute('stop-color', jour ? '#7fbfe6' : '#18284a');
    $('ciel-bas').setAttribute('stop-color', jour ? '#d6ecf7' : '#4b5f8c');
    $('astre-disque').setAttribute('fill', jour ? '#fff1a0' : '#fff4cc');
    $('astre-disque').setAttribute('r', jour ? '28' : '24');
    document.querySelector('meta[name="theme-color"]').content = jour ? '#7fbfe6' : '#18284a';
  }

  function flocons() {
    const f = $('flocons');
    for (let i = 0; i < 28; i++) {
      const s = document.createElement('span');
      s.textContent = '•';
      s.style.left = `${Math.random() * 100}%`;
      s.style.fontSize = `${6 + Math.random() * 10}px`;
      s.style.animationDuration = `${7 + Math.random() * 9}s`;
      s.style.animationDelay = `${-Math.random() * 16}s`;
      s.style.setProperty('--vent', `${(Math.random() - 0.3) * 60}px`);
      f.append(s);
    }
  }

  function enTete() {
    $('nom-renard').textContent = etat.nom;
    const jours = Math.floor((Date.now() - etat.adopte) / 86400000) + 1;
    $('depuis').textContent = `Ensemble depuis ${jours} jour${jours > 1 ? 's' : ''}`;
    document.title = etat.nom;
  }

  // ================= Modes et actions =================
  let mode = 'caresser';
  const tiroir = $('tiroir');

  function choisirMode(m) {
    mode = m;
    document.querySelectorAll('.actions button').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.action === m));
    });
    $('astuce').textContent = ASTUCES[m] || '';
    $('brosse-curseur').hidden = true;
  }

  function fermerTiroir() {
    tiroir.hidden = true;
    choisirMode(mode === 'nourrir' || mode === 'tenue' ? 'caresser' : mode);
  }

  function chut() {
    dire(`Chuuut… ${etat.nom} dort 💤`);
  }

  $('actions').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    const a = b.dataset.action;
    if (!tiroir.hidden) {
      const etaitOuvert = mode;
      tiroir.hidden = true;
      if (etaitOuvert === a) { choisirMode('caresser'); return; }
    }
    if (a === 'dormir') { basculerSommeil(); return; }
    if (etat.dort && a !== 'caresser' && a !== 'tenue') { chut(); return; }
    if (a === 'nourrir') ouvrirNourriture();
    else if (a === 'tenue') ouvrirTenues();
    else if (a === 'jouer' && etat.stats.energie < 15) {
      temporaire('yeux-fermes-actif', 1500);
      dire('Trop fatigué pour jouer… 🥱');
      return;
    }
    choisirMode(a);
  });

  // ---- Nourrir ----
  function ouvrirNourriture() {
    tiroir.replaceChildren(
      el('h3', `Que veux-tu donner à ${etat.nom} ?`),
      el('div', NOURRITURES.map((n) => {
        const b = el('button', [el('span', n.emoji), n.nom]);
        b.addEventListener('click', () => nourrir(n, b));
        return b;
      }), 'choix'));
    tiroir.hidden = false;
  }

  let occupe = false;
  function nourrir(n, bouton) {
    if (occupe) return;
    if (etat.stats.ventre >= 95) {
      temporaire('penche', 1200);
      dire('Je n\'ai plus faim… 🙈');
      return;
    }
    occupe = true;
    const depart = bouton.getBoundingClientRect();
    const r = scene.getBoundingClientRect();
    const bouche = versEcran(200, 210);
    const f = el('div', n.emoji, 'nourriture');
    f.style.left = `${depart.left + depart.width / 2 - r.left}px`;
    f.style.top = `${depart.top + depart.height / 2 - r.top}px`;
    scene.append(f);
    tiroir.hidden = true;
    temporaire('bouche-active', 2000);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      f.style.left = `${bouche.x}px`;
      f.style.top = `${bouche.y}px`;
      f.style.transform = 'translate(-50%, -50%) scale(.5)';
    }));
    setTimeout(() => {
      f.remove();
      temporaire('mache', 1400);
      temporaire('yeux-fermes-actif', 1400);
      const prefere = n.id === etat.prefere;
      modifier({ ventre: n.ventre, bonheur: n.bonheur + (prefere ? 10 : 0) });
      setTimeout(() => {
        occupe = false;
        temporaire('content', 1800);
        const p = versEcran(200, 120);
        if (prefere) {
          for (let i = 0; i < 5; i++) setTimeout(() => particule(p.x, p.y, '🧡'), i * 120);
          dire(etat.prefereDecouvert ? `Miam, mon préféré ! ${n.emoji}` : `${n.emoji} C'est son plat préféré !`);
          etat.prefereDecouvert = true;
          sauver();
        } else {
          particule(p.x, p.y, '😋');
          dire(auHasard(['Miam !', 'Délicieux !', 'Merci 🧡', 'Encore un peu ?', 'Mmmh…']));
        }
        if (mode === 'nourrir') ouvrirNourriture();
      }, 1400);
    }, 600);
  }

  // ---- Tenues ----
  function ouvrirTenues() {
    tiroir.replaceChildren(
      el('h3', 'Choisis sa tenue'),
      el('div', TENUES.map((t) => {
        const b = el('button', [el('span', t.emoji), t.nom]);
        b.setAttribute('aria-pressed', String(etat.tenues.includes(t.id)));
        b.addEventListener('click', () => {
          if (etat.tenues.includes(t.id)) etat.tenues = etat.tenues.filter((x) => x !== t.id);
          else {
            // un seul accessoire sur la tête à la fois
            if (t.tete) etat.tenues = etat.tenues.filter((x) => !TENUES.find((y) => y.id === x).tete);
            etat.tenues.push(t.id);
            if (!etat.dort) { temporaire('content', 1500); dire(auHasard(['Je suis beau ?', 'Trop classe !', 'J\'adore ✨'])); }
          }
          sauver();
          afficherTenues();
          ouvrirTenues();
        });
        return b;
      }), 'choix'));
    tiroir.hidden = false;
  }

  // ---- Dormir ----
  let minuterieZzz;
  function basculerSommeil() {
    if (occupe) return;
    if (!etat.dort && etat.stats.energie > 90) {
      temporaire('sautille', 1000);
      dire('Je ne suis pas fatigué !');
      return;
    }
    etat.dort = !etat.dort;
    sauver();
    humeur();
    if (etat.dort) dire('Bonne nuit… 💤', 1800);
    else { temporaire('sautille', 1000); dire(auHasard(['Bien dormi ! ☀️', 'Bonjour toi !', '*s\'étire*'])); }
    choisirMode('caresser');
  }
  function zzz() {
    clearInterval(minuterieZzz);
    minuterieZzz = setInterval(() => {
      if (!etat.dort) return;
      const p = versEcran(150, 262);
      particule(p.x, p.y, auHasard(['z', 'Z', 'z']), 'zzz');
    }, 1300);
  }

  // ---- Jouer ----
  function anime(duree, etape) {
    return new Promise((fin) => {
      const debut = performance.now();
      function boucle(t) {
        const k = Math.min(1, (t - debut) / duree);
        etape(k);
        if (k < 1) requestAnimationFrame(boucle); else fin();
      }
      requestAnimationFrame(boucle);
    });
  }
  const placer = (dx, dy) => pos.setAttribute('transform', `translate(${-10 + dx} ${137 + dy}) scale(.9)`);

  async function lancerBalle(cible) {
    occupe = true;
    const balle = $('balle');
    const x = Math.max(110, Math.min(290, cible.x));
    const y = 446;
    balle.style.display = '';
    // la balle part du bas de l'écran et retombe dans la neige
    await anime(650, (k) => {
      const bx = 200 + (x - 200) * k;
      const by = 560 + (y - 560) * k - Math.sin(k * Math.PI) * 220;
      balle.setAttribute('transform', `translate(${bx} ${by}) rotate(${k * 540})`);
    });
    // le renard bondit dessus (le fameux saut du renard dans la neige)
    const dx = x - 170;
    vibrer(15);
    await anime(520, (k) => placer(dx * k, -Math.sin(k * Math.PI) * 95));
    balle.style.display = 'none';
    $('balle-gueule').innerHTML = '<g transform="translate(200 218)"><circle r="12" fill="#e2463b"/><path d="M-11 -3 Q0 4 11 -3" stroke="#fff" stroke-width="3" fill="none"/></g>';
    const p = versEcran(200, 120);
    const pattes = versEcran(200, 340);
    for (let i = 0; i < 6; i++) particule(pattes.x + (Math.random() - 0.5) * 120, pattes.y, '❄️');
    temporaire('content', 1600);
    modifier({ bonheur: 10, energie: -8, ventre: -3 });
    dire(auHasard(['Attrapée !', 'Encore ! Encore !', 'Hop !', 'Trop facile 😎']), 1500);
    await new Promise((r) => setTimeout(r, 700));
    // il revient en sautillant
    await anime(650, (k) => placer(dx * (1 - k), -Math.abs(Math.sin(k * Math.PI * 3)) * 14));
    $('balle-gueule').innerHTML = '';
    placer(0, 0);
    occupe = false;
    if (etat.stats.energie < 15) {
      dire('Je suis épuisé… 🥱');
      choisirMode('caresser');
    }
  }

  // ================= Gestes sur la scène =================
  let appui = null;
  let distance = 0;
  let dernierPoint = null;

  scene.addEventListener('pointerdown', (ev) => {
    if (!tiroir.hidden) { fermerTiroir(); return; }
    appui = { t: Date.now(), x: ev.clientX, y: ev.clientY, bouge: 0 };
    dernierPoint = { x: ev.clientX, y: ev.clientY };
    scene.setPointerCapture(ev.pointerId);
    if (mode === 'brosser') deplacerBrosse(ev);
  });

  scene.addEventListener('pointermove', (ev) => {
    if (!appui) return;
    const d = Math.hypot(ev.clientX - dernierPoint.x, ev.clientY - dernierPoint.y);
    dernierPoint = { x: ev.clientX, y: ev.clientY };
    appui.bouge += d;
    if (occupe) return;
    const p = versRenard(ev);
    if (mode === 'caresser' && surLeRenard(p)) caresser(ev, d);
    if (mode === 'brosser') { deplacerBrosse(ev); if (surLeRenard(p)) brosser(ev, p, d); }
  });

  scene.addEventListener('pointerup', (ev) => {
    if (!appui) return;
    const tape = appui.bouge < 12 && Date.now() - appui.t < 400;
    appui = null;
    $('brosse-curseur').hidden = true;
    if (!tape || occupe) return;
    if (mode === 'jouer' && !etat.dort) { lancerBalle(versScene(ev)); return; }
    toucher(versRenard(ev));
  });
  scene.addEventListener('pointercancel', () => { appui = null; $('brosse-curseur').hidden = true; });

  function caresser(ev, d) {
    distance += d;
    if (!etat.dort) temporaire('content', 700);
    if (distance > 55) {
      distance = 0;
      const r = scene.getBoundingClientRect();
      particule(ev.clientX - r.left, ev.clientY - r.top - 20, etat.dort ? '💤' : auHasard(['💛', '🧡', '💕']));
      modifier({ bonheur: etat.dort ? 0.5 : 1.5 });
      if (!etat.dort && Math.random() < 0.06) dire(auHasard(['Hihi ça chatouille', 'Encore…', '*ronronne*', 'J\'adore ça 🧡']));
    }
  }

  function deplacerBrosse(ev) {
    const r = scene.getBoundingClientRect();
    const c = $('brosse-curseur');
    c.hidden = false;
    c.style.left = `${ev.clientX - r.left}px`;
    c.style.top = `${ev.clientY - r.top}px`;
  }

  function brosser(ev, p, d) {
    const r = scene.getBoundingClientRect();
    if (!etat.dort) temporaire('yeux-fermes-actif', 600);
    // feuille sous la brosse ?
    for (const f of $('noeuds').children) {
      if (f.classList.contains('noeud-tombe')) continue;
      const [x, y] = NOEUDS[+f.dataset.i];
      if (Math.hypot(p.x - x, p.y - y) < 24) {
        f.classList.add('noeud-tombe');
        vibrer(8);
        particule(ev.clientX - r.left, ev.clientY - r.top, '🍂');
        setTimeout(() => {
          modifier({ pelage: 10, bonheur: 2 });
          if ($('noeuds').childElementCount === 0) {
            temporaire('content', 2000);
            dire('Mon pelage est tout doux ! ✨');
          }
        }, 600);
        return;
      }
    }
    distance += d;
    if (distance > 70) {
      distance = 0;
      particule(ev.clientX - r.left, ev.clientY - r.top, '✨');
      modifier({ pelage: 1, bonheur: 0.5 });
    }
  }

  function toucher(p) {
    if (!surLeRenard(p)) return;
    if (etat.dort) {
      if (Math.random() < 0.3) dire(auHasard(['*ronfle*', 'Mmh… cinq minutes…', 'zzZ…']), 1500);
      return;
    }
    if (p.y > 180 && p.y < 204 && p.x > 186 && p.x < 214) {
      temporaire('eternue', 600);
      temporaire('yeux-fermes-actif', 500);
      dire('Atchoum ! 🤧', 1400);
      return;
    }
    if (p.y < 132) {
      const o = $(p.x < 200 ? 'oreille-g' : 'oreille-d');
      o.classList.remove('frisson');
      void o.getBBox();
      o.classList.add('frisson');
      setTimeout(() => o.classList.remove('frisson'), 1000);
      return;
    }
    temporaire('penche', 900);
    temporaire('content', 900);
    if (Math.random() < 0.35) dire(auHasard(['Coucou toi !', 'Tu m\'as manqué', 'Hihi', 'On joue ?', '🧡']), 1600);
  }

  // ================= Besoins exprimés =================
  function besoins() {
    if (!etat || etat.dort || occupe || !bulle.hidden) return;
    const s = etat.stats;
    const liste = [];
    if (s.ventre < 30) liste.push('J\'ai un petit creux… 🍎');
    if (s.energie < 25) liste.push('Je tombe de sommeil… 🌙');
    if (s.pelage < 30) liste.push('Mon pelage est plein de feuilles… 🖌️');
    if (s.bonheur < 30) liste.push('Tu joues avec moi ? 🎾');
    if (liste.length) dire(auHasard(liste), 3500);
  }

  // ================= Petit utilitaire DOM =================
  function el(tag, contenu, cls) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (Array.isArray(contenu)) e.append(...contenu);
    else if (contenu != null) e.append(contenu);
    return e;
  }

  // ================= Démarrage =================
  function demarrer(premiereFois) {
    vieillir();
    sauver();
    enTete();
    afficherJauges();
    afficherTenues();
    humeur();
    choisirMode('caresser');
    zzz();
    if (premiereFois) {
      setTimeout(() => { temporaire('sautille', 1000); dire(`Bonjour ! Moi c'est ${etat.nom} 🧡`, 3500); }, 400);
    } else if (etat.absent > 3600000) {
      setTimeout(() => dire(etat.dort ? `${etat.nom} dort paisiblement 💤` : 'Te revoilà ! Tu m\'as manqué 🧡', 3000), 400);
    }
    setInterval(() => { vieillir(); sauver(); afficherJauges(); humeur(); }, 30000);
    setInterval(besoins, 20000);
    setInterval(ciel, 60000);
    setTimeout(besoins, 5000);
  }

  ciel();
  flocons();
  if (etat) {
    etat.absent = Date.now() - etat.maj;
    demarrer(false);
  } else {
    const d = $('accueil');
    d.addEventListener('cancel', (e) => e.preventDefault());
    $('form-nom').addEventListener('submit', () => {
      const nom = $('champ-nom').value.trim() || 'Renardeau';
      const choix = NOURRITURES.filter((n) => n.id !== 'biscuit');
      etat = {
        nom,
        adopte: Date.now(),
        maj: Date.now(),
        stats: { ventre: 65, bonheur: 70, pelage: 60, energie: 85 },
        dort: false,
        tenues: [],
        prefere: auHasard(choix).id,
        prefereDecouvert: false,
      };
      sauver();
      demarrer(true);
    });
    d.showModal();
  }

  document.addEventListener('visibilitychange', () => {
    if (!etat) return;
    if (document.hidden) sauver();
    else { vieillir(); sauver(); afficherJauges(); humeur(); ciel(); }
  });
})();
