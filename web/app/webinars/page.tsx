import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowDown, ArrowLeft, Radio } from 'lucide-react';
import { SinaiBrandLogo } from '@/components/sinai-brand-logo';
import { SinaiFontSizeSwitch } from '@/components/sinai-font-size-switch';
import { SinaiSiteFooter } from '@/components/sinai-site-footer';
import { SinaiThemeSwitch } from '@/components/sinai-theme-switch';
import { WebinarGallery } from '@/components/webinar-gallery';
import { WebinarSchedule, type UpcomingWebinar } from '@/components/webinar-schedule';
import './webinars.css';

export const metadata: Metadata = {
  title: 'Webinars SINAI',
  description: 'Transmisiones en vivo, programación y grabaciones de los webinars de SINAI.',
};

const LIVE_CHANNEL_URL = 'https://www.twitch.tv/sinai_academico';

/** Ordenados por fecha: el primero es la próxima transmisión. */
const upcomingWebinars: UpcomingWebinar[] = [
  {
    day: '10',
    month: 'NOV',
    weekday: 'Martes',
    isoDate: '2026-11-10',
    title: 'Finalización de calendario',
    objective: 'Conocer e identificar en la Plataforma SINAI los diferentes procesos que se deben ejecutar para procesar la promoción de los estudiantes de manera exitosa en el calendario 2026.',
    platform: 'Twitch',
    accessUrl: LIVE_CHANNEL_URL,
  },
];

export default function WebinarsPage() {
  return (
    <>
      <main className="sinai-webinars-main">
        <div className="sinai-webinars-container">
          <header className="sinai-webinars-header">
            <Link href="/" className="sinai-welcome-brand" aria-label="Volver al inicio del centro de ayuda SINAI">
              <SinaiBrandLogo />
              <span>Webinars</span>
            </Link>

            <div className="sinai-webinars-header-actions">
              <Link href="/" className="sinai-webinars-back">
                <ArrowLeft aria-hidden="true" />
                Volver al inicio
              </Link>
              <SinaiFontSizeSwitch />
              <SinaiThemeSwitch />
            </div>
          </header>
        </div>

        <section className="sinai-live-hero" aria-labelledby="sinai-live-hero-title">
          <div className="sinai-live-hero-signal" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <div className="sinai-webinars-container sinai-live-hero-inner">
            <div className="sinai-live-hero-copy">
              <span className="sinai-live-badge">
                <span className="sinai-live-dot" aria-hidden="true" />
                Eventos en vivo
              </span>
              <h1 id="sinai-live-hero-title">Aprenda SINAI en vivo, con su equipo y en tiempo real.</h1>
              <p>
                Conéctese a nuestras transmisiones para conocer los procesos de cada temporada académica, resolver dudas
                con los asesores y, si no alcanza a asistir, vuelva a ver las grabaciones cuando lo necesite.
              </p>

              <div className="sinai-live-hero-actions">
                <a href={LIVE_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="sinai-live-primary">
                  <Radio aria-hidden="true" />
                  Seguir el canal en Twitch
                </a>
                <a href="#sinai-webinar-library-title" className="sinai-live-secondary">
                  Ver grabaciones
                  <ArrowDown aria-hidden="true" />
                </a>
              </div>
            </div>

            <aside className="sinai-live-panel" aria-labelledby="sinai-live-panel-title">
              <div className="sinai-live-panel-heading">
                <p>Agenda</p>
                <h2 id="sinai-live-panel-title">Próxima transmisión</h2>
              </div>
              <WebinarSchedule webinars={upcomingWebinars} />
            </aside>
          </div>
        </section>

        <div className="sinai-webinars-container sinai-webinars-content">
          <WebinarGallery />
        </div>
      </main>
      <SinaiSiteFooter />
    </>
  );
}
