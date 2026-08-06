'use client';

import { Children, cloneElement, isValidElement, useState, type ReactElement, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, CircleHelp, Clock3, ExternalLink, Info } from 'lucide-react';
import { ContentImage, ContentImageSequenceTrigger, ContentImageTrigger, type ImageTriggerVariant } from '@/components/content-image';

export function GuideOverview({ children }: { children: ReactNode }) {
  return (
    <section className="not-prose my-8 overflow-hidden rounded-2xl border bg-gradient-to-br from-fd-primary/10 via-fd-card to-fd-card p-6 shadow-sm sm:p-7">
      <div className="flex items-center gap-2 text-sm font-semibold text-fd-primary">
        <CheckCircle2 className="size-4" />
        En esta guía
      </div>
      <div className="mt-3 text-[0.95rem] leading-7 text-fd-muted-foreground">{children}</div>
      <div className="mt-5 inline-flex items-center gap-2 rounded-full border bg-fd-background/70 px-3 py-1.5 text-xs font-medium text-fd-muted-foreground">
        <Clock3 className="size-3.5" />
        Tiempo estimado: 10 minutos
      </div>
    </section>
  );
}

export function GuideSummary({
  children,
  prerequisite,
  duration,
}: {
  children: ReactNode;
  prerequisite: ReactNode;
  duration?: string;
}) {
  return (
    <section className="not-prose my-3 grid overflow-hidden rounded-xl border bg-fd-card text-sm sm:grid-cols-2">
      <div className="flex gap-3 p-4">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-fd-primary" />
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="font-semibold text-fd-foreground">En esta gu&iacute;a</p>
            {duration && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-fd-muted-foreground">
                <Clock3 className="size-3.5" />
                {duration}
              </span>
            )}
          </div>
          <div className="mt-1 leading-6 text-fd-muted-foreground">{children}</div>
        </div>
      </div>
      <div className="flex gap-3 border-t bg-fd-muted/35 p-4 sm:border-s sm:border-t-0">
        <Info className="mt-0.5 size-4 shrink-0 text-fd-primary" />
        <div>
          <p className="font-semibold text-fd-foreground">Antes de comenzar</p>
          <div className="mt-1 leading-6 text-fd-muted-foreground">{prerequisite}</div>
        </div>
      </div>
    </section>
  );
}

function GuideSummaryLegacy({
  children,
  prerequisite,
  duration,
}: {
  children: ReactNode;
  prerequisite: ReactNode;
  duration?: string;
}) {
  return (
    <section className="not-prose my-3 grid overflow-hidden rounded-xl border bg-fd-card text-sm sm:grid-cols-2">
      <div className="flex gap-3 p-4">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-fd-primary" />
        <div>
          <p className="font-semibold text-fd-foreground">En esta guía</p>
          <div className="mt-1 leading-6 text-fd-muted-foreground">{children}</div>
        </div>
      </div>
      <div className="flex gap-3 border-t bg-fd-muted/35 p-4 sm:border-s sm:border-t-0">
        <Info className="mt-0.5 size-4 shrink-0 text-fd-primary" />
        <div>
          <p className="font-semibold text-fd-foreground">Antes de comenzar</p>
          <div className="mt-1 leading-6 text-fd-muted-foreground">{prerequisite}</div>
        </div>
      </div>
    </section>
  );
}

export function GuideVideos({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  return (
    <section
      id="video-tutorial"
      className={compact ? 'not-prose -mt-3 mb-7 scroll-mt-24' : 'not-prose my-7 scroll-mt-24'}
    >
      {!compact && <div className="mb-3 flex items-baseline justify-between gap-4" />}
      <div className="space-y-5 [&_section]:my-0">{children}</div>
    </section>
  );
}

export function GuideGallery({ children, label = 'Ver capturas complementarias' }: { children: ReactNode; label?: string }) {
  return (
    <div
      role="group"
      aria-label={label}
      className="not-prose my-5 grid gap-3 sm:grid-cols-2 [&_figure]:my-0 [&_figure]:min-h-full [&_img]:h-auto [&_img]:max-h-64 [&_img]:w-full [&_img]:object-contain"
    >
      {children}
    </div>
  );
}

export function GuideFocusGrid({ children }: { children: ReactNode }) {
  return <div className="not-prose my-6 grid grid-cols-1 gap-3 sm:grid-cols-3 [&_figure]:my-0 [&_figure]:max-w-none">{children}</div>;
}

export function GuideImageTrigger({ src, alt, children, compact = false, variant = 'default' }: { src: string; alt: string; children?: ReactNode; compact?: boolean; variant?: ImageTriggerVariant }) {
  return <ContentImageTrigger src={src} alt={alt} compact={compact} variant={variant}>{children}</ContentImageTrigger>;
}

export function GuideImageSequence({
  images,
  children,
  compact = false,
  variant = 'default',
}: {
  images: { src: string; alt: string }[];
  children?: ReactNode;
  compact?: boolean;
  variant?: ImageTriggerVariant;
}) {
  return <ContentImageSequenceTrigger images={images} compact={compact} variant={variant}>{children}</ContentImageSequenceTrigger>;
}

export function GuideCallout({
  children,
  type = 'info',
}: {
  children: ReactNode;
  type?: 'info' | 'warning';
}) {
  const isWarning = type === 'warning';
  const Icon = isWarning ? AlertTriangle : Info;

  return (
    <aside
      className={[
        'sinai-guide-callout not-prose my-4 flex gap-3 rounded-lg border p-3 text-sm leading-6',
        isWarning
          ? 'border-amber-500/30 bg-amber-500/10 text-fd-foreground'
          : 'border-fd-primary/25 bg-fd-primary/8 text-fd-foreground',
      ].join(' ')}
    >
      <Icon className={isWarning ? 'mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400' : 'mt-0.5 size-5 shrink-0 text-fd-primary'} />
      <div>{children}</div>
    </aside>
  );
}

export function GuideFAQ({ children }: { children: ReactNode }) {
  const [openItem, setOpenItem] = useState<string | null>(null);

  return (
    <section className="sinai-guide-faq not-prose my-8 overflow-hidden rounded-2xl border bg-fd-card shadow-sm" aria-labelledby="guide-faq-title">
      <header className="sinai-guide-faq-header border-b px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex items-start gap-3">
          <span className="sinai-guide-faq-icon grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-sm">
            <CircleHelp className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="m-0 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-fd-primary">Centro de ayuda</p>
            <h2 id="guide-faq-title" className="mt-1 text-xl font-semibold tracking-tight text-fd-foreground">
              Preguntas frecuentes
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-fd-muted-foreground">
              Consulte las situaciones más comunes relacionadas con este proceso.
            </p>
          </div>
        </div>
      </header>
      <div className="divide-y">
        {Children.map(children, (child) => {
          if (!isValidElement<GuideFAQItemProps>(child)) return child;

          return cloneElement(child as ReactElement<GuideFAQItemProps>, {
            open: openItem === child.props.index,
            onToggle: (isOpen) => {
              if (isOpen) {
                setOpenItem(child.props.index);
                return;
              }

              setOpenItem((currentItem) => (currentItem === child.props.index ? null : currentItem));
            },
          });
        })}
      </div>
    </section>
  );
}

type GuideFAQItemProps = {
  index: string;
  question: string;
  children: ReactNode;
  open?: boolean;
  onToggle?: (isOpen: boolean) => void;
};

export function GuideFAQItem({
  index,
  question,
  children,
  open = false,
  onToggle,
}: GuideFAQItemProps) {
  return (
    <details
      className="sinai-guide-faq-item group bg-fd-card transition-colors"
      open={open}
      onToggle={(event) => onToggle?.(event.currentTarget.open)}
    >
      <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 px-5 py-4 text-start outline-none transition-colors hover:bg-fd-muted/55 focus-visible:bg-fd-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fd-primary sm:px-6 [&::-webkit-details-marker]:hidden">
        <span className="sinai-guide-faq-index font-mono text-xs font-bold tabular-nums text-fd-primary" aria-hidden="true">
          {index}
        </span>
        <span className="min-w-0 flex-1 text-[0.95rem] font-semibold leading-6 text-fd-foreground">{question}</span>
        <span className="sinai-guide-faq-chevron grid size-8 shrink-0 place-items-center rounded-full border bg-fd-card text-fd-muted-foreground transition-transform duration-200 group-open:rotate-180 group-open:border-fd-primary/30 group-open:text-fd-primary">
          <ChevronDown className="size-4" aria-hidden="true" />
        </span>
      </summary>
      <div className="px-5 pb-5 sm:px-6 sm:pb-6">
        <div className="sinai-guide-faq-answer border-s-2 border-fd-primary/35 ps-4 text-[0.95rem] font-normal leading-7 text-fd-muted-foreground [&_p]:m-0 [&_strong]:font-normal [&_strong]:text-fd-muted-foreground">
          {children}
        </div>
      </div>
    </details>
  );
}

export function GuideStep({
  id,
  number,
  title,
  children,
}: {
  id?: string;
  number: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="not-prose relative my-6 grid scroll-mt-24 grid-cols-[2.5rem_1fr] gap-4 sm:grid-cols-[3rem_1fr] sm:gap-5">
      <div className="flex justify-center">
        <span className="flex size-9 items-center justify-center rounded-full bg-fd-primary text-sm font-bold text-fd-primary-foreground shadow-sm sm:size-10">
          {number}
        </span>
      </div>
      <div className="min-w-0 border-b border-fd-border pb-7 last:border-none">
        <h3 className="m-0 text-lg font-semibold tracking-tight text-fd-foreground">{title}</h3>
        <div className="mt-2 text-[0.95rem] leading-7 text-fd-muted-foreground [&_strong]:font-semibold [&_strong]:text-fd-foreground [&_ul]:my-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
          {children}
        </div>
      </div>
    </section>
  );
}

function GuideScreenshotFrame({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption?: string;
}) {
  return (
    <figure className="not-prose my-6 mx-auto w-full max-w-3xl overflow-hidden rounded-xl border bg-fd-card shadow-sm">
      <a href={src} target="_blank" rel="noreferrer" className="flex min-h-48 items-center justify-center bg-fd-muted/35 p-3 sm:p-5">
        <img src={src} alt={alt} className="max-h-[30rem] max-w-full rounded-md object-contain shadow-sm" />
      </a>
      <figcaption className="flex items-center gap-2 border-t px-4 py-3 text-xs leading-5 text-fd-muted-foreground">
        <ExternalLink className="size-3.5 shrink-0" />
        {caption ?? 'Haz clic en la captura para ampliarla.'}
      </figcaption>
    </figure>
  );
}

export function GuideScreenshotGrid({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose my-6 grid gap-5 md:grid-cols-2 [&_figure]:my-0 [&_figure]:min-h-full [&_figure]:max-w-none [&_img]:max-h-80">
      {children}
    </div>
  );
}

export function GuideImage({
  src,
  alt,
  caption,
  compact = false,
  variant = 'default',
  size: _size = 'wide',
  presentation: _presentation = 'balanced',
  showCaption: _showCaption = false,
  focusPosition: _focusPosition = 'center',
  focusFit: _focusFit = 'cover',
}: {
  src: string;
  alt: string;
  caption?: string;
  compact?: boolean;
  variant?: ImageTriggerVariant;
  size?: 'compact' | 'medium' | 'wide';
  /**
   * Keeps smaller source captures at a calm, readable scale and adds a
   * neutral canvas around them. It is the default presentation for guides.
   */
  presentation?: 'default' | 'balanced' | 'focused';
  /** Hides the visible footer while retaining the accessible zoom interaction. */
  showCaption?: boolean;
  /** Defines the relevant area of a source image when used as a compact visual reference. */
  focusPosition?: 'left' | 'center' | 'right';
  focusFit?: 'cover' | 'contain';
}) {
  return (
    <ContentImageTrigger src={src} alt={alt} compact={compact} variant={variant}>
      {caption ?? 'Ver ejemplo'}
    </ContentImageTrigger>
  );
}
