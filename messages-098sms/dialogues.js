// Répliques de Vi. {nom} = prénom choisi au départ, {petitnom} = « beauté » ou « cupcake ».
// chaleur : points ajoutés à la jauge 🔥 (il en faut assez pour obtenir une photo).
// Une scène sans « choix » se termine par une relance qui garde la tension.

const SCENES = {
  // ---------- Rencontre ----------
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
  assurance: {
    chaleur: 1,
    vi: ['Toujours.', 'Sauf quand une jolie fille me regarde comme tu le fais. Là, mes poings se desserrent tout seuls.'],
    choix: [{ t: 'Et qu\'est-ce que tu fais de tes mains, alors ?', go: 'gants' }, { t: 'Approche.', go: 'aveu2' }],
  },
  aveu: {
    chaleur: 2,
    vi: ['Je sais. J\'ai fait semblant de pas remarquer pendant dix bonnes minutes.', 'Les dix minutes les plus longues de ma vie.', 'Approche. Je mords pas… sauf si on me le demande gentiment.'],
    choix: [{ t: 'Et si je te le demande gentiment ?', go: 'aveu3' }, { t: 'Je m\'approche.', go: 'aveu2' }],
  },
  aveu2: { chaleur: 2, vi: ['Plus près.', 'Encore.', 'Là. Maintenant je sens ton parfum, et je crois que je vais avoir du mal à penser à autre chose ce soir.'] },
  aveu3: { chaleur: 3, vi: ['Gentiment, hein ?', 'Alors je commence par ton épaule. Une petite morsure, juste là. Pour voir comment tu réagis.', '…Ce petit souffle que tu viens de lâcher ? Je le veux encore.'] },
  verre: {
    chaleur: 1,
    vi: ['Exigeante. J\'aime ça.', 'Barman ! Deux verres. Le sien bien frais… parce que d\'ici quelques minutes, elle va avoir très chaud.'],
    choix: [{ t: 'Et pourquoi j\'aurais chaud ?', go: 'verre2' }, { t: 'Santé. À nous deux.', go: 'verre3' }],
  },
  verre2: { chaleur: 3, vi: ['Parce que je compte passer la soirée à te regarder comme si j\'allais te dévorer.', 'Et parce que c\'est exactement ce que je vais faire. Plus tard. Ailleurs.'] },
  verre3: { chaleur: 2, vi: ['À nous deux.', 'Bois doucement. Je veux pas que tu sois pompette. Je veux que tu te souviennes de chaque seconde de ce qui va suivre.'] },

  // ---------- Ce soir ----------
  soiree: {
    vi: ['Ce soir ? Je comptais traîner aux docks et cogner deux ou trois idiots.', 'Mais j\'ai comme l\'impression d\'avoir une bien meilleure proposition sous les yeux.'],
    choix: [{ t: 'Viens chez moi.', go: 'soiree2' }, { t: 'Emmène-moi danser.', go: 'soiree3' }],
  },
  soiree2: {
    chaleur: 3,
    vi: ['Direct. J\'adore.', 'Laisse la porte entrouverte et éteins la lumière.', 'Je trouve toujours mon chemin dans le noir. Surtout jusqu\'à toi.'],
    choix: [{ t: 'La porte est ouverte…', go: 'soiree4' }, { t: 'Dépêche-toi.', go: 'soiree4' }],
  },
  soiree3: {
    chaleur: 2,
    vi: ['Danser ? Moi ?', '…OK. Mais je te préviens : quand je danse, je colle. Très près. Et mes mains ont tendance à descendre.'],
    choix: [{ t: 'Colle-toi à moi.', go: 'soiree9' }, { t: 'Laisse-les descendre.', go: 'soiree9' }],
  },
  soiree4: {
    chaleur: 3,
    vi: ['J\'entre. Je referme derrière moi. Clic.', 'T\'es là, dans la pénombre. Je vois juste ta silhouette… et ça suffit pour me couper le souffle.', 'Je m\'approche. Lentement. Je veux que tu m\'entendes venir.'],
    choix: [{ t: 'Je t\'attends sur le lit.', go: 'soiree5' }, { t: 'Embrasse-moi tout de suite.', go: 'soiree6' }],
  },
  soiree5: {
    chaleur: 4,
    vi: ['Sur le lit, hein ? T\'es pas du genre à tourner autour du pot.', 'Je m\'allonge contre toi. Mes doigts glissent le long de ton bras, ton épaule, ton cou.', 'Dis-moi d\'arrêter. … Non ? Alors je continue.'],
    choix: [{ t: 'Continue.', go: 'soiree7' }, { t: 'À mon tour de te toucher.', go: 'soiree8' }],
  },
  soiree6: {
    chaleur: 4,
    vi: ['Je te plaque contre la porte et je t\'embrasse comme si j\'avais attendu ça toute ma vie.', 'Tes mains dans mes cheveux, les miennes sur tes hanches. On arrive même pas jusqu\'à la chambre.'],
    choix: [{ t: 'Alors prends-moi là, contre la porte.', go: 'soiree10' }, { t: 'Porte-moi jusqu\'au lit.', go: 'soiree5' }],
  },
  soiree7: { chaleur: 5, vi: ['Ma bouche suit le même chemin que mes doigts. Ton cou. Ta clavicule. Plus bas.', 'Je défais tes boutons un par un. Je prends tout mon temps, juste pour te sentir trembler sous moi.', 'Le reste… les murs sont pas assez épais pour que ça reste un secret.'] },
  soiree8: { chaleur: 4, vi: ['Vas-y. Je bouge pas.', 'Tes mains sur mon ventre… sur mes tatouages… plus bas… Je retiens ma respiration comme une idiote.', 'Personne m\'a jamais fait cet effet-là. Personne.'] },
  soiree9: {
    chaleur: 3,
    vi: ['Mon ventre contre ton dos, mes mains sur tes hanches. On bouge au même rythme.', 'Je murmure à ton oreille : « Tout le monde nous regarde. »', '« Laisse-les regarder. »'],
    choix: [{ t: 'On rentre ?', go: 'soiree4' }, { t: 'Embrasse-moi devant tout le monde.', go: 'soiree6' }],
  },
  soiree10: { chaleur: 5, vi: ['Contre la porte. Tes jambes autour de ma taille. Tes ongles dans ma nuque.', 'Je crois que je viens de découvrir mon nouvel endroit préféré dans cette maison.', 'On testera les autres après. Tous les autres.'] },

  // ---------- Combat ----------
  combat: {
    vi: ['Trois gars, une ruelle. Ils ont rien vu venir.', 'J\'ai encore une égratignure sur l\'épaule, là.'],
    choix: [{ t: 'Montre.', go: 'combat2' }, { t: 'Tu aurais pu te faire mal !', go: 'combat3' }],
  },
  combat2: {
    chaleur: 3,
    vi: ['Tu veux que j\'enlève ma veste, c\'est ça ? Subtil, {nom}. Très subtil.', '…Bon. Mais c\'est toi qui soignes. Avec tes lèvres, de préférence.'],
    choix: [{ t: 'Je soigne avec mes lèvres.', go: 'combat4' }, { t: 'Enlève tout, que je vérifie.', go: 'combat5' }],
  },
  combat3: {
    chaleur: 2,
    vi: ['Tu t\'inquiètes pour moi ? C\'est mignon.', 'Viens vérifier que tout est en place, si ça te rassure. Prends ton temps. Inspecte bien partout.'],
    choix: [{ t: 'Je vérifie partout.', go: 'combat5' }],
  },
  combat4: {
    chaleur: 3,
    vi: ['Ta bouche sur mon épaule… OK, j\'ai plus mal du tout.', 'Par contre, j\'ai d\'autres égratignures. Plus bas. Beaucoup plus bas. Faut bien chercher.'],
    choix: [{ t: 'Je cherche partout.', go: 'combat5' }, { t: 'Tu mens, il y a rien.', go: 'combat6' }],
  },
  combat5: { chaleur: 4, vi: ['Je retire mon débardeur pour te faciliter le travail.', 'Prends ton temps. Inspecte chaque centimètre. Avec les mains, avec la bouche, comme tu veux.', '…Tes mains sont froides. Continue quand même. Surtout, continue.'] },
  combat6: { chaleur: 2, vi: ['Démasquée.', 'Mais t\'as pas arrêté pour autant, j\'ai remarqué. Ta bouche est toujours sur ma peau.'] },

  // ---------- Mains ----------
  gants: {
    vi: ['Mes gants ? Ils ont cassé plus de murs que t\'as vu de films.', 'Mais je les enlève toujours avant de toucher une femme.', 'Mes mains nues sont… beaucoup plus douées pour ça.'],
    choix: [{ t: 'Prouve-le.', go: 'gants2' }, { t: 'Enlève-les pour moi.', go: 'gants3' }],
  },
  gants2: {
    chaleur: 3,
    vi: ['Avec plaisir.', 'Donne-moi ta main… voilà. Maintenant ferme les yeux, et devine où va la mienne.'],
    choix: [{ t: 'Où va ta main ?', go: 'gants4' }],
  },
  gants3: {
    chaleur: 2,
    vi: ['Déjà fait.', 'Plus rien entre ta peau et moi. Ça te fait peur ? Ça devrait. Un peu.'],
    choix: [{ t: 'Touche-moi.', go: 'gants4' }],
  },
  gants4: {
    chaleur: 4,
    vi: ['Ta nuque d\'abord. Puis le creux de ton dos.', 'Elle descend… elle hésite… elle s\'arrête juste au bord de ta ceinture.', 'Tu respires plus, là. J\'adore.'],
    choix: [{ t: 'Ne t\'arrête pas.', go: 'gants5' }, { t: 'Tu me rends folle.', go: 'gants6' }],
  },
  gants5: { chaleur: 5, vi: ['Alors je m\'arrête pas.', 'Mes doigts passent sous le tissu. Juste un peu. Juste assez pour que tu fermes les yeux et que tu te mordes la lèvre.', 'La suite, c\'est entre toi, moi et une porte fermée à clé.'] },
  gants6: { chaleur: 2, vi: ['C\'est réciproque, {petitnom}.', 'Et on a même pas vraiment commencé.'] },

  // ---------- Jalousie ----------
  jalousie: {
    vi: ['Ah ouais ? J\'ai pas remarqué.', 'J\'étais trop occupée à regarder ta bouche pendant que tu parlais.'],
    choix: [{ t: 'Menteuse.', go: 'jalousie2' }, { t: 'Et ma bouche, elle te dit quoi ?', go: 'jalousie3' }],
  },
  jalousie2: { chaleur: 2, vi: ['Moi ? Jamais. Bon, peut-être une fois ou deux.', 'Mais là-dessus je mens pas : y a que toi qui me donnes envie de perdre un combat exprès. Juste pour finir sous toi.'] },
  jalousie3: {
    chaleur: 3,
    vi: ['Elle me dit de la faire taire. De la meilleure façon qui soit.', 'Viens là.'],
    choix: [{ t: 'Fais-la taire, alors.', go: 'jalousie4' }],
  },
  jalousie4: {
    chaleur: 4,
    vi: ['Je t\'attrape par le menton. Je te regarde une seconde, juste pour te faire attendre.', 'Puis je t\'embrasse. Lentement d\'abord. Puis moins lentement. Puis plus du tout lentement.'],
    choix: [{ t: 'Encore.', go: 'baiser2' }, { t: 'Mords-moi la lèvre.', go: 'baiser2' }],
  },
  baiser2: { chaleur: 4, vi: ['Encore, et encore. Je te mordille la lèvre, tu soupires contre ma bouche, et je perds complètement le fil.', 'Si tu continues à faire ce petit bruit, je réponds plus de rien, {nom}.'] },

  // ---------- Ce que je te ferais ----------
  ferais: {
    vi: ['T\'es sûre de vouloir savoir ?'],
    choix: [{ t: 'Oui.', go: 'ferais2' }, { t: 'Vas-y, ose.', go: 'ferais2' }],
  },
  ferais2: {
    chaleur: 4,
    vi: ['D\'abord, je te plaquerais contre le mur. Doucement. Je sais me tenir… au début.', 'Ensuite je prendrais tout mon temps pour trouver chaque endroit qui te fait frissonner. Ton cou en premier.', 'Et quand tu pourrais plus respirer, je m\'arrêterais. Juste pour t\'entendre me supplier de continuer.'],
    choix: [{ t: 'Continue…', go: 'ferais3' }, { t: 'Je te supplie.', go: 'ferais3' }, { t: 'Tu es terrible.', go: 'ferais4' }],
  },
  ferais3: {
    chaleur: 4,
    vi: ['Puisque tu le demandes si bien…', 'Je glisserais mes mains sous ton haut et je le remonterais, centimètre par centimètre, en embrassant chaque morceau de peau qui apparaît.', 'Et quand il serait par terre, je te regarderais. Longtemps. Comme si j\'avais gagné le plus beau combat de ma vie.'],
    choix: [{ t: 'Et après ?', go: 'ferais5' }, { t: 'Je te laisserais faire.', go: 'ferais7' }],
  },
  ferais4: { chaleur: 1, vi: ['Je sais. Et t\'adores ça.'] },
  ferais5: {
    chaleur: 5,
    vi: ['Après ? Je te pousserais sur le lit.', 'Je monterais sur toi, un genou de chaque côté de tes hanches, et je t\'ordonnerais de pas bouger.', 'Évidemment, tu bougerais. Et c\'est exactement ce que je veux.'],
    choix: [{ t: 'Et après ?', go: 'ferais6' }],
  },
  ferais6: { chaleur: 5, vi: ['Après, {nom}, on éteint la lumière.', 'Et la seule chose que les voisins sauront, c\'est que t\'as crié mon prénom. Plusieurs fois.'] },
  ferais7: { chaleur: 3, vi: ['Bonne réponse.', 'J\'adore quand tu te laisses faire… presque autant que quand tu reprends le dessus.'] },

  // ---------- La nuit ----------
  pensee: {
    vi: ['Arrête, tu vas me faire rougir. Et une fille de Zaun, ça rougit pas.', '…Bon. Je pense à toi aussi. Beaucoup. Trop, même. Surtout la nuit.'],
    choix: [{ t: 'Tu penses à quoi, la nuit ?', go: 'pensee2' }, { t: 'Trop ?', go: 'pensee3' }],
  },
  pensee2: {
    chaleur: 3,
    vi: ['À tes mains. À ta voix.', 'À la tête que tu ferais si j\'étais allongée contre toi, là, maintenant, avec rien d\'autre que mes tatouages.', 'Je dors plus beaucoup, à cause de toi.'],
    choix: [{ t: 'Viens me rejoindre dans le lit.', go: 'lit' }, { t: 'Et tu fais quoi, quand tu dors pas ?', go: 'pensee4' }],
  },
  pensee3: { chaleur: 1, vi: ['Trop pour une bagarreuse qui prétend avoir un cœur en acier.', 'T\'as trouvé la faille. Bravo.'] },
  pensee4: { chaleur: 4, vi: ['Je ferme les yeux et j\'imagine que mes mains sont les tiennes.', 'Ça marche à moitié. Il manque ton odeur. Et ta façon de soupirer mon prénom.'] },

  lit: {
    chaleur: 4,
    vi: ['T\'as pas besoin de le demander deux fois.', 'Je me glisse sous les draps. Ma peau contre la tienne. T\'es brûlante.'],
    choix: [{ t: 'Serre-moi.', go: 'lit2' }, { t: 'Fais-moi oublier le monde.', go: 'lit2' }],
  },
  lit2: {
    chaleur: 4,
    vi: ['Mes bras autour de toi, ma jambe par-dessus la tienne, mon souffle dans ton cou.', 'Mes mains se baladent. Je fais semblant que c\'est un accident. On sait toutes les deux que c\'en est pas un.'],
    choix: [{ t: 'Plus bas…', go: 'lit3' }, { t: 'Prends ton temps.', go: 'lit5' }],
  },
  lit3: {
    chaleur: 4,
    vi: ['Plus bas, hein ?', 'Tu le veux vraiment ? Dis-le. Je veux l\'entendre de ta bouche.'],
    choix: [{ t: 'Je le veux.', go: 'lit4' }, { t: 'S\'il te plaît, Vi.', go: 'lit4' }],
  },
  lit4: { chaleur: 5, vi: ['Alors c\'est ce que tu vas avoir.', 'Je disparais sous les draps.', 'La suite ne regarde que nous deux… et tes ongles dans mes épaules.'] },
  lit5: { chaleur: 3, vi: ['J\'ai toute la nuit.', 'Et j\'ai bien l\'intention de l\'utiliser jusqu\'à la dernière minute.'] },

  // ---------- Défis ----------
  defi: {
    defi: true,
    choix: [{ t: 'Défi accepté 😈', go: 'defi2' }, { t: 'Trop gênant !', go: 'defi3' }],
  },
  defi2: { chaleur: 3, vi: ['C\'est pour ça que je t\'aime bien, toi. Zéro peur.', 'J\'attends. Écris-le-moi en dessous. 👇'] },
  defi3: { chaleur: 1, vi: ['Gênée ? Toi ? Adorable.', 'Je garde le défi en réserve. Je finis toujours par obtenir ce que je veux.'] },

  // ---------- Compliments ----------
  compliment: {
    vi: ['Moi ? Avec mes cicatrices et mon nez cassé trois fois ?', '…Redis-le.'],
    choix: [{ t: 'Tu es magnifique, Vi.', go: 'compliment2' }, { t: 'Et terriblement sexy.', go: 'compliment3' }],
  },
  compliment2: { chaleur: 2, vi: ['OK, OK. T\'as gagné. Mon cœur fait des trucs bizarres, là.', 'Approche, que je te remercie comme il faut.'] },
  compliment3: {
    chaleur: 3,
    vi: ['Sexy, hein ?', 'Fais gaffe, {nom}. À force de me dire des trucs pareils, je vais te prendre au mot. Et je fais jamais les choses à moitié.'],
    choix: [{ t: 'Prends-moi au mot.', go: 'mur' }],
  },

  cupcake: {
    chaleur: 2,
    flag: 'cupcake',
    vi: ['Ce surnom-là, je le donne pas à n\'importe qui.', 'Mais toi… ouais. T\'es un cupcake. Sucrée, tentante, et j\'ai très envie de croquer dedans.'],
  },

  // ---------- Câlins et baisers ----------
  calin: {
    vi: ['Viens là.', 'Mes bras autour de toi, ton dos contre moi. Je bouge plus.', '…Tu sens mon cœur ? Il cogne plus fort que sur un ring.'],
    choix: [{ t: 'Reste comme ça.', go: 'calin2' }, { t: 'Embrasse-moi.', go: 'calin3' }],
  },
  calin2: { chaleur: 2, vi: ['Toute la nuit si tu veux.', 'Mais je promets rien pour mes mains. Elles ont jamais su rester sages.'] },
  calin3: {
    chaleur: 3,
    vi: ['Pas besoin de me le dire deux fois.', 'Un baiser lent. Puis un autre, beaucoup moins sage.', 'Tu me rends dingue, tu le sais ?'],
    choix: [{ t: 'Encore.', go: 'baiser2' }, { t: 'Emmène-moi dans la chambre.', go: 'lit' }],
  },

  // ---------- Tenue ----------
  tenue: {
    vi: ['Mon débardeur. Celui qui laisse voir mes tatouages.', 'Et toi ? Non attends, me dis rien. Laisse-moi imaginer…', '…Ouais. C\'est encore mieux que ce que j\'imaginais.'],
    choix: [{ t: 'Viens vérifier.', go: 'tenue2' }, { t: 'Pas grand-chose…', go: 'tenue5' }],
  },
  tenue2: {
    chaleur: 3,
    vi: ['J\'arrive.', 'Garde-la sur toi. Je veux avoir le plaisir de te l\'enlever moi-même. Lentement.'],
    choix: [{ t: 'Enlève-la-moi.', go: 'tenue4' }],
  },
  tenue4: { chaleur: 5, vi: ['Je commence par le haut. Mes doigts sous le tissu, sur ton ventre, et je remonte, lentement.', 'Tu lèves les bras. Bonne fille.', 'Le reste suit. Beaucoup plus vite que prévu.'] },
  tenue5: { chaleur: 4, vi: ['Pas grand-chose ?', 'Tu me dis ça à moi, maintenant, alors que je suis à l\'autre bout de la ville ?', 'C\'est de la torture. Garde exactement ce « pas grand-chose ». J\'arrive.'] },

  // ---------- Douche ----------
  douche: {
    chaleur: 3,
    vi: ['Une douche ? Maintenant ? Tu fais exprès.', 'Laisse la porte ouverte. Au cas où j\'aurais très, très besoin de me laver les mains.'],
    choix: [{ t: 'Rejoins-moi.', go: 'douche2' }, { t: 'Non, tu restes là.', go: 'douche4' }],
  },
  douche2: {
    chaleur: 4,
    vi: ['Déjà en train d\'enlever mon débardeur.', 'L\'eau chaude, la vapeur, toi trempée devant moi… je vais pas réussir à être sage.', 'Je prends le savon. Tourne-toi.'],
    choix: [{ t: 'Je me tourne.', go: 'douche3' }, { t: 'Lave-moi partout.', go: 'douche3' }],
  },
  douche3: { chaleur: 5, vi: ['Mes mains glissent sur ton dos, tes épaules, tes hanches. Partout où l\'eau passe, je passe aussi.', 'Tu t\'appuies contre le carrelage. Je me colle contre toi. Plus un millimètre entre nous.', 'On va vider le ballon d\'eau chaude. Tant pis.'] },
  douche4: { chaleur: 2, vi: ['Cruelle.', 'Je vais rester assise devant la porte à écouter l\'eau couler et à imaginer. Une vraie torture.'] },

  // ---------- Massage ----------
  massage: {
    chaleur: 2,
    vi: ['Allonge-toi sur le ventre. Docteure Vi s\'occupe de tout.', 'Huile chaude, mains de boxeuse. Je promets d\'être douce… au début.'],
    choix: [{ t: 'Enlève-moi mon haut.', go: 'massage2' }, { t: 'Commence par les épaules.', go: 'massage2' }],
  },
  massage2: {
    chaleur: 4,
    vi: ['Avec plaisir.', 'Je dénoue tes muscles un par un. Tes épaules… le creux de tes reins…', 'Mes mains descendent un peu plus à chaque passage. Tu me dis si je dépasse les bornes ?'],
    choix: [{ t: 'Dépasse-les.', go: 'massage3' }, { t: 'Tu es douée…', go: 'massage4' }],
  },
  massage3: { chaleur: 5, vi: ['Alors j\'oublie les bornes.', 'Mes pouces glissent sous l\'élastique, ma bouche remplace mes mains sur ton dos.', 'Ce massage vient de prendre un tournant très, très peu professionnel.'] },
  massage4: { chaleur: 3, vi: ['Je t\'avais dit que mes mains nues étaient douées.', 'Et encore. T\'as rien vu.'] },

  // ---------- Tatouages ----------
  tatouages: {
    chaleur: 2,
    vi: ['Ils sont un peu partout. Faudra chercher.', 'Y en a un sur la nuque, un sur le bras… et un autre que personne a jamais vu.'],
    choix: [{ t: 'Celui que personne n\'a vu.', go: 'tatouages2' }, { t: 'Celui sur ta nuque.', go: 'tatouages4' }],
  },
  tatouages2: {
    chaleur: 4,
    vi: ['Tu veux vraiment le voir ?', 'Il est bas. Très bas. Sur la hanche, là où mon pantalon s\'arrête.', 'Approche. Tire un peu sur la ceinture. Doucement…'],
    choix: [{ t: 'Je tire doucement.', go: 'tatouages3' }],
  },
  tatouages3: { chaleur: 5, vi: ['Voilà. Maintenant t\'es la seule à savoir.', 'Et puisque t\'es déjà là, avec tes doigts sur ma hanche… t\'as le droit de continuer à explorer.'] },
  tatouages4: { chaleur: 2, vi: ['Tu veux que je relève mes cheveux ? OK.', 'Mais si tu souffles dessus, je réponds plus de rien.'] },

  // ---------- Contre le mur ----------
  mur: {
    chaleur: 4,
    vi: ['Ah. On joue à ça ?', 'Ton dos contre le mur. Mes mains de chaque côté de ta tête. Tu peux plus t\'échapper.', 'Pas que t\'aies l\'air d\'en avoir envie.'],
    choix: [{ t: 'Embrasse-moi.', go: 'mur2' }, { t: 'C\'est moi qui mène.', go: 'mur4' }],
  },
  mur2: {
    chaleur: 4,
    vi: ['Je prends mon temps. Mes lèvres frôlent les tiennes sans les toucher. Une fois. Deux fois.', 'Puis je craque. Et c\'est pas doux du tout.'],
    choix: [{ t: 'Plus fort.', go: 'mur3' }],
  },
  mur3: { chaleur: 5, vi: ['Ma cuisse se glisse entre les tiennes. J\'attrape tes poignets et je les remonte au-dessus de ta tête.', 'Tu me regardes avec ces yeux-là… Tu vas me tuer, {nom}.'] },
  mur4: { chaleur: 4, vi: ['Ah ouais ?', 'Tu m\'attrapes par le col et tu inverses. C\'est moi contre le mur, maintenant.', '…OK. Je retire tout. J\'adore quand tu prends le contrôle. Fais de moi ce que tu veux.'] },

  // ---------- Réveil ----------
  reveil: {
    chaleur: 3,
    vi: ['Compte sur moi. Mais pas avec un réveil.', 'Avec ma bouche dans ton cou, et mes mains qui partent en exploration sous la couette avant même que t\'ouvres les yeux.'],
    choix: [{ t: 'J\'adore cette idée.', go: 'reveil2' }],
  },
  reveil2: { chaleur: 4, vi: ['Alors couche-toi tôt.', 'Et dors sans rien sur toi. Ça me fera gagner du temps.'] },

  // ---------- Secrets ----------
  secret: {
    chaleur: 3,
    vi: ['Approche ton oreille.', '…La première fois que je t\'ai vue, j\'ai eu envie de t\'enlever tes vêtements avant même de connaître ton prénom.'],
    choix: [{ t: 'Tu y penses encore ?', go: 'secret3' }, { t: 'À mon tour…', go: 'secret2' }],
  },
  secret2: { chaleur: 1, vi: ['Vas-y, je t\'écoute. Écris-le-moi en dessous.', 'Et me mens pas. Je le saurais.'] },
  secret3: { chaleur: 3, vi: ['Tout le temps.', 'Là, maintenant, par exemple. T\'as aucune idée de ce qui se passe dans ma tête.'] },

  nuit: {
    vi: ['Déjà ? Pff.', 'Bonne nuit, {nom}. Rêve de moi, c\'est un ordre.', 'Et si tu te réveilles en pleine nuit avec trop chaud… c\'est normal. C\'est moi.'],
  },
};

// Sujets proposés (trois au hasard à chaque fois)
const SUJETS = [
  { t: 'Tu fais quoi ce soir ?', go: 'soiree' },
  { t: 'Raconte-moi ton dernier combat.', go: 'combat' },
  { t: 'J\'adore tes mains.', go: 'gants' },
  { t: 'Une fille t\'a regardée tout à l\'heure…', go: 'jalousie' },
  { t: 'Dis-moi ce que tu me ferais si j\'étais là.', go: 'ferais' },
  { t: 'Je pense à toi.', go: 'pensee' },
  { t: 'Lance-moi un défi.', go: 'defi' },
  { t: 'Tu es magnifique.', go: 'compliment' },
  { t: 'Tu m\'appelles cupcake ?', go: 'cupcake', unique: true },
  { t: 'J\'ai envie d\'un câlin.', go: 'calin' },
  { t: 'Qu\'est-ce que tu portes ?', go: 'tenue' },
  { t: 'Je vais prendre une douche…', go: 'douche' },
  { t: 'J\'ai mal au dos…', go: 'massage' },
  { t: 'Montre-moi tes tatouages.', go: 'tatouages' },
  { t: 'Plaque-moi contre le mur.', go: 'mur' },
  { t: 'Viens dans mon lit.', go: 'lit' },
  { t: 'Réveille-moi demain matin.', go: 'reveil' },
  { t: 'Dis-moi un secret.', go: 'secret' },
  { t: 'Bonne nuit, Vi.', go: 'nuit' },
];

