import fetch from 'node-fetch';
import slugify from 'slugify';

// Fonction pour convertir un projet en contenu MDX
function convertToMdx(project) {
  // Transformation des listes en format bullet points pour MDX
  const objectifs = project.competences
    ? project.competences.split('\n').map(item => item.trim()).filter(Boolean)
    : [];
  
  // Création du frontmatter
  return `---
published: true
title: ${project.titre}
description: >-
  ${project.description.substring(0, 150)}${project.description.length > 150 ? '...' : ''}
publishDate: ${new Date().toISOString().split('T')[0]}T00:00:00.000Z
category: fiche
image: >-
  https://images.unsplash.com/photo-1522661067900-ab829854a57f?q=80&w=2940&auto=format&fit=crop
pedagogicalSheet:
  enseignement: ${project['type-enseignement']}
  section: ${project.section}
  responsable:
    prenom: ${project.prenom}
    nom: ${project.nom}
    email: ${project.email}
  description: >
    ${project.description.replace(/\n/g, '\n    ')}
  objectifs:
${objectifs.map(obj => `    - ${obj}`).join('\n')}
  competences:
${objectifs.map(comp => `    - ${comp}`).join('\n')}
  references:
    - type: document
      description: >-
        Projet soumis via le formulaire en ligne
  declinaisons: >
    ${project.resultats || ''}
  conseils: >
    ${project.links || ''}
---
`;
}

// Fonction pour vérifier si un fichier existe déjà dans le dépôt GitHub
async function checkFileExistsInGitHub(filename) {
  try {
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const path = `src/content/post/5_FICHES/${filename}`;
    const token = process.env.GITHUB_TOKEN;
    
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    return response.status === 200;
  } catch (_) {
    return false;
  }
}

// Fonction pour créer un fichier dans le dépôt GitHub
async function createFileInGitHub(filename, content) {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const path = `src/content/post/5_FICHES/${filename}`;
  const token = process.env.GITHUB_TOKEN;
  const branch = process.env.GITHUB_BRANCH || 'main';
  
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: `Ajout de la fiche pédagogique: ${filename}`,
      content: Buffer.from(content).toString('base64'),
      branch: branch
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Erreur GitHub: ${error.message}`);
  }
  
  return await response.json();
}

// Fonction principale
export const handler = async (event) => {
  // Vérification de la méthode HTTP
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Méthode non autorisée' })
    };
  }

  try {
    // Récupération des données du formulaire ou du webhook NocoDB
    let project;
    
    // Si c'est un webhook NocoDB
    if (event.headers['x-nocodb-hook']) {
      project = JSON.parse(event.body);
    } 
    // Si c'est une soumission directe du formulaire
    else {
      project = JSON.parse(event.body);
    }

    // Validation des données minimales requises
    if (!project.titre || !project.description || !project.prenom || !project.nom || !project.email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Données incomplètes' })
      };
    }

    // Génération du nom de fichier
    const slug = slugify(project.titre, { lower: true, strict: true });
    const filename = `${slug}.mdx`;
    
    // Vérifier si le fichier existe déjà dans GitHub
    const fileExists = await checkFileExistsInGitHub(filename);
    
    if (fileExists) {
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          message: 'La fiche pédagogique existe déjà',
          filename: filename,
          alreadyExists: true
        })
      };
    }
    
    // Génération du contenu MDX
    const mdxContent = convertToMdx(project);
    
    // Créer le fichier dans GitHub
    const result = await createFileInGitHub(filename, mdxContent);
    
    // Déclencher un build Netlify pour mettre à jour le site
    if (process.env.TRIGGER_NETLIFY_BUILD === 'true') {
      await fetch(process.env.NETLIFY_BUILD_HOOK, { method: 'POST' });
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Fiche pédagogique créée avec succès',
        filename: filename,
        url: result.content.html_url
      })
    };
    
  } catch (error) {
    console.error('Erreur:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erreur lors de la création de la fiche', error: error.message })
    };
  }
}; 