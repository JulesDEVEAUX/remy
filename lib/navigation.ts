/**
 * Valide une destination de retour reçue en paramètre (query string ou champ de
 * formulaire) avant de l'utiliser comme lien ou redirection : n'accepte qu'un
 * chemin interne (`/xxx`), jamais une URL absolue ni un chemin protocole-relatif
 * (`//evil.com`), pour éviter un open redirect. Retombe sur `fallback` sinon.
 */
export function safeRedirectTarget(raw: string | undefined | null, fallback: string): string {
  if (!raw) {
    return fallback;
  }
  if (!raw.startsWith('/') || raw.startsWith('//')) {
    return fallback;
  }
  return raw;
}
