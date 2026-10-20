'use client';

import { ChevronDown, ChevronLeft, ChevronRight, ListVideo } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { YouTube } from '@/components/youtube';

type GuideVideo = {
  id: string;
  title: string;
  description: string;
  odyseeUrl?: string;
};

export function GuideVideoPlaylist({
  title = 'Ruta de aprendizaje',
  description = 'Elija un video para verlo. Recomendamos seguirlos en orden.',
  videos,
}: {
  title?: string;
  description?: string;
  videos: GuideVideo[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [highlightPlayer, setHighlightPlayer] = useState(false);
  const [highlightList, setHighlightList] = useState(false);
  const [scrollRequest, setScrollRequest] = useState(0);
  const [scrollTarget, setScrollTarget] = useState<'player' | 'list'>('player');
  const playerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const activeVideo = videos[activeIndex];
  const hasMoreVideos = videos.length > 1;

  useEffect(() => {
    if (!scrollRequest) return;

    const frame = window.requestAnimationFrame(() => {
      const element = scrollTarget === 'player' ? playerRef.current : listRef.current;
      if (!element) return;

      const offset = Number.parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? 'auto' : 'smooth' });
      if (scrollTarget === 'player') setHighlightPlayer(true);
      else setHighlightList(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [scrollRequest, scrollTarget]);

  useEffect(() => {
    if (!highlightPlayer) return;
    const timeout = window.setTimeout(() => setHighlightPlayer(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [highlightPlayer]);

  useEffect(() => {
    if (!highlightList) return;
    const timeout = window.setTimeout(() => setHighlightList(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [highlightList]);

  if (!activeVideo) return null;

  function selectVideo(index: number) {
    setActiveIndex(index);
    setHighlightPlayer(false);
    setHighlightList(false);
    setScrollTarget('player');
    setScrollRequest((request) => request + 1);
  }

  function showList() {
    setHighlightPlayer(false);
    setHighlightList(false);
    setScrollTarget('list');
    setScrollRequest((request) => request + 1);
  }

  return (
    <section id="video-tutorial" className="not-prose -mt-3 mb-7 scroll-mt-24">
      <div
        ref={listRef}
        className={[
          'scroll-mt-[calc(var(--fd-docs-row-3,3.5rem)+1rem)] overflow-hidden rounded-2xl border bg-fd-card shadow-sm transition-shadow duration-700',
          highlightList ? 'shadow-[0_0_0_3px_var(--color-fd-primary)]' : '',
        ].join(' ')}
      >
        <div className="border-b bg-fd-muted/35 px-5 py-4 sm:px-6">
          <p className="text-sm font-semibold text-fd-foreground">{title}</p>
          <p className="mt-1 text-sm leading-6 text-fd-muted-foreground">{description}</p>
          <p className="mt-3 flex items-start gap-2 rounded-lg border border-dashed border-fd-primary/40 bg-fd-primary/5 px-3 py-2 text-sm leading-6 text-fd-foreground">
            <ChevronDown className="mt-0.5 size-4 shrink-0 text-fd-primary" aria-hidden="true" />
            <span>
              {hasMoreVideos ? (
                <>
                  <span className="font-semibold">Pulse un video.</span> Se abre en el reproductor de abajo.
                </>
              ) : (
                <>El video se abre en el reproductor de abajo.</>
              )}
            </span>
          </p>
        </div>

        <div className="grid gap-3 p-3 sm:grid-cols-2 sm:p-4" role="list" aria-label={title}>
          {videos.map((video, index) => {
            const selected = index === activeIndex;

            return (
              <div key={video.id} role="listitem">
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectVideo(index)}
                  className={[
                    'group min-h-24 w-full rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2',
                    selected
                      ? 'border-fd-primary bg-fd-primary/10 shadow-sm'
                      : 'bg-fd-background hover:border-fd-primary/50 hover:bg-fd-accent/45',
                  ].join(' ')}
                >
                  <div className="flex items-start gap-3">
                    <span className={[
                      'mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                      selected ? 'bg-fd-primary text-fd-primary-foreground' : 'bg-fd-muted text-fd-muted-foreground',
                    ].join(' ')}>
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-fd-foreground">{video.title}</span>
                      <span className="mt-1 block text-xs leading-5 text-fd-muted-foreground">{video.description}</span>
                    </span>
                    <span className={[
                      'mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
                      selected
                        ? 'bg-fd-primary text-fd-primary-foreground'
                        : 'border bg-fd-background text-fd-muted-foreground group-hover:border-fd-primary/50 group-hover:text-fd-primary',
                    ].join(' ')}>
                      {selected ? 'Se ve abajo' : 'Ver abajo'}
                      <ChevronDown className="size-3.5" aria-hidden="true" />
                    </span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 py-3 text-xs font-semibold text-fd-primary" aria-hidden="true">
        <span className="h-px w-8 bg-fd-primary/35" />
        <ChevronDown className="size-4" />
        <span>Se reproduce aquí</span>
        <span className="h-px w-8 bg-fd-primary/35" />
      </div>

      <div
        ref={playerRef}
        className={[
          'scroll-mt-[calc(var(--fd-docs-row-3,3.5rem)+1rem)] rounded-2xl transition-shadow duration-700',
          highlightPlayer ? 'shadow-[0_0_0_3px_var(--color-fd-primary)]' : 'shadow-none',
        ].join(' ')}
      >
        <YouTube
          key={activeVideo.id}
          embedded
          id={activeVideo.id}
          title={activeVideo.title}
          odyseeUrl={activeVideo.odyseeUrl}
          leading={hasMoreVideos ? (
            <PlaylistNowPlaying
              index={activeIndex}
              total={videos.length}
              nextTitle={videos[activeIndex + 1]?.title}
              onPrevious={() => selectVideo(activeIndex - 1)}
              onNext={() => selectVideo(activeIndex + 1)}
              onShowList={showList}
            />
          ) : null}
        />
      </div>
    </section>
  );
}

function PlaylistNowPlaying({
  index,
  total,
  nextTitle,
  onPrevious,
  onNext,
  onShowList,
}: {
  index: number;
  total: number;
  nextTitle?: string;
  onPrevious: () => void;
  onNext: () => void;
  onShowList: () => void;
}) {
  return (
    <div
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      role="region"
      aria-label="Otros videos de esta guía"
    >
      <p className="min-w-0 text-xs leading-5 text-fd-muted-foreground">
        <span className="inline-flex items-center rounded-full bg-fd-primary/10 px-2 py-0.5 font-semibold text-fd-primary">
          Video {index + 1} de {total}
        </span>{' '}
        {nextTitle ? (
          <>El siguiente es <span className="font-medium text-fd-foreground">{nextTitle}</span>.</>
        ) : (
          <>Este es el último. Los demás siguen en la lista de arriba.</>
        )}
      </p>
      <div className="flex shrink-0 flex-wrap gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={index === 0}
          className={navButtonClass(index === 0)}
        >
          <ChevronLeft className="size-3.5" aria-hidden="true" />
          Anterior
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!nextTitle}
          className={navButtonClass(!nextTitle, true)}
        >
          Siguiente
          <ChevronRight className="size-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onShowList}
          className={navButtonClass(false)}
        >
          <ListVideo className="size-3.5" aria-hidden="true" />
          Ver la lista
        </button>
      </div>
    </div>
  );
}

function navButtonClass(disabled: boolean, primary = false) {
  if (disabled) {
    return 'inline-flex min-h-9 cursor-not-allowed items-center gap-1.5 rounded-lg border border-dashed bg-fd-muted px-3 py-2 text-xs font-semibold text-fd-muted-foreground opacity-75';
  }

  if (primary) {
    return 'inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-fd-primary px-3 py-2 text-xs font-semibold text-fd-primary-foreground transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 active:scale-[0.97]';
  }

  return 'inline-flex min-h-9 items-center gap-1.5 rounded-lg border bg-fd-background px-3 py-2 text-xs font-semibold text-fd-foreground transition hover:border-fd-primary/60 hover:text-fd-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 active:scale-[0.97]';
}