// Relances après une scène : elles prolongent la tension au lieu de changer de sujet
const RELANCES = [
  'Je suis pas encore redescendue, moi…',
  'Tu me laisses dans cet état ? Sérieux ?',
  'Encore. J\'en ai pas eu assez.',
  'Dis-moi ce que tu veux maintenant. Et sois précise.',
  'J\'ai chaud. C\'est ta faute.',
  'On en était où ? Ah oui. À toi qui me rends dingue.',
  'Ton tour. Fais-moi rougir.',
  'Je t\'écoute… et mes mains aussi.',
  'Pas question d\'arrêter là, {petitnom}.',
  'Respire. Ou pas. J\'aime bien quand t\'as le souffle court.',
];

const DEFIS = [
  'Défi : envoie-moi le mot le plus coquin que tu connais. Et assume-le.',
  'Défi : ce soir, tu t\'endors en pensant à moi. Je saurai si tu triches.',
  'Défi : décris-moi ta tenue en ce moment. Dans le moindre détail.',
  'Défi : avoue-moi ton fantasme le plus inavouable. À voix basse.',
  'Défi : dis-moi où tu voudrais sentir mes mains en premier.',
  'Défi : dis-moi ce que tu me ferais si j\'étais attachée à ton lit.',
  'Défi : écris-moi ce que tu veux que je te murmure à l\'oreille.',
  'Défi : la prochaine fois que tu croises un miroir, imagine-moi derrière toi.',
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
const PHOTO_APRES = ['Alors ? 😏', 'Respire, {petitnom}.', 'Tu dis plus rien ? Je prends ça comme un compliment.', 'Je veux voir ta tête, là.', 'À ton tour de me faire de l\'effet.'];
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
  'Je me suis réveillée avec ton prénom sur les lèvres. Et pas que ton prénom.',
];

