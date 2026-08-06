"use client";

import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
  type ComponentProps,
  type FocusEvent,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import {
  persistSinaiFontSize,
  readStoredSinaiFontSize,
  SINAI_FONT_SIZE_DEFAULT,
  type SinaiFontSize,
} from "@/lib/sinai-font-size";

const sizes = [
  {
    value: "small" as const,
    label: "Letra pequeña",
    glyph: "A",
    glyphClassName: "text-[0.65rem] font-semibold leading-none",
  },
  {
    value: "medium" as const,
    label: "Letra mediana",
    glyph: "A",
    glyphClassName: "text-[0.8rem] font-semibold leading-none",
  },
  {
    value: "large" as const,
    label: "Letra grande",
    glyph: "A",
    glyphClassName: "text-[1rem] font-semibold leading-none",
  },
] as const;

type SinaiFontSizeSwitchProps = ComponentProps<"div"> & {
  /** Compact trigger for dense chrome (collapsed sidebar strip). */
  compact?: boolean;
};

function useSinaiFontSize() {
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const [size, setSize] = useState<SinaiFontSize>(SINAI_FONT_SIZE_DEFAULT);

  useEffect(() => {
    setSize(readStoredSinaiFontSize());
  }, []);

  const select = useCallback((next: SinaiFontSize) => {
    setSize(next);
    persistSinaiFontSize(next);
  }, []);

  return { mounted, size, select };
}

/** Selector de tamaño de letra: icono único que se expande al hover/foco/toque. */
export function SinaiFontSizeSwitch({
  className,
  compact = false,
  ...props
}: SinaiFontSizeSwitchProps) {
  const { mounted, size, select } = useSinaiFontSize();
  const [open, setOpen] = useState(false);

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setOpen(false);
    }
  };

  return (
    <div
      {...props}
      className={cn(
        "sinai-font-size-switch",
        compact && "is-compact",
        open && "is-open",
        className,
      )}
      role="group"
      aria-label="Tamaño de letra"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={handleBlur}
      onClick={() => setOpen(true)}
    >
      <span className="sinai-font-size-switch-trigger" aria-hidden="true">
        <span className="sinai-font-size-switch-trigger-mark">
          <span>A</span>
          <span>a</span>
        </span>
      </span>

      <div
        className="sinai-font-size-switch-options"
        {...(!open ? { inert: true } : {})}
      >
        {sizes.map(({ value, label, glyph, glyphClassName }) => {
          const active = mounted && size === value;

          return (
            <button
              key={value}
              type="button"
              aria-label={label}
              aria-pressed={active}
              title={label}
              data-size={value}
              onClick={(event) => {
                event.stopPropagation();
                select(value);
              }}
              className={cn(
                "sinai-font-size-switch-option",
                active && "is-active",
              )}
            >
              <span className={glyphClassName} aria-hidden="true">
                {glyph}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Inserta el selector en la franja flotante del menú colapsado
 * (junto a abrir menú y buscar), que Fumadocs no expone como slot.
 */
export function SinaiFontSizeCollapsedPanel() {
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const findHost = () =>
      document.querySelector<HTMLElement>("[data-sidebar-panel]");

    const current = findHost();
    if (current) {
      setHost(current);
      return;
    }

    const observer = new MutationObserver(() => {
      const next = findHost();
      if (next) {
        setHost(next);
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  if (!host) return null;

  return createPortal(
    <SinaiFontSizeSwitch compact className="sinai-font-size-switch--panel" />,
    host,
  );
}
