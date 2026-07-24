'use client';

import { CheckCircle2, Play } from 'lucide-react';
import { useState } from 'react';
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
  const activeVideo = videos[activeIndex];

  if (!activeVideo) return null;

  return (
    <section id="video-tutorial" className="not-prose -mt-3 mb-7 scroll-mt-24">
      <div className="overflow-hidden rounded-2xl border bg-fd-card shadow-sm">
        <div className="border-b bg-fd-muted/35 px-5 py-4 sm:px-6">
          <p className="text-sm font-semibold text-fd-foreground">{title}</p>
          <p className="mt-1 text-sm leading-6 text-fd-muted-foreground">{description}</p>
        </div>

        <div className="grid gap-3 p-3 sm:grid-cols-2 sm:p-4" role="list" aria-label={title}>
          {videos.map((video, index) => {
            const selected = index === activeIndex;

            return (
              <div key={video.id} role="listitem">
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setActiveIndex(index)}
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
                      {selected ? <CheckCircle2 className="size-4" aria-hidden="true" /> : index + 1}
                    </span>
                    <span>
                      <span className="flex items-center gap-2 text-sm font-semibold text-fd-foreground">
                        {video.title}
                        {selected && <span className="text-xs font-medium text-fd-primary">En reproducción</span>}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-fd-muted-foreground">{video.description}</span>
                    </span>
                    <Play className={[
                      'ml-auto mt-1 size-4 shrink-0 transition',
                      selected ? 'fill-fd-primary text-fd-primary' : 'text-fd-muted-foreground group-hover:text-fd-primary',
                    ].join(' ')} aria-hidden="true" />
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <YouTube
        key={activeVideo.id}
        id={activeVideo.id}
        title={activeVideo.title}
        odyseeUrl={activeVideo.odyseeUrl}
      />
    </section>
  );
}
