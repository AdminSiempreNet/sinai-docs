'use client';

import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type ActiveImage = {
  src: string;
  alt: string;
  trigger: HTMLElement;
};

function getImageFromTarget(target: EventTarget | null) {
  if (target instanceof HTMLImageElement) return target;
  if (target instanceof HTMLAnchorElement) {
    return target.querySelector<HTMLImageElement>('img:not([data-image-modal-managed])');
  }
  return null;
}

export function ContentImageModal() {
  const [activeImage, setActiveImage] = useState<ActiveImage>();
  const activeTriggerRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const closeImage = () => {
    const trigger = activeImage?.trigger ?? activeTriggerRef.current;
    setActiveImage(undefined);
    requestAnimationFrame(() => trigger?.focus());
  };

  useEffect(() => {
    const prepareImages = () => {
      document.querySelectorAll<HTMLImageElement>('#nd-page img:not([data-image-modal-managed])').forEach((image) => {
        const imageLink = image.closest('a');
        const trigger = imageLink ?? image;

        if (imageLink) {
          imageLink.setAttribute('aria-haspopup', 'dialog');
          imageLink.setAttribute('aria-label', `Ampliar captura: ${image.alt || 'imagen de SINAI'}`);
        } else {
          image.setAttribute('role', 'button');
          image.tabIndex = 0;
          image.setAttribute('aria-haspopup', 'dialog');
          image.setAttribute('aria-label', `Ampliar captura: ${image.alt || 'imagen de SINAI'}`);
        }

        trigger.setAttribute('data-image-modal-trigger', '');
      });
    };

    const openImage = (event: MouseEvent | KeyboardEvent) => {
      const image = getImageFromTarget(event.target);
      if (!image || !image.closest('#nd-page') || image.closest('[data-image-modal-managed]')) return;

      if (event instanceof KeyboardEvent && event.key !== 'Enter' && event.key !== ' ') return;

      event.preventDefault();
      event.stopPropagation();
      const imageLink = image.closest('a');
      const linkedImage = imageLink?.getAttribute('href');
      const isImageLink = linkedImage && /\.(avif|gif|jpe?g|png|svg|webp)(?:[?#].*)?$/i.test(linkedImage);
      const nextImage = {
        src: isImageLink ? linkedImage : image.currentSrc || image.src,
        alt: image.alt,
        trigger: imageLink ?? image,
      };
      activeTriggerRef.current = nextImage.trigger;
      setActiveImage(nextImage);
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeImage();
    };

    const observer = new MutationObserver(prepareImages);
    prepareImages();
    observer.observe(document.getElementById('nd-page') ?? document.body, { childList: true, subtree: true });
    document.addEventListener('click', openImage, true);
    document.addEventListener('keydown', openImage, true);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      observer.disconnect();
      document.removeEventListener('click', openImage, true);
      document.removeEventListener('keydown', openImage, true);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  useEffect(() => {
    if (!activeImage) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeImage]);

  if (!activeImage) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={activeImage.alt || 'Imagen ampliada'}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-8"
      onClick={closeImage}
      onKeyDown={(event) => {
        if (event.key === 'Tab') {
          event.preventDefault();
          closeButtonRef.current?.focus();
        }
      }}
    >
      <div className="relative flex max-h-full max-w-6xl rounded-xl bg-fd-card p-3 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={closeImage}
          className="absolute -right-2 -top-2 z-10 inline-flex size-11 items-center justify-center rounded-full border bg-fd-card text-fd-foreground shadow-md transition hover:bg-fd-accent"
          aria-label="Cerrar imagen ampliada"
        >
          <X className="size-4" />
        </button>
        <img src={activeImage.src} alt={activeImage.alt} className="max-h-[calc(100dvh-7rem)] max-w-full rounded-lg object-contain" />
      </div>
    </div>
  );
}