// Réponses au texte libre, selon des mots-clés (une des réponses est tirée au hasard)
const MOTS_CLES = [
  { mots: ['photo', 'selfie', 'montre moi', 'image', 'nude'], action: 'photo' },
  { mots: ['bonne nuit', 'dodo', 'dormir'], go: 'nuit' },
  { mots: ['lit', 'draps', 'chambre', 'couette'], go: 'lit' },
  { mots: ['douche', 'bain', 'baignoire'], go: 'douche' },
  { mots: ['massage', 'masse', 'dos'], go: 'massage' },
  { mots: ['tatouage', 'tattoo'], go: 'tatouages' },
  { mots: ['mur', 'plaque'], go: 'mur' },
  { mots: ['calin', 'serre moi', 'bras'], go: 'calin' },
  { mots: ['defi'], go: 'defi' },
  { mots: ['secret'], go: 'secret' },
  { mots: ['reveil', 'matin'], go: 'reveil' },
  { mots: ['je t aime', 'je taime', 't aime', 'amoureuse'], chaleur: 2, reps: [
    ['Fais gaffe, tu vas me faire fondre. Et un gant d\'Atlas qui fond, c\'est pas beau à voir.', '…Moi aussi, idiote.'],
    ['Répète.', '…Non, sérieux, répète. J\'ai besoin de l\'entendre encore.'],
    ['Tu sais que je suis nulle avec les mots. Alors je vais te le montrer. Ce soir. Toute la nuit.'],
  ] },
  { mots: ['bisou', 'embrasse', 'baiser', 'kiss', 'bouche', 'levre'], chaleur: 2, reps: [
    ['Un sur la joue… puis un juste là, au coin de tes lèvres.', 'Le suivant, viens le chercher.'],
    ['Ta bouche. Ma bouche. Maintenant.', 'Et cette fois je te laisse pas reprendre ton souffle.'],
    ['J\'embrasse ta lèvre du bas. Je la mordille. Je la relâche.', 'T\'as vu ? Je peux te faire perdre la tête en trois secondes.'],
  ] },
  { mots: ['cou', 'nuque', 'oreille'], chaleur: 3, reps: [
    ['Ton cou… c\'est ma partie préférée. Juste après toutes les autres.'],
    ['Je souffle doucement juste sous ton oreille.', 'T\'as la chair de poule. Je l\'ai senti.'],
    ['Je pose mes lèvres sur ta nuque et je remonte, très lentement.', 'Tu trembles. J\'adore te faire trembler.'],
  ] },
  { mots: ['sein', 'poitrine', 'fesse', 'cul', 'cuisse', 'hanche', 'ventre', 'corps'], chaleur: 3, reps: [
    ['Fais attention à ce que tu me fais imaginer, {nom}. J\'ai les mains qui me démangent.'],
    ['Tu sais exactement comment me rendre folle, toi.', 'Continue de parler comme ça et je débarque pour vérifier par moi-même.'],
    ['Arrête de m\'allumer comme ça…', '…Ou plutôt non. Continue. J\'adore.'],
    ['Je connais déjà le chemin par cœur. Je le refais quand même. Avec les mains. Puis avec la bouche.'],
  ] },
  { mots: ['nue', 'nu', 'deshabille', 'enleve', 'vetement', 'culotte', 'soutif', 'lingerie', 'string'], chaleur: 3, reps: [
    ['Je suis déjà en train de défaire ma ceinture.', 'Tu disais ?'],
    ['Toi d\'abord. Lentement. Je veux regarder chaque seconde.'],
    ['Rien sur toi ? Arrête. Je suis à deux rues et je cours vite.'],
    ['Garde juste ça. Le reste, je m\'en occupe. Avec les dents s\'il le faut.'],
  ] },
  { mots: ['touche', 'caresse', 'main', 'doigt', 'peau'], chaleur: 3, reps: [
    ['Mes doigts sur ta peau, du bout des ongles. Juste assez pour te donner des frissons.'],
    ['Où tu veux que je te touche ? Dis-le. Précisément.'],
    ['Je pose ma main à plat sur ton ventre. Je bouge plus. J\'attends que tu me supplies de descendre.'],
  ] },
  { mots: ['mord', 'griffe', 'ongle', 'suçon', 'sucon', 'marque'], chaleur: 3, reps: [
    ['Mords si tu veux. Je marque pas facilement… mais pour toi je ferai une exception.'],
    ['Griffe-moi le dos. Laisse des traces. Demain, je veux me souvenir de toi à chaque mouvement.'],
    ['Je te laisse une marque dans le cou. Comme ça tout le monde saura que t\'es prise.'],
  ] },
  { mots: ['chaud', 'envie', 'excite', 'desir', 'frisson', 'mouille', 'brule'], chaleur: 3, reps: [
    ['Moi aussi j\'ai chaud.', 'Mais je crois que c\'est toi qui fais monter la température.'],
    ['Tu sais ce que ça me fait quand tu m\'écris ça ?', 'Non. Tu sais pas. Mais tu vas le découvrir.'],
    ['Envie de quoi ? Dis-le. Je veux le lire.'],
    ['Ne bouge pas. Garde cette envie au chaud. J\'arrive m\'en occuper.'],
  ] },
  { mots: ['domine', 'soumise', 'obeis', 'ordre', 'attache', 'menotte', 'genou', 'chef'], chaleur: 4, reps: [
    ['Tu veux que je donne les ordres ?', 'À genoux, alors. … Pour commencer.'],
    ['Attachée, hein ? T\'as de la chance, j\'ai toujours des bandages sur moi.'],
    ['Ce soir, c\'est moi qui commande. Et tu vas adorer obéir.'],
    ['Ou alors c\'est toi qui me donnes des ordres. J\'obéis très bien, quand c\'est toi.'],
  ] },
  { mots: ['gemi', 'crie', 'soupir', 'hurle'], chaleur: 3, reps: [
    ['Ce bruit-là. Refais-le. Plus près de mon oreille.'],
    ['Je veux t\'entendre. Pas besoin d\'être discrète, les voisins ont l\'habitude maintenant.'],
  ] },
  { mots: ['caitlyn', 'cait'], chaleur: 1, reps: [['Cait ? Elle est pas là ce soir.', 'Et franchement, là, j\'ai d\'yeux que pour toi.']] },
  { mots: ['powder', 'jinx', 'soeur'], reps: [['Ma sœur ? On parle pas d\'elle maintenant.', 'Ce soir, c\'est juste toi et moi.']] },
  { mots: ['bonjour', 'salut', 'coucou', 'hey', 'hello'], chaleur: 1, reps: [['Salut toi. T\'as pensé à moi ? Mens pas.'], ['Te voilà. J\'allais venir te chercher.']] },
];

