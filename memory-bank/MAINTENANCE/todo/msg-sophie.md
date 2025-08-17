# Message de validation - Filtre "Démos Numériques"

Bonsoir Sophie,

J'espère que tu vas bien.

Suite à notre échange du 23 juillet (réf. : Notion – Demande Juillet 2025 : Filtre démo), j'ai le plaisir de t'annoncer que le filtre "Démos numériques" est maintenant finalisé et déployé sur la branche de test.

## 🔗 Accès à la version de test
https://feature-digital-demos-filter--outofthebooks.netlify.app/festival/#programme/

## ✅ Fonctionnalités implémentées

### Nouveau filtre "Démos numériques"
- Bouton dédié dans l'interface de filtrage
- Filtrage exclusif par rapport aux ateliers classiques
- Badge de comptage indépendant

### Cartes événements améliorées
- Badge violet "Démo numérique" sur les événements concernés
- Affichage de l'heure de fin (format 10:00 – 10:30)
- Design harmonisé avec le reste du programme

### Gestion intelligente des durées
J'ai implémenté une logique flexible :
- Si une durée est renseignée dans NocoDB (colonne "Durée" à créer), elle est utilisée
- Sinon, durées par défaut :
  • Ateliers et conférences : 60 min
  • Démos numériques : 30 min ⚠️
  • Stands : "Toute la journée"

**Peux-tu confirmer que la durée de 30 minutes par défaut pour les démos te convient ?**

### Sécurité production
- En production : seuls les événements "Publiés" sont affichés
- En test/local : tous les événements visibles (y compris "À valider")
- Détection automatique de l'environnement

N'hésite pas à me faire part de tes retours ou ajustements souhaités.

Merci encore pour ta confiance et bonne soirée,
Guillaume