"""Dessine les icônes d'une appli : le numéro du jour sur fond vert sapin."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from config import CREME, OR, ROUGE, VERT_SAPIN

POLICES = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
    "/Library/Fonts/Georgia Bold.ttf",
    "C:/Windows/Fonts/georgiab.ttf",
]


def _police(taille):
    for chemin in POLICES:
        if Path(chemin).exists():
            return ImageFont.truetype(chemin, taille)
    return ImageFont.load_default(taille)


def _icone(jour, taille, marge_securite):
    """marge_securite : part de l'image gardée libre (icônes « maskable »)."""
    img = Image.new("RGB", (taille, taille), VERT_SAPIN)
    d = ImageDraw.Draw(img)
    zone = taille * (1 - 2 * marge_securite)
    centre = taille / 2

    # liseré doré
    r = zone / 2 * 0.92
    d.ellipse([centre - r, centre - r, centre + r, centre + r], outline=OR, width=max(2, taille // 64))

    # petit ruban rouge en haut
    rb = zone * 0.07
    d.ellipse([centre - rb, centre - r - rb, centre + rb, centre - r + rb], fill=ROUGE)

    # numéro du jour
    police = _police(int(zone * 0.48))
    d.text((centre, centre + zone * 0.02), str(jour), font=police, fill=CREME, anchor="mm")
    return img


def dessiner_icones(jour, dossier):
    dossier = Path(dossier)
    dossier.mkdir(parents=True, exist_ok=True)
    _icone(jour, 192, 0.04).save(dossier / "icone-192.png")
    _icone(jour, 512, 0.04).save(dossier / "icone-512.png")
    _icone(jour, 512, 0.12).save(dossier / "icone-maskable-512.png")
    _icone(jour, 180, 0.08).save(dossier / "apple-touch-icon.png")
