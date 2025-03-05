/**
 * @deprecated Cette fonction est obsolète. Utilisez extractAushaInfoFromIframe à la place.
 */
export function generateAushaPlayer(
  podcastUrl: string,
  showId?: string,
  podcastId?: string
): { smartlinkUrl: string; playerConfig: { height: string; src: string; id: string } } {
  // Générer un ID unique pour le player
  const playerId = `ausha-player-${Math.random().toString(36).substring(2, 9)}`;
  
  // Valeurs par défaut pour "Education, mode d'emploi"
  const defaultShowId = 'mw1jzt8lqP9L';
  
  // Debug: Afficher les paramètres d'entrée
  console.log('generateAushaPlayer - Paramètres d\'entrée:', {
    podcastUrl,
    showId,
    podcastId
  });
  
  // Tenter d'extraire les IDs depuis l'URL si non fournis
  let extractedShowId = showId;
  let extractedPodcastId = podcastId;
  
  if (!extractedShowId || !extractedPodcastId) {
    try {
      // Exemple d'URL: https://podcast.ausha.co/education-mode-d-emploi/08-helene-jacques
      // Où 'education-mode-d-emploi' est le slug du show
      
      // Extraire le slug du show depuis l'URL
      const urlParts = podcastUrl.split('/');
      console.log('generateAushaPlayer - URL parts:', urlParts);
      
      if (urlParts.length >= 4) {
        const showSlug = urlParts[3]; // Le slug du show est généralement le 4ème segment de l'URL
        console.log('generateAushaPlayer - Show slug extrait:', showSlug);
        
        // Si nous avons un mapping de slugs vers IDs, nous pourrions l'utiliser ici
        // Pour l'instant, nous utilisons l'ID par défaut si le slug correspond
        if (showSlug === 'education-mode-d-emploi' && !extractedShowId) {
          extractedShowId = defaultShowId;
          console.log('generateAushaPlayer - Utilisation de l\'ID par défaut pour education-mode-d-emploi:', extractedShowId);
        }
        
        // Extraire l'ID de l'épisode depuis l'URL
        if (urlParts.length >= 5 && !extractedPodcastId) {
          const episodeSlug = urlParts[4]; // Le slug de l'épisode est le 5ème segment
          console.log('generateAushaPlayer - Episode slug extrait:', episodeSlug);
          
          // IMPORTANT: Nous devons générer un ID unique pour chaque épisode
          // Créer un hash basé sur le slug de l'épisode pour avoir un ID unique par épisode
          if (episodeSlug) {
            // Créer un hash simple à partir du slug de l'épisode
            let hash = 0;
            for (let i = 0; i < episodeSlug.length; i++) {
              hash = ((hash << 5) - hash) + episodeSlug.charCodeAt(i);
              hash |= 0; // Convertir en entier 32 bits
            }
            // Convertir le hash en chaîne et formater pour ressembler à un ID Ausha
            const hashStr = Math.abs(hash).toString(16).substring(0, 10).toUpperCase();
            extractedPodcastId = hashStr.padEnd(10, '0');
            console.log('generateAushaPlayer - ID d\'épisode généré à partir du slug:', extractedPodcastId);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'extraction des IDs depuis l\'URL du podcast:', error);
      // En cas d'erreur, générer un ID aléatoire plutôt que d'utiliser une valeur par défaut
      if (!extractedPodcastId) {
        extractedPodcastId = Math.random().toString(36).substring(2, 12).toUpperCase();
        console.log('generateAushaPlayer - ID d\'épisode généré aléatoirement:', extractedPodcastId);
      }
    }
  }
  
  // Utiliser les IDs extraits ou générer des valeurs aléatoires si nécessaire
  const finalShowId = extractedShowId || defaultShowId;
  // S'assurer que nous avons toujours un ID de podcast, même si l'extraction a échoué
  const finalPodcastId = extractedPodcastId || 
                         `EP${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  
  // Debug: Afficher les IDs finaux
  console.log('generateAushaPlayer - IDs finaux:', {
    finalShowId,
    finalPodcastId
  });
  
  // Construire l'URL du smartlink
  const smartlinkUrl = `https://podcast.ausha.co/s/${finalShowId}`;
  
  // Construire la configuration du player
  const playerConfig = {
    height: '220',
    src: `https://player.ausha.co/index.html?showId=${finalShowId}&podcastId=${finalPodcastId}&v=3&playlist=false&color=%23a855f7`,
    id: playerId
  };
  
  // Debug: Afficher la configuration finale
  console.log('generateAushaPlayer - Configuration finale:', {
    smartlinkUrl,
    playerConfig
  });
  
  return {
    smartlinkUrl,
    playerConfig
  };
}

/**
 * Extrait les informations d'un code iframe Ausha
 * @param iframeCode Code iframe complet fourni par Ausha
 * @returns Objet contenant les informations extraites ou un objet vide si le code est invalide
 */
export function extractAushaInfoFromIframe(iframeCode: string): { 
  showId?: string; 
  podcastId?: string; 
  color?: string;
  height?: string;
  playerId?: string;
} {
  // Nettoyer le code iframe
  let cleanedIframeCode = iframeCode.trim();
  
  // Vérifier si le code contient les balises iframe
  if (!cleanedIframeCode.includes('<iframe') || !cleanedIframeCode.includes('</iframe>')) {
    console.warn('Le code iframe ne contient pas les balises <iframe> et </iframe>');
    return {};
  }
  
  // Vérifier si c'est bien un iframe Ausha
  if (!cleanedIframeCode.includes('player.ausha.co')) {
    console.warn('Le code iframe ne provient pas d\'Ausha (player.ausha.co)');
    return {};
  }
  
  // Nettoyer le code en s'assurant qu'il se termine correctement
  const scriptEndIndex = cleanedIframeCode.indexOf('</script>');
  if (scriptEndIndex > -1) {
    // Supprimer tout contenu après la balise </script>
    cleanedIframeCode = cleanedIframeCode.substring(0, scriptEndIndex + 9);
  }
  
  // Extraire les paramètres de l'URL
  const srcMatch = cleanedIframeCode.match(/src="([^"]+)"/);
  if (!srcMatch) {
    console.warn('Impossible de trouver l\'attribut src dans le code iframe');
    return {};
  }
  
  const srcUrl = srcMatch[1];
  const urlParams = new URLSearchParams(srcUrl.split('?')[1]);
  
  // Extraire l'ID du player
  const playerIdMatch = cleanedIframeCode.match(/id="([^"]+)"/);
  const playerId = playerIdMatch ? playerIdMatch[1] : undefined;
  
  // Extraire la hauteur
  const heightMatch = cleanedIframeCode.match(/height="([^"]+)"/);
  const height = heightMatch ? heightMatch[1] : undefined;
  
  // Extraire les paramètres
  const showId = urlParams.get('showId') || undefined;
  const podcastId = urlParams.get('podcastId') || undefined;
  const color = urlParams.get('color') || undefined;
  
  // Vérifier les paramètres requis
  if (!showId) {
    console.warn('Le paramètre showId est manquant dans le code iframe');
  }
  
  if (!podcastId) {
    console.warn('Le paramètre podcastId est manquant dans le code iframe');
  }
  
  return {
    showId,
    podcastId,
    color,
    height,
    playerId
  };
}

/**
 * Génère un smartlink Ausha à partir d'un showId
 * @param showId ID du show Ausha
 * @returns URL du smartlink
 */
export function generateSmartlinkUrl(showId?: string): string | undefined {
  if (!showId) return undefined;
  return `https://podcast.ausha.co/s/${showId}`;
}
