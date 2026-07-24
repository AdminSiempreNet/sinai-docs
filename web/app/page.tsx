import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpenCheck,
  Building2,
  GraduationCap,
  ListTree,
  Presentation,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { SinaiBrandLogo } from '@/components/sinai-brand-logo';
import { SinaiSiteFooter } from '@/components/sinai-site-footer';
import { SinaiThemeSwitch } from '@/components/sinai-theme-switch';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';

const roles = [
  {
    title: 'Guías generales',
    description: 'Acceso y procesos comunes.',
    href: '/docs/generales',
    icon: BookOpenCheck,
    role: 'general',
  },
  {
    title: 'Administrativo',
    description: 'Gestión institucional y académica.',
    href: '/docs/administrativo',
    icon: Building2,
    role: 'administrativo',
  },
  {
    title: 'Docente',
    description: 'Planeación, evaluación y seguimiento.',
    href: '/docs/docente',
    icon: Presentation,
    role: 'docente',
  },
  {
    title: 'Estudiante',
    description: 'Consulta de información académica.',
    href: '/docs/estudiante',
    icon: GraduationCap,
    role: 'estudiante',
  },
];

const steps = [
  {
    number: '01',
    title: 'Elija su perfil',
    description: 'Entre al espacio que corresponde a su tarea.',
    icon: ShieldCheck,
  },
  {
    number: '02',
    title: 'Abra el proceso',
    description: 'Use el menú lateral para ubicar la categoría.',
    icon: ListTree,
  },
  {
    number: '03',
    title: 'Siga la guía',
    description: 'Avance con información clara y actualizada.',
    icon: Search,
  },
];

export default function Home() {
  return (
    <>
      <main className="sinai-welcome">
        <header className="sinai-welcome-header">
          <Link href="/" className="sinai-welcome-brand" aria-label="Inicio de la base de conocimiento SINAI">
            <SinaiBrandLogo />
            <span>Base de conocimiento</span>
          </Link>

          <div className="sinai-welcome-header-actions">
            <nav className="sinai-welcome-nav" aria-label="Navegación principal">
              <Link href="/docs/generales">Guías generales</Link>
              <Link href="/docs/administrativo">Guías por rol</Link>
              <a href="https://www.sinai.net.co" target="_blank" rel="noopener noreferrer">
                Ir a SINAI <ArrowUpRight aria-hidden="true" />
              </a>
            </nav>
            <SinaiThemeSwitch className="sinai-welcome-theme-switch" />
          </div>
        </header>

        <section className="sinai-welcome-hero" aria-labelledby="sinai-welcome-title">
          <div className="sinai-welcome-content">
            <div className="sinai-welcome-intro">
              <p className="sinai-welcome-kicker">
                <BookOpenCheck aria-hidden="true" />
                Centro de orientación SINAI
              </p>
              <h1 id="sinai-welcome-title">La guía correcta para cada proceso en SINAI.</h1>
              <p>
                Encuentre tutoriales, respuestas y rutas paso a paso organizadas para acompañar su trabajo en la plataforma.
              </p>
            </div>

            <section className="sinai-welcome-role-picker" aria-labelledby="sinai-welcome-roles-title">
              <div className="sinai-welcome-picker-heading">
                <div>
                  <p>¿Con qué perfil trabaja?</p>
                  <h2 id="sinai-welcome-roles-title">Elija su espacio de consulta</h2>
                </div>
                <span>4 rutas disponibles</span>
              </div>

              <div className="sinai-welcome-role-grid">
                {roles.map(({ title, description, href, icon: Icon, role }) => (
                  <Link key={href} href={href} className="sinai-welcome-role-card" data-role={role}>
                    <span className="sinai-welcome-role-icon"><Icon aria-hidden="true" /></span>
                    <span className="sinai-welcome-role-copy">
                      <strong>{title}</strong>
                      <small>{description}</small>
                    </span>
                    <ArrowRight className="sinai-welcome-role-arrow" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </section>

            <p className="sinai-welcome-menu-note">
              <ListTree aria-hidden="true" />
              Dentro de cada módulo, el menú lateral organiza todos los procesos y sus guías.
            </p>
          </div>

          <figure className="sinai-welcome-banner">
            <Image
              src="/images/home/sinai-knowledge-route.png"
              alt="Ilustración abstracta de una guía abierta y rutas de conocimiento conectadas"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 42vw"
            />
            <figcaption>
              <span>Una ruta para avanzar</span>
              <strong>Perfil <i /> proceso <i /> guía</strong>
            </figcaption>
          </figure>
        </section>

        <section className="sinai-welcome-steps" aria-labelledby="sinai-welcome-steps-title">
          <div className="sinai-welcome-section-intro">
            <p>Así funciona</p>
            <h2 id="sinai-welcome-steps-title">De la consulta a la acción</h2>
          </div>
          <ol>
            {steps.map(({ number, title, description, icon: Icon }) => (
              <li key={number}>
                <span className="sinai-welcome-step-number">{number}</span>
                <Icon aria-hidden="true" />
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="sinai-welcome-start" aria-labelledby="sinai-welcome-start-title">
          <div className="sinai-welcome-start-icon"><BookOpenCheck aria-hidden="true" /></div>
          <div>
            <p>¿Es su primera vez en SINAI?</p>
            <h2 id="sinai-welcome-start-title">Comience por las guías generales</h2>
            <span>Conozca el acceso a la plataforma y las acciones que aplican para todos los usuarios.</span>
          </div>
          <Link href="/docs/generales" className={cn(buttonVariants({ variant: 'outline' }), 'sinai-welcome-start-action')}>
            Ver guías generales
            <ArrowRight aria-hidden="true" />
          </Link>
        </section>
      </main>
      <SinaiSiteFooter />
    </>
  );
}
