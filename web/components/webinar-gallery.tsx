'use client';

import Image from 'next/image';
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  Layers3,
  Play,
  Radio,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { YouTube } from '@/components/youtube';

type Webinar = {
  id: number;
  title: string;
  summary: string;
  description: string;
  date: string;
  duration: string;
  audience: string;
  topic: string;
  accent: 'blue' | 'cyan' | 'green' | 'violet' | 'amber' | 'indigo';
  youtubeId: string;
  odyseeUrl: string;
  thumbnailUrl: string;
  thumbnailSource: 'YouTube' | 'Alternativo';
};

const webinars: Webinar[] = [
  {
    id: 1,
    title: 'Organice el calendario académico institucional',
    summary: 'Fechas, periodos y cronogramas preparados para toda la comunidad educativa.',
    description: 'Un recorrido práctico por la configuración del calendario y los momentos que orientan el trabajo institucional durante el año escolar.',
    date: '24 septiembre 2026',
    duration: '52 min',
    audience: 'Administrativos',
    topic: 'Configuración',
    accent: 'blue',
    youtubeId: 'VYh0b1tLOh4',
    odyseeUrl: 'https://odysee.com/@AndresGoDu:a/Configuraci%C3%B3n-del-Calendario---SINAI---M%C3%B3dulo-administrativo:22d7397dd93300f6d7d3cb04a4cc471a7ad943e2',
    thumbnailUrl: 'https://i.ytimg.com/vi/VYh0b1tLOh4/hqdefault.jpg',
    thumbnailSource: 'YouTube',
  },
  {
    id: 2,
    title: 'Registro de calificaciones con mayor claridad',
    summary: 'Buenas prácticas para registrar, revisar y hacer seguimiento a las notas.',
    description: 'Revise el flujo de registro en línea y las recomendaciones que ayudan a mantener la información académica completa y consistente.',
    date: '10 septiembre 2026',
    duration: '46 min',
    audience: 'Docentes',
    topic: 'Evaluación',
    accent: 'green',
    youtubeId: 'xWmmjTgvDFg',
    odyseeUrl: 'https://odysee.com/@AndresGoDu:a/Registro-de-Calificaciones-en-L%C3%ADnea---SINAI---M%C3%B3dulo-docente:d180796d4f3f3716d1c72ff2bbd20470a3750ed7',
    thumbnailUrl: 'https://i.ytimg.com/vi/xWmmjTgvDFg/hqdefault.jpg',
    thumbnailSource: 'YouTube',
  },
  {
    id: 3,
    title: 'Gestión de usuarios y permisos en SINAI',
    summary: 'Cuentas, perfiles y permisos alineados con las responsabilidades del equipo.',
    description: 'Conozca los criterios para crear usuarios, asignar accesos y mantener organizada la administración de las cuentas institucionales.',
    date: '27 agosto 2026',
    duration: '58 min',
    audience: 'Administrativos',
    topic: 'Usuarios',
    accent: 'violet',
    youtubeId: '9BfAgdPNybo',
    odyseeUrl: 'https://odysee.com/@AndresGoDu:a/Gestion-de-usuarios:862060a774c641d7559040c019820d5fb52035c9',
    thumbnailUrl: 'https://i.ytimg.com/vi/9BfAgdPNybo/hqdefault.jpg',
    thumbnailSource: 'YouTube',
  },
  {
    id: 4,
    title: 'Seguimiento integral desde el observador',
    summary: 'Registros que ayudan a comprender y acompañar el proceso de cada estudiante.',
    description: 'Explore las herramientas del observador para documentar situaciones, reconocer avances y consultar el historial de seguimiento.',
    date: '13 agosto 2026',
    duration: '49 min',
    audience: 'Docentes',
    topic: 'Seguimiento',
    accent: 'cyan',
    youtubeId: 'vNPpQUybIb4',
    odyseeUrl: 'https://odysee.com/@AndresGoDu:a/Registro-de-seguimiento:2cd2f282ef8eeb71a52605a86dbee0f9ada2e194',
    thumbnailUrl: 'https://thumbnails.odycdn.com/card/s:1280:720/quality:85/plain/https://thumbs.odycdn.com/67b316c48adf4b4d1ec23a0db35e8515.webp',
    thumbnailSource: 'Alternativo',
  },
  {
    id: 5,
    title: 'Educación inclusiva y gestión del PIAR',
    summary: 'Orientaciones para documentar los ajustes y acompañar los procesos de inclusión.',
    description: 'Una sesión dedicada a la configuración y diligenciamiento del PIAR dentro de los procesos académicos de la institución.',
    date: '30 julio 2026',
    duration: '1 h 06 min',
    audience: 'Docentes y orientadores',
    topic: 'Inclusión',
    accent: 'amber',
    youtubeId: 'pE2YfBAR-uw',
    odyseeUrl: 'https://odysee.com/@AndresGoDu:a/Configuraci%C3%B3n-PIAR:2d73ca7ba1b836fa7b124c3d5ab852fe85f81c46',
    thumbnailUrl: 'https://thumbnails.odycdn.com/card/s:1280:720/quality:85/plain/https://thumbs.odycdn.com/ae3522cca6555a1f819973ba6cf40247.webp',
    thumbnailSource: 'Alternativo',
  },
  {
    id: 6,
    title: 'Cierre de periodo sin inconsistencias',
    summary: 'Validaciones clave antes de generar informes y consolidar resultados.',
    description: 'Identifique los pendientes más frecuentes y aplique una ruta de revisión antes de completar el cierre académico del periodo.',
    date: '16 julio 2026',
    duration: '54 min',
    audience: 'Administrativos',
    topic: 'Cierre académico',
    accent: 'indigo',
    youtubeId: 'UbBLrtgcfWg',
    odyseeUrl: 'https://odysee.com/@AndresGoDu:a/Modulo-Inconsistencias---Estudiantes-sin-calificaciones---SINAI---M%C3%B3dulo-A:5888a81ed4ef4d99f64abb6391a7bffcacc803c7',
    thumbnailUrl: 'https://thumbnails.odycdn.com/card/s:1280:720/quality:85/plain/https://thumbs.odycdn.com/59272752422904263e50bcf6eacb95ba.webp',
    thumbnailSource: 'Alternativo',
  },
];

