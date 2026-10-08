'use client';

import { Check, Link2 } from 'lucide-react';
import { useState } from 'react';

export type UpcomingWebinar = {
  date: string;
  isoDate: string;
  time: string;
  title: string;
  audience: string;
  /** Enlace de la sala. Sustituir cuando exista la sesión real. */
  accessUrl: string;
};

export function WebinarSchedule({ webinars }: { webinars: UpcomingWebinar[] }) {
  const [copiedDate, setCopiedDate] = useState<string>();

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

  return (
    <ol>
      {webinars.map((webinar) => {
        const copied = copiedDate === webinar.isoDate;
        return (
          <li key={webinar.isoDate}>
            <time dateTime={webinar.isoDate}>{webinar.date}</time>
            <div>
              <strong>{webinar.title}</strong>
              <span>{webinar.time} · {webinar.audience}</span>
              <button
                type="button"
                className="sinai-webinars-access"
                data-copied={copied || undefined}
                aria-label={copied ? `Enlace copiado: ${webinar.title}` : `Obtener enlace de acceso: ${webinar.title}`}
                onClick={() => copyAccessLink(webinar)}
              >
                {copied ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />}
                {copied ? 'Enlace copiado' : 'Obtener enlace de acceso'}
              </button>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
