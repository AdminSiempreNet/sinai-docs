import { source } from '@/lib/source';

/**
 * Representación Markdown de una guía para consumidores de IA.
 * No se renderiza en la interfaz ni se añade al árbol de navegación.
 */
export async function getLLMText(page: (typeof source)['$inferPage']) {
  const processed = await page.data.getText('processed');
  const description = page.data.description ? `\n\n> ${page.data.description}` : '';

  return `# ${page.data.title}\n\nFuente: ${page.url}${description}\n\n${processed}`;
}

/** Reúne todas las guías actuales en un único documento de contexto. */
export async function getLLMFullText() {
  const pages = await Promise.all(source.getPages().map(getLLMText));
  return pages.join('\n\n---\n\n');
}
