# Scripts

Scripts utilitaires pour le projet OOTB.

## Image Processing

- `analyze-image-failures.js` - Diagnostic des échecs de traitement d'images (URLs expirées, formats non supportés)
- `smart-build.sh` - Build intelligent avec installation conditionnelle de Poppler (si PDFs détectés)
- `check-pdf-needs.js` - Détection du besoin de conversion PDF

## Utilisation

```bash
node scripts/analyze-image-failures.js   # Analyser les images en échec
bash scripts/smart-build.sh              # Build avec Poppler conditionnel
```
