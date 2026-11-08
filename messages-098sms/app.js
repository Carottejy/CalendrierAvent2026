(() => {
  'use strict';

  const CLE = 'messages-v1';
  const SEUIL_PHOTO = 6;   // chaleur nécessaire pour obtenir une photo (sur 10)
  const MAX_HISTO = 300;
  const $ = (id) => document.getElementById(id);

  // ================= État =================
  function lire() {
    try { return JSON.parse(localStorage.getItem(CLE)) || {}; } catch (e) { return {}; }
  }
  const etat = Object.assign({
    nom: null, chaleur: 0, histo: [], flags: {}, vues: [], dernierJour: null, photos: [], recents: [],
  }, lire());
  function sauver() {
    if (etat.histo.length > MAX_HISTO) etat.histo = etat.histo.slice(-MAX_HISTO);
    try { localStorage.setItem(CLE, JSON.stringify(etat)); } catch (e) { /* stockage indisponible */ }
  }

  // Les identifiants des photos (Drive) arrivent par le lien du QR code : …/#p=id1.id2…
  const params = new URLSearchParams(location.hash.slice(1));
  if (params.get('p')) {
    etat.photos = params.get('p').split('.').filter((x) => /^[\w-]{10,}$/.test(x));
    sauver();
    history.replaceState(null, '', location.pathname);
  }

  // ================= Utilitaires =================
  const auHasard = (l) => l[Math.floor(Math.random() * l.length)];
  const petitNom = () => (etat.flags.cupcake ? 'cupcake' : 'beauté');
  const perso = (t) => t.replaceAll('{nom}', etat.nom || 'beauté').replaceAll('{petitnom}', petitNom());
  const normaliser = (s) => ` ${s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ')} `;
  const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
  const aujourdhui = () => new Date().toLocaleDateString('fr-CA');

  const fil = $('fil');
  const choixEl = $('choix');
  const champ = $('champ');
  let occupe = false;
  let attendNom = false;

  function defiler() { requestAnimationFrame(() => { fil.scrollTop = fil.scrollHeight; }); }

  // ================= Affichage des messages =================
  function urlsPhoto(id) {
    return [
      `https://lh3.googleusercontent.com/d/${id}=w1000`,
      `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
    ];
  }
  function imagePhoto(id, onclick) {
    const img = document.createElement('img');
    img.referrerPolicy = 'no-referrer';
    img.alt = 'Photo de Vi';
    img.loading = 'lazy';
    const urls = urlsPhoto(id);
    let k = 0;
    img.src = urls[0];
    img.onerror = () => {
      k += 1;
      if (k < urls.length) { img.src = urls[k]; return; }
      // dernier recours : un lien pour l'ouvrir dans Drive
      const a = document.createElement('a');
      a.href = `https://drive.google.com/file/d/${id}/view`;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = '📷 Ouvrir sa photo';
      img.replaceWith(a);
    };
    if (onclick) img.addEventListener('click', () => onclick(img.src));
    return img;
  }

  function bulle(m, anime = true) {
    const b = document.createElement('div');
    b.className = `bulle ${m.de}${m.type === 'photo' ? ' photo' : ''}`;
    if (!anime) b.style.animation = 'none';
    if (m.type === 'photo') b.append(imagePhoto(m.contenu, ouvrirGrande));
    else b.textContent = m.contenu;
    fil.append(b);
    defiler();
  }

  function ajouter(de, contenu, type = 'texte') {
    const m = { de, contenu, type, t: Date.now() };
    etat.histo.push(m);
    sauver();
    bulle(m);
  }

  function statut(ecrit) {
    const s = $('statut');
    s.textContent = ecrit ? 'écrit…' : 'en ligne';
    s.classList.toggle('ecrit', ecrit);
  }

  async function viDit(texte) {
    const indic = document.createElement('div');
    indic.className = 'ecrit-bulle';
    indic.innerHTML = '<i></i><i></i><i></i>';
    fil.append(indic);
    statut(true);
    defiler();
    await attendre(Math.min(2200, 550 + texte.length * 22));
    indic.remove();
    statut(false);
    ajouter('vi', texte);
    if (navigator.vibrate) navigator.vibrate(10);
    await attendre(250);
  }

  function majChaleur() {
    const j = $('jauge');
    j.style.width = `${Math.min(100, etat.chaleur * 10)}%`;
    j.classList.toggle('pleine', etat.chaleur >= SEUIL_PHOTO);
  }
  function chauffer(n) {
    etat.chaleur = Math.max(0, Math.min(10, etat.chaleur + (n || 0)));
    sauver();
    majChaleur();
  }

  // ================= Déroulé des scènes =================
  async function jouer(id) {
    const s = SCENES[id];
    occuper(true);
    if (s.defi) await viDit(auHasard(DEFIS));
    for (const l of s.vi || []) await viDit(perso(l));
    chauffer(s.chaleur);
    if (s.flag) { etat.flags[s.flag] = true; sauver(); }
    occuper(false);
    if (s.demandeNom) { attendNom = true; champ.placeholder = 'Ton prénom…'; champ.focus(); return; }
    if (s.choix) proposer(s.choix);
    else await relancer();
  }

  async function relancer() {
    occuper(true);
    await attendre(500);
    await viDit(perso(auHasard(RELANCES)));
    occuper(false);
    proposerSujets();
  }

  function proposerSujets() {
    const dispo = SUJETS.filter((s) => !(s.unique && etat.flags[SCENES[s.go].flag]) && !etat.recents.includes(s.go));
    const tirage = [];
    const pool = dispo.length >= 3 ? dispo.slice() : SUJETS.slice();
    while (tirage.length < 3 && pool.length) tirage.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    proposer(tirage);
  }

  function proposer(liste) {
    choixEl.replaceChildren(...liste.map((c) => {
      const b = document.createElement('button');
      b.textContent = c.t;
      b.addEventListener('click', () => choisir(c));
      return b;
    }));
    defiler();
  }

  function choisir(c) {
    if (occupe) return;
    choixEl.replaceChildren();
    ajouter('moi', c.t);
    etat.recents = [c.go, ...etat.recents.filter((x) => x !== c.go)].slice(0, 5);
    sauver();
    jouer(c.go);
  }

  function occuper(o) {
    occupe = o;
    $('saisie').classList.toggle('occupe', o);
    if (o) choixEl.replaceChildren();
  }

  // ================= Photos =================
  async function demanderPhoto(texte) {
    if (occupe) return;
    choixEl.replaceChildren();
    ajouter('moi', texte || '📸 Envoie-moi une photo…');
    occuper(true);
    if (!etat.photos.length) {
      await viDit(perso(PHOTO_AUCUNE));
    } else if (etat.chaleur < SEUIL_PHOTO) {
      await viDit(perso(auHasard(PHOTO_REFUS)));
    } else {
      let restantes = etat.photos.filter((id) => !etat.vues.includes(id));
      if (!restantes.length) { restantes = etat.photos.slice(); await viDit(perso(PHOTO_REVOIR)); }
      const id = auHasard(restantes);
      await viDit(perso(auHasard(PHOTO_ENVOI)));
      const indic = document.createElement('div');
      indic.className = 'ecrit-bulle';
      indic.innerHTML = '<i></i><i></i><i></i>';
      fil.append(indic); statut(true); defiler();
      await attendre(1600);
      indic.remove(); statut(false);
      ajouter('vi', id, 'photo');
      if (!etat.vues.includes(id)) etat.vues.push(id);
      chauffer(-SEUIL_PHOTO);
      if (navigator.vibrate) navigator.vibrate([20, 40, 20]);
      await attendre(1400);
      await viDit(perso(auHasard(PHOTO_APRES)));
    }
    occuper(false);
    await relancer();
  }
  $('btn-photo').addEventListener('click', () => demanderPhoto());

  // ================= Texte libre =================
  $('saisie').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const texte = champ.value.trim();
    if (!texte || occupe) return;
    champ.value = '';
    if (attendNom) {
      attendNom = false;
      etat.nom = texte.slice(0, 20).replace(/^\w/, (c) => c.toUpperCase());
      champ.placeholder = 'Écris à Vi…';
      sauver();
      ajouter('moi', texte);
      jouer('apresNom');
      return;
    }
    const n = normaliser(texte);
    const regle = MOTS_CLES.find((r) => r.mots.some((m) => n.includes(` ${m} `) || n.includes(` ${m}`)));
    if (regle && regle.action === 'photo') { demanderPhoto(texte); return; }
    choixEl.replaceChildren();
    ajouter('moi', texte);
    if (regle && regle.go) { jouer(regle.go); return; }
    occuper(true);
    if (regle) {
      for (const l of regle.vi) await viDit(perso(l));
      chauffer(regle.chaleur);
    } else {
      await viDit(perso(auHasard(REPONSES_LIBRES)));
      chauffer(1);
    }
    occuper(false);
    await relancer();
  });

  // ================= Galerie =================
  function ouvrirGrande(src) {
    $('grande').src = src;
    $('visionneuse').hidden = false;
  }
  $('visionneuse').addEventListener('click', () => { $('visionneuse').hidden = true; });
  $('btn-galerie').addEventListener('click', () => {
    const g = $('grille');
    g.replaceChildren(...etat.vues.map((id) => imagePhoto(id, ouvrirGrande)));
    $('galerie-vide').hidden = etat.vues.length > 0;
    $('galerie').hidden = false;
  });
  $('fermer-galerie').addEventListener('click', () => { $('galerie').hidden = true; });
  $('galerie').addEventListener('click', (e) => { if (e.target.id === 'galerie') $('galerie').hidden = true; });

  // ================= Démarrage =================
  async function demarrer() {
    majChaleur();
    let jourPrec = null;
    for (const m of etat.histo) {
      const j = new Date(m.t).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
      if (j !== jourPrec) {
        const d = document.createElement('div');
        d.className = 'jour';
        d.textContent = j;
        fil.append(d);
        jourPrec = j;
      }
      bulle(m, false);
    }
    if (!etat.nom) {
      etat.histo = [];
      fil.replaceChildren();
      await attendre(600);
      etat.dernierJour = aujourdhui();
      sauver();
      jouer('debut');
      return;
    }
    if (etat.dernierJour !== aujourdhui()) {
      etat.dernierJour = aujourdhui();
      sauver();
      occuper(true);
      await attendre(700);
      await viDit(perso(auHasard(BONJOURS)));
      occuper(false);
    }
    proposerSujets();
  }
  demarrer();
})();
