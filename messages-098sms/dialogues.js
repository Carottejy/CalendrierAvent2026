// Répliques de Vi. {nom} est remplacé par le prénom choisi au départ.
// chaleur : points ajoutés à la jauge 🔥 (il en faut assez pour obtenir une photo).

const SCENES = {
  debut: {
    vi: ['Hé. T\'es qui, toi ?', 'Attends, laisse-moi deviner. T\'es la fille qui me fixe depuis tout à l\'heure à l\'autre bout du bar.', 'Allez, dis-moi ton prénom.'],
    demandeNom: true,
  },
  apresNom: {
    vi: ['{nom}. Ça sonne bien.', 'Moi c\'est Vi. Retiens-le, tu vas le crier… pardon, le répéter souvent. 😏'],
    choix: [
      { t: 'Tu es toujours aussi sûre de toi ?', go: 'assurance' },
      { t: 'Je t\'avoue que je te regardais, oui…', go: 'aveu' },
      { t: 'Paye-moi un verre d\'abord.', go: 'verre' },
    ],
  },
  assurance: { chaleur: 1, vi: ['Toujours.', 'Sauf quand une jolie fille me regarde comme tu le fais. Là, j\'avoue, mes poings se desserrent tout seuls.'] },
  aveu: { chaleur: 2, vi: ['Je sais. J\'ai fait semblant de pas remarquer pendant dix bonnes minutes.', 'Les dix minutes les plus longues de ma vie.', 'Approche. Je mords pas… sauf si on me le demande gentiment.'] },
  verre: { chaleur: 1, vi: ['Exigeante. J\'aime ça.', 'Barman ! Deux verres. Le sien bien frais… parce que d\'ici quelques minutes, elle va avoir très chaud.'] },

  soiree: {
    vi: ['Ce soir ? Je comptais traîner aux docks et cogner deux ou trois idiots.', 'Mais j\'ai comme l\'impression d\'avoir une bien meilleure proposition sous les yeux.'],
    choix: [{ t: 'Viens chez moi.', go: 'soiree2' }, { t: 'Emmène-moi danser.', go: 'soiree3' }],
  },
  soiree2: { chaleur: 3, vi: ['Direct. J\'adore.', 'Laisse la porte entrouverte et éteins la lumière.', 'Je trouve toujours mon chemin dans le noir. Surtout jusqu\'à toi.'] },
  soiree3: { chaleur: 2, vi: ['Danser ? Moi ?', '…OK. Mais je te préviens : quand je danse, je colle. Très près. Et mes mains ont tendance à descendre.'] },

  combat: {
    vi: ['Trois gars, une ruelle. Ils ont rien vu venir.', 'J\'ai encore une égratignure sur l\'épaule, là.'],
    choix: [{ t: 'Montre.', go: 'combat2' }, { t: 'Tu aurais pu te faire mal !', go: 'combat3' }],
  },
  combat2: { chaleur: 3, vi: ['Tu veux que j\'enlève ma veste, c\'est ça ? Subtil, {nom}. Très subtil.', '…Bon. Mais c\'est toi qui soignes. Avec tes lèvres, de préférence.'] },
  combat3: { chaleur: 2, vi: ['Tu t\'inquiètes pour moi ? C\'est mignon.', 'Viens vérifier que tout est en place, si ça te rassure. Prends ton temps. Inspecte bien partout.'] },

  gants: {
    vi: ['Mes gants ? Ils ont cassé plus de murs que t\'as vu de films.', 'Mais je les enlève toujours avant de toucher une femme.', 'Mes mains nues sont… beaucoup plus douées pour ça.'],
    choix: [{ t: 'Prouve-le.', go: 'gants2' }, { t: 'Enlève-les pour moi.', go: 'gants3' }],
  },
  gants2: { chaleur: 3, vi: ['Avec plaisir.', 'Donne-moi ta main… voilà. Maintenant ferme les yeux, et devine où va la mienne.'] },
  gants3: { chaleur: 2, vi: ['Déjà fait.', 'Plus rien entre ta peau et moi. Ça te fait peur ? Ça devrait. Un peu.'] },

  jalousie: {
    vi: ['Ah ouais ? J\'ai pas remarqué.', 'J\'étais trop occupée à regarder ta bouche pendant que tu parlais.'],
    choix: [{ t: 'Menteuse.', go: 'jalousie2' }, { t: 'Et ma bouche, elle te dit quoi ?', go: 'jalousie3' }],
  },
  jalousie2: { chaleur: 2, vi: ['Moi ? Jamais. Bon, peut-être une fois ou deux.', 'Mais là-dessus je mens pas : y a que toi qui me donnes envie de perdre un combat exprès. Juste pour finir sous toi.'] },
  jalousie3: { chaleur: 3, vi: ['Elle me dit de la faire taire. De la meilleure façon qui soit.', 'Viens là.'] },

  ferais: {
    vi: ['T\'es sûre de vouloir savoir ?'],
    choix: [{ t: 'Oui.', go: 'ferais2' }, { t: 'Vas-y, ose.', go: 'ferais2' }],
  },
  ferais2: {
    chaleur: 4,
    vi: ['D\'abord, je te plaquerais contre le mur. Doucement. Je sais me tenir… au début.', 'Ensuite je prendrais tout mon temps pour trouver chaque endroit qui te fait frissonner. Ton cou en premier.', 'Et quand tu pourrais plus respirer, je m\'arrêterais. Juste pour t\'entendre me supplier de continuer.'],
    choix: [{ t: 'Continue…', go: 'ferais3' }, { t: 'Tu es terrible.', go: 'ferais4' }],
  },
  ferais3: { chaleur: 2, vi: ['Ah non. La suite, faut la mériter, {nom}.', 'Ce soir. En vrai. Si t\'as le courage.'] },
  ferais4: { chaleur: 1, vi: ['Je sais. Et t\'adores ça.'] },

  pensee: {
    vi: ['Arrête, tu vas me faire rougir. Et une fille de Zaun, ça rougit pas.', '…Bon. Je pense à toi aussi. Beaucoup. Trop, même. Surtout la nuit.'],
    choix: [{ t: 'Tu penses à quoi, la nuit ?', go: 'pensee2' }, { t: 'Trop ?', go: 'pensee3' }],
  },
  pensee2: { chaleur: 3, vi: ['À tes mains. À ta voix.', 'À la tête que tu ferais si j\'étais allongée contre toi, là, maintenant, avec rien d\'autre que mes tatouages.', 'Je dors plus beaucoup, à cause de toi.'] },
  pensee3: { chaleur: 1, vi: ['Trop pour une bagarreuse qui prétend avoir un cœur en acier.', 'T\'as trouvé la faille. Bravo.'] },

  defi: {
    defi: true,
    choix: [{ t: 'Défi accepté 😈', go: 'defi2' }, { t: 'Trop gênant !', go: 'defi3' }],
  },
  defi2: { chaleur: 3, vi: ['C\'est pour ça que je t\'aime bien, toi. Zéro peur.', 'J\'attends. Écris-le-moi en dessous. 👇'] },
  defi3: { chaleur: 1, vi: ['Gênée ? Toi ? Adorable.', 'Je garde le défi en réserve. Je finis toujours par obtenir ce que je veux.'] },

  compliment: {
    vi: ['Moi ? Avec mes cicatrices et mon nez cassé trois fois ?', '…Redis-le.'],
    choix: [{ t: 'Tu es magnifique, Vi.', go: 'compliment2' }, { t: 'Et terriblement sexy.', go: 'compliment3' }],
  },
  compliment2: { chaleur: 2, vi: ['OK, OK. T\'as gagné. Mon cœur fait des trucs bizarres là.', 'Approche, que je te remercie comme il faut.'] },
  compliment3: { chaleur: 3, vi: ['Sexy, hein ?', 'Fais gaffe, {nom}. À force de me dire des trucs pareils, je vais te prendre au mot. Et je fais jamais les choses à moitié.'] },

  cupcake: {
    chaleur: 2,
    flag: 'cupcake',
    vi: ['Ce surnom-là, je le donne pas à n\'importe qui.', 'Mais toi… ouais. T\'es un cupcake. Sucrée, tentante, et j\'ai très envie de croquer dedans.'],
  },

  calin: {
    vi: ['Viens là.', 'Mes bras autour de toi, ton dos contre moi. Je bouge plus.', '…Tu sens mon cœur ? Il cogne plus fort que sur un ring.'],
    choix: [{ t: 'Reste comme ça.', go: 'calin2' }, { t: 'Embrasse-moi.', go: 'calin3' }],
  },
  calin2: { chaleur: 2, vi: ['Toute la nuit si tu veux.', 'Mais je promets rien pour mes mains. Elles ont jamais su rester sages.'] },
  calin3: { chaleur: 3, vi: ['Pas besoin de me le dire deux fois.', 'Un baiser lent. Puis un autre, beaucoup moins sage.', 'Tu me rends dingue, tu le sais ?'] },

  tenue: {
    vi: ['Mon débardeur. Celui qui laisse voir mes tatouages.', 'Et toi ? Non attends, me dis rien. Laisse-moi imaginer…', '…Ouais. C\'est encore mieux que ce que j\'imaginais.'],
    choix: [{ t: 'Viens vérifier.', go: 'tenue2' }, { t: 'Rien de spécial.', go: 'tenue3' }],
  },
  tenue2: { chaleur: 3, vi: ['J\'arrive.', 'Garde-la sur toi. Je veux avoir le plaisir de te l\'enlever moi-même. Lentement.'] },
  tenue3: { chaleur: 1, vi: ['Sur toi, rien n\'est jamais « rien de spécial ».'] },

  nuit: {
    vi: ['Déjà ? Pff.', 'Bonne nuit, {nom}. Rêve de moi, c\'est un ordre.', 'Et si tu te réveilles en pleine nuit avec trop chaud… c\'est normal. C\'est moi.'],
  },
};

