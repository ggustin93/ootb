import { I18N } from 'astrowind:config';

export const formatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(I18N?.language, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'Europe/Paris',
});

// Noms des mois en français abrégés
const MOIS_COURTS = [
  'janv.',
  'févr.',
  'mars',
  'avr.',
  'mai',
  'juin',
  'juil.',
  'août',
  'sept.',
  'oct.',
  'nov.',
  'déc.'
];

export const getFormattedDate = (date: string | Date | undefined): string => {
  if (!date) return '';
  try {
    // Si c'est déjà une chaîne formatée comme "24 févr. 2023", la retourner directement
    if (typeof date === 'string' && date.match(/^\d{1,2} [a-zéûôA-Z]{3,5}\.? \d{4}$/i)) {
      return date;
    }
    
    let dateObj: Date;
    
    // Gestion spéciale pour les formats de date français (ex: "24 mai 2023")
    if (typeof date === 'string') {
      // Essayer de détecter et parser un format français
      const frenchDateRegex = /^(\d{1,2}) (janv\.|févr\.|mars|avr\.|mai|juin|juil\.|août|sept\.|oct\.|nov\.|déc\.) (\d{4})$/i;
      const match = date.match(frenchDateRegex);
      
      if (match) {
        const jour = parseInt(match[1], 10);
        const moisStr = match[2].toLowerCase();
        const annee = parseInt(match[3], 10);
        
        // Convertir le mois en index (0-11)
        const moisIndex = MOIS_COURTS.findIndex(m => 
          m.toLowerCase() === moisStr || 
          m.toLowerCase().replace('.', '') === moisStr.replace('.', '')
        );
        
        if (moisIndex !== -1 && !isNaN(jour) && !isNaN(annee)) {
          dateObj = new Date(annee, moisIndex, jour);
        } else {
          dateObj = new Date(date);
        }
      } else {
        dateObj = new Date(date);
      }
    } else {
      dateObj = date;
    }
    
    if (isNaN(dateObj.getTime())) {
      console.warn(`Date invalide dans getFormattedDate: ${date}`);
      return '';
    }
    
    // Créer manuellement un format de date avec l'année complète
    const jour = dateObj.getDate();
    const mois = MOIS_COURTS[dateObj.getMonth()];
    const anneeComplete = dateObj.getFullYear();
    
    // Format: "24 févr. 2025"
    return `${jour} ${mois} ${anneeComplete}`;
    
  } catch (error) {
    console.error(`Erreur lors du formatage de la date: ${date}`, error);
    return '';
  }
};

export const trim = (str = '', ch?: string) => {
  let start = 0,
    end = str.length || 0;
  while (start < end && str[start] === ch) ++start;
  while (end > start && str[end - 1] === ch) --end;
  return start > 0 || end < str.length ? str.substring(start, end) : str;
};

// Function to format a number in thousands (K) or millions (M) format depending on its value
export const toUiAmount = (amount: number) => {
  if (!amount) return 0;

  let value: string;

  if (amount >= 1000000000) {
    const formattedNumber = (amount / 1000000000).toFixed(1);
    if (Number(formattedNumber) === parseInt(formattedNumber)) {
      value = parseInt(formattedNumber) + 'B';
    } else {
      value = formattedNumber + 'B';
    }
  } else if (amount >= 1000000) {
    const formattedNumber = (amount / 1000000).toFixed(1);
    if (Number(formattedNumber) === parseInt(formattedNumber)) {
      value = parseInt(formattedNumber) + 'M';
    } else {
      value = formattedNumber + 'M';
    }
  } else if (amount >= 1000) {
    const formattedNumber = (amount / 1000).toFixed(1);
    if (Number(formattedNumber) === parseInt(formattedNumber)) {
      value = parseInt(formattedNumber) + 'K';
    } else {
      value = formattedNumber + 'K';
    }
  } else {
    value = Number(amount).toFixed(0);
  }

  return value;
};
