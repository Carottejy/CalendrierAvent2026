# Calendrier de l'Avent 2026

Les surprises « appli » du calendrier. Chaque surprise est une petite PWA
(installable sur l'écran d'accueil du téléphone, utilisable hors ligne) avec
sa propre adresse et son propre QR code.

Adresse du site : https://carottejy.github.io/CalendrierAvent2026/

## Organisation

```
spndle-k3x9pa/         une appli = un dossier (nom difficile à deviner)
  index.html           la surprise
  manifest.webmanifest nom, icônes, couleurs de l'appli installée
  sw.js                fonctionnement hors ligne (limité à ce dossier)
  icones/
apps.json              registre de toutes les applis (jour, dossier, titre)
qrcodes/               un QR code par appli (.png et .svg) + planche.html à imprimer
outils/                scripts et modèle
```

## Ajouter une appli

Les applis ne sont liées à aucun jour : le QR code peut être offert n'importe
quand, et l'appli reste accessible pour toujours ensuite.

```bash
pip install qrcode pillow
python3 outils/nouvelle_app.py --titre "Notre carte aux trésors" --icone "♥"
```

Le script crée le dossier, les icônes, l'inscrit dans `apps.json` et
régénère tous les QR codes. Il ne reste qu'à écrire le contenu de la surprise
dans `index.html`.

Pour régénérer seulement les QR codes : `python3 outils/qrcodes.py`.

## Mettre en ligne (une seule fois)

Settings → Pages → *Deploy from a branch* → `main` / `(root)` → Save.