// Sujets proposés entre deux échanges (trois au hasard à chaque fois)
const SUJETS = [
  { t: 'Tu fais quoi ce soir ?', go: 'soiree' },
  { t: 'Raconte-moi ton dernier combat.', go: 'combat' },
  { t: 'J\'adore tes gants.', go: 'gants' },
  { t: 'Une fille t\'a regardée tout à l\'heure…', go: 'jalousie' },
  { t: 'Dis-moi ce que tu me ferais si j\'étais là.', go: 'ferais' },
  { t: 'Je pense à toi.', go: 'pensee' },
  { t: 'Lance-moi un défi.', go: 'defi' },
  { t: 'Tu es magnifique.', go: 'compliment' },
  { t: 'Tu m\'appelles cupcake ?', go: 'cupcake', unique: true },
  { t: 'J\'ai envie d\'un câlin.', go: 'calin' },
  { t: 'Qu\'est-ce que tu portes ?', go: 'tenue' },
  { t: 'Bonne nuit, Vi.', go: 'nuit' },
];

const RELANCES = [
  'Bon. On parle de quoi, beauté ?',
  'Je t\'écoute. J\'ai tout mon temps… et toute mon attention.',
  'Dis-moi tout, {nom}.',
  'Alors, {petitnom} ? Je t\'ai coupé le souffle ?',
  'Tu comptes me laisser comme ça ?',
];

