import Link from 'next/link';
import { SinaiBrandLogo } from '@/components/sinai-brand-logo';
import { SinaiNotFound } from '@/components/sinai-not-found';

export default function NotFound() {
  return (
    <div className="sinai-not-found-page">
      <header className="sinai-not-found-header">
        <Link href="/" className="sinai-welcome-brand" aria-label="Inicio del centro de ayuda SINAI">
          <SinaiBrandLogo />
          <span>Centro de Ayuda de la Plataforma SINAI</span>
        </Link>
        <nav aria-label="Navegación de recuperación">
          <Link href="/docs/generales">Guías generales</Link>
          <Link href="/docs/administrativo">Guías por rol</Link>
        </nav>
      </header>
      <SinaiNotFound />
    </div>
  );
}
