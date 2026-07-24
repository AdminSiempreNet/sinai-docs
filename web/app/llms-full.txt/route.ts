import { getLLMFullText } from '@/lib/get-llm-text';

// Documento consolidado para agentes de IA; no forma parte de la navegación.
export const revalidate = false;

export async function GET() {
  return new Response(await getLLMFullText(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
