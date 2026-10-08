import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

type HubCard = {
  title: string;
  description: string;
  href: string;
  image: string;
  imageAlt: string;
};

const HUB_CARDS: HubCard[] = [
  {
    title: 'Configuración de la Institución',
    description: 'Defina y actualice la información general del establecimiento.',
    href: '/docs/administrativo/configuracion-institucional/datos-institucionales',
    image: '/images/section-hubs/institutional-config/institution.webp',
    imageAlt: 'Edificio institucional con ubicación y documento',
  },
  {
    title: 'Calendarios, cronogramas y periodos',
    description: 'Configure calendarios, parámetros, escalas y periodos académicos.',
    href: '/docs/administrativo/configuracion-institucional/calendarios-cronogramas-periodos',
    image: '/images/section-hubs/institutional-config/calendar.webp',
    imageAlt: 'Calendario académico con reloj y parámetros',
  },
  {
    title: 'Gestión Académica',
    description: 'Organice escalas, áreas, componentes, sedes, grupos y evaluación.',
    href: '/docs/administrativo/configuracion-institucional/gestion-academica',
    image: '/images/section-hubs/institutional-config/academic-management.webp',
    imageAlt: 'Libros, birrete y estructura de gestión académica',
  },
];

function HubIllustration({ card }: { card: HubCard }) {
  return (
    <div className="sinai-institutional-card-illustration">
      <Image
        src={card.image}
        alt={card.imageAlt}
        width={720}
        height={720}
        sizes="(max-width: 900px) 100vw, 33vw"
        data-image-modal-managed
      />
    </div>
  );
}

export function InstitutionalConfigHub() {
  return (
    <div className="sinai-institutional-hub">
      <header className="sinai-institutional-hero">
        <div className="sinai-institutional-hero-copy">
          <div className="sinai-institutional-title-lockup">
            <span aria-hidden="true" />
            <div>
              <h1>Configuración Institucional</h1>
              <p>
                Configure los datos de la institución, calendarios, periodos y la
                estructura académica.
              </p>
            </div>
          </div>
          <span className="sinai-institutional-title-rule" aria-hidden="true" />
          <div className="sinai-institutional-description">
            <p>
              Aquí encontrará las guías para dejar lista la institución en SINAI: datos
              institucionales, calendarios con sus cronogramas y periodos, y la gestión
              académica de escalas, áreas, componentes, sedes y grupos.
            </p>
          </div>
        </div>

      </header>

      <section className="sinai-institutional-options" aria-labelledby="institutional-options-title">
        <div className="sinai-institutional-section-heading">
          <h2 id="institutional-options-title">Contenido de esta sección</h2>
        </div>

        <div className="sinai-institutional-card-grid">
          {HUB_CARDS.map((card) => (
            <Link className="sinai-institutional-card" href={card.href} key={card.href}>
              <HubIllustration card={card} />
              <div className="sinai-institutional-card-copy">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <span className="sinai-institutional-card-action" aria-hidden="true">
                  <ArrowRight />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
