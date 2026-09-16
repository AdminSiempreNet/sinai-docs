'use client';

import './content-image.css';

import { ChevronLeft, ChevronRight, Images, X } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

type ImageSequenceItem = {
  src: string;
  alt: string;
};

export type ImageTriggerVariant = 'default' | 'contextual' | 'microchip' | 'reference';

function ExamplePreview({ image, caption = 'Vista previa' }: { image: ImageSequenceItem; caption?: string }) {
  return (
    <>
      <span className="sinai-reference-card-image">
        <img src={image.src} alt="" loading="lazy" data-image-modal-managed />
      </span>
      <span className="sinai-reference-card-caption">{caption}</span>
    </>
  );
}

function ImageDialogFrame({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="sinai-image-dialog" onClick={(event) => event.stopPropagation()}>
      <header className="sinai-image-dialog-header">
        <div className="sinai-image-dialog-title">
          <Images aria-hidden="true" />
          <div>
            <p>Referencia del proceso</p>
            <h2>{title}</h2>
          </div>
        </div>
        <div className="sinai-image-dialog-actions">
          <button type="button" onClick={onClose} className="sinai-image-dialog-close" aria-label="Cerrar visor de imágenes">
            <X aria-hidden="true" />
          </button>
        </div>
      </header>
      <div className="sinai-image-dialog-stage">{children}</div>
      {footer && <footer className="sinai-image-dialog-footer">{footer}</footer>}
    </div>
  );
}

function ImageDialog({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt || 'Imagen ampliada'}
      className="sinai-image-dialog-backdrop fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <ImageDialogFrame title={alt || 'Captura de SINAI'} onClose={onClose}>
        <img src={src} alt={alt} className="sinai-image-dialog-image" data-image-modal-managed />
      </ImageDialogFrame>
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
}: {
  src: string;
  alt: string;
  children?: ReactNode;
  compact?: boolean;
  variant?: ImageTriggerVariant;
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
      <span className="sinai-reference-cards not-prose">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          className="sinai-reference-card"
          aria-label={`Ver referencia visual: ${alt}`}
        >
          <ExamplePreview image={{ src, alt }} />
        </button>
      </span>
      {open && <ImageDialog src={src} alt={alt} onClose={closeModal} />}
    </>
  );
}

export function ContentImageSequenceTrigger({
  images,
}: {
  images: ImageSequenceItem[];
  children?: ReactNode;
  compact?: boolean;
  variant?: ImageTriggerVariant;
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
      <span className="sinai-reference-cards not-prose">
        {images.map((image, index) => (
          <button
            key={`${image.src}-${index}`}
            type="button"
            onClick={(event) => {
              triggerRef.current = event.currentTarget;
              setActiveIndex(index);
              setOpen(true);
            }}
            className="sinai-reference-card"
            aria-label={`Ver referencia visual ${index + 1} de ${total}: ${image.alt}`}
          >
            <ExamplePreview image={image} caption={total > 1 ? `Vista previa ${index + 1} de ${total}` : 'Vista previa'} />
          </button>
        ))}
      </span>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Ejemplos visuales del proceso"
          className="sinai-image-dialog-backdrop fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
          onClick={closeModal}
        >
          <ImageDialogFrame
            title={activeImage.alt}
            onClose={closeModal}
            footer={total > 1 ? (
              <div className="sinai-image-dialog-navigation">
                <button type="button" onClick={showPrevious} className="sinai-image-dialog-nav" aria-label="Ver imagen anterior">
                  <ChevronLeft aria-hidden="true" />
                  Anterior
                </button>
                <span className="sinai-image-dialog-progress" aria-live="polite">
                  Captura <strong>{activeIndex + 1}</strong> de {total}
                </span>
                <button type="button" onClick={showNext} className="sinai-image-dialog-nav" aria-label="Ver imagen siguiente">
                  Siguiente
                  <ChevronRight aria-hidden="true" />
                </button>
              </div>
            ) : undefined}
          >
            <img src={activeImage.src} alt={activeImage.alt} className="sinai-image-dialog-image" data-image-modal-managed />
          </ImageDialogFrame>
        </div>
      )}
    </>
  );
}
