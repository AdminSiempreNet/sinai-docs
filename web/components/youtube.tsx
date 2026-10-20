'use client';

import { CircleAlert, CirclePlay, Play } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

type YouTubeProps = {
  /** Sin identificador, YouTube queda pendiente y el video se reproduce en la plataforma alternativa. */
  id?: string;
  title: string;
  odyseeUrl?: string;
  /** Quita el margen exterior cuando el reproductor va dentro de otra pieza, como la lista de videos. */
  embedded?: boolean;
  /** Franja superior del reproductor. La usa la lista para indicar que hay más videos. */
  leading?: ReactNode;
};

type YouTubeStatus = 'checking' | 'available' | 'unavailable' | 'embedding-blocked' | 'unknown';
type SourceAvailability = 'available' | 'unavailable' | 'unknown';

type YouTubePlayerInstance = {
  destroy: () => void;
};

type YouTubePlayerConstructor = new (
  element: HTMLElement,
  options: {
    videoId: string;
    host?: string;
    playerVars?: Record<string, string | number>;
    events: {
      onReady: () => void;
      onError: (event: { data: number }) => void;
    };
  },
) => YouTubePlayerInstance;

declare global {
  interface Window {
    YT?: { Player: YouTubePlayerConstructor };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export function YouTube({ id, title, odyseeUrl, embedded = false, leading }: YouTubeProps) {
  const youtubePending = !id;
  const odyseeEmbedUrl = odyseeUrl ? toOdyseeEmbedUrl(odyseeUrl) : undefined;
  const [platform, setPlatform] = useState<'youtube' | 'odysee'>(youtubePending && odyseeEmbedUrl ? 'odysee' : 'youtube');
  const [isLoading, setIsLoading] = useState(!youtubePending || Boolean(odyseeEmbedUrl));
  const [youtubeStatus, setYouTubeStatus] = useState<YouTubeStatus>(youtubePending ? 'unavailable' : 'checking');
  const [odyseeStatus, setOdyseeStatus] = useState<SourceAvailability>('unknown');
  const [youtubeIssue, setYouTubeIssue] = useState<string | undefined>(
    youtubePending ? 'el video de YouTube está pendiente de publicación.' : undefined,
  );
  const isOdysee = platform === 'odysee' && Boolean(odyseeEmbedUrl);
  const activePlatform = isOdysee ? 'Alternativo' : 'YouTube';
  const youtubeUnavailable = youtubeStatus === 'unavailable' || youtubeStatus === 'embedding-blocked';
  const odyseeUnavailable = !odyseeEmbedUrl || odyseeStatus === 'unavailable';
  const tutorialPending = youtubeUnavailable && odyseeUnavailable;

  const showYouTubeIssue = useCallback((
    status: Extract<YouTubeStatus, 'unavailable' | 'embedding-blocked'>,
    message: string,
    useOdysee = Boolean(odyseeEmbedUrl),
  ) => {
    setYouTubeStatus(status);
    setYouTubeIssue(message);

    if (useOdysee && odyseeEmbedUrl) {
      setIsLoading(true);
      setPlatform('odysee');
    } else {
      setIsLoading(false);
    }
  }, [odyseeEmbedUrl]);

  const handleYouTubePlayerError = useCallback((code: number) => {
    if (code === 100) {
      showYouTubeIssue('unavailable', 'YouTube indica que este video fue retirado o ahora es privado.');
      return;
    }

    if (code === 101 || code === 150) {
      showYouTubeIssue('embedding-blocked', 'El propietario no permite reproducir este video dentro de la guía.');
      return;
    }

    showYouTubeIssue('unavailable', 'YouTube no pudo reproducir este tutorial en este momento.');
  }, [showYouTubeIssue]);

  const handleOdyseeError = useCallback(() => {
    setOdyseeStatus('unavailable');
    setPlatform('youtube');
    setIsLoading(!youtubeUnavailable);
  }, [youtubeUnavailable]);

  const markVideoReady = useCallback(() => setIsLoading(false), []);

  useEffect(() => {
    if (!id) return;
    let active = true;

    const query = new URLSearchParams({ id });
    if (odyseeUrl) query.set('odyseeUrl', odyseeUrl);

    void fetch(`/api/videos/youtube-status?${query}`)
      .then(async (response) => {
        if (!response.ok) return undefined;
        return await response.json() as { youtube?: YouTubeStatus; odysee?: SourceAvailability };
      })
      .then((result) => {
        if (!active || !result?.youtube) return;

        const odyseeAvailable = Boolean(odyseeEmbedUrl) && result.odysee !== 'unavailable';
        if (result.odysee) {
          setOdyseeStatus(result.odysee);
          if (result.odysee === 'unavailable') {
            setPlatform((current) => current === 'odysee' ? 'youtube' : current);
          }
        }

        if (result.youtube === 'unavailable') {
          showYouTubeIssue('unavailable', 'YouTube indica que este video ya no está disponible.', odyseeAvailable);
          return;
        }

        if (result.youtube === 'embedding-blocked') {
          showYouTubeIssue('embedding-blocked', 'YouTube no permite reproducir este video dentro de la guía.', odyseeAvailable);
          return;
        }

        setYouTubeStatus(result.youtube);
      })
      .catch(() => {
        if (active) setYouTubeStatus('unknown');
      });

    return () => {
      active = false;
    };
  }, [id, odyseeEmbedUrl, odyseeUrl, showYouTubeIssue]);

  function selectPlatform(nextPlatform: 'youtube' | 'odysee') {
    if (nextPlatform === platform || (nextPlatform === 'youtube' && youtubeUnavailable)) return;
    setIsLoading(true);
    setPlatform(nextPlatform);
  }

  return (
    <section className={['not-prose overflow-hidden rounded-2xl border bg-fd-card shadow-sm', embedded ? '' : 'my-8'].join(' ')}>
      <div className="border-b bg-fd-muted/40 px-5 py-4 sm:px-6">
        {leading ? <div className="mb-3">{leading}</div> : null}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-fd-foreground">{title}</p>
            <p className="mt-1 text-xs text-fd-muted-foreground">Elige la plataforma que prefieras; el video se mostrar&aacute; aqu&iacute; mismo.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {youtubePending ? (
              <span className="inline-flex min-h-9 cursor-not-allowed items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-xs font-medium text-fd-muted-foreground">
                <Play className="size-3.5" />
                YouTube pendiente
              </span>
            ) : (
            <button
              type="button"
              onClick={() => selectPlatform('youtube')}
              aria-pressed={!isOdysee}
              disabled={youtubeUnavailable}
              className={[
                'inline-flex min-h-9 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition',
                youtubeUnavailable
                  ? 'cursor-not-allowed border border-dashed bg-fd-muted text-fd-muted-foreground opacity-75'
                  : !isOdysee
                    ? 'bg-red-600 text-white hover:bg-red-700 active:scale-[0.97]'
                    : 'border bg-fd-background text-fd-foreground hover:border-red-600/60 hover:text-red-600 active:scale-[0.97]',
              ].join(' ')}
            >
              <Play className="size-3.5 fill-current" />
              {youtubeUnavailable ? 'YouTube no disponible' : 'YouTube'}
            </button>
            )}
            {odyseeEmbedUrl ? (
              <button
                type="button"
                onClick={() => selectPlatform('odysee')}
                aria-pressed={isOdysee}
                disabled={odyseeStatus === 'unavailable'}
                className={[
                  'inline-flex min-h-9 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition active:scale-[0.97]',
                  odyseeStatus === 'unavailable'
                    ? 'cursor-not-allowed border border-dashed bg-fd-muted text-fd-muted-foreground opacity-75'
                    : isOdysee
                    ? 'bg-fd-primary text-fd-primary-foreground shadow-sm hover:brightness-95'
                    : 'border bg-fd-background text-fd-foreground hover:border-fd-primary/60 hover:text-fd-primary',
                ].join(' ')}
              >
                <AlternativeIcon />
                {odyseeStatus === 'unavailable' ? 'Alternativo no disponible' : 'Alternativo'}
              </button>
            ) : (
              <span className="inline-flex min-h-9 cursor-not-allowed items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-xs font-medium text-fd-muted-foreground">
                <AlternativeIcon muted />
                Alternativo pendiente
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="relative aspect-video overflow-hidden bg-black">
        {isOdysee ? (
          <iframe
            src={odyseeEmbedUrl}
            title={`${title} en plataforma alternativa`}
            className="size-full"
            loading="lazy"
            onLoad={markVideoReady}
            onError={handleOdyseeError}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : tutorialPending ? (
          <VideoPending title={title} />
        ) : youtubeUnavailable ? (
          <VideoUnavailable title={title} message={youtubeIssue} />
        ) : (
          <YouTubePlayer id={id ?? ''} onReady={markVideoReady} onError={handleYouTubePlayerError} />
        )}
        {isLoading && !tutorialPending && !youtubeUnavailable ? <VideoLoadingOverlay platform={activePlatform} /> : null}
      </div>

      <div className="border-t px-5 py-3 text-xs leading-5 text-fd-muted-foreground" aria-live="polite">
        {tutorialPending ? (
          <span>Este tutorial está pendiente de publicación. Inténtalo de nuevo más adelante.</span>
        ) : youtubeIssue ? (
          <span>{isOdysee ? `Mostrando versión alternativa: ${youtubeIssue}` : youtubeIssue}</span>
        ) : (
          <span>Si YouTube no está disponible, se usará una versión alternativa cuando exista una copia.</span>
        )}
      </div>
    </section>
  );
}

function YouTubePlayer({
  id,
  onReady,
  onError,
}: {
  id: string;
  onReady: () => void;
  onError: (code: number) => void;
}) {
  const playerElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let player: YouTubePlayerInstance | undefined;
    let disposed = false;

    void loadYouTubeIframeApi()
      .then(() => {
        if (disposed || !playerElement.current || !window.YT?.Player) return;

        // La API de YouTube reemplaza el nodo que recibe. Se crea un hijo
        // imperativo para que React siga siendo dueño del contenedor exterior.
        const playerHost = document.createElement('div');
        playerHost.className = 'size-full';
        playerElement.current.replaceChildren(playerHost);

        player = new window.YT.Player(playerHost, {
          videoId: id,
          host: 'https://www.youtube-nocookie.com',
          playerVars: {
            origin: window.location.origin,
            playsinline: 1,
          },
          events: {
            onReady,
            onError: (event) => onError(event.data),
          },
        });
      })
      .catch(() => onError(5));

    return () => {
      disposed = true;
      player?.destroy();
      playerElement.current?.replaceChildren();
    };
  }, [id, onError, onReady]);

  return <div ref={playerElement} className="size-full" />;
}

function VideoUnavailable({ title, message }: { title: string; message?: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-fd-muted px-6 text-center">
      <div className="max-w-sm">
        <CircleAlert className="mx-auto size-8 text-fd-muted-foreground" aria-hidden="true" />
        <p className="mt-3 text-sm font-semibold text-fd-foreground">Tutorial no disponible en YouTube</p>
        <p className="mt-1 text-xs leading-5 text-fd-muted-foreground">{message ?? `No fue posible cargar “${title}”.`}</p>
      </div>
    </div>
  );
}

function VideoPending({ title }: { title: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-fd-muted px-6 text-center">
      <div className="max-w-sm">
        <CircleAlert className="mx-auto size-8 text-fd-muted-foreground" aria-hidden="true" />
        <p className="mt-3 text-sm font-semibold text-fd-foreground">Tutorial pendiente</p>
        <p className="mt-1 text-xs leading-5 text-fd-muted-foreground">
          Aún no hay una versión disponible de “{title}”. Estamos preparando este material.
        </p>
      </div>
    </div>
  );
}

function VideoLoadingOverlay({ platform }: { platform: 'YouTube' | 'Alternativo' }) {
  return (
    <div
      className="sinai-video-loading absolute inset-0 z-10 grid place-items-center bg-black"
      role="status"
      aria-live="polite"
      aria-label={`Preparando el video en ${platform}`}
    >
      <div className="flex w-56 flex-col items-center text-center text-white">
        <div className="sinai-video-signal" aria-hidden="true">
          <span className="sinai-video-signal-orbit" />
          <span className="sinai-video-signal-pulse" />
          <span className="sinai-video-signal-core">
            <Play className="size-5 translate-x-px fill-current" />
          </span>
          <span className="sinai-video-signal-node sinai-video-signal-node-a" />
          <span className="sinai-video-signal-node sinai-video-signal-node-b" />
          <span className="sinai-video-signal-node sinai-video-signal-node-c" />
        </div>
        <p className="mt-6 text-sm font-semibold tracking-tight">Preparando {platform}</p>
        <p className="mt-1 text-xs text-white/55">Conectando con el reproductor&hellip;</p>
        <span className="sinai-video-loading-track mt-5" aria-hidden="true">
          <span />
        </span>
      </div>
    </div>
  );
}

function AlternativeIcon({ muted = false }: { muted?: boolean }) {
  return (
    <CirclePlay
      aria-hidden="true"
      className={['size-4 shrink-0', muted ? 'opacity-55' : ''].join(' ')}
    />
  );
}

let youtubeApiPromise: Promise<void> | undefined;

function loadYouTubeIframeApi() {
  if (window.YT?.Player) return Promise.resolve();
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.dataset.sinaiYouTubeApi = 'true';
    script.onerror = () => reject(new Error('No fue posible cargar la API de YouTube.'));

    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      resolve();
    };

    document.head.append(script);
  });

  return youtubeApiPromise;
}

function toOdyseeEmbedUrl(url: string) {
  const parsed = new URL(url);
  return `${parsed.origin}/$/embed${parsed.pathname}${parsed.search}`;
}
