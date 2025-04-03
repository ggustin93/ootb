/**
 * Configuration pour l'API NocoDB
 * Ce fichier centralise toutes les informations nécessaires pour se connecter à NocoDB
 * et accéder aux différentes tables.
 */

// URL de base de l'API NocoDB
export const NOCODB_BASE_URL = "https://app.nocodb.com";

// Identifiants des projets et tables NocoDB
export const NOCODB_CONFIG = {
  // Identifiant du projet
  projectId: "pocv8knemg3rcok",
  
  // Identifiants des tables
  tables: {
    stands: "mbwhou86e9tzqql", // ID de la table des stands
    ateliers: "maiiy35ahod5nnu", // ID réel de la table des ateliers
    conferences: "mdf8viczcxywoug" // ID réel de la table des conférences
  },
  
  // Paramètres de requête par défaut
  defaultQueryParams: {
    stands: {
      offset: 0,
      limit: 50,
      where: ""
    },
    ateliers: {
      offset: 0,
      limit: 50,
      where: ""
    },
    conferences: {
      offset: 0,
      limit: 50,
      where: ""
    }
  },
  
  // Configuration pour la détection des doublons
  duplicateDetection: {
    // Seuil de similarité pour considérer deux titres comme similaires (0-1)
    // Plus la valeur est élevée, plus les titres doivent être similaires pour être considérés comme doublons
    similarityThreshold: 0.9,
    
    // Champs à utiliser pour la détection des doublons
    fields: ['title', 'day', 'type']
  }
};

/**
 * Récupère le token d'API NocoDB depuis les variables d'environnement
 * @returns Le token d'API ou une chaîne vide si non défini
 */
export function getNocoDBToken(): string {
  return import.meta.env.NOCODB_API_TOKEN || "";
}

/**
 * Vérifie si le token d'API NocoDB est disponible
 * @returns true si le token est disponible, false sinon
 */
export function hasNocoDBToken(): boolean {
  return !!getNocoDBToken();
}

/**
 * Calcule la similarité entre deux chaînes de caractères (distance de Levenshtein normalisée)
 * @param str1 Première chaîne
 * @param str2 Deuxième chaîne
 * @returns Similarité entre 0 (complètement différent) et 1 (identique)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  // Si les chaînes sont identiques, la similarité est de 1
  if (str1 === str2) return 1;
  
  // Si l'une des chaînes est vide, la similarité est de 0
  if (str1.length === 0 || str2.length === 0) return 0;
  
  // Normaliser les chaînes pour la comparaison
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  // Si les chaînes normalisées sont identiques, la similarité est de 1
  if (s1 === s2) return 1;
  
  // Calculer la distance de Levenshtein
  const matrix: number[][] = [];
  
  // Initialiser la première ligne et la première colonne
  for (let i = 0; i <= s1.length; i++) matrix[i] = [i];
  for (let j = 0; j <= s2.length; j++) matrix[0][j] = j;
  
  // Remplir la matrice
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // Suppression
        matrix[i][j - 1] + 1,      // Insertion
        matrix[i - 1][j - 1] + cost // Substitution
      );
    }
  }
  
  // La distance est la valeur en bas à droite de la matrice
  const distance = matrix[s1.length][s2.length];
  
  // Normaliser la distance par la longueur de la plus longue chaîne
  const maxLength = Math.max(s1.length, s2.length);
  
  // Convertir la distance en similarité (1 - distance normalisée)
  return 1 - distance / maxLength;
} 