import React from 'react';

interface PodcastProps {
  url: string;
}

export function Podcast({ url }: PodcastProps) {
  // Fonction pour extraire l'ID Spotify
  const getSpotifyId = (url: string) => {
    const match = url.match(/episode\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  };

  const spotifyId = getSpotifyId(url);

  return (
    <div className="my-8">
      {spotifyId ? (
        <iframe 
          src={`https://open.spotify.com/embed/episode/${spotifyId}`}
          width="100%" 
          height="232" 
          frameBorder="0" 
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-lg shadow-lg"
        />
      ) : (
        <div className="bg-gray-100 p-4 rounded-lg text-gray-600 text-center">
          Désolé, ce podcast n'est pas disponible pour le moment.
        </div>
      )}
    </div>
  );
} 