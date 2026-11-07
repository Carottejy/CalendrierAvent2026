// Les 24 créatures de Noël et leur dessin (SVG généré à partir de quelques traits).
const CREATURES = [
  { nom: 'Flocounet', corps: 'rond', couleur: '#bfe3ff', ventre: '#ffffff', yeux: 'ronds', tete: 'flocon', objet: 'aucun', rarete: 'commun', desc: 'Il naît dans le tout premier flocon de l\'hiver et adore se poser sur le bout des nez.' },
  { nom: 'Sucrelune', corps: 'goutte', couleur: '#ffc4d6', ventre: '#ffffff', yeux: 'joyeux', tete: 'noeud', objet: 'sucre', rarete: 'commun', desc: 'Elle laisse derrière elle un parfum de sucre d\'orge.' },
  { nom: 'Gui-Gui', corps: 'haricot', couleur: '#9ccf7a', ventre: '#e9f6d8', yeux: 'ronds', tete: 'gui', objet: 'aucun', rarete: 'commun', desc: 'Il se cache au-dessus des portes en espérant surprendre un bisou.' },
  { nom: 'Pompinou', corps: 'rond', couleur: '#ff7b6b', ventre: '#ffe3d8', yeux: 'joyeux', tete: 'bonnet', objet: 'aucun', rarete: 'commun', desc: 'Son bonnet est plus grand que lui, mais il refuse d\'en changer.' },
  { nom: 'Renneki', corps: 'poire', couleur: '#b07a4f', ventre: '#f0d8bf', yeux: 'ronds', tete: 'bois', objet: 'cloche', rarete: 'commun', desc: 'Un tout petit renne qui s\'entraîne en secret pour la grande tournée.' },
  { nom: 'Givrette', corps: 'goutte', couleur: '#d6f1ff', ventre: '#ffffff', yeux: 'endormis', tete: 'pompon', objet: 'aucun', motif: 'etoiles', rarete: 'commun', desc: 'La nuit, elle dessine des fougères de givre sur les vitres.' },
  { nom: 'Cannelou', corps: 'haricot', couleur: '#c98b52', ventre: '#f3dcc0', yeux: 'joyeux', tete: 'oreilles', objet: 'echarpe', rarete: 'commun', desc: 'Il sent bon la cannelle et ronronne près des cheminées.' },
  { nom: 'Clochinette', corps: 'poire', couleur: '#ffe08a', ventre: '#fff6d5', yeux: 'ronds', tete: 'antenne', objet: 'cloche', rarete: 'commun', desc: 'On l\'entend tinter bien avant de la voir.' },
  { nom: 'Pain d\'Épicou', corps: 'rond', couleur: '#c47a3a', ventre: '#c47a3a', yeux: 'joyeux', tete: 'aucun', objet: 'aucun', motif: 'glacage', rarete: 'commun', desc: 'Croustillant dehors, moelleux dedans. Surtout ne pas le tremper dans le lait.' },
  { nom: 'Sapinou', corps: 'sapin', couleur: '#2e8b57', ventre: '#2e8b57', yeux: 'ronds', tete: 'etoile', objet: 'aucun', motif: 'boules', rarete: 'commun', desc: 'Il rêve qu\'on l\'illumine chaque soir de décembre.' },
  { nom: 'Guirlandine', corps: 'haricot', couleur: '#b48cff', ventre: '#efe6ff', yeux: 'joyeux', tete: 'noeud', objet: 'boule', motif: 'rayures', rarete: 'commun', desc: 'Elle s\'enroule autour des rampes d\'escalier pour faire la sieste.' },
  { nom: 'Moufflon', corps: 'rond', couleur: '#ece4d2', ventre: '#ffffff', yeux: 'endormis', tete: 'oreilles', objet: 'echarpe', rarete: 'commun', desc: 'Il dort roulé en boule au fond des moufles oubliées.' },
  { nom: 'Chocolune', corps: 'goutte', couleur: '#7a4a2a', ventre: '#b58660', yeux: 'grands', tete: 'pompon', objet: 'aucun', rarete: 'commun', desc: 'Elle fond de bonheur au premier rayon de soleil.' },
  { nom: 'Marronet', corps: 'poire', couleur: '#8a5a3b', ventre: '#d9b38c', yeux: 'joyeux', tete: 'antenne', objet: 'echarpe', rarete: 'commun', desc: 'Toujours un peu grillé, toujours bien au chaud.' },
  { nom: 'Lutinou', corps: 'poire', couleur: '#7bc96f', ventre: '#e6f7df', yeux: 'joyeux', tete: 'lutin', objet: 'cadeau', rarete: 'rare', desc: 'Il emballe les cadeaux plus vite que son ombre.' },
  { nom: 'Neigeot', corps: 'rond', couleur: '#ffffff', ventre: '#eef4fb', yeux: 'ronds', tete: 'chapeau', objet: 'echarpe', rarete: 'commun', desc: 'Il a perdu sa carotte et la cherche partout.' },
  { nom: 'Papillotte', corps: 'haricot', couleur: '#ff9ecf', ventre: '#ffe6f2', yeux: 'grands', tete: 'noeud', objet: 'aucun', motif: 'rayures', rarete: 'commun', desc: 'Elle cache une blague dans chacune de ses poches.' },
  { nom: 'Bougie-Bou', corps: 'goutte', couleur: '#fff0c2', ventre: '#ffffff', yeux: 'endormis', tete: 'flamme', objet: 'aucun', rarete: 'rare', desc: 'Sa petite flamme ne s\'éteint jamais, même sous la neige.' },
  { nom: 'Houxlala', corps: 'rond', couleur: '#d2453a', ventre: '#ffd6d0', yeux: 'joyeux', tete: 'gui', objet: 'sucre', rarete: 'commun', desc: 'Il pique un peu quand on le caresse à rebrousse-poil.' },
  { nom: 'Biscornu', corps: 'haricot', couleur: '#e0b16a', ventre: '#f6e2bd', yeux: 'ronds', tete: 'antenne', objet: 'cadeau', motif: 'vermicelles', rarete: 'commun', desc: 'Un biscuit raté devenu la créature la plus fière du Pôle.' },
  { nom: 'Étoilin', corps: 'goutte', couleur: '#ffd84a', ventre: '#fff6c8', yeux: 'etoiles', tete: 'etoile', objet: 'aucun', rarete: 'rare', desc: 'Tombé du sommet d\'un sapin, il cherche le chemin du retour.' },
  { nom: 'Aurorine', corps: 'poire', couleur: '#7fe0d0', ventre: '#e3fbf6', yeux: 'etoiles', tete: 'antenne', objet: 'boule', motif: 'etoiles', rarete: 'rare', desc: 'Elle danse dans le ciel du Grand Nord les nuits claires.' },
  { nom: 'Polochon', corps: 'rond', couleur: '#f4f7fb', ventre: '#ffffff', yeux: 'endormis', tete: 'oreilles', objet: 'echarpe', rarete: 'legendaire', desc: 'Un ours polaire si câlin qu\'on ne peut pas s\'empêcher de le serrer fort.' },
  { nom: 'Grand Nowel', corps: 'poire', couleur: '#d62f2f', ventre: '#ffffff', yeux: 'joyeux', tete: 'couronne', objet: 'cadeau', rarete: 'legendaire', desc: 'Le roi des créatures de Noël. On dit qu\'il exauce un vœu à qui l\'attrape.' },
];

