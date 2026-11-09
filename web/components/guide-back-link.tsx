'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';

function BackLink() {
  const volver = useSearchParams().get('volver');

  // Solo rutas internas de la documentación: el valor llega por la URL.
  if (!volver?.startsWith('/docs/')) return null;

  return (
    <div className="sticky top-[calc(var(--fd-nav-height,0px)+0.5rem)] z-20 mb-4 w-fit">
      <Link
        href={volver}
        className="inline-flex items-center gap-2 rounded-full border border-fd-primary/30 bg-fd-background px-4 py-2 text-sm font-medium text-fd-primary shadow-sm transition-colors hover:bg-fd-primary/10"
      >
        <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
        Volver a la guía anterior
      </Link>
    </div>
  );
}

/** Aparece solo cuando se llega a una guía desde un GuideLink, sin cambiar el MDX de la guía de destino. */
export function GuideBackLink() {
  return (
    <Suspense fallback={null}>
      <BackLink />
    </Suspense>
  );
}
