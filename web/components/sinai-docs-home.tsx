import Link from 'next/link';
import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  GraduationCap,
  ListTree,
  Presentation,
  Sparkles,
} from 'lucide-react';

const routes = [
  {
    title: 'Guías generales',
    description: 'Acceso, recuperación de contraseña y procesos comunes.',
    href: '/docs/generales',
    icon: BookOpenCheck,
    role: 'general',
    label: 'Para todos',
  },
  {
    title: 'Administrativo',
    description: 'Gestión institucional, matrícula y configuración.',
    href: '/docs/administrativo',
    icon: Building2,
    role: 'administrativo',
    label: 'Gestión institucional',
  },
  {
    title: 'Docente',
    description: 'Planeación, evaluación y seguimiento académico.',
    href: '/docs/docente',
    icon: Presentation,
    role: 'docente',
    label: 'Acompañamiento docente',
  },
  {
    title: 'Estudiante',
    description: 'Consulta de información y procesos académicos.',
    href: '/docs/estudiante',
    icon: GraduationCap,
    role: 'estudiante',
    label: 'Vida académica',
  },
];

export function SinaiDocsHome() {
  return (
    <section className="sinai-docs-home" aria-label="Rutas de la base de conocimiento">
      <div className="sinai-docs-home-intro">
        <div className="sinai-docs-home-intro-copy">
          <p className="sinai-docs-home-kicker">
            <Sparkles aria-hidden="true" />
            Centro de orientación SINAI
          </p>
          <h2>Encuentre la ruta adecuada para continuar</h2>
          <p>
            Consulte instrucciones claras para cada tarea y avance con seguridad dentro de la plataforma.
          </p>
        </div>

        <div className="sinai-docs-home-route" aria-label="Cómo usar esta base de conocimiento">
          <span>01</span>
          <div>
            <strong>Elija su perfil</strong>
            <p>Abra el espacio que corresponde a su tarea.</p>
          </div>
          <span>02</span>
          <div>
            <strong>Ubique el proceso</strong>
            <p>Siga las categorías del menú lateral.</p>
          </div>
        </div>
      </div>

      <div className="sinai-docs-home-heading">
        <div>
          <p>Explore por perfil</p>
          <h2>¿Qué necesita consultar?</h2>
        </div>
        <span>4 rutas disponibles</span>
      </div>

      <div className="sinai-docs-home-grid">
        {routes.map(({ title, description, href, icon: Icon, role, label }) => (
          <Link key={href} href={href} className="sinai-docs-home-card" data-role={role}>
            <span className="sinai-docs-home-card-icon"><Icon aria-hidden="true" /></span>
            <span className="sinai-docs-home-card-copy">
              <small>{label}</small>
              <strong>{title}</strong>
              <span>{description}</span>
            </span>
            <ArrowRight className="sinai-docs-home-card-arrow" aria-hidden="true" />
          </Link>
        ))}
      </div>

      <aside className="sinai-docs-home-note">
        <ListTree aria-hidden="true" />
        <span>Dentro de cada módulo, el menú lateral organiza los procesos y las guías disponibles.</span>
      </aside>
    </section>
  );
}
