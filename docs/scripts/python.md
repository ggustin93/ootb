# Scripts Python OOTB

Ce dossier contient les scripts Python utilisés pour diverses tâches d'automatisation du projet OOTB.

## Installation

1. Activer l'environnement virtuel :
```bash
cd scripts/python
source .venv/bin/activate  # Sur Unix/MacOS
# ou
.venv\Scripts\activate  # Sur Windows
```

2. Installer les dépendances :
```bash
pip install -r requirements.txt
```

## Scripts disponibles

### festival_form_creator.py
Script pour créer automatiquement les formulaires d'inscription du festival dans Directus.

Pour l'exécuter :
```bash
python festival_form_creator.py
```

## Structure du dossier
```
scripts/python/
├── .venv/              # Environnement virtuel Python
├── requirements.txt    # Dépendances Python
└── festival_form_creator.py  # Script de création des formulaires
```

## Note importante
Ces scripts sont séparés du code principal Node.js/Astro et ont leur propre environnement virtuel Python pour éviter toute confusion ou conflit avec le reste du projet. 