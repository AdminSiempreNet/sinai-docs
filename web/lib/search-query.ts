/** Utilidades de consulta para búsqueda flexible en español (sin dependencia del source). */

const STOPWORDS = new Set([
  'a',
  'al',
  'como',
  'con',
  'de',
  'del',
  'el',
  'en',
  'es',
  'esta',
  'este',
  'la',
  'las',
  'lo',
  'los',
  'me',
  'mi',
  'o',
  'para',
  'por',
  'que',
  'se',
  'si',
  'su',
  'un',
  'una',
  'y',
  'ya',
]);

/** Grupos de paráfrasis frecuentes para intenciones de soporte. */
export const SYNONYM_GROUPS: string[][] = [
  [
    'ingreso',
    'ingresar',
    'entrar',
    'acceder',
    'acceso',
    'iniciar sesion',
    'inicio de sesion',
    'login',
  ],
  ['contrasena', 'clave', 'password', 'recuperar contrasena', 'olvide la clave'],
  ['calificacion', 'calificaciones', 'nota', 'notas', 'planilla'],
  ['matricula', 'matricular', 'inscripcion', 'inscribir'],
];

export function normalizeSearchQuery(query: string): string {
  return query
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[¿?¡!.,;:()[\]"'«»]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function expandSearchQueries(queries: string[]): string[] {
  const expanded = new Set<string>();

  for (const raw of queries) {
    const normalized = normalizeSearchQuery(raw);
    if (!normalized) continue;

    expanded.add(normalized);

    for (const group of SYNONYM_GROUPS) {
      const matched = group.find((term) => normalized.includes(term));
      if (!matched) continue;

      for (const alt of group) {
        if (alt === matched) continue;

        // Sustitución in-place solo con términos de una palabra para evitar frases rotas.
        if (!matched.includes(' ') && !alt.includes(' ')) {
          expanded.add(normalized.replace(matched, alt));
        } else {
          expanded.add(alt);
        }
      }

      const primary = group[1] ?? group[0];
      expanded.add(group[0]);
      if (group[1]) expanded.add(group[1]);
      expanded.add(`${primary} sinai`);
    }
  }

  return [...expanded];
}

export function meaningfulTokens(query: string): string[] {
  return normalizeSearchQuery(query)
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

export function tokenMatchesText(haystack: string, token: string): boolean {
  if (haystack.includes(token)) return true;

  const stemLength = Math.min(6, Math.max(4, token.length - 1));
  const stem = token.slice(0, stemLength);
  if (stem.length >= 4 && new RegExp(`(?:^|\\s)${escapeRegExp(stem)}\\w*`, 'i').test(haystack)) {
    return true;
  }

  for (const group of SYNONYM_GROUPS) {
    if (!group.some((term) => term.includes(token) || token.includes(term))) continue;
    if (group.some((term) => haystack.includes(term))) return true;
  }

  return false;
}

export function scoreTitleAgainstQueries(
  title: string,
  description: string,
  url: string,
  searchQueries: string[],
): number {
  const normalizedTitle = normalizeSearchQuery(title);
  const normalizedDescription = normalizeSearchQuery(description);
  const normalizedUrl = normalizeSearchQuery(url);
  let best = 0;

  for (const searchQuery of searchQueries) {
    const tokens = meaningfulTokens(searchQuery);
    if (tokens.length === 0) continue;

    const titleHits = tokens.filter((token) =>
      tokenMatchesText(normalizedTitle, token),
    ).length;
    const descHits = tokens.filter((token) =>
      tokenMatchesText(normalizedDescription, token),
    ).length;
    const urlHits = tokens.filter((token) =>
      tokenMatchesText(normalizedUrl, token),
    ).length;
    const ratio = titleHits / tokens.length;

    let score = titleHits * 120 + descHits * 28 + urlHits * 18;
    if (ratio >= 0.6) score += 180;
    if (ratio === 1) score += 120;
    if (titleHits >= 2) score += 60;

    best = Math.max(best, score);
  }

  return best;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
