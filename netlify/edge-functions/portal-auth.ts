// Protège le portail admin par HTTP Basic Auth (plan Netlify Starter : pas de Basic-Auth natif).
// Mot de passe dans la variable d'environnement PORTAL_PASSWORD ; l'identifiant est ignoré.
import type { Config, Context } from '@netlify/edge-functions';

const UNAUTHORIZED_PAGE = `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Accès réservé</title>
<body style="font-family:system-ui,sans-serif;max-width:32rem;margin:15vh auto;padding:0 1rem;color:#1f2937;line-height:1.6">
<h1 style="font-size:1.5rem">Accès réservé</h1>
<p>Cet espace est protégé par un mot de passe. Votre navigateur affiche normalement une fenêtre de connexion : saisissez n'importe quel identifiant et le mot de passe qui vous a été communiqué.</p>
<p>Rien ne s'affiche ? <a href="">Rechargez la page</a>, ou ouvrez-la dans Chrome, Safari ou Firefox.</p>
<p>Besoin d'aide : <a href="mailto:hello@pwablo.be">hello@pwablo.be</a></p>
</body></html>`;

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

  // Affiché si l'utilisateur annule la fenêtre de connexion, ou si le navigateur n'en affiche pas (navigateurs intégrés).
  return new Response(UNAUTHORIZED_PAGE, {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Out of the Books", charset="UTF-8"',
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

export const config: Config = { path: ['/dashboard', '/dashboard/*'] };
