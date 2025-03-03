// Script pour enregistrer la collection de navigation dans Tina
import * as fs from 'fs';
import * as path from 'path';

// Chemin vers le fichier de navigation
const navigationFilePath = path.join(__dirname, '../src/content/navigation/index.json');

// Fonction pour lire le fichier de navigation
function readNavigationFile() {
  try {
    const data = fs.readFileSync(navigationFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lors de la lecture du fichier de navigation:', error);
    return null;
  }
}

// Fonction pour écrire dans le fichier de navigation
function writeNavigationFile(data) {
  try {
    fs.writeFileSync(navigationFilePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'écriture dans le fichier de navigation:', error);
    return false;
  }
}

// Exporter les fonctions pour les utiliser dans Tina
export {
  readNavigationFile,
  writeNavigationFile,
}; 