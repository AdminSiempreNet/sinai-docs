import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowDown, ArrowLeft } from 'lucide-react';
import { SinaiBrandLogo } from '@/components/sinai-brand-logo';
import { SinaiFontSizeSwitch } from '@/components/sinai-font-size-switch';
import { SinaiSiteFooter } from '@/components/sinai-site-footer';
import { SinaiThemeSwitch } from '@/components/sinai-theme-switch';
import { WebinarGallery } from '@/components/webinar-gallery';
import './webinars.css';

export const metadata: Metadata = {
  title: 'Webinars SINAI',
  description: 'Transmisiones en vivo, programación y grabaciones de los webinars de SINAI.',
};

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

        <section className="sinai-live-hero sinai-standby-hero" aria-labelledby="sinai-live-hero-title">
          <div className="sinai-webinars-container sinai-live-hero-inner">
            <div className="sinai-live-hero-copy sinai-standby-copy">
              <span className="sinai-standby-badge">
                <span aria-hidden="true" />
                Calendario 2026
              </span>
              <h1 id="sinai-live-hero-title">Gracias por acompañarnos este año.</h1>
              <p>
                El ciclo de webinars de este calendario ha finalizado. Ya puede consultar la grabación de
                <strong> Finalización de calendario</strong> y las demás sesiones realizadas.
              </p>

              <div className="sinai-live-hero-actions">
                <a href="#sinai-webinar-library-title" className="sinai-live-secondary">
                  Ver webinars realizados
                  <ArrowDown aria-hidden="true" />
                </a>
              </div>
            </div>

            <section className="sinai-standby-agenda" aria-labelledby="sinai-live-panel-title">
              <div className="sinai-live-panel-heading">
                <p>Próximamente</p>
                <h2 id="sinai-live-panel-title">La nueva agenda se anunciará en 2027</h2>
              </div>
              <p className="sinai-live-empty">
                No hay webinars programados para el calendario actual. Siga este espacio para conocer las nuevas fechas.
              </p>
            </section>
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
