'use client';

import Image from 'next/image';
import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Clock3,
  Layers3,
  Play,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import './webinar-gallery.css';

type Webinar = {
  id: string;
  title: string;
  summary: string;
  description: string;
  date: string;
  isoDate: string;
  duration: string;
  audience: string;
  topic: string;
  accent: 'blue' | 'cyan' | 'green' | 'violet' | 'amber' | 'indigo';
  odyseePath: string;
  thumbnailUrl: string;
};

const INITIAL_VISIBLE = 6;

/** Ordenados del más reciente al más antiguo: el primero ocupa la primera tarjeta. */
const webinars: Webinar[] = [
  {
    id: 'preparacion-para-la-promocion',
    title: 'Preparación para la promoción de estudiantes',
    summary: 'Ajustes de matrícula, asignación académica y criterios de promoción antes de procesarla.',
    description: 'Principales procesos y configuraciones que se deben tener en cuenta para preparar correctamente la promoción de estudiantes en SINAI desde el módulo administrativo: ajustes de matrícula, verificación de la asignación académica, configuración de los criterios de promoción y las verificaciones y recomendaciones previas para evitar inconvenientes al procesar la promoción.',
    date: '14 de octubre de 2026',
    isoDate: '2026-10-14',
    duration: '2 h 13 min',
    audience: 'Rectores, coordinadores y administrativos',
    topic: 'Promoción',
    accent: 'amber',
    odyseePath: '@AndresGoDu:a/2895181808-1508357822-c5f1f9d6-f559-47b1-bbe1-77a072f9f71e:8',
    thumbnailUrl: 'https://thumbnails.odycdn.com/card/s:1280:720/quality:85/plain/https://thumbs.odycdn.com/51c96cf2758f7efd02e37765d23e24e6.webp',
  },
  {
    id: 'semana-institucional-actualizaciones',
    title: 'Semana institucional: actualizaciones de SINAI',
    summary: 'Base de conocimiento, preinformes o alertas académicas y boletines digitales.',
    description: 'Socializar las nuevas herramientas de la Plataforma SINAI —Base de Conocimiento, Preinformes o Alertas Académicas y Boletines Digitales—, destacando su funcionamiento, beneficios y ventajas para facilitar el acceso a la información, fortalecer el seguimiento académico y optimizar la gestión de los procesos institucionales de manera ágil, organizada y eficiente.',
    date: '8 de octubre de 2026',
    isoDate: '2026-10-08',
    duration: '2 h 08 min',
    audience: 'Directivos, administrativos y docentes',
    topic: 'Actualizaciones',
    accent: 'blue',
    odyseePath: '@AndresGoDu:a/2893454436-1508357822-34cd6400-79e5-4a85-98fb-33daa6eccde0:2',
    thumbnailUrl: 'https://thumbnails.odycdn.com/card/s:1280:720/quality:85/plain/https://thumbs.odycdn.com/5bdaee59d5b776ee29e25b051d88bee2.webp',
  },
  {
    id: 'inscripciones-y-prematricula',
    title: 'Inscripciones y prematrícula',
    summary: 'Preparación del ingreso de estudiantes nuevos y la continuidad de los antiguos.',
    description: 'Recorrido por los procesos de inscripción de aspirantes y prematrícula en SINAI: cómo se preparan, cómo se registra y consulta la información de los estudiantes y cómo hacer seguimiento para llegar a la matrícula del nuevo año escolar con los datos completos y organizados.',
    date: '30 de septiembre de 2026',
    isoDate: '2026-09-30',
    duration: '1 h 48 min',
    audience: 'Directivos y administrativos',
    topic: 'Matrícula',
    accent: 'green',
    odyseePath: '@AndresGoDu:a/2883012591-1508357822-09c6b8c8-49d0-49db-9354-aef3e1b07bf4:fcb687a570',
    thumbnailUrl: 'https://thumbnails.odycdn.com/card/s:1280:720/quality:85/plain/https://thumbs.odycdn.com/0ae854fc15ab67e7cee635f2d88b76b8.webp',
  },
  {
    id: 'planeacion-curricular',
    title: 'Planeación curricular',
    summary: 'Mallas curriculares, planes de área y planeación de clases en un mismo hilo.',
    description: 'Orientaciones para organizar la planeación curricular de la institución en SINAI: cómo se articulan las mallas curriculares y los planes de área con la planeación de clases, los estándares y los Derechos Básicos de Aprendizaje, para que el trabajo pedagógico de cada asignatura sea coherente, consultable y fácil de hacer seguimiento.',
    date: '8 de octubre de 2026',
    isoDate: '2026-10-08',
    duration: '1 h 57 min',
    audience: 'Directivos y docentes',
    topic: 'Planeación',
    accent: 'violet',
    odyseePath: '@AndresGoDu:a/weibar:474097046f',
    thumbnailUrl: 'https://thumbnails.odycdn.com/card/s:1280:720/quality:85/plain/https://thumbs.odycdn.com/04070132e92d36878e407380c37abfc2.webp',
  },
];

