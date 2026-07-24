import { getLLMFullText } from '@/lib/get-llm-text';

// Alias compatible con la variante solicitada; el nombre canónico es llms-full.txt.
export const revalidate = false;

export async function GET() {
  return new Response(await getLLMFullText(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      Link: '</llms-full.txt>; rel="canonical"',
    },
  });
}