const RARETES = {
  commun: { nom: 'Commune', couleur: '#7aa7c7', chance: 0.8, vitesse: 1 },
  rare: { nom: 'Rare', couleur: '#b06fd8', chance: 0.55, vitesse: 1.5 },
  legendaire: { nom: 'Légendaire', couleur: '#e3a21a', chance: 0.38, vitesse: 2 },
};

function dessinerCreature(c, id = 'c') {
  const fonce = assombrir(c.couleur, 0.28);
  const corps = {
    rond: { d: 'M100 66 C 140 66, 158 98, 158 124 C 158 158, 132 178, 100 178 C 68 178, 42 158, 42 124 C 42 98, 60 66, 100 66 Z', haut: 66, yeux: 112, ventre: [100, 148, 34, 28] },
    goutte: { d: 'M100 44 C 128 78, 158 106, 158 136 C 158 164, 132 178, 100 178 C 68 178, 42 164, 42 136 C 42 106, 72 78, 100 44 Z', haut: 50, yeux: 118, ventre: [100, 152, 32, 24] },
    poire: { d: 'M100 52 C 126 52, 138 74, 134 96 C 158 110, 166 172, 100 178 C 34 172, 42 110, 66 96 C 62 74, 74 52, 100 52 Z', haut: 54, yeux: 86, ventre: [100, 145, 36, 30] },
    haricot: { d: 'M100 84 C 150 84, 172 106, 172 132 C 172 160, 142 178, 100 178 C 58 178, 28 160, 28 132 C 28 106, 50 84, 100 84 Z', haut: 86, yeux: 120, ventre: [100, 156, 40, 20] },
    sapin: { d: 'M100 46 C 104 46, 162 158, 160 166 C 158 176, 42 176, 40 166 C 38 158, 96 46, 100 46 Z', haut: 50, yeux: 124, ventre: [100, 160, 0, 0] },
  }[c.corps];
  const y = corps.yeux;
  const h = corps.haut;
  const p = [];

  p.push('<ellipse cx="100" cy="184" rx="52" ry="8" fill="rgba(0,0,0,.18)"/>');
  // pieds et bras
  p.push(`<ellipse cx="78" cy="178" rx="15" ry="8" fill="${fonce}"/><ellipse cx="122" cy="178" rx="15" ry="8" fill="${fonce}"/>`);
  const bx = c.corps === 'haricot' ? 30 : 46;
  p.push(`<ellipse cx="${bx}" cy="${y + 34}" rx="10" ry="14" fill="${c.couleur}" stroke="${fonce}" stroke-width="3" transform="rotate(25 ${bx} ${y + 34})"/>`);
  p.push(`<ellipse cx="${200 - bx}" cy="${y + 34}" rx="10" ry="14" fill="${c.couleur}" stroke="${fonce}" stroke-width="3" transform="rotate(-25 ${200 - bx} ${y + 34})"/>`);

  // corps
  p.push(`<clipPath id="${id}-clip"><path d="${corps.d}"/></clipPath>`);
  p.push(`<path d="${corps.d}" fill="${c.couleur}" stroke="${fonce}" stroke-width="3.5" stroke-linejoin="round"/>`);
  p.push(`<g clip-path="url(#${id}-clip)">`);
  if (corps.ventre[2]) p.push(`<ellipse cx="${corps.ventre[0]}" cy="${corps.ventre[1]}" rx="${corps.ventre[2]}" ry="${corps.ventre[3]}" fill="${c.ventre}"/>`);
  p.push(motif(c, y));
  p.push(`<ellipse cx="78" cy="${h + 22}" rx="16" ry="9" fill="#fff" opacity=".35" transform="rotate(-25 78 ${h + 22})"/>`);
  p.push('</g>');

  // visage
  p.push(yeux(c.yeux, y));
  p.push(`<ellipse cx="68" cy="${y + 16}" rx="8" ry="5" fill="#ff8fa3" opacity=".55"/><ellipse cx="132" cy="${y + 16}" rx="8" ry="5" fill="#ff8fa3" opacity=".55"/>`);
  p.push(c.yeux === 'grands'
    ? `<ellipse cx="100" cy="${y + 22}" rx="6" ry="5" fill="#5a2320"/>`
    : `<path d="M91 ${y + 17} Q100 ${y + 26} 109 ${y + 17}" fill="none" stroke="#3a2420" stroke-width="3" stroke-linecap="round"/>`);

  p.push(tete(c.tete, h, c.couleur, fonce));
  p.push(objet(c.objet, y));
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">${p.join('')}</svg>`;
}

function yeux(type, y) {
  const g = 76; const d = 124;
  switch (type) {
    case 'joyeux':
      return `<g fill="none" stroke="#2b1b17" stroke-width="4.5" stroke-linecap="round"><path d="M${g - 9} ${y + 3} Q${g} ${y - 8} ${g + 9} ${y + 3}"/><path d="M${d - 9} ${y + 3} Q${d} ${y - 8} ${d + 9} ${y + 3}"/></g>`;
    case 'endormis':
      return `<g fill="none" stroke="#2b1b17" stroke-width="4" stroke-linecap="round"><path d="M${g - 9} ${y} Q${g} ${y + 7} ${g + 9} ${y}"/><path d="M${d - 9} ${y} Q${d} ${y + 7} ${d + 9} ${y}"/></g>`;
    case 'grands':
      return [g, d].map((x) => `<ellipse cx="${x}" cy="${y}" rx="12" ry="14" fill="#fff" stroke="#2b1b17" stroke-width="2"/><ellipse cx="${x + 2}" cy="${y + 2}" rx="7" ry="9" fill="#2b1b17"/><circle cx="${x + 5}" cy="${y - 2}" r="3" fill="#fff"/>`).join('');
    case 'etoiles':
      return [g, d].map((x) => `<ellipse cx="${x}" cy="${y}" rx="8" ry="10" fill="#2b1b17"/><path d="M${x + 2} ${y - 7} l1.6 3.4 3.6 .4 -2.7 2.4 .8 3.6 -3.3 -1.9 -3.3 1.9 .8 -3.6 -2.7 -2.4 3.6 -.4 Z" fill="#fff"/>`).join('');
    default:
      return [g, d].map((x) => `<ellipse cx="${x}" cy="${y}" rx="8" ry="10" fill="#2b1b17"/><circle cx="${x + 3}" cy="${y - 4}" r="3.2" fill="#fff"/>`).join('');
  }
}

function motif(c, y) {
  switch (c.motif) {
    case 'rayures':
      return [0, 1, 2, 3, 4, 5].map((i) => `<rect x="${10 + i * 34}" y="40" width="12" height="160" fill="#fff" opacity=".45" transform="rotate(25 100 120)"/>`).join('');
    case 'etoiles':
      return [[64, y + 40], [138, y + 44], [118, y + 66], [80, y + 70], [150, y - 10]].map(([x, yy]) => `<path d="M${x} ${yy - 6} l1.8 4 4.3 .5 -3.2 2.9 .9 4.2 -3.8 -2.2 -3.8 2.2 .9 -4.2 -3.2 -2.9 4.3 -.5 Z" fill="#fff" opacity=".8"/>`).join('');
    case 'glacage':
      return `<path d="M50 ${y + 38} q12 -10 24 0 t24 0 t24 0 t24 0 t24 0" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><g fill="#fff"><circle cx="100" cy="${y + 52}" r="5"/><circle cx="100" cy="${y + 68}" r="5"/></g><path d="M58 ${y - 22} q10 -8 20 0 M122 ${y - 22} q10 -8 20 0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    case 'boules':
      return [[78, 150, '#e74c3c'], [124, 146, '#f1c40f'], [100, 98, '#3498db'], [140, 166, '#e74c3c'], [62, 168, '#f1c40f']].map(([x, yy, col]) => `<circle cx="${x}" cy="${yy}" r="6" fill="${col}" stroke="rgba(0,0,0,.2)"/>`).join('')
        + '<path d="M70 96 Q100 112 128 92 M56 132 Q100 148 146 126" stroke="#fff3a8" stroke-width="3" fill="none" stroke-dasharray="2 6" stroke-linecap="round"/>';
    case 'vermicelles':
      return [[70, 110, 30], [130, 104, -20], [88, 160, 60], [140, 150, 10], [60, 140, -40], [112, 128, 80]].map(([x, yy, r], i) => `<rect x="${x - 5}" y="${yy - 2}" width="10" height="4" rx="2" fill="${['#ff6fa8', '#5fd0ff', '#fff36a', '#8ce06f'][i % 4]}" transform="rotate(${r} ${x} ${yy})"/>`).join('');
    default:
      return '';
  }
}

function tete(type, h, couleur, fonce) {
  switch (type) {
    case 'bonnet':
      return `<path d="M58 ${h + 14} Q 92 ${h - 48} 146 ${h - 36} Q 132 ${h - 10} 142 ${h + 14} Z" fill="#d62f2f" stroke="#a51f1f" stroke-width="2"/><rect x="52" y="${h + 4}" width="96" height="18" rx="9" fill="#fff"/><circle cx="148" cy="${h - 36}" r="11" fill="#fff"/>`;
    case 'lutin':
      return `<path d="M62 ${h + 12} L 142 ${h - 38} L 138 ${h + 12} Z" fill="#2f9e44" stroke="#1f7a33" stroke-width="2" stroke-linejoin="round"/><rect x="58" y="${h + 4}" width="84" height="14" rx="7" fill="#d62f2f"/><circle cx="144" cy="${h - 40}" r="7" fill="#ffd43b" stroke="#c99a00"/>`;
    case 'chapeau':
      return `<rect x="72" y="${h - 34}" width="56" height="42" rx="4" fill="#222"/><rect x="60" y="${h + 4}" width="80" height="9" rx="4" fill="#222"/><rect x="72" y="${h - 4}" width="56" height="8" fill="#d62f2f"/>`;
    case 'bois':
      return `<g fill="none" stroke="#7a4a24" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="M82 ${h + 8} L 70 ${h - 24} L 56 ${h - 34} M70 ${h - 24} L 78 ${h - 44}"/><path d="M118 ${h + 8} L 130 ${h - 24} L 144 ${h - 34} M130 ${h - 24} L 122 ${h - 44}"/></g>`;
    case 'etoile':
      return `<path d="M100 ${h - 44} l7 15 16 2 -12 11 3 16 -14 -8 -14 8 3 -16 -12 -11 16 -2 Z" fill="#ffd43b" stroke="#e0a800" stroke-width="2.5" stroke-linejoin="round"/>`;
    case 'gui':
      return `<g transform="translate(70 ${h + 2}) rotate(-20)"><ellipse cx="-12" cy="-6" rx="14" ry="7" fill="#3c9a4b" transform="rotate(-30 -12 -6)"/><ellipse cx="12" cy="-6" rx="14" ry="7" fill="#3c9a4b" transform="rotate(30 12 -6)"/><circle cx="-3" cy="2" r="5" fill="#e03131"/><circle cx="5" cy="3" r="5" fill="#e03131"/><circle cx="1" cy="-4" r="5" fill="#e03131"/></g>`;
    case 'oreilles':
      return `<circle cx="66" cy="${h + 12}" r="15" fill="${couleur}" stroke="${fonce}" stroke-width="3.5"/><circle cx="66" cy="${h + 12}" r="7" fill="#ffb3c1"/><circle cx="134" cy="${h + 12}" r="15" fill="${couleur}" stroke="${fonce}" stroke-width="3.5"/><circle cx="134" cy="${h + 12}" r="7" fill="#ffb3c1"/>`;
    case 'flocon':
      return `<g transform="translate(100 ${h - 22})" stroke="#fff" stroke-width="4" stroke-linecap="round"><path d="M0 -16 V16 M-14 -8 L14 8 M-14 8 L14 -8"/><path d="M-4 -12 L0 -8 L4 -12 M-4 12 L0 8 L4 12" fill="none" stroke-width="3"/></g>`;
    case 'couronne':
      return `<path d="M70 ${h + 8} L 66 ${h - 28} L 84 ${h - 12} L 100 ${h - 36} L 116 ${h - 12} L 134 ${h - 28} L 130 ${h + 8} Z" fill="#ffd43b" stroke="#c99a00" stroke-width="2.5" stroke-linejoin="round"/><circle cx="100" cy="${h - 4}" r="5" fill="#e03131"/><circle cx="82" cy="${h}" r="3.5" fill="#4dabf7"/><circle cx="118" cy="${h}" r="3.5" fill="#4dabf7"/>`;
    case 'flamme':
      return `<path d="M100 ${h - 40} C 112 ${h - 24}, 114 ${h - 10}, 100 ${h + 2} C 86 ${h - 10}, 88 ${h - 24}, 100 ${h - 40} Z" fill="#ff922b"/><path d="M100 ${h - 24} C 106 ${h - 16}, 106 ${h - 8}, 100 ${h} C 94 ${h - 8}, 94 ${h - 16}, 100 ${h - 24} Z" fill="#ffe066"/>`;
    case 'antenne':
      return `<path d="M100 ${h + 4} Q 96 ${h - 18} 108 ${h - 28}" fill="none" stroke="#3a2420" stroke-width="3.5" stroke-linecap="round"/><circle cx="109" cy="${h - 31}" r="7.5" fill="#ffd43b" stroke="#c99a00" stroke-width="2"/>`;
    case 'pompon':
      return `<circle cx="100" cy="${h - 6}" r="13" fill="#fff" stroke="#dde6ee" stroke-width="2"/>`;
    case 'noeud':
      return `<g transform="translate(100 ${h + 4})"><path d="M0 0 L -22 -14 L -22 14 Z M0 0 L 22 -14 L 22 14 Z" fill="#e64980" stroke="#b02a62" stroke-width="2" stroke-linejoin="round"/><circle r="6" fill="#c2255c"/></g>`;
    default:
      return '';
  }
}

function objet(type, y) {
  switch (type) {
    case 'echarpe':
      return `<path d="M54 ${y + 32} Q100 ${y + 50} 146 ${y + 32} L148 ${y + 46} Q100 ${y + 64} 52 ${y + 46} Z" fill="#d62f2f"/><path d="M120 ${y + 50} L126 ${y + 84} L140 ${y + 80} L134 ${y + 46} Z" fill="#b02525"/>`;
    case 'cloche':
      return `<path d="M100 ${y + 36} C 90 ${y + 36}, 88 ${y + 46}, 88 ${y + 54} L 84 ${y + 60} L 116 ${y + 60} L 112 ${y + 54} C 112 ${y + 46}, 110 ${y + 36}, 100 ${y + 36} Z" fill="#ffd43b" stroke="#c99a00" stroke-width="2"/><circle cx="100" cy="${y + 62}" r="4" fill="#c99a00"/>`;
    case 'sucre':
      return `<g transform="translate(160 ${y + 30}) rotate(12)"><path d="M0 50 V0 a10 10 0 0 0 -20 0" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/><path d="M0 50 V0 a10 10 0 0 0 -20 0" fill="none" stroke="#e03131" stroke-width="8" stroke-dasharray="6 6" stroke-linecap="butt"/></g>`;
    case 'cadeau':
      return `<g transform="translate(140 ${Math.min(y + 56, 150)})"><rect x="0" y="0" width="34" height="28" rx="3" fill="#4dabf7" stroke="#1c7ed6" stroke-width="2"/><rect x="14" y="0" width="6" height="28" fill="#ffd43b"/><rect x="0" y="10" width="34" height="6" fill="#ffd43b"/><path d="M17 0 C 8 -10, 4 -2, 17 0 C 30 -2, 26 -10, 17 0" fill="#ffd43b" stroke="#c99a00"/></g>`;
    case 'boule':
      return `<g transform="translate(36 ${y + 52})"><line x1="0" y1="-24" x2="0" y2="-12" stroke="#888" stroke-width="2"/><rect x="-5" y="-14" width="10" height="5" fill="#ffd43b"/><circle r="12" fill="#e64980"/><path d="M-12 0 Q0 6 12 0" stroke="#fff" stroke-width="2.5" fill="none"/></g>`;
    default:
      return '';
  }
}

function assombrir(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.round(v * (1 - k)));
  const r = f(n >> 16); const g = f((n >> 8) & 255); const b = f(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
