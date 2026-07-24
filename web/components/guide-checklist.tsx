'use client';

import { CheckCircle2, RotateCcw } from 'lucide-react';
import { useId, useState } from 'react';

export function GuideChecklist({
  title = 'Antes de finalizar',
  items,
}: {
  title?: string;
  items: string[];
}) {
  const [checked, setChecked] = useState<boolean[]>(() => items.map(() => false));
  const id = useId();
  const completed = checked.filter(Boolean).length;

  function toggle(index: number) {
    setChecked((current) => current.map((value, itemIndex) => itemIndex === index ? !value : value));
  }

  return (
    <section className="not-prose my-8 rounded-xl border bg-fd-card p-4 shadow-sm sm:p-5" aria-labelledby={`${id}-title`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-fd-primary" aria-hidden="true" />
          <div>
            <h2 id={`${id}-title`} className="m-0 text-base font-semibold text-fd-foreground">
              {title}
            </h2>
            <p className="mt-1 text-sm text-fd-muted-foreground" aria-live="polite">
              {completed} de {items.length} pasos verificados
            </p>
          </div>
        </div>
        {completed > 0 && (
          <button
            type="button"
            onClick={() => setChecked(items.map(() => false))}
            className="inline-flex min-h-10 items-center gap-2 rounded-md px-2 text-sm font-medium text-fd-muted-foreground transition-colors hover:bg-fd-muted hover:text-fd-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Reiniciar
          </button>
        )}
      </div>
      <ul className="mt-4 space-y-1 border-t pt-3">
        {items.map((item, index) => (
          <li key={item}>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-[0.95rem] leading-6 text-fd-foreground transition-colors hover:bg-fd-muted/70">
              <input
                type="checkbox"
                checked={checked[index]}
                onChange={() => toggle(index)}
                className="size-4 shrink-0 accent-fd-primary"
              />
              <span className={checked[index] ? 'text-fd-muted-foreground line-through' : undefined}>{item}</span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
