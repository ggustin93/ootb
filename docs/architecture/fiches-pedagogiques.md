# Fiches Pédagogiques

Ce répertoire contient les fiches pédagogiques générées automatiquement à partir de la base de données NocoDB.

## Processus de génération

Les fiches pédagogiques sont générées au moment du build par le script `src/scripts/build-fiches-pedagogiques.js`. Ce script :

1. Se connecte à l'API NocoDB
2. Récupère toutes les fiches pédagogiques depuis la table configurée
3. **Vérifie si les données ont changé** par rapport à l'exécution précédente
4. Convertit les données en format MDX compatible avec Astro **uniquement si des modifications sont détectées**
5. Génère les fichiers dans ce répertoire

Le processus de vérification des modifications permet d'optimiser le temps de build en évitant de régénérer les fichiers MDX lorsque les données sont identiques à celles de l'exécution précédente.

### Détection des modifications

Le script compare les nouvelles données récupérées avec les données précédemment sauvegardées pour déterminer si des modifications ont été apportées. Cette vérification se fait en plusieurs étapes :

1. Vérification de l'existence d'un fichier de données précédent
2. Comparaison du nombre d'éléments entre les anciennes et nouvelles données
3. Vérification détaillée des identifiants et du contenu de chaque fiche

Si des modifications sont détectées, le script procède à la régénération complète des fichiers MDX.

## Modification des fiches

**Ne modifiez pas directement les fichiers de ce répertoire !** Toutes les modifications seront écrasées lors du prochain build.

Pour modifier une fiche pédagogique, utilisez l'interface NocoDB ou soumettez-la via le formulaire du site.

## Structure des fichiers

Chaque fiche est enregistrée dans un fichier MDX avec le format suivant :

```yaml
---
published: true
title: Titre de la fiche
description: Description courte
publishDate: 2023-05-15T00:00:00.000Z
category: fiche
image: URL d'une image
tags: ["2023-2024", "primaire", "mathématiques"]
pedagogicalSheet:
  enseignement: Ordinaire/Spécialisé
  section: Primaire/Secondaire/etc.
  responsable:
    prenom: Prénom
    nom: Nom
    email: Email
  description: Description détaillée
  destinataire: Public cible de cette fiche
  objectifs: 
    - Objectif 1
    - Objectif 2
  competences: 
    - Compétence 1
    - Compétence 2
  references: 
    - type: site
      url: https://example.com
      description: Description de la référence
  declinaisons: Texte sur les adaptations possibles
  conseils: Conseils d'implémentation
---
```

## Configuration

Le script utilise les variables d'environnement suivantes :

- `NOCODB_BASE_URL` : URL de base de l'API NocoDB
- `NOCODB_API_TOKEN` : Token d'authentification pour l'API
- `NOCODB_ORG_ID` : ID de l'organisation NocoDB
- `NOCODB_PROJECT_ID` : ID du projet NocoDB
- `NOCODB_BASE_ID` : ID de la base NocoDB
- `NOCODB_TABLE_ID` : ID de la table des fiches pédagogiques

## Exécution manuelle

Pour générer les fiches manuellement, exécutez :

```bash
node src/scripts/build-fiches-pedagogiques.js
```

Le script affichera des messages indiquant si des modifications ont été détectées et si les fiches ont été régénérées.

## Avantages de la vérification des modifications

- **Performances améliorées** : Réduction significative du temps de build lorsque les données sont inchangées
- **Moins de risques de régression** : Les fichiers existants ne sont pas touchés si aucun changement n'est détecté
- **Logs plus clairs** : Le script indique clairement si des modifications ont été détectées et quelles actions ont été entreprises

## Conseils d'optimisation

- Effectuez des mises à jour par lots dans NocoDB plutôt que des modifications individuelles fréquentes
- Utilisez le script dans le cadre du processus de build plutôt que manuellement pour maintenir la cohérence
- Vérifiez les messages du script pour vous assurer que les fiches ont été correctement générées ou que le script a correctement détecté qu'aucune modification n'était nécessaire 