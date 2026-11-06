#!/usr/bin/env python3
"""Génère un QR code par appli du registre, plus une planche à imprimer.

Usage :
    python3 outils/qrcodes.py

Produit dans qrcodes/ :
  - <nom>-xxxxxx.png  (pour imprimer ou glisser dans une carte)
  - <nom>-xxxxxx.svg  (même chose, en vectoriel, net à toutes les tailles)
  - planche.html        (toutes les cartes à imprimer et découper)
"""
import json
import shutil

import qrcode
import qrcode.image.svg

from config import BASE_URL, DOSSIER_QR, REGISTRE, VERT_SAPIN


def url_de(slug):
    return f"{BASE_URL}{slug}/"


def _qr(url):
    q = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=2, box_size=16)
    q.add_data(url)
    q.make(fit=True)
    return q


def generer_tout():
    apps = json.loads(REGISTRE.read_text(encoding="utf-8")) if REGISTRE.exists() else []
    if DOSSIER_QR.exists():
        shutil.rmtree(DOSSIER_QR)
    DOSSIER_QR.mkdir()

    cartes = []
    for app in apps:
        url = url_de(app["slug"])
        q = _qr(url)
        q.make_image(fill_color=VERT_SAPIN, back_color="white").save(DOSSIER_QR / f"{app['slug']}.png")
        q.make_image(image_factory=qrcode.image.svg.SvgPathImage).save(DOSSIER_QR / f"{app['slug']}.svg")
        cartes.append(
            f'<figure><div class="jour">{app.get("jour") or "🎁"}</div>'
            f'<img src="{app["slug"]}.svg" alt="QR code">'
            f'<figcaption>Scanne-moi</figcaption></figure>'
        )

    planche = PLANCHE.replace("{{CARTES}}", "\n".join(cartes) or "<p>Aucune appli pour l'instant.</p>")
    (DOSSIER_QR / "planche.html").write_text(planche, encoding="utf-8")
    print(f"{len(apps)} QR code(s) générés dans {DOSSIER_QR.name}/")


PLANCHE = """<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<meta name="robots" content="noindex">
<title>QR codes à imprimer</title>
<style>
  @page { margin: 10mm; }
  body { font-family: Georgia, serif; margin: 0; color: #1f3d2b; }
  .grille { display: grid; grid-template-columns: repeat(3, 60mm); gap: 6mm; justify-content: center; }
  figure { margin: 0; width: 60mm; height: 75mm; border: 1px dashed #bbb; box-sizing: border-box;
           display: flex; flex-direction: column; align-items: center; justify-content: center;
           break-inside: avoid; }
  .jour { font-size: 22pt; font-weight: bold; color: #b3261e; }
  img { width: 44mm; height: 44mm; }
  figcaption { font-style: italic; font-size: 10pt; margin-top: 2mm; }
</style></head>
<body><div class="grille">
{{CARTES}}
</div></body></html>
"""


if __name__ == "__main__":
    generer_tout()
