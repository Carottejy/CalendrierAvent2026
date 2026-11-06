"""Réglages communs aux outils du calendrier."""
from pathlib import Path

# Adresse publique du site (GitHub Pages). À changer seulement si le dépôt
# ou le compte GitHub change de nom.
BASE_URL = "https://carottejy.github.io/CalendrierAvent2026/"

RACINE = Path(__file__).resolve().parent.parent
REGISTRE = RACINE / "apps.json"
MODELE = RACINE / "outils" / "modele"
DOSSIER_QR = RACINE / "qrcodes"

# Couleurs du calendrier (fond des icônes, thème des applis)
VERT_SAPIN = "#1f3d2b"
ROUGE = "#b3261e"
OR = "#e8c27a"
CREME = "#fbf6ec"
