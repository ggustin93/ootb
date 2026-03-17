# Scripts Python OOTB

Scripts Python d'automatisation du projet.

> **Note** : Ce script référence Directus, qui a été remplacé par NocoDB. Vérifier la compatibilité avant utilisation.

## Installation

```bash
cd scripts/python
python -m venv .venv        # Créer l'environnement virtuel (première fois)
source .venv/bin/activate   # Unix/macOS
pip install -r requirements.txt
```

## Scripts disponibles

- `festival_form_creator.py` - Création automatique des formulaires d'inscription festival

```bash
python festival_form_creator.py
```

## Structure

```
scripts/python/
  .venv/                    # Environnement virtuel (a creer avec `python -m venv .venv`)
  requirements.txt          # Dépendances
  festival_form_creator.py  # Script formulaires
```
