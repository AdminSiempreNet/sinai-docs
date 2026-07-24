'use client';

import { X, ZoomIn } from 'lucide-react';
import { useEffect, useState } from 'react';

export function GuideScreenshot({
  src,
  alt,
  caption,
  showCaption = false,
}: {
  src: string;
  alt: string;
  caption?: string;
  showCaption?: boolean;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <>
      <figure data-image-modal-managed className="not-prose my-6 mx-auto w-full max-w-3xl overflow-hidden rounded-xl border bg-fd-card shadow-sm">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex min-h-48 w-full items-center justify-center bg-fd-muted/35 p-3 text-start sm:p-5"
          aria-label={`Ampliar captura: ${alt}`}
        >
          <span className="relative block max-w-full">
            <img src={src} alt={alt} className="max-h-[30rem] max-w-full rounded-md object-contain shadow-sm" />
            <span className="absolute inset-0 flex items-center justify-center rounded-md bg-black/0 opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100">
              <ZoomIn className="size-8 text-white drop-shadow" />
            </span>
          </span>
        </button>
        {showCaption && (
          <figcaption className="border-t px-4 py-3 text-xs leading-5 text-fd-muted-foreground">
            {caption ?? 'Haz clic en la captura para ampliarla.'}
          </figcaption>
        )}
      </figure>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setOpen(false)}
        >
          <div className="relative flex max-h-full max-w-6xl flex-col rounded-xl bg-fd-card p-3 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute -right-2 -top-2 z-10 inline-flex size-9 items-center justify-center rounded-full border bg-fd-card text-fd-foreground shadow-md transition hover:bg-fd-accent"
              aria-label="Cerrar captura ampliada"
            >
              <X className="size-4" />
            </button>
            <img src={src} alt={alt} className="max-h-[calc(100dvh-7rem)] max-w-full rounded-lg object-contain" />
            {caption && <p className="px-2 pt-3 text-center text-sm text-fd-muted-foreground">{caption}</p>}
          </div>
        </div>
      )}
    </>
  );
}
