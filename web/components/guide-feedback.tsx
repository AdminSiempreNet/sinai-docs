'use client';

import { CheckCircle2, CircleHelp, MessageSquareText } from 'lucide-react';
import { useState } from 'react';

type Feedback = 'useful' | 'needs-help' | undefined;

export function GuideFeedback({
  title,
  url,
  status,
  lastReviewed,
}: {
  title: string;
  url: string;
  status?: string;
  lastReviewed?: string;
}) {
  const [feedback, setFeedback] = useState<Feedback>();
  const subject = encodeURIComponent(`Solicitud de ayuda: ${title}`);
  const body = encodeURIComponent(`Guía: ${title}\nEnlace: ${url}\n\nCuéntanos qué paso necesitas aclarar:`);
  const reviewNote = [status, lastReviewed && `Revisión estructural: ${lastReviewed}`].filter(Boolean).join(' · ');

  return (
    <aside className="not-prose my-10 rounded-xl border bg-fd-card p-4 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-5">
      <div className="flex gap-3">
        {feedback === 'useful' ? (
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-fd-primary" aria-hidden="true" />
        ) : (
          <CircleHelp className="mt-0.5 size-5 shrink-0 text-fd-primary" aria-hidden="true" />
        )}
        <div>
          <h2 className="m-0 text-base font-semibold text-fd-foreground">
            {feedback === 'useful' ? 'Gracias por tu respuesta' : '¿Te fue útil esta guía?'}
          </h2>
          <p className="mt-1 text-sm leading-6 text-fd-muted-foreground">
            {feedback === 'needs-help'
              ? 'Cuéntanos qué parte necesitas aclarar para poder orientarte.'
              : 'Tu comentario nos ayuda a mantener las instrucciones claras y actualizadas.'}
          </p>
          {reviewNote && <p className="mt-2 text-xs text-fd-muted-foreground">{reviewNote}</p>}
        </div>
      </div>
      {feedback === 'needs-help' ? (
        <a
          href={`mailto:servicioalcliente@siempre.net.co?subject=${subject}&body=${body}`}
          className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-fd-primary px-4 text-sm font-semibold text-fd-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary focus-visible:ring-offset-2 sm:mt-0"
        >
          <MessageSquareText className="size-4" aria-hidden="true" />
          Solicitar ayuda
        </a>
      ) : feedback === 'useful' ? null : (
        <div className="mt-4 flex gap-2 sm:mt-0">
          <button
            type="button"
            onClick={() => setFeedback('useful')}
            className="min-h-11 rounded-md bg-fd-primary px-4 text-sm font-semibold text-fd-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary focus-visible:ring-offset-2"
          >
            Sí
          </button>
          <button
            type="button"
            onClick={() => setFeedback('needs-help')}
            className="min-h-11 rounded-md border px-4 text-sm font-semibold text-fd-foreground transition-colors hover:bg-fd-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary focus-visible:ring-offset-2"
          >
            Necesito ayuda
          </button>
        </div>
      )}
    </aside>
  );
}