const DEFIS = [
  'Défi : envoie-moi le mot le plus coquin que tu connais. Et assume-le.',
  'Défi : ce soir, tu t\'endors en pensant à moi. Je saurai si tu triches.',
  'Défi : décris-moi ta tenue en ce moment. Dans le moindre détail.',
  'Défi : avoue-moi ton fantasme le plus inavouable. À voix basse.',
  'Défi : dis-moi où tu voudrais sentir mes mains en premier.',
  'Défi : trois mots pour me décrire. Pas le droit de dire « bagarreuse ».',
];

const PHOTO_REFUS = [
  'Une photo ? Tu crois que je suis si facile ? Chauffe-moi d\'abord.',
  'Mérite-la, {nom}. Dis-moi un truc qui me fasse fondre.',
  'Patience, {petitnom}. Plus tu me chauffes, plus je deviens généreuse.',
  'Hmm… pas encore. Mais continue comme ça, t\'es sur la bonne voie.',
  'Tu demandes, je refuse. Tu me charmes, je cède. C\'est comme ça que ça marche.',
];
const PHOTO_ENVOI = [
  'OK. Juste pour toi. Et tu la montres à personne.',
  'Tiens. Et j\'attends une réaction à la hauteur.',
  'Celle-là, tu l\'as bien méritée.',
  'Je l\'ai prise en pensant à toi. Devine à quoi je pensais exactement.',
  'Regarde bien. Et imagine que je suis juste derrière ton écran.',
  'Personne d\'autre l\'a vue. Seulement toi.',
  'T\'as gagné. Mais après, c\'est ton tour…',
];
const PHOTO_APRES = ['Alors ? 😏', 'Respire, {petitnom}.', 'Tu dis plus rien ? Je prends ça comme un compliment.', 'Je veux voir ta tête, là.'];
const PHOTO_PREMIERE = 'Tiens. Comme ça tu sauras à quoi ressemble la fille qui va t\'empêcher de dormir.';
const PHOTO_SPONTANEE = [
  'J\'ai pensé à toi. Du coup… tiens.',
  'Je m\'ennuyais. Cadeau.',
  'Me demande pas pourquoi. Regarde, c\'est tout.',
  'Je viens de la prendre. Pour toi et personne d\'autre.',
  'T\'as rien demandé, je sais. Mais j\'avais envie.',
];
const PHOTO_REVOIR = 'Tu veux revoir celle-là ? Je savais que tu craquerais.';
const PHOTO_AUCUNE = 'Mes photos sont restées à Zaun… Va falloir te contenter de ton imagination. Et crois-moi, la mienne travaille dur.';

