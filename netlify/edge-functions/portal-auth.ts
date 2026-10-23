// Protège le portail admin par HTTP Basic Auth (plan Netlify Starter : pas de Basic-Auth natif).
// Mot de passe dans la variable d'environnement PORTAL_PASSWORD ; l'identifiant est ignoré.
import type { Config, Context } from '@netlify/edge-functions';

/** Extrait le mot de passe d'un en-tête `Authorization: Basic …` ('' si absent ou mal formé). */
function readPassword(header: string | null): string {
  const [scheme, encoded] = (header ?? '').split(' ');
  if (scheme !== 'Basic' || !encoded) return '';
  try {
    return atob(encoded).split(':').slice(1).join(':');
  } catch {
    return '';
  }
}

export default function portalAuth(request: Request, context: Context): Response | Promise<Response> {
  const expected = Netlify.env.get('PORTAL_PASSWORD');

  // Fail closed : sans PORTAL_PASSWORD configuré, personne n'entre.
  if (expected && readPassword(request.headers.get('authorization')) === expected) return context.next();

  return new Response('Accès réservé', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Out of the Books", charset="UTF-8"' },
  });
}

export const config: Config = { path: ['/dashboard', '/dashboard/*'] };
