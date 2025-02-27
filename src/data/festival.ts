import type { Event } from '~/types/festival';

// Jours du festival avec leurs dates
export const days = ['Mardi', 'Mercredi', 'Jeudi'] as const;
export const dayDates: Record<typeof days[number], string> = {
  'Mardi': '01/10',
  'Mercredi': '02/10',
  'Jeudi': '03/10'
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

export const events: Event[] = [
  {
    id: '1',
    time: '9h00',
    type: 'Conférences',
    title: 'Découverte des outils numériques',
    description: 'Le numérique au service de la pédagogie : explorez les dernières innovations technologiques qui transforment l\'apprentissage. De la réalité virtuelle aux plateformes collaboratives, découvrez comment intégrer efficacement ces outils dans votre enseignement pour créer des expériences d\'apprentissage plus engageantes et personnalisées.',
    location: 'Salle Mercure',
    speaker: 'Dr. Marie Lambert',
    day: 'Mardi',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1744&q=80'
  },
  {
    id: '2',
    time: '10h30',
    type: 'Ateliers',
    title: 'Ateliers créatifs innovants',
    description: 'Plongez dans un atelier pratique où vous explorerez des techniques créatives novatrices pour dynamiser vos cours. Au programme : design thinking appliqué à l\'éducation, méthodes de storytelling pédagogique, et création de supports visuels impactants. Repartez avec une boîte à outils complète de techniques testées et approuvées.',
    location: 'Salle Jupiter',
    speaker: 'Sarah Martin',
    day: 'Mardi',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1742&q=80'
  },
  {
    id: '3',
    time: '14h00',
    type: 'Conférences',
    title: 'L\'intelligence émotionnelle en classe',
    description: 'Une exploration approfondie de l\'importance des compétences émotionnelles dans l\'éducation. Découvrez des stratégies concrètes pour développer l\'empathie, la gestion des émotions et la résilience chez vos élèves. Cette conférence interactive vous donnera les clés pour créer un environnement d\'apprentissage bienveillant et émotionnellement intelligent.',
    location: 'Salle Mars',
    speaker: 'Prof. Jean Dupont',
    day: 'Mardi',
    image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
  },
  {
    id: '4',
    time: '15h30',
    type: 'Ateliers',
    title: 'La classe flexible',
    description: 'Réinventez votre espace d\'apprentissage avec les principes de la classe flexible. Cet atelier pratique vous guidera dans la conception d\'environnements adaptables qui favorisent la collaboration, l\'autonomie et le bien-être des élèves. Découvrez des solutions concrètes pour transformer votre classe, quel que soit votre budget ou votre espace disponible.',
    location: 'Salle Vénus',
    speaker: 'Claire Dubois',
    day: 'Mardi',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1744&q=80'
  },
  {
    id: '5',
    time: '16h45',
    type: 'Conférences',
    title: 'Les neurosciences au service de l\'apprentissage',
    description: 'Une plongée fascinante dans les dernières découvertes en neurosciences cognitives et leurs applications concrètes en éducation. Apprenez comment le cerveau apprend, mémorise et évolue, et découvrez des stratégies pédagogiques basées sur ces connaissances pour optimiser l\'apprentissage de vos élèves. Des cas pratiques et des exemples concrets illustreront chaque concept.',
    location: 'Salle Mercure',
    speaker: 'Dr. Pierre Neuville',
    day: 'Mardi',
    image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
  },
  {
    id: '6',
    time: '9h00',
    type: 'Ateliers',
    title: 'Gamification en classe',
    description: 'Transformez votre enseignement grâce aux principes de la gamification. Dans cet atelier interactif, vous découvrirez comment intégrer des mécaniques de jeu pour stimuler la motivation et l\'engagement. Au programme : création de parcours d\'apprentissage ludiques, systèmes de récompenses, défis pédagogiques et utilisation d\'outils numériques de gamification.',
    location: 'Salle Jupiter',
    speaker: 'Lucie Game',
    day: 'Mardi',
    image: 'https://images.unsplash.com/photo-1511377107391-116a9d5d20b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
  },
  {
    id: '7',
    time: '10h30',
    type: 'Conférences',
    title: 'L\'école du futur',
    description: 'Une vision prospective et inspirante de l\'éducation de demain. Cette conférence explorera les tendances émergentes qui façonnent l\'avenir de l\'enseignement : intelligence artificielle, réalité augmentée, apprentissage personnalisé, et nouvelles compétences du 21e siècle. Découvrez comment préparer vos élèves aux défis et opportunités qui les attendent.',
    location: 'Salle Mars',
    speaker: 'Prof. Future',
    day: 'Mardi',
    image: 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
  },
  {
    id: '8',
    time: '9h00',
    type: 'Conférences',
    title: 'La différenciation pédagogique',
    description: 'Une approche approfondie de la différenciation pédagogique pour répondre aux besoins uniques de chaque élève. Cette conférence présentera des stratégies pratiques pour adapter votre enseignement aux différents styles d\'apprentissage, niveaux et besoins spécifiques. Découvrez des outils d\'évaluation diagnostique et des méthodes pour créer des parcours d\'apprentissage personnalisés.',
    location: 'Salle Mercure',
    speaker: 'Dr. Sophie Martin',
    day: 'Mercredi',
    image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
  },
  {
    id: '9',
    time: '10h30',
    type: 'Ateliers',
    title: 'Mindfulness en classe',
    description: 'Intégrez la pleine conscience dans votre pratique pédagogique. Cet atelier expérientiel vous formera aux techniques de mindfulness adaptées au contexte scolaire. Apprenez à guider des exercices de respiration, de concentration et de relaxation pour aider vos élèves à gérer leur stress, améliorer leur concentration et développer leur bien-être émotionnel.',
    location: 'Salle Jupiter',
    speaker: 'Marie Zen',
    day: 'Mercredi',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
  },
  {
    id: '10',
    type: 'Conférences',
    time: '14h00',
    title: 'L\'évaluation positive',
    description: 'Découvrez une approche révolutionnaire de l\'évaluation centrée sur le progrès et la croissance. Cette conférence présentera des méthodes innovantes pour évaluer les compétences de manière constructive et motivante. Apprenez à créer des grilles d\'évaluation qui valorisent les progrès, à donner des feedbacks constructifs et à impliquer les élèves dans leur propre évaluation.',
    location: 'Salle Mars',
    speaker: 'Prof. Éval',
    day: 'Mercredi',
    image: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
  },
  {
    id: '11',
    time: '9h00',
    type: 'Conférences',
    title: 'La collaboration école-famille',
    description: 'Construisez des ponts solides entre l\'école et les familles pour optimiser la réussite des élèves. Cette conférence explorera les meilleures pratiques pour établir une communication efficace, impliquer les parents dans le processus éducatif et créer une véritable communauté éducative. Des outils numériques aux réunions innovantes, découvrez des stratégies concrètes pour renforcer ce partenariat essentiel.',
    location: 'Salle Mercure',
    speaker: 'Dr. Parent',
    day: 'Jeudi',
    image: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
  },
  {
    id: '12',
    time: '10h30',
    type: 'Ateliers',
    title: 'Le numérique créatif',
    description: 'Un atelier pratique pour maîtriser les outils numériques de création de contenus pédagogiques. Explorez des applications et plateformes innovantes pour créer des supports visuels attractifs, des vidéos pédagogiques engageantes et des contenus interactifs. Apprenez à utiliser des outils de montage, d\'animation et de création graphique pour produire des ressources pédagogiques professionnelles et captivantes.',
    location: 'Salle Jupiter',
    speaker: 'Tech Master',
    day: 'Jeudi',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
  }
];

// Export the organized events
export const eventsByDay = organizeEventsByDay(events); 