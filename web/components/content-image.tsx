'use client';

import { ChevronLeft, ChevronRight, ImageIcon, Images, X } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

function ImageDialog({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt || 'Imagen ampliada'}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
    >
      <div className="relative flex max-h-full max-w-6xl rounded-xl bg-fd-card p-3 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className="absolute -right-2 -top-2 z-10 inline-flex size-11 items-center justify-center rounded-full border bg-fd-card text-fd-foreground shadow-md transition hover:bg-fd-accent"
          aria-label="Cerrar imagen ampliada"
        >
          <X className="size-4" />
        </button>
        <img src={src} alt={alt} className="max-h-[calc(100dvh-7rem)] max-w-full rounded-lg object-contain" />
      </div>
    </div>
  );
}

export function ContentImage({ alt = '', className, onClick, onKeyDown, src, ...props }: ComponentProps<'img'>) {
  const [open, setOpen] = useState(false);
  const imageSrc = typeof src === 'string' ? src : '';
  const previewClassName = className ?? 'mx-auto block h-auto max-h-[30rem] w-auto max-w-full object-contain';

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  const openModal = () => setOpen(true);

  return (
    <>
      <img
        {...props}
        src={imageSrc}
        alt={alt}
        data-image-modal-managed
        role="button"
        tabIndex={0}
        className={`cursor-zoom-in ${previewClassName}`}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onClick?.(event);
          openModal();
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openModal();
          }
        }}
      />

      {open && <ImageDialog src={imageSrc} alt={alt} onClose={() => setOpen(false)} />}
    </>
  );
}

export function ContentImageTrigger({
  src,
  alt,
  children = 'Ver captura de referencia',
}: {
  src: string;
  alt: string;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeModal = () => {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="not-prose inline-flex min-h-11 items-center gap-2 rounded-lg border bg-fd-card px-3.5 py-2 text-sm font-medium text-fd-foreground shadow-sm transition hover:bg-fd-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
      >
        <ImageIcon className="size-4 text-fd-primary" aria-hidden="true" />
        {children}
      </button>
      {open && <ImageDialog src={src} alt={alt} onClose={closeModal} />}
    </>
  );
}

type ImageSequenceItem = {
  src: string;
  alt: string;
};

export function ContentImageSequenceTrigger({
  images,
  children = 'Ver ejemplos visuales',
}: {
  images: ImageSequenceItem[];
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const total = images.length;
  const activeImage = images[activeIndex];

  const closeModal = () => {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const showPrevious = () => setActiveIndex((index) => (index - 1 + total) % total);
  const showNext = () => setActiveIndex((index) => (index + 1) % total);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeModal();
      if (event.key === 'ArrowLeft') showPrevious();
      if (event.key === 'ArrowRight') showNext();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, total]);

  if (!activeImage || total === 0) return null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setActiveIndex(0);
          setOpen(true);
        }}
        className="not-prose inline-flex min-h-11 items-center gap-2 rounded-lg border bg-fd-card px-3.5 py-2 text-sm font-medium text-fd-foreground shadow-sm transition hover:bg-fd-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
      >
        <Images className="size-4 text-fd-primary" aria-hidden="true" />
        {children}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Ejemplos visuales del proceso"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-8"
          onClick={closeModal}
        >
          <div className="relative flex max-h-full max-w-6xl rounded-xl bg-fd-card p-3 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={closeModal}
              className="absolute -right-2 -top-2 z-10 inline-flex size-11 items-center justify-center rounded-full border bg-fd-card text-fd-foreground shadow-md transition hover:bg-fd-accent"
              aria-label="Cerrar visor de imágenes"
            >
              <X className="size-4" />
            </button>

            <img
              src={activeImage.src}
              alt={activeImage.alt}
              className="max-h-[calc(100dvh-9rem)] max-w-full rounded-lg object-contain"
            />

            {total > 1 && (
              <div className="absolute inset-x-5 bottom-5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={showPrevious}
                  className="inline-flex size-11 items-center justify-center rounded-full border border-white/20 bg-black/65 text-white shadow-sm transition hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  aria-label="Ver imagen anterior"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <span className="rounded-full bg-black/65 px-3 py-1.5 text-xs font-medium text-white" aria-live="polite">
                  {activeIndex + 1} de {total}
                </span>
                <button
                  type="button"
                  onClick={showNext}
                  className="inline-flex size-11 items-center justify-center rounded-full border border-white/20 bg-black/65 text-white shadow-sm transition hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  aria-label="Ver imagen siguiente"
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
