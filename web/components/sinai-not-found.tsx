import Link from 'next/link';
import { ArrowRight, Compass } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';

type SinaiNotFoundProps = {
  embedded?: boolean;
};

export function SinaiNotFound({ embedded = false }: SinaiNotFoundProps) {
  return (
    <main className={cn('sinai-not-found', embedded && 'sinai-not-found-embedded')}>
      <section className="sinai-not-found-content" aria-labelledby="sinai-not-found-title">
        <p className="sinai-not-found-eyebrow">
          <Compass aria-hidden="true" />
          Página no encontrada
        </p>
        <p className="sinai-not-found-code" aria-hidden="true">404</p>
        <h1 id="sinai-not-found-title">Esta ruta no está en el centro de ayuda.</h1>
        <p className="sinai-not-found-description">
          El enlace puede estar incompleto o la guía todavía no se ha publicado. Vuelva al inicio y elija el espacio que necesita consultar.
        </p>
        <div className="sinai-not-found-actions">
          <Link href={embedded ? '/docs/generales' : '/'} className={cn(buttonVariants({ variant: 'primary' }), 'sinai-not-found-primary')}>
            {embedded ? 'Volver a las guías' : 'Volver al centro de ayuda'}
            <ArrowRight aria-hidden="true" />
          </Link>
          <Link href="/docs/administrativo" className={cn(buttonVariants({ variant: 'outline' }), 'sinai-not-found-secondary')}>
            Ver guías por rol
          </Link>
        </div>
      </section>
    </main>
  );
}