// Réponses par défaut, de plus en plus audacieuses au fil de la relation (niveau selon les photos déjà envoyées)
const REPONSES_LIBRES = [
  [
    'Hmm. Répète ça plus près de mon oreille.',
    'Tu sais que t\'es irrésistible quand tu dis des trucs comme ça ?',
    'Continue de me parler comme ça et je débarque.',
    'T\'es en train de me rendre folle, {nom}.',
    'Ah ouais ? Viens me le prouver.',
    'J\'aime quand t\'oses. Encore.',
  ],
  [
    'Tu sais ce que j\'ai envie de faire, là ? Te faire taire. Avec ma bouche.',
    'Chaque message que tu m\'envoies, c\'est un vêtement en moins dans ma tête.',
    'J\'ai relu ton message trois fois. Avec un sourire pas du tout innocent.',
    'Arrête. Ou continue. Mais si tu continues, assume ce qui va arriver.',
    'Je suis dans mon lit et je pense plus du tout à dormir.',
    'Dis-moi encore un truc comme ça et je t\'enlève ce que tu portes avec les dents.',
  ],
  [
    'T\'as aucune idée de l\'état dans lequel tu me mets. Aucune.',
    'Viens. Maintenant. Je veux plus parler, je veux te sentir.',
    'Si j\'étais à côté de toi, tu serais déjà sur le dos. Et tu dirais merci.',
    'Je ferme les yeux et c\'est ta peau que je sens sous mes doigts. Partout.',
    'Ce soir je vais pas être douce. Sauf si tu me le demandes. Et même là, pas sûr.',
    'Je veux t\'entendre dire mon prénom comme tu le dis quand je t\'embrasse dans le cou.',
  ],
];