export function WebinarGallery() {
  const [activeWebinar, setActiveWebinar] = useState<Webinar>();
  const [showAll, setShowAll] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const activeTriggerRef = useRef<HTMLButtonElement | null>(null);

  const visibleWebinars = showAll ? webinars : webinars.slice(0, INITIAL_VISIBLE);
  const hiddenCount = webinars.length - INITIAL_VISIBLE;

  const closeModal = () => {
    setActiveWebinar(undefined);
    requestAnimationFrame(() => activeTriggerRef.current?.focus());
  };

  useEffect(() => {
    if (!activeWebinar) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeModal();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [activeWebinar]);

  const openWebinar = (webinar: Webinar, trigger: HTMLButtonElement) => {
    activeTriggerRef.current = trigger;
    setActiveWebinar(webinar);
  };

  return (
    <section className="sinai-webinar-library" aria-labelledby="sinai-webinar-library-title">
      <div className="sinai-webinar-library-heading">
        <div>
          <p>Biblioteca de encuentros</p>
          <h2 id="sinai-webinar-library-title">Webinars realizados</h2>
        </div>
        <span>
          <Layers3 aria-hidden="true" /> {webinars.length} {webinars.length === 1 ? 'grabación' : 'grabaciones'}
        </span>
      </div>

      <div className="sinai-webinar-grid">
        {visibleWebinars.map((webinar) => (
          <article key={webinar.id} className="sinai-webinar-card" data-accent={webinar.accent}>
            <button type="button" onClick={(event) => openWebinar(webinar, event.currentTarget)} aria-label={`Ver webinar: ${webinar.title}`}>
              <span className="sinai-webinar-cover" aria-hidden="true">
                <Image
                  src={webinar.thumbnailUrl}
                  alt=""
                  fill
                  sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw"
                  className="sinai-webinar-thumbnail"
                />
                <span className="sinai-webinar-recorded">Grabación</span>
                <span className="sinai-webinar-play"><Play /></span>
              </span>

              <span className="sinai-webinar-card-body">
                <span className="sinai-webinar-card-meta">
                  <span>{webinar.topic}</span>
                  <span><CalendarDays aria-hidden="true" /> <time dateTime={webinar.isoDate}>{webinar.date}</time></span>
                </span>
                <strong>{webinar.title}</strong>
                <small>{webinar.summary}</small>
                <span className="sinai-webinar-card-footer">
                  <span><Users aria-hidden="true" /> {webinar.audience}</span>
                  <span><Clock3 aria-hidden="true" /> {webinar.duration}</span>
                </span>
                <span className="sinai-webinar-card-action">Ver grabación <ChevronRight aria-hidden="true" /></span>
              </span>
            </button>
          </article>
        ))}
      </div>

      {hiddenCount > 0 ? (
        <div className="sinai-webinar-more">
          <button type="button" onClick={() => setShowAll((current) => !current)} aria-expanded={showAll}>
            {showAll ? 'Mostrar menos' : `Mostrar ${hiddenCount} ${hiddenCount === 1 ? 'webinar más' : 'webinars más'}`}
            <ChevronDown aria-hidden="true" data-open={showAll} />
          </button>
        </div>
      ) : null}

      {activeWebinar ? (
        <div className="sinai-webinar-modal-backdrop" role="presentation" onMouseDown={closeModal}>
          <section
            className="sinai-webinar-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sinai-webinar-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key !== 'Tab') return;
              const focusable = event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], iframe');
              const first = focusable[0];
              const last = focusable[focusable.length - 1];
              if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last?.focus();
              } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
              }
            }}
          >
            <header className="sinai-webinar-modal-header">
              <div>
                <span>Webinar grabado · {activeWebinar.topic}</span>
                <h2 id="sinai-webinar-modal-title">{activeWebinar.title}</h2>
              </div>
              <button ref={closeButtonRef} type="button" onClick={closeModal} aria-label="Cerrar webinar">
                <X aria-hidden="true" />
              </button>
            </header>

            <div className="sinai-webinar-modal-content">
              <div className="sinai-webinar-modal-player">
                <div className="sinai-webinar-video">
                  <iframe
                    src={`https://odysee.com/$/embed/${activeWebinar.odyseePath}`}
                    title={activeWebinar.title}
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>

              <aside className="sinai-webinar-modal-details">
                <p className="sinai-webinar-modal-kicker">Acerca de esta sesión</p>
                <p>{activeWebinar.description}</p>
                <dl>
                  <div><dt><Users aria-hidden="true" /> Dirigido a</dt><dd>{activeWebinar.audience}</dd></div>
                  <div><dt><CalendarDays aria-hidden="true" /> Fecha</dt><dd><time dateTime={activeWebinar.isoDate}>{activeWebinar.date}</time></dd></div>
                  <div><dt><Clock3 aria-hidden="true" /> Duración</dt><dd>{activeWebinar.duration}</dd></div>
                  <div><dt><Layers3 aria-hidden="true" /> Tema</dt><dd>{activeWebinar.topic}</dd></div>
                </dl>
              </aside>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
