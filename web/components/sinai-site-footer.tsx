import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight,
  BookOpenCheck,
  ChevronRight,
  LogIn,
  ShieldCheck,
} from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';

const navigationLinks = [
  { label: 'Inicio', href: '/docs' },
  { label: 'Guías generales', href: '/docs/generales' },
  { label: 'Preguntas frecuentes', href: '/docs/administrativo/preguntas-frecuentes' },
];

const roleLinks = [
  { label: 'Administrativo', href: '/docs/administrativo' },
  { label: 'Docente', href: '/docs/docente' },
  { label: 'Estudiante', href: '/docs/estudiante' },
];

interface SinaiSiteFooterProps {
  compact?: boolean;
}

export function SinaiSiteFooter({ compact = false }: SinaiSiteFooterProps) {
  return (
    <footer className={cn('sinai-site-footer', compact && 'sinai-site-footer-compact')} aria-labelledby="sinai-footer-title">
      <div className="sinai-footer-shell">

        <div className="sinai-footer-content-grid">
          <section className="sinai-footer-brand-panel" aria-label="SINAI y SIEMPRE.NET">
            <Image
              src="/images/brand/sinai-white.png"
              alt="SINAI"
              width={850}
              height={394}
              className="sinai-footer-logo"
            />
            <p>Base de conocimiento para consultar, comprender y ejecutar los procesos de su institución.</p>
            <span className="sinai-footer-trust-mark">
              <ShieldCheck aria-hidden="true" />
              Información y acompañamiento institucional
            </span>
          </section>

          <nav className="sinai-footer-link-group" aria-labelledby="sinai-footer-nav-title">
            <p className="sinai-footer-group-kicker">Explorar</p>
            <h2 id="sinai-footer-nav-title">Navegación</h2>
            <ul>
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}><ChevronRight aria-hidden="true" />{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="sinai-footer-link-group" aria-labelledby="sinai-footer-roles-title">
            <p className="sinai-footer-group-kicker">Acceso rápido</p>
            <h2 id="sinai-footer-roles-title">Guías por rol</h2>
            <ul>
              {roleLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}><ChevronRight aria-hidden="true" />{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <section className="sinai-footer-contact-panel" aria-labelledby="sinai-footer-contact-title">
            <BookOpenCheck aria-hidden="true" />
            <div>
              <p className="sinai-footer-group-kicker">Manténgase en ruta</p>
              <h2 id="sinai-footer-contact-title">¿No encontró la guía?</h2>
              <p>Cuéntenos el módulo y la tarea que necesita realizar.</p>
              <a href="mailto:servicioalcliente@siempre.net.co">servicioalcliente@siempre.net.co <ArrowUpRight aria-hidden="true" /></a>
            </div>
          </section>
        </div>
      </div>

      <div className="sinai-footer-legal">
        <div className="sinai-footer-legal-content">
          <span>© {new Date().getFullYear()} SIEMPRE.NET SAS</span>
          <span className="sinai-footer-legal-divider" aria-hidden="true" />
          <span>SINAI · Sistemas de Información Académica</span>
          <a href="https://siempre.net.co/" target="_blank" rel="noopener noreferrer">
            siempre.net.co <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
