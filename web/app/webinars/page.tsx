import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Radio } from 'lucide-react';
import { SinaiBrandLogo } from '@/components/sinai-brand-logo';
import { SinaiFontSizeSwitch } from '@/components/sinai-font-size-switch';
import { SinaiSiteFooter } from '@/components/sinai-site-footer';
import { SinaiThemeSwitch } from '@/components/sinai-theme-switch';
import { WebinarGallery } from '@/components/webinar-gallery';
import { WebinarSchedule } from '@/components/webinar-schedule';

export const metadata: Metadata = {
  title: 'Webinars SINAI',
  description: 'Programación y grabaciones de los webinars de SINAI.',
};

const upcomingWebinars = [
  {
    date: '22 OCT',
    isoDate: '2026-10-22',
    time: '3:00 p. m.',
    title: 'Preparación institucional para el cierre académico',
    audience: 'Administrativos',
    accessUrl: 'https://sinai.net.co/webinars/acceso/preparacion-cierre-academico',
  },
  {
    date: '12 NOV',
    isoDate: '2026-11-12',
    time: '4:00 p. m.',
    title: 'Seguimiento pedagógico y registro docente',
    audience: 'Docentes',
    accessUrl: 'https://sinai.net.co/webinars/acceso/seguimiento-pedagogico',
  },
  {
    date: '26 NOV',
    isoDate: '2026-11-26',
    time: '3:00 p. m.',
    title: 'Resultados, informes y promoción escolar',
    audience: 'Administrativos',
    accessUrl: 'https://sinai.net.co/webinars/acceso/resultados-promocion',
  },
];

export default function WebinarsPage() {
  return (
    <>
      <main className="sinai-webinars-page">
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

        <section className="sinai-webinars-hero" aria-labelledby="sinai-webinars-title">
          <div className="sinai-webinars-hero-copy">
            <span className="sinai-webinars-eyebrow"><Radio aria-hidden="true" /> Webinars SINAI</span>
            <h1 id="sinai-webinars-title">Encuentros para aprender, consultar y volver a ver.</h1>
            <p>
              Conozca la programación de las próximas sesiones y acceda a las grabaciones de los webinars realizados por nuestro equipo.
            </p>
            <span className="sinai-webinars-sample-note">Contenido de muestra para visualizar la plantilla</span>
          </div>

          <aside className="sinai-webinars-schedule" aria-labelledby="sinai-webinars-schedule-title">
            <div className="sinai-webinars-schedule-heading">
              <span><CalendarDays aria-hidden="true" /></span>
              <div>
                <p>Programación de ejemplo</p>
                <h2 id="sinai-webinars-schedule-title">Próximos webinars</h2>
              </div>
            </div>
            <WebinarSchedule webinars={upcomingWebinars} />
          </aside>
        </section>

        <WebinarGallery />
      </main>
      <SinaiSiteFooter />
    </>
  );
}
