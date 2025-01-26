export interface Event {
  time: string;
  type: 'Stands' | 'Conférences' | 'Ateliers';
  title: string;
  description: string;
  location: string;
  speaker?: string;
  image: string;
}

export const events: Record<string, Event[]> = {
  "Mercredi 1/10": [
    {
      time: "9h00",
      type: "Conférences",
      title: "Comment stimuler la créativité en 10 minutes par jour",
      description: "Une conférence ludique et interactive pour découvrir le jeu de cartes original et inspirant d'Oriane Blondiaux. Vous apprendrez à stimuler l'imagination, l'intuition et la créativité de vos élèves à travers des exercices pratiques et des exemples concrets. Découvrez des techniques simples et efficaces pour intégrer des moments créatifs dans votre routine quotidienne de classe. Cette approche novatrice permet de développer la pensée divergente et la confiance en soi des élèves tout en maintenant leur engagement. Public : Maternelle-primaire et secondaire.",
      location: "Salle Mercure",
      speaker: "Oriane Blondiaux, Éveilleuse d'empreintes",
      image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070"
    },
    {
      time: "10h00", 
      type: "Stands",
      title: "Découverte des outils numériques",
      description: "Un espace dédié aux dernières innovations en matière d'outils numériques éducatifs. Découvrez des solutions concrètes pour enrichir vos pratiques pédagogiques et rendre vos cours plus interactifs. Nos experts vous guideront à travers une sélection d'applications, de plateformes et d'outils spécialement conçus pour l'éducation. Vous pourrez tester des tablettes éducatives, des logiciels de création de contenu interactif et des solutions de réalité augmentée. Démonstrations et essais pratiques sur place avec accompagnement personnalisé. Public : Tous niveaux.",
      location: "Hall Principal",
      image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=2020"
    },
    {
      time: "11h00",
      type: "Ateliers",
      title: "Le Khaleidoscope© de l'inclusion",
      description: "Un atelier pratique pour explorer et s'approprier les 9 comportements inclusifs essentiels. À travers des exercices concrets et des mises en situation, découvrez comment créer un environnement d'apprentissage véritablement inclusif. Vous explorerez des stratégies pour adapter votre enseignement aux différents profils d'apprentissage, développer l'empathie dans votre classe et mettre en place des pratiques pédagogiques qui valorisent la diversité. L'atelier propose également des outils d'évaluation pour mesurer l'impact de ces approches inclusives. Public : Maternelle-primaire et secondaire.",
      location: "Salle Mercure",
      image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=2070"
    },
    {
      time: "14h00",
      type: "Stands",
      title: "Éditions scolaires innovantes",
      description: "Découvrez les nouvelles méthodes d'apprentissage à travers les manuels interactifs. Explorez une nouvelle génération de ressources pédagogiques qui combinent supports traditionnels et contenus numériques enrichis. Nos éditeurs présenteront leurs dernières innovations en matière de manuels hybrides, d'exercices autocorrectifs et de contenus personnalisables. Vous pourrez également découvrir des solutions d'évaluation innovantes et des ressources adaptées aux besoins spécifiques des élèves.",
      location: "Hall Principal",
      image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2070"
    }
  ],
  "Jeudi 2/10": [
    {
      time: "9h30",
      type: "Conférences", 
      title: "L'intelligence artificielle dans l'éducation",
      description: "Une conférence approfondie sur l'impact de l'IA dans l'éducation. Dr. Lambert explorera les applications concrètes, les enjeux éthiques et les perspectives d'avenir. Découvrez comment intégrer intelligemment ces outils dans votre pratique pédagogique. La conférence abordera les dernières avancées en matière d'apprentissage adaptatif, de tutorat intelligent et d'analyse prédictive des performances. Vous comprendrez comment l'IA peut vous aider à personnaliser l'apprentissage tout en maintenant l'aspect humain de l'enseignement. Des études de cas et retours d'expérience viendront enrichir la présentation. Public : Tous niveaux.",
      location: "Salle Mars",
      speaker: "Dr. Marie Lambert, Chercheure en EdTech",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070"
    },
    {
      time: "11h00",
      type: "Stands",
      title: "Solutions adaptatives pour l'apprentissage",
      description: "Présentation de solutions technologiques adaptées aux différents profils d'apprentissage. Explorez des outils innovants qui s'ajustent automatiquement au rythme et au style d'apprentissage de chaque élève. Découvrez des plateformes qui utilisent l'intelligence artificielle pour créer des parcours personnalisés, des systèmes de reconnaissance vocale pour l'apprentissage des langues, et des outils de visualisation pour les concepts complexes. Démonstrations pratiques et conseils d'implémentation disponibles.",
      location: "Hall Principal",
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2032"
    },
    {
      time: "12h15",
      type: "Ateliers",
      title: "L'iPad au service des apprentissages",
      description: "Découvrez le potentiel de l'iPad comme outil de compensation pour les élèves en situation de handicap. Cet atelier pratique vous montrera comment utiliser les fonctionnalités d'accessibilité intégrées et les applications spécialisées pour soutenir différents types de besoins. Vous apprendrez à configurer des paramètres d'accessibilité, à sélectionner les applications appropriées et à créer des activités pédagogiques inclusives. Des études de cas concrets illustreront l'impact positif de ces outils sur l'autonomie et la réussite des élèves.",
      location: "Salle Jupiter",
      image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=2070"
    },
    {
      time: "14h30",
      type: "Ateliers",
      title: "Création de contenus pédagogiques interactifs",
      description: "Apprenez à créer des contenus engageants pour vos élèves. Cet atelier pratique vous guidera à travers les différentes étapes de la création de ressources pédagogiques interactives. Vous découvrirez comment utiliser des outils de création de contenu multimédia, concevoir des activités ludiques et mettre en place des évaluations formatives engageantes. L'accent sera mis sur la création de contenus accessibles et adaptables aux différents niveaux et styles d'apprentissage de vos élèves.",
      location: "Salle Venus",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070"
    }
  ],
  "Vendredi 3/10": [
    {
      time: "9h00",
      type: "Stands",
      title: "Village des startups EdTech",
      description: "Rencontrez les startups qui révolutionnent l'éducation. Découvrez les dernières innovations technologiques et pédagogiques à travers des démonstrations interactives. Échangez avec les fondateurs et les équipes de développement sur leurs visions de l'éducation de demain. Au programme : solutions de réalité virtuelle pour l'apprentissage, plateformes collaboratives nouvelle génération, outils d'évaluation innovants et bien d'autres découvertes qui transforment l'expérience éducative.",
      location: "Hall Principal",
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=2070"
    },
    {
      time: "10h30",
      type: "Conférences",
      title: "Le métavers éducatif",
      description: "Explorer les possibilités des univers virtuels pour l'apprentissage. Le Professeur Martin présentera les dernières avancées en matière d'environnements d'apprentissage immersifs et leurs applications concrètes dans l'éducation. Vous découvrirez comment ces espaces virtuels peuvent favoriser l'engagement des élèves, faciliter la collaboration à distance et offrir des expériences d'apprentissage uniques. La présentation inclura des démonstrations en direct et des exemples de projets éducatifs réussis dans le métavers.",
      location: "Salle Neptune",
      speaker: "Prof. Thomas Martin, Expert en réalité virtuelle",
      image: "https://images.unsplash.com/photo-1617802690992-15d93263d3a9?q=80&w=2070"
    },
    {
      time: "13h00",
      type: "Ateliers",
      title: "Gamification de l'apprentissage",
      description: "Techniques et outils pour rendre l'apprentissage plus ludique et engageant. Cet atelier pratique vous permettra de découvrir comment intégrer des mécaniques de jeu dans vos enseignements. Vous explorerez différentes approches de gamification, depuis les systèmes de points et de badges jusqu'aux quêtes pédagogiques complexes. Apprenez à créer des parcours d'apprentissage motivants qui maintiennent l'engagement des élèves tout en atteignant vos objectifs pédagogiques.",
      location: "Salle Jupiter",
      image: "https://images.unsplash.com/photo-1511213966740-24d719a0a814?q=80&w=2070"
    },
    {
      time: "15h00",
      type: "Conférences",
      title: "Clôture : L'avenir de l'éducation",
      description: "Table ronde sur les perspectives et innovations dans l'éducation. Des experts internationaux partageront leurs visions et analyses des tendances qui façonnent l'avenir de l'éducation. La discussion portera sur l'impact des nouvelles technologies, l'évolution des méthodes pédagogiques et les compétences essentielles pour le 21e siècle. Les intervenants aborderont également les défis de l'éducation inclusive, le rôle de l'intelligence artificielle et l'importance de l'apprentissage tout au long de la vie.",
      location: "Amphithéâtre Principal",
      speaker: "Panel d'experts internationaux",
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070"
    }
  ]
}

export const dates = Object.keys(events);
export const eventTypes = ['Stands', 'Conférences', 'Ateliers'] as const;