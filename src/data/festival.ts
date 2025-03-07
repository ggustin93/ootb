import type { Event } from '~/types/festival';

// Mode test - quand activé, les données fictives seront ajoutées aux données réelles récupérées depuis l'API.
export const TEST_MODE = false;

// Jours du festival avec leurs dates
export const days = ['Mercredi', 'Jeudi', 'Vendredi'] as const;
export const dayDates: Record<typeof days[number], string> = {
  'Mercredi': '01/10',
  'Jeudi': '02/10',
  'Vendredi': '03/10'
};

// Types d'événements
export const eventTypes = ['Conférences', 'Ateliers', 'Stands'];

// Images par défaut pour chaque type d'événement
const defaultImages = {
  'Conférences': 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
  'Ateliers': 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
  'Stands': 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
};

// Fonction pour organiser les événements par jour
function organizeEventsByDay(events: Event[]): Record<string, Event[]> {
  return events.reduce((acc, event) => {
    const day = event.day;
    if (!acc[day]) {
      acc[day] = [];
    }
    // Ajouter l'image par défaut si non définie
    if (!event.image) {
      event.image = defaultImages[event.type];
    }
    acc[day].push(event);
    return acc;
  }, {} as Record<string, Event[]>);
}

// Données fictives pour les stands basées sur la structure réelle
const standsData = [
  {
    ID: 1,
    Prénom: "Thibault",
    Nom: "Mathieu",
    Email: "thibaultmathieu792@gmail.com",
    GSM: "0475792751",
    "Site internet": "www.universitedepaix.org",
    "Choisissez un titre court": "Université de Paix - Des formations et programmes éducatifs pour gérer les conflits et améliorer le vivre ensemble",
    "À qui s'adresse le stand ?": "Professeurs, parents et enfants",
    "Niveau d'enseignement": "Maternelle-primaire et secondaire",
    "Type d'enseignement": "Enseignement ordinaire",
    "Décrivez brièvement votre stand pour les visiteurs": "Sur notre stand, explorez une multitude d'outils didactiques, feuilletez et reprenez nos catalogues de formations et nos brochures de présentation pour en savoir plus sur nos programmes. 🎓✨\n\nEt pour célébrer les 65 ans de l'asbl, participez à notre concours spécial et tentez votre chance pour remporter une surprise ! 🎁🥳",
    "Envoyez votre logo": [
      {
        id: "logo1",
        url: "/path/to/logo.jpg",
        signedUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1744&q=80"
      }
    ],
    Statut: "A valider",
    "Thématique liée": { Id: 1, Title: "Thématique 1" },
    Espaces: { Id: 1, Title: "Cafétéria" },
    Jours: 2
  },
  {
    ID: 2,
    Prénom: "Virginie",
    Nom: "TYOU",
    Email: "virginie.tyou@cliky.eu",
    GSM: "0032477205088",
    "Site internet": "www.cliky.eu",
    "Choisissez un titre court": "Éduquer au numérique - La Philosophie Cliky",
    "À qui s'adresse le stand ?": "Professeurs, parents et enfants",
    "Niveau d'enseignement": "Maternelle-primaire et secondaire",
    "Type d'enseignement": "Enseignement ordinaire et spécialisé",
    "Décrivez brièvement votre stand pour les visiteurs": "Éduquer au numérique par les émotions et la perception. La Philosophie Cliky est une démarche d'éducation à la citoyenneté numérique (ECN) intergénérationnelle et spécifiquement dédiée aux enfants de 5 à 13 ans. Venez découvrir notre méthode innovante et nos différents outils !",
    "Envoyez votre logo": [
      {
        id: "logo2",
        url: "/path/to/logo.jpg",
        signedUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
      }
    ],
    Statut: "A valider",
    "Thématique liée": { Id: 2, Title: "Thématique 2" },
    Espaces: { Id: 2, Title: "Espace 2" },
    Jours: 2
  }
];

// Données fictives pour les ateliers basées sur la structure réelle
const ateliersData = [
  {
    ID: 1,
    Prénom: "Alexandra",
    Nom: "VOLCKAERT",
    Email: "alexandra@babaoo.com",
    GSM: "0478 700 701",
    "Site internet": "www.babaoo.com",
    "Choisissez un titre court": "Babaoo : Atelier découverte d'un outil digital pour développer ses fonctions exécutives",
    "À qui s'adresse atelier ?": "Professionnels",
    "Niveau d'enseignement": "Primaire et secondaire",
    "Type d'enseignement": "Enseignement ordinaire et spécialisé",
    "Décrivez brièvement votre animation pour les visiteurs": "Plus que jamais, les enfants ont besoin de comprendre le fonctionnement de leur cerveau, pour l'utiliser correctement !\nVenez découvrir Babaoo, l'outil digital qui apprend aux enfants à développer leur fonctions exécutives !\nDe manière ludique, et avec des missions à réaliser avec les copains dans la vraie vie, les enfants développent de nouveaux réflexes cognitifs, pour appliquer de nouvelles stratégies !",
    "À propos de vous": "Spécialiste des fonctions exécutives et créatrice de Babaoo",
    "Envoyez votre logo": [
      {
        id: "logo3",
        url: "/path/to/logo.jpg",
        signedUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
      }
    ],
    Jours: "Mardi",
    Heure: "10h30",
    Statut: "A valider",
    Espaces: "Salle Jupiter"
  },
  {
    ID: 2,
    Prénom: "Sonia",
    Nom: "Trichili",
    Email: "sonia@codenplay.be",
    GSM: "0474935440",
    "Site internet": "www.codenplay.be",
    "Choisissez un titre court": "Les algorithmes dès la maternelle",
    "À qui s'adresse atelier ?": "Professeurs",
    "Niveau d'enseignement": "Maternelle et primaire",
    "Type d'enseignement": "Enseignement ordinaire et spécialisé",
    "Décrivez brièvement votre animation pour les visiteurs": "Cet atelier vise à explorer la manière dont les concepts d'algorithmes peuvent être introduits et enseignés dès le plus jeune âge notamment à travers des activités débranchées et l'utilisation de la robotique pédagogique. Les participants découvriront et expérimenteront des activités ludiques et adaptées pour développer les compétences numériques des enfants dès la maternelle, en mettant l'accent sur la logique, la pensée informatique et la résolution de problèmes.",
    "À propos de vous": "Durant 20 ans, j'ai été institutrice primaire dans la région de Charleroi. Afin de motiver mes élèves et rendre mes pratiques pédagogiques plus efficaces, je me suis intéressée aux outils numériques.",
    "Envoyez votre logo": [
      {
        id: "logo4",
        url: "/path/to/logo.jpg",
        signedUrl: "https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
      }
    ],
    Jours: "Lundi",
    Heure: "14h00",
    Statut: "A valider",
    Espaces: "Salle Mars"
  }
];

// Données fictives pour les conférences basées sur la structure supposée
const conferencesData = [
  {
    ID: 1,
    Prénom: "Marie",
    Nom: "Lambert",
    Email: "marie.lambert@example.com",
    GSM: "0470123456",
    "Site internet": "www.example.com",
    "Choisissez un titre court": "Découverte des outils numériques",
    "À qui s'adresse la conférence ?": "Professeurs, parents et enfants",
    "Niveau d'enseignement": "Maternelle-primaire et secondaire",
    "Type d'enseignement": "Enseignement ordinaire et spécialisé",
    "Décrivez brièvement votre conférence pour les visiteurs": "Le numérique au service de la pédagogie : explorez les dernières innovations technologiques qui transforment l'apprentissage. De la réalité virtuelle aux plateformes collaboratives, découvrez comment intégrer efficacement ces outils dans votre enseignement pour créer des expériences d'apprentissage plus engageantes et personnalisées.",
    "À propos de vous": "Dr. Marie Lambert est spécialiste en technologies éducatives et enseigne à l'université depuis 10 ans.",
    "Envoyez votre logo": [
      {
        id: "logo5",
        url: "/path/to/logo.jpg",
        signedUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1744&q=80"
      }
    ],
    Jours: "Mardi",
    Heure: "9h00",
    Statut: "A valider",
    Espaces: "Salle Mercure"
  },
  {
    ID: 2,
    Prénom: "Jean",
    Nom: "Dupont",
    Email: "jean.dupont@example.com",
    GSM: "0471234567",
    "Site internet": "www.example.com",
    "Choisissez un titre court": "L'intelligence émotionnelle en classe",
    "À qui s'adresse la conférence ?": "Professeurs",
    "Niveau d'enseignement": "Maternelle-primaire et secondaire",
    "Type d'enseignement": "Enseignement ordinaire",
    "Décrivez brièvement votre conférence pour les visiteurs": "Une exploration approfondie de l'importance des compétences émotionnelles dans l'éducation. Découvrez des stratégies concrètes pour développer l'empathie, la gestion des émotions et la résilience chez vos élèves. Cette conférence interactive vous donnera les clés pour créer un environnement d'apprentissage bienveillant et émotionnellement intelligent.",
    "À propos de vous": "Prof. Jean Dupont est psychologue et formateur en intelligence émotionnelle depuis 15 ans.",
    "Envoyez votre logo": [
      {
        id: "logo6",
        url: "/path/to/logo.jpg",
        signedUrl: "https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
      }
    ],
    Jours: "Mardi",
    Heure: "14h00",
    Statut: "A valider",
    Espaces: "Salle Mars"
  }
];

// Conversion des données brutes en format Event
function convertStandsToEvents(stands: typeof standsData): Event[] {
  return stands.map(stand => {
    // Déterminer le jour en fonction de la valeur Jours
    // 0 = Les trois jours, 1 = Mercredi, 2 = Jeudi, 3 = Vendredi
    let day: 'Mercredi' | 'Jeudi' | 'Vendredi';
    switch(stand.Jours) {
      case 1:
        day = 'Mercredi';
        break;
      case 2:
        day = 'Jeudi';
        break;
      case 3:
        day = 'Vendredi';
        break;
      default:
        day = 'Mercredi'; // Par défaut, on met Mercredi si la valeur n'est pas reconnue
    }
    
    // Récupérer l'URL de l'image ou utiliser l'image par défaut
    const imageUrl = stand["Envoyez votre logo"]?.length > 0 
      ? stand["Envoyez votre logo"][0].signedUrl 
      : defaultImages['Stands'];
    
    return {
      id: `stand-${stand.ID}`,
      title: stand["Choisissez un titre court"],
      description: stand["Décrivez brièvement votre stand pour les visiteurs"],
      day,
      time: "Toute la journée", // Les stands sont généralement présents toute la journée
      location: stand.Espaces?.Title || "Emplacement à définir",
      speaker: `${stand.Prénom} ${stand.Nom}`,
      type: "Stands" as const,
      image: imageUrl,
      url: stand["Site internet"] || "",
      target: stand["À qui s'adresse le stand ?"],
      level: stand["Niveau d'enseignement"],
      teachingType: stand["Type d'enseignement"]
    };
  });
}

function convertAteliersToEvents(ateliers: typeof ateliersData): Event[] {
  return ateliers.map(atelier => {
    // Récupérer l'URL de l'image ou utiliser l'image par défaut
    const imageUrl = atelier["Envoyez votre logo"]?.length > 0 
      ? atelier["Envoyez votre logo"][0].signedUrl 
      : defaultImages['Ateliers'];
    
    // Convertir le jour si nécessaire (pour gérer le cas "Lundi" ou "Mardi" qui ne sont pas dans les jours du festival)
    let day: 'Mercredi' | 'Jeudi' | 'Vendredi';
    if (atelier.Jours === 'Lundi' || atelier.Jours === 'Mardi') {
      day = 'Mercredi'; // On remplace par Mercredi pour les besoins de la démo
    } else if (atelier.Jours === 'Mercredi' || atelier.Jours === 'Jeudi' || atelier.Jours === 'Vendredi') {
      day = atelier.Jours as 'Mercredi' | 'Jeudi' | 'Vendredi';
    } else {
      day = 'Mercredi'; // Valeur par défaut
    }
    
    return {
      id: `atelier-${atelier.ID}`,
      title: atelier["Choisissez un titre court"],
      description: atelier["Décrivez brièvement votre animation pour les visiteurs"],
      day,
      time: atelier.Heure || "Horaire à définir",
      location: atelier.Espaces || "Emplacement à définir",
      speaker: `${atelier.Prénom} ${atelier.Nom}`,
      type: "Ateliers" as const,
      image: imageUrl,
      url: atelier["Site internet"] || "",
      target: atelier["À qui s'adresse atelier ?"],
      level: atelier["Niveau d'enseignement"],
      teachingType: atelier["Type d'enseignement"]
    };
  });
}

function convertConferencesToEvents(conferences: typeof conferencesData): Event[] {
  return conferences.map(conference => {
    // Récupérer l'URL de l'image ou utiliser l'image par défaut
    const imageUrl = conference["Envoyez votre logo"]?.length > 0 
      ? conference["Envoyez votre logo"][0].signedUrl 
      : defaultImages['Conférences'];
    
    // Convertir le jour si nécessaire
    let day: 'Mercredi' | 'Jeudi' | 'Vendredi';
    if (conference.Jours === 'Lundi' || conference.Jours === 'Mardi') {
      day = 'Mercredi'; // On remplace par Mercredi pour les besoins de la démo
    } else if (conference.Jours === 'Mercredi' || conference.Jours === 'Jeudi' || conference.Jours === 'Vendredi') {
      day = conference.Jours as 'Mercredi' | 'Jeudi' | 'Vendredi';
    } else {
      day = 'Mercredi'; // Valeur par défaut
    }
    
    return {
      id: `conference-${conference.ID}`,
      title: conference["Choisissez un titre court"],
      description: conference["Décrivez brièvement votre conférence pour les visiteurs"],
      day,
      time: conference.Heure || "Horaire à définir",
      location: conference.Espaces || "Emplacement à définir",
      speaker: `${conference.Prénom} ${conference.Nom}`,
      type: "Conférences" as const,
      image: imageUrl,
      url: conference["Site internet"] || "",
      target: conference["À qui s'adresse la conférence ?"],
      level: conference["Niveau d'enseignement"],
      teachingType: conference["Type d'enseignement"]
    };
  });
}

// Conversion des données brutes en événements
const standEvents = convertStandsToEvents(standsData);
const atelierEvents = convertAteliersToEvents(ateliersData);
const conferenceEvents = convertConferencesToEvents(conferencesData);

// Fonction pour détecter les doublons
function checkForDuplicates(events: Event[]): void {
  const eventMap = new Map<string, Event[]>();
  
  events.forEach(event => {
    const key = `${event.title}-${event.day}-${event.type}`;
    if (!eventMap.has(key)) {
      eventMap.set(key, [event]);
    } else {
      eventMap.get(key)?.push(event);
    }
  });
  
  // Vérifier s'il y a des doublons
  let hasDuplicates = false;
  eventMap.forEach((eventsWithSameKey, key) => {
    if (eventsWithSameKey.length > 1) {
      console.warn(`Doublon détecté dans les données fictives: ${key} (${eventsWithSameKey.length} occurrences)`);
      console.warn(`  IDs impliqués: ${eventsWithSameKey.map(e => e.id).join(', ')}`);
      hasDuplicates = true;
    }
    
    // Vérification spécifique pour "Éduquer au numérique"
    if (key.includes("Éduquer au numérique - La Philosophie Cliky")) {
      console.warn(`⚠️ ATTENTION: Événement "Éduquer au numérique" détecté dans les données fictives.`);
      console.warn(`  Cet événement est susceptible de créer des doublons avec les données réelles.`);
      console.warn(`  Considérez le supprimer des données fictives si vous utilisez les données réelles.`);
    }
  });
  
  if (!hasDuplicates) {
    console.log('Aucun doublon détecté dans les données fictives');
  }
}

// Combinaison de tous les événements
export const events: Event[] = [...standEvents, ...atelierEvents, ...conferenceEvents];

// Vérification des doublons en mode développement
if (import.meta.env.DEV) {
  checkForDuplicates(events);
}

// Export des événements organisés par jour
export const eventsByDay = organizeEventsByDay(events); 