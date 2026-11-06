(() => {
  'use strict';

  // ---------- Dates (heure de Paris) ----------
  const PREMIER_JOUR = Date.UTC(2026, 11, 1); // 1er décembre 2026 = défi n°1
  const fmt = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  });
  function maintenant() {
    const o = {};
    fmt.formatToParts(new Date()).forEach((x) => { o[x.type] = x.value; });
    return o;
  }
  function utcDuJour(decalage = 0) {
    const o = maintenant();
    return Date.UTC(+o.year, +o.month - 1, +o.day + decalage);
  }
  const cleJour = (decalage = 0) => new Date(utcDuJour(decalage)).toISOString().slice(0, 10);
  const numeroDuJour = () => Math.round((utcDuJour() - PREMIER_JOUR) / 86400000);
  function secondesAvantMinuit() {
    const o = maintenant();
    return 86400 - (+o.hour * 3600 + +o.minute * 60 + +o.second);
  }

  // ---------- Tirage du jour (identique pour tout le monde) ----------
  function prng(graine) {
    return () => {
      graine = (graine + 0x6D2B79F5) | 0;
      let t = Math.imul(graine ^ (graine >>> 15), 1 | graine);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function melange(liste, graine) {
    const a = liste.slice();
    const r = prng(graine);
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const modulo = (n, m) => ((n % m) + m) % m;

  const PAR_NOM = Object.fromEntries(PERSONNAGES.map((p) => [p.nom, p]));
  const MONSTRE_PAR_NOM = Object.fromEntries(MONSTRES.map((m) => [m.nom, m]));

  const MODES = {
    classique: { candidats: PERSONNAGES.map((p) => p.nom), graine: 1305, icone: '🗂️' },
    emojis: { candidats: Object.keys(EMOJIS), graine: 2005, icone: '😈' },
    monstres: { candidats: MONSTRES.map((m) => m.nom), graine: 6606, icone: '🐺' },
  };

  function cibleDuJour(mode) {
    const n = numeroDuJour();
    const ordre = melange(MODES[mode].candidats, MODES[mode].graine);
    let cible = ordre[modulo(n, ordre.length)];
    if (mode === 'emojis') {
      // éviter le même personnage que le mode Classique le même jour
      const classique = cibleDuJour('classique');
      if (cible === classique) cible = ordre[modulo(n + 1, ordre.length)];
    }
    return cible;
  }

  // ---------- Sauvegarde ----------
  const CLE = 'spndle-v1';
  function lire() {
    try { return JSON.parse(localStorage.getItem(CLE)) || {}; } catch (e) { return {}; }
  }
  function ecrire(d) {
    try { localStorage.setItem(CLE, JSON.stringify(d)); } catch (e) { /* stockage indisponible */ }
  }

  const etat = {};
  function partie(mode) {
    const p = etat[mode];
    if (p && (p.libre || p.jour === cleJour())) return p;
    const enregistree = (lire().parties || {})[mode];
    const nouvelle = enregistree && enregistree.jour === cleJour()
      ? enregistree
      : { jour: cleJour(), essais: [], gagne: false, interprete: false };
    nouvelle.cible = cibleDuJour(mode);
    etat[mode] = nouvelle;
    return nouvelle;
  }
  function sauver(mode, p) {
    if (p.libre) return;
    const d = lire();
    d.parties = d.parties || {};
    const { cible, ...reste } = p;
    d.parties[mode] = reste;
    ecrire(d);
  }
  function statsDe(mode) {
    return ((lire().stats || {})[mode]) || { victoires: 0, serie: 0, record: 0, dernier: null };
  }
  function enregistrerVictoire(mode) {
    const d = lire();
    d.stats = d.stats || {};
    const s = statsDe(mode);
    if (s.dernier === cleJour()) return;
    s.serie = s.dernier === cleJour(-1) ? s.serie + 1 : 1;
    s.victoires += 1;
    s.record = Math.max(s.record, s.serie);
    s.dernier = cleJour();
    d.stats[mode] = s;
    ecrire(d);
  }
  function gagneAujourdhui(mode) {
    const p = (lire().parties || {})[mode];
    return !!(p && p.jour === cleJour() && p.gagne);
  }

  // ---------- Petit utilitaire DOM ----------
  function h(tag, attrs, ...enfants) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else if (k === 'style') e.setAttribute('style', v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const c of enfants.flat()) {
      if (c == null || c === false) continue;
      e.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
    return e;
  }
  const normaliser = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  function toast(texte) {
    const t = h('div', { class: 'toast', role: 'status' }, texte);
    document.body.append(t);
    setTimeout(() => t.remove(), 2200);
  }

  // ---------- Champ de saisie avec suggestions ----------
  function champ(options, placeholder, onChoix) {
    const input = h('input', {
      type: 'text', placeholder, autocomplete: 'off', autocapitalize: 'off',
      spellcheck: 'false', enterkeyhint: 'done', 'aria-label': placeholder,
    });
    const liste = h('ul', { class: 'suggestions', hidden: true, role: 'listbox' });
    let resultats = [];
    let actif = 0;

    function afficher() {
      const q = normaliser(input.value.trim());
      if (!q) { liste.hidden = true; resultats = []; return; }
      resultats = options.filter((o) => {
        const n = normaliser(o.nom);
        return n.startsWith(q) || n.split(/[\s()'’-]+/).some((m) => m.startsWith(q));
      }).slice(0, 8);
      actif = 0;
      liste.replaceChildren(...resultats.map((o, i) => h('li', {
        class: i === actif ? 'actif' : null, role: 'option',
        onpointerdown: (ev) => { ev.preventDefault(); choisir(o.nom); },
      }, o.nom, o.sous ? h('small', {}, ' · ', o.sous) : null)));
      liste.hidden = resultats.length === 0;
    }
    function choisir(nom) {
      input.value = '';
      liste.hidden = true;
      onChoix(nom);
    }
    input.addEventListener('input', afficher);
    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' && resultats.length) { ev.preventDefault(); choisir(resultats[actif].nom); }
      if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
        ev.preventDefault();
        if (!resultats.length) return;
        actif = modulo(actif + (ev.key === 'ArrowDown' ? 1 : -1), resultats.length);
        [...liste.children].forEach((li, i) => li.classList.toggle('actif', i === actif));
      }
    });
    input.addEventListener('blur', () => setTimeout(() => { liste.hidden = true; }, 150));
    const wrap = h('div', { class: 'saisie' }, input, liste);
    wrap.focus = () => input.focus({ preventScroll: true });
    return wrap;
  }

  // ---------- Encadré de victoire ----------
  function encadreVictoire(mode, p, nomAffiche) {
    const n = p.essais.length;
    const s = statsDe(mode);
    return h('div', { class: 'carte victoire' },
      h('div', { class: 'tampon' }, 'AFFAIRE CLASSÉE'),
      h('p', { class: 'reponse' }, nomAffiche),
      h('p', {}, `Trouvé en ${n} essai${n > 1 ? 's' : ''}`),
      p.libre ? null : h('div', { class: 'stats' },
        h('div', {}, h('strong', {}, s.victoires), 'victoires'),
        h('div', {}, h('strong', {}, s.serie), 'série'),
        h('div', {}, h('strong', {}, s.record), 'record')),
      h('div', { class: 'boutons' },
        p.libre ? null : h('button', { class: 'btn', onclick: () => partager(mode, p) }, 'Partager'),
        h('button', { class: 'btn secondaire', onclick: () => partieLibre(mode) }, 'Partie libre'),
        p.libre ? h('button', { class: 'btn secondaire', onclick: () => retourDuJour(mode) }, 'Défi du jour') : null),
      p.libre ? null : h('p', { class: 'compte' }, 'Prochain dossier dans ', h('span', { class: 'compte-val' }, compteARebours())));
  }

  function bandeauLibre(mode, p) {
    if (!p.libre) return null;
    return h('p', { class: 'libre-bandeau' }, 'Partie libre · ',
      h('a', { href: '#', style: 'color:inherit', onclick: (e) => { e.preventDefault(); retourDuJour(mode); } }, 'revenir au défi du jour'));
  }

  // ---------- Mode Classique ----------
  const COLONNES = ['Perso', 'Genre', 'Espèce', 'Affiliations', 'Relation', '1re saison', 'Der\u00adnière saison'];
  const COURT = { 'Hommes de Lettres britanniques': 'HdL (GB)', 'Hommes de Lettres': 'HdL', "Cavaliers de l'Apocalypse": 'Cavaliers', "Chevaliers de l'Enfer": "Chevaliers de l'Enfer" };

  function comparer(g, c) {
    const egal = (a, b) => (a === b ? 'vert' : 'rouge');
    const ag = new Set(g.affiliations);
    const ac = new Set(c.affiliations);
    let aff = 'rouge';
    if (ag.size === ac.size && [...ag].every((x) => ac.has(x))) aff = 'vert';
    else if ([...ag].some((x) => ac.has(x))) aff = 'orange';
    const saison = (v, t) => ({
      texte: `S${v}`, cls: egal(v, t), fleche: v === t ? '' : (t > v ? '↑' : '↓'),
    });
    return [
      { texte: g.nom, cls: 'nom' },
      { texte: g.genre, cls: egal(g.genre, c.genre) },
      { texte: g.espece, cls: egal(g.espece, c.espece) },
      { texte: g.affiliations.map((x) => COURT[x] || x).join(', ') || 'Aucune', cls: aff },
      { texte: g.relation, cls: egal(g.relation, c.relation) },
      saison(g.debut, c.debut),
      saison(g.fin, c.fin),
    ];
  }

  function rendreClassique(p, anime) {
    const cible = PAR_NOM[p.cible];
    const erreurs = p.essais.length - (p.gagne ? 1 : 0);
    const restants = Math.max(0, 6 - erreurs);
    const options = PERSONNAGES.filter((x) => !p.essais.includes(x.nom)).map((x) => ({ nom: x.nom, sous: x.espece }));

    const zone = [];
    zone.push(h('div', { class: 'carte' },
      h('h2', {}, 'Qui se cache dans ce dossier ?'),
      h('p', { class: 'consigne' }, 'Propose un personnage de la série.'),
      h('div', { class: 'indice-bonus' },
        p.interprete || p.gagne
          ? h('p', {}, '🎭 Interprété par ', h('b', {}, cible.acteur))
          : h('button', {
            disabled: restants > 0,
            onclick: () => { p.interprete = true; sauver('classique', p); rendre(); },
          }, restants > 0 ? `🎭 Indice « interprète » dans ${restants} essai${restants > 1 ? 's' : ''}` : '🎭 Révéler l\'interprète'))));

    const champSaisie = p.gagne ? null : champ(options, 'Tape un nom…', (nom) => proposer('classique', nom));
    if (champSaisie) zone.push(champSaisie);
    if (p.gagne) zone.push(encadreVictoire('classique', p, cible.nom));

    if (p.essais.length) {
      const grille = h('div', { class: 'grille' }, COLONNES.map((c) => h('div', { class: 'entete' }, c)));
      [...p.essais].reverse().forEach((nom, idx) => {
        const nouveau = anime && idx === 0;
        comparer(PAR_NOM[nom], cible).forEach((cell, i) => {
          grille.append(h('div', {
            class: `case ${cell.cls}`,
            style: nouveau ? `animation-delay:${i * 0.15}s` : 'animation:none;opacity:1;transform:none',
          }, cell.fleche ? h('span', {}, cell.texte, h('span', { class: 'fleche' }, cell.fleche)) : cell.texte));
        });
      });
      zone.push(h('div', { class: 'grille-wrap', style: 'margin-top:1rem' }, grille));
      zone.push(h('div', { class: 'legende' },
        h('span', {}, h('i', { style: 'background:var(--vert)' }), 'Identique'),
        h('span', {}, h('i', { style: 'background:var(--orange)' }), 'En partie'),
        h('span', {}, h('i', { style: 'background:var(--rouge)' }), 'Différent'),
        h('span', {}, '↑↓ saison plus tard / plus tôt')));
    }
    return { zone, champSaisie };
  }

  // ---------- Mode Émojis ----------
  function rendreEmojis(p, anime) {
    const emojis = EMOJIS[p.cible];
    const erreurs = p.essais.length - (p.gagne ? 1 : 0);
    const visibles = p.gagne ? 4 : Math.min(4, 1 + erreurs);
    const options = PERSONNAGES.filter((x) => !p.essais.includes(x.nom)).map((x) => ({ nom: x.nom, sous: x.espece }));

    const zone = [h('div', { class: 'carte' },
      h('h2', {}, 'Quel personnage se cache derrière ces émojis ?'),
      h('div', { class: 'emojis' }, emojis.map((e, i) => (i < visibles
        ? h('span', {}, e)
        : h('span', { class: 'cache' }, '?')))),
      p.gagne ? null : h('p', { class: 'consigne' },
        visibles < 4 ? 'Chaque erreur dévoile un émoji de plus.' : 'Tous les émojis sont dévoilés !'))];

    const champSaisie = p.gagne ? null : champ(options, 'Tape un nom…', (nom) => proposer('emojis', nom));
    if (champSaisie) zone.push(champSaisie);
    if (p.gagne) zone.push(encadreVictoire('emojis', p, p.cible));
    zone.push(listeEssais(p, anime));
    return { zone, champSaisie };
  }

  // ---------- Mode Monstres ----------
  function rendreMonstres(p, anime) {
    const monstre = MONSTRE_PAR_NOM[p.cible];
    const erreurs = p.essais.length - (p.gagne ? 1 : 0);
    const visibles = p.gagne ? 4 : Math.min(4, 1 + erreurs);
    const options = MONSTRES.filter((x) => !p.essais.includes(x.nom)).map((x) => ({ nom: x.nom }));

    const zone = [h('div', { class: 'carte' },
      h('h2', {}, 'Quelle créature les frères traquent-ils ?'),
      h('ol', { class: 'indices' }, monstre.indices.map((t, i) => (i < visibles
        ? h('li', {}, t)
        : h('li', { class: 'cache' }, `Indice verrouillé : encore ${i - visibles + 1} erreur${i - visibles + 1 > 1 ? 's' : ''}`)))))];

    const champSaisie = p.gagne ? null : champ(options, 'Tape une créature…', (nom) => proposer('monstres', nom));
    if (champSaisie) zone.push(champSaisie);
    if (p.gagne) zone.push(encadreVictoire('monstres', p, monstre.nom));
    zone.push(listeEssais(p, anime));
    return { zone, champSaisie };
  }

  function listeEssais(p, anime) {
    return h('div', { class: 'essais' }, [...p.essais].reverse().map((nom, idx) => h('div', {
      class: `essai ${nom === p.cible ? 'vert' : 'rouge'}`,
      style: anime && idx === 0 ? null : 'animation:none',
    }, `${nom === p.cible ? '✓' : '✗'}  ${nom}`)));
  }

  // ---------- Actions ----------
  let modeCourant = 'classique';

  function proposer(mode, nom) {
    const p = partie(mode);
    if (p.gagne || p.essais.includes(nom)) return;
    p.essais.push(nom);
    if (nom === p.cible) {
      p.gagne = true;
      if (!p.libre) enregistrerVictoire(mode);
    }
    sauver(mode, p);
    rendre({ anime: true, focus: !p.gagne });
  }

  function partieLibre(mode) {
    const autres = MODES[mode].candidats.filter((c) => c !== partie(mode).cible);
    etat[mode] = {
      libre: true, essais: [], gagne: false, interprete: false,
      cible: autres[Math.floor(Math.random() * autres.length)],
    };
    rendre({ focus: true });
  }
  function retourDuJour(mode) {
    delete etat[mode];
    rendre();
  }

  function partager(mode, p) {
    const n = p.essais.length;
    let texte = `SPNdle #${numeroDuJour() + 1} ${MODES[mode].icone} trouvé en ${n} essai${n > 1 ? 's' : ''}`;
    if (mode === 'classique') {
      const carre = { vert: '🟩', orange: '🟧', rouge: '🟥' };
      const lignes = p.essais.map((nom) => comparer(PAR_NOM[nom], PAR_NOM[p.cible]).slice(1).map((c) => carre[c.cls]).join(''));
      texte += '\n' + (lignes.length > 8 ? [...lignes.slice(0, 3), '…', ...lignes.slice(-4)] : lignes).join('\n');
    }
    if (navigator.share) {
      navigator.share({ text: texte }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(texte).then(() => toast('Résultat copié !'), () => toast(texte));
    } else {
      toast(texte);
    }
  }

  function compteARebours() {
    const s = secondesAvantMinuit();
    const pad = (x) => String(x).padStart(2, '0');
    return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  }

  // ---------- Rendu ----------
  const jeu = document.getElementById('jeu');
  const onglets = document.getElementById('onglets');

  function rendre(opts = {}) {
    const p = partie(modeCourant);
    const rendu = { classique: rendreClassique, emojis: rendreEmojis, monstres: rendreMonstres }[modeCourant](p, opts.anime);
    jeu.replaceChildren(...[bandeauLibre(modeCourant, p), ...rendu.zone].filter(Boolean));
    if (opts.focus && rendu.champSaisie) rendu.champSaisie.focus();

    onglets.querySelectorAll('button').forEach((b) => {
      b.setAttribute('aria-selected', String(b.dataset.mode === modeCourant));
      b.querySelector('.fait').textContent = gagneAujourdhui(b.dataset.mode) ? '✓ résolu' : '';
    });
  }

  onglets.addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    modeCourant = b.dataset.mode;
    rendre();
  });

  // Compte à rebours et changement de jour à minuit
  let jourAffiche = cleJour();
  setInterval(() => {
    if (cleJour() !== jourAffiche) {
      jourAffiche = cleJour();
      Object.keys(etat).forEach((m) => { if (!etat[m].libre) delete etat[m]; });
      rendre();
      return;
    }
    document.querySelectorAll('.compte-val').forEach((e) => { e.textContent = compteARebours(); });
  }, 1000);

  // Aide
  const aide = document.getElementById('aide');
  const ouvrirAide = () => (aide.showModal ? aide.showModal() : aide.setAttribute('open', ''));
  const fermerAide = () => (aide.close ? aide.close() : aide.removeAttribute('open'));
  document.getElementById('btn-aide').addEventListener('click', ouvrirAide);
  document.getElementById('fermer-aide').addEventListener('click', fermerAide);
  aide.addEventListener('click', (e) => { if (e.target === aide) fermerAide(); });

  // Démarrage : premier mode non résolu
  modeCourant = Object.keys(MODES).find((m) => !gagneAujourdhui(m)) || 'classique';
  rendre();
  const d = lire();
  if (!d.vu) { d.vu = true; ecrire(d); ouvrirAide(); }
})();
