import { Plugin } from 'tinacms';
import { navigationCollection } from '../navigationCollection';

// Plugin pour la navigation
export const navigationPlugin: Plugin = {
  __type: 'content-creator',
  name: 'Navigation Editor',
  fields: navigationCollection.fields,
  async onSubmit(values, cms) {
    // Enregistrer les valeurs dans le fichier JSON
    try {
      const response = await fetch('/api/navigation/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la navigation');
      }
      
      return { status: 'success', message: 'Navigation mise à jour avec succès' };
    } catch (error) {
      return { status: 'error', message: 'Erreur lors de la mise à jour de la navigation' };
    }
  },
}; 