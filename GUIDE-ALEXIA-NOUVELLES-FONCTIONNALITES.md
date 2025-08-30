# 🚀 Guide Utilisateur - Nouvelles Fonctionnalités

**Pour : Alexia**  
**Fonctionnalités :** Partenaires cliquables + Toggle bouton header  
**Date :** Implémentation complète  

---

## 🎯 Résumé des nouvelles fonctionnalités

✅ **Partenaires cliquables** - Les logos peuvent maintenant rediriger vers les sites des partenaires  
✅ **Toggle bouton header** - Basculer facilement entre "Billetterie" et "Communauté"

---

## 📋 1. Gestion des Partenaires Cliquables

### Comment ça fonctionne
- Les logos de partenaires peuvent maintenant être **cliquables**
- Si un partenaire a une URL, son logo devient un lien
- S'il n'a pas d'URL, le logo reste non-cliquable (comme avant)

### Dans TinaCMS Admin

#### Pour la page Festival
1. Aller dans **Collections** → **Festival** → **Partenaires**
2. Pour chaque partenaire, vous pouvez maintenant remplir :
   - **Nom du partenaire** (obligatoire)
   - **Logo** (obligatoire)
   - **Site web** (optionnel) ← **NOUVEAU !**

#### Pour la page À propos
1. Aller dans **Collections** → **About** → **Nos partenaires**
2. Le champ **Lien** existant fonctionne maintenant correctement
3. Laisser vide ou mettre `#` = pas de lien
4. Mettre une vraie URL = logo cliquable

#### Pour les catégories de contenu (Podcasts/TV)
Les partenaires des catégories **Podcast** et **TV** dans `/src/content/blog/blog.json` ont aussi été mis à jour avec des URLs cliquables :
- **TV COM** → https://www.tvcom.be/
- **Province du Brabant wallon** → https://www.brabantwallon.be/
- **Éditions Plantyn** → https://www.plantyn.com/

### Exemples d'URLs pré-configurées
```
Fédération Wallonie-Bruxelles → https://www.federation-wallonie-bruxelles.be/
Ville de Wavre → https://www.wavre.be/
Daoust → https://www.daoust.be/
IFPC → https://www.ifpc.be/
TV Com → https://www.tvcom.be/
```

---

## 🎪 2. Toggle Bouton Header "Magique"

### Le problème résolu
Avant, il fallait modifier manuellement le code pour changer le bouton entre :
- "Prendre votre ticket" (période festival)
- "Rejoindre la communauté" (période normale)

### La solution élégante
**Un simple dropdown dans TinaCMS !** 🎉

### Comment l'utiliser

1. **Aller dans TinaCMS Admin**
2. **Collections** → **Navigation** → **Navigation Header** → **Boutons d'action**
3. Vous verrez une configuration avec **"Mode du bouton"**

#### Deux options disponibles :
- 🎪 **Période Festival - Prendre votre ticket**
- 🤝 **Normal - Rejoindre la communauté**

#### Ce qui se passe automatiquement :
- **Mode Festival** → Bouton "Prendre votre ticket" → `https://billetterie-festival-ootb.com`
- **Mode Communauté** → Bouton "Rejoindre la communauté" → `/#rejoindre`

### Configuration avancée (si besoin)
Les URLs et textes sont pré-configurés, mais peuvent être modifiés :

```json
Festival: {
  "text": "Prendre votre ticket",
  "href": "https://billetterie-festival-ootb.com",
  "variant": "primary"
}

Communauté: {
  "text": "Rejoindre la communauté", 
  "href": "/#rejoindre",
  "variant": "outline"
}
```

---

## 🛠️ Utilisation Pratique

### Workflow pour la période festival
1. 2 semaines avant le festival → Basculer sur "Mode Festival"
2. Le bouton devient automatiquement "Prendre votre ticket"
3. Après le festival → Basculer sur "Mode Communauté"

### Avantages
- ✅ **Aucun code à toucher**
- ✅ **Changement instantané**
- ✅ **URLs pré-configurées**
- ✅ **Pas d'erreurs possibles**
- ✅ **Rétrocompatible**

---

## 🔧 Support Technique

### Si un partenaire n'a pas de lien
- Laisser le champ "Site web" vide
- Le logo reste affiché mais non-cliquable

### Si le toggle ne fonctionne pas
- Vérifier que vous êtes dans **Navigation** → **Navigation Header**
- Il ne peut y avoir qu'un seul bouton d'action
- Après changement, la page se met à jour automatiquement

### URLs par défaut
- **Billetterie**: `https://billetterie-festival-ootb.com`
- **Communauté**: `/#rejoindre` (ancre vers section)

---

## 📱 Responsive & Accessibilité

### Fonctionnalités intégrées
- ✅ **Liens s'ouvrent en nouvel onglet** (`target="_blank"`)
- ✅ **Sécurisés** (`rel="noopener noreferrer"`)
- ✅ **Accessibles** (labels ARIA appropriés)
- ✅ **Responsive** (fonctionne sur mobile et desktop)

---

## 🎉 Résultat

### Avant
- Logos statiques, pas de liens
- Changement bouton = modification code

### Maintenant  
- **Logos cliquables** vers sites partenaires
- **Toggle magique** en 2 clics dans TinaCMS
- **Interface admin conviviale**
- **Zéro manipulation technique**

**C'est prêt à utiliser ! 🚀**
