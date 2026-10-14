'use client';

import { CalendarClock, Check, ExternalLink, Link2, Radio } from 'lucide-react';
import { useEffect, useState } from 'react';

export type UpcomingWebinar = {
  day: string;
  month: string;
  weekday: string;
  isoDate: string;
  title: string;
  objective: string;
  platform: string;
  accessUrl: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function daysUntil(isoDate: string) {
  const [year, month, day] = isoDate.split('-').map(Number);
  const event = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((event.getTime() - today.getTime()) / DAY_MS);
}

function countdownLabel(days: number) {
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Mañana';
  return `Faltan ${days} días`;
}

export function WebinarSchedule({ webinars }: { webinars: UpcomingWebinar[] }) {
  const [copiedDate, setCopiedDate] = useState<string>();
  const [remainingDays, setRemainingDays] = useState<Record<string, number>>({});

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setRemainingDays(Object.fromEntries(webinars.map((webinar) => [webinar.isoDate, daysUntil(webinar.isoDate)])));
    });

    return () => window.cancelAnimationFrame(frame);
  }, [webinars]);

  const copyAccessLink = async (webinar: UpcomingWebinar) => {
    try {
      await navigator.clipboard.writeText(webinar.accessUrl);
    } catch {
      const field = document.createElement('textarea');
      field.value = webinar.accessUrl;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.left = '-9999px';
      document.body.append(field);
      field.select();
      document.execCommand('copy');
      field.remove();
    }

    setCopiedDate(webinar.isoDate);
    window.setTimeout(() => {
      setCopiedDate((current) => (current === webinar.isoDate ? undefined : current));
    }, 2200);
  };

  if (webinars.length === 0) {
    return (
      <p className="sinai-live-empty">
        Pronto anunciaremos la próxima transmisión. Siga el canal para recibir el aviso.
      </p>
    );
  }

  return (
    <ol className="sinai-live-events">
      {webinars.map((webinar) => {
        const copied = copiedDate === webinar.isoDate;
        const days = remainingDays[webinar.isoDate];

        return (
          <li key={webinar.isoDate} className="sinai-live-event">
            <div className="sinai-live-event-top">
              <time dateTime={webinar.isoDate} className="sinai-live-date">
                <span>{webinar.month}</span>
                <strong>{webinar.day}</strong>
                <small>{webinar.weekday}</small>
              </time>

              <div className="sinai-live-event-copy">
                <span className="sinai-live-event-platform">
                  <Radio aria-hidden="true" /> Transmisión en {webinar.platform}
                </span>
                <h3>{webinar.title}</h3>
                {days !== undefined && days >= 0 ? (
                  <span className="sinai-live-countdown">
                    <CalendarClock aria-hidden="true" /> {countdownLabel(days)}
                  </span>
                ) : null}
              </div>
            </div>

            <p className="sinai-live-objective">
              <strong>Objetivo</strong>
              {webinar.objective}
            </p>

            <div className="sinai-live-event-actions">
              <a href={webinar.accessUrl} target="_blank" rel="noopener noreferrer" className="sinai-live-join">
                Unirse en {webinar.platform}
                <ExternalLink aria-hidden="true" />
              </a>
              <button
                type="button"
                className="sinai-live-copy"
                data-copied={copied || undefined}
                aria-label={copied ? `Enlace copiado: ${webinar.title}` : `Copiar enlace de acceso: ${webinar.title}`}
                onClick={() => copyAccessLink(webinar)}
              >
                {copied ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />}
                {copied ? 'Enlace copiado' : 'Copiar enlace'}
              </button>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