export function WebinarGallery() {
  const [activeWebinar, setActiveWebinar] = useState<Webinar>();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const activeTriggerRef = useRef<HTMLButtonElement | null>(null);

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
        <span><Layers3 aria-hidden="true" /> 6 grabaciones de ejemplo</span>
      </div>

      <div className="sinai-webinar-grid">
        {webinars.map((webinar) => (
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
                <span className="sinai-webinar-recorded" data-source={webinar.thumbnailSource.toLowerCase()}>
                  {webinar.thumbnailSource}
                </span>
                <span className="sinai-webinar-play"><Play /></span>
              </span>

              <span className="sinai-webinar-card-body">
                <span className="sinai-webinar-card-meta">
                  <span>{webinar.topic}</span>
                  <span><Clock3 aria-hidden="true" /> {webinar.duration}</span>
                </span>
                <strong>{webinar.title}</strong>
                <small>{webinar.summary}</small>
                <span className="sinai-webinar-card-footer">
                  <span><CalendarDays aria-hidden="true" /> {webinar.date}</span>
                  <span className="sinai-webinar-card-action">Ver grabación <ChevronRight aria-hidden="true" /></span>
                </span>
              </span>
            </button>
          </article>
        ))}
      </div>

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
                <span>Webinar grabado · {activeWebinar.date}</span>
                <h2 id="sinai-webinar-modal-title">{activeWebinar.title}</h2>
              </div>
              <button ref={closeButtonRef} type="button" onClick={closeModal} aria-label="Cerrar webinar">
                <X aria-hidden="true" />
              </button>
            </header>

            <div className="sinai-webinar-modal-content">
              <div className="sinai-webinar-modal-player">
                <YouTube id={activeWebinar.youtubeId} title={activeWebinar.title} odyseeUrl={activeWebinar.odyseeUrl} />
              </div>

              <aside className="sinai-webinar-modal-details">
                <p className="sinai-webinar-modal-kicker">Acerca de esta sesión</p>
                <p>{activeWebinar.description}</p>
                <dl>
                  <div><dt><Users aria-hidden="true" /> Dirigido a</dt><dd>{activeWebinar.audience}</dd></div>
                  <div><dt><Clock3 aria-hidden="true" /> Duración</dt><dd>{activeWebinar.duration}</dd></div>
                  <div><dt><Layers3 aria-hidden="true" /> Tema</dt><dd>{activeWebinar.topic}</dd></div>
                </dl>
                <div className="sinai-webinar-source-note">
                  <Radio aria-hidden="true" />
                  <p><strong>Dos opciones de reproducción</strong><span>Elija YouTube o la versión alternativa desde el selector del video.</span></p>
                </div>
              </aside>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