const BONJOURS = [
  'Bien dormi, {nom} ? Moi non. Devine à cause de qui.',
  'Debout, {petitnom}. J\'ai rêvé de toi et c\'était… intense.',
  'Salut beauté. Tu m\'as manqué. C\'est nul, je sais.',
  'Hé. Je voulais juste te dire que t\'es la meilleure chose qui me soit arrivée depuis longtemps. Voilà. C\'est dit.',
  'Coucou toi. Programme d\'aujourd\'hui : penser à toi. Encore.',
  'J\'ai cogné dans un sac pendant une heure ce matin. Ça a pas suffi à me sortir ta bouche de la tête.',
];

// Réponses au texte libre, selon des mots-clés
const MOTS_CLES = [
  { mots: ['photo', 'selfie', 'montre', 'image'], action: 'photo' },
  { mots: ['bonne nuit', 'dodo', 'dormir'], go: 'nuit' },
  { mots: ['je t aime', 'je taime', 't aime', 'amoureuse'], chaleur: 2, vi: ['Fais gaffe, tu vas me faire fondre. Et un gant d\'Atlas qui fond, c\'est pas beau à voir.', '…Moi aussi, idiote.'] },
  { mots: ['bisou', 'embrasse', 'baiser', 'kiss', 'bouche', 'levres'], chaleur: 2, vi: ['Un sur la joue… puis un juste là, au coin de tes lèvres.', 'Le suivant, viens le chercher.'] },
  { mots: ['chaud', 'envie', 'excite', 'desir', 'frisson'], chaleur: 2, vi: ['Moi aussi j\'ai chaud.', 'Mais je crois que c\'est toi qui fais monter la température.'] },
  { mots: ['caitlyn', 'cait'], chaleur: 1, vi: ['Cait ? Elle est pas là ce soir.', 'Et franchement, là, j\'ai d\'yeux que pour toi.'] },
  { mots: ['powder', 'jinx', 'soeur'], vi: ['Ma sœur ? On parle pas d\'elle maintenant.', 'Ce soir, c\'est juste toi et moi.'] },
  { mots: ['bonjour', 'salut', 'coucou', 'hey', 'hello'], chaleur: 1, vi: ['Salut toi. T\'as pensé à moi ? Mens pas.'] },
  { mots: ['calin', 'serre', 'bras'], go: 'calin' },
  { mots: ['defi'], go: 'defi' },
];
const REPONSES_LIBRES = [
  'Hmm. Répète ça plus près de mon oreille.',
  'Tu sais que t\'es irrésistible quand tu dis des trucs comme ça ?',
  'Je suis pas sûre d\'avoir tout compris, mais t\'avais l\'air terriblement sexy en l\'écrivant.',
  'Continue de me parler comme ça et je débarque.',
  'T\'es en train de me rendre folle, {nom}.',
  'Ah ouais ? Viens me le prouver.',
  'J\'aime quand t\'oses. Encore.',
];
