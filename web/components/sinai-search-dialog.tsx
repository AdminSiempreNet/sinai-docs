'use client';

import DefaultSearchDialog from 'fumadocs-ui/components/dialog/search-default';
import { usePathname } from 'next/navigation';

const roleTags = [
  { name: 'Todos', value: 'todos' },
  { name: 'Administrativo', value: 'administrativo' },
  { name: 'Docente', value: 'docente' },
  { name: 'Estudiante', value: 'estudiante' },
];

export function SinaiSearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const role = pathname.split('/').filter(Boolean)[1];
  const defaultTag = roleTags.some((tag) => tag.value === role) ? role : 'todos';

  return (
    <DefaultSearchDialog
      open={open}
      onOpenChange={onOpenChange}
      defaultTag={defaultTag}
      tags={open ? roleTags : []}
      footer={open ? (
        <span className="sinai-search-hint" aria-hidden="true">
          ↑↓ Navegar · Enter Abrir · Esc Cerrar
        </span>
      ) : null}
    />
  );
}
