import { llms } from 'fumadocs-core/source';
import { source } from '@/lib/source';

// El índice cambia únicamente cuando se vuelve a construir la documentación.
export const revalidate = false;

export function GET() {
  return new Response(llms(source).index(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
