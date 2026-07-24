"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useSyncExternalStore, type ComponentProps } from "react";
import { useTheme } from "fumadocs-ui/provider/base";
import { cn } from "@/lib/cn";

const themes = [
  { value: "system", label: "Sistema", Icon: Monitor },
  { value: "light", label: "Claro", Icon: Sun },
  { value: "dark", label: "Oscuro", Icon: Moon },
] as const;

/** Selector de apariencia con sistema como preferencia y primera opción. */
export function SinaiThemeSwitch({ className, ...props }: ComponentProps<"div">) {
  const { setTheme, theme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  return (
    <div
      {...props}
      className={cn(
        "inline-flex items-center overflow-hidden rounded-full border p-1 *:rounded-full",
        className,
      )}
      role="group"
      aria-label="Apariencia"
    >
      {themes.map(({ value, label, Icon }) => {
        const active = mounted && theme === value;

        return (
          <button
            key={value}
            type="button"
            aria-label={label}
            aria-pressed={active}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              "size-6.5 p-1.5 text-fd-muted-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-primary",
              active && "bg-fd-accent text-fd-accent-foreground",
            )}
          >
            <Icon className="size-full" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
