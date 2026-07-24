import { NextResponse } from 'next/server';

type Availability = 'available' | 'unavailable' | 'embedding-blocked' | 'unknown';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const odyseeUrl = getSafeOdyseeUrl(searchParams.get('odyseeUrl'));

  if (!id || !/^[a-zA-Z0-9_-]{11}$/.test(id)) {
    return NextResponse.json({ youtube: 'unknown' satisfies Availability, odysee: 'unknown' satisfies Availability }, { status: 400 });
  }

  const [youtube, odysee] = await Promise.all([
    checkYouTube(id),
    checkOdysee(odyseeUrl),
  ]);

  return NextResponse.json({ youtube, odysee });
}

async function checkYouTube(id: string): Promise<Availability> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (apiKey) {
    try {
      const query = new URLSearchParams({ part: 'status', id, key: apiKey });
      const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?${query}`, {
        next: { revalidate: 60 * 60 * 24 },
      });

      if (response.ok) {
        const data = await response.json() as { items?: Array<{ status?: { embeddable?: boolean } }> };
        const video = data.items?.[0];
        if (!video) return 'unavailable';
        return video.status?.embeddable === false ? 'embedding-blocked' : 'available';
      }
    } catch {
      // Se continúa con la comprobación pública de oEmbed.
    }
  }

  try {
    const url = new URL('https://www.youtube.com/oembed');
    url.searchParams.set('url', `https://www.youtube.com/watch?v=${id}`);
    url.searchParams.set('format', 'json');
    const response = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });

    if (response.ok) return 'available';
    if ([400, 401, 403, 404].includes(response.status)) return 'unavailable';
  } catch {
    // La detección del reproductor cubre los casos que no se puedan verificar aquí.
  }

  return 'unknown';
}

async function checkOdysee(url: string | undefined): Promise<Availability> {
  if (!url) return 'unavailable';

  try {
    const response = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
    if (response.ok) return 'available';
    if ([404, 410].includes(response.status)) return 'unavailable';
  } catch {
    // No se sustituye una copia existente por un estado pendiente ante un fallo temporal.
  }

  return 'unknown';
}

function getSafeOdyseeUrl(value: string | null) {
  if (!value) return undefined;

  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && (url.hostname === 'odysee.com' || url.hostname.endsWith('.odysee.com'))) {
      return url.toString();
    }
  } catch {
    // Una URL no válida se trata como una copia ausente.
  }

  return undefined;
}
