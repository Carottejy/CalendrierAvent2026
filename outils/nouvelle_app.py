#!/usr/bin/env python3
"""Crée une nouvelle PWA (une surprise) à partir du modèle.

Usage :
    python3 outils/nouvelle_app.py --jour 5 --titre "Notre carte aux trésors"

Ce que fait le script :
  1. choisit une adresse difficile à deviner : jour-05-<6 caractères au hasard>/
  2. copie le modèle (page, manifeste, service worker) dans ce dossier
  3. dessine les icônes de l'appli (numéro du jour)
  4. ajoute l'appli au registre apps.json
  5. régénère tous les QR codes
"""
import argparse
import json
import secrets
import shutil
import string
import sys

from config import MODELE, RACINE, REGISTRE
from icones import dessiner_icones
from qrcodes import generer_tout

ALPHABET = string.ascii_lowercase + string.digits


def charger_registre():
    if REGISTRE.exists():
        return json.loads(REGISTRE.read_text(encoding="utf-8"))
    return []


def sauver_registre(apps):
    apps.sort(key=lambda a: (a["jour"], a["slug"]))
    REGISTRE.write_text(json.dumps(apps, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--jour", type=int, required=True, help="jour du calendrier (1 à 24)")
    p.add_argument("--titre", required=True, help="nom de l'appli affiché sur le téléphone")
    p.add_argument("--court", help="nom court sous l'icône (12 caractères max conseillés)")
    args = p.parse_args()

    if not 1 <= args.jour <= 24:
        sys.exit("Le jour doit être compris entre 1 et 24.")

    apps = charger_registre()
    slug = f"jour-{args.jour:02d}-" + "".join(secrets.choice(ALPHABET) for _ in range(6))
    dossier = RACINE / slug

    remplacements = {
        "{{TITRE}}": args.titre,
        "{{COURT}}": args.court or f"Jour {args.jour}",
        "{{JOUR}}": str(args.jour),
        "{{SLUG}}": slug,
    }

    dossier.mkdir()
    for fichier in MODELE.iterdir():
        texte = fichier.read_text(encoding="utf-8")
        for cle, valeur in remplacements.items():
            texte = texte.replace(cle, valeur)
        (dossier / fichier.name).write_text(texte, encoding="utf-8")

    dessiner_icones(args.jour, dossier / "icones")

    apps.append({"jour": args.jour, "slug": slug, "titre": args.titre})
    sauver_registre(apps)
    generer_tout()

    print(f"Appli créée : {slug}/")


if __name__ == "__main__":
    main()
