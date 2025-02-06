export function generateAushaPlayer(
  podcastUrl: string
): { smartlinkUrl: string; playerConfig: { height: string; src: string; id: string } } {
  // Valeurs par défaut
  const defaultColor = "#921e6d"; // Violet OOTB
  const playerId = `ausha-${Math.random().toString(36).substring(2, 6)}`; // Génère un ID unique

  // Extraire le showId et podcastId de l'URL
  const showId = 'mw1jzt8lqP9L';
  const podcastId = 'YKOz3hxgD0OK';

  // Génère le smartlink
  const smartlinkUrl = podcastUrl.replace("podcast.ausha.co", "smartlink.ausha.co");

  // Configuration du player
  const playerConfig = {
    height: "220",
    src: `https://player.ausha.co/?showId=${showId}&color=${encodeURIComponent(defaultColor)}&podcastId=${podcastId}&v=3&playerId=${playerId}`,
    id: playerId
  };

  return { smartlinkUrl, playerConfig };
}
