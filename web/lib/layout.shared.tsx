import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { SinaiBrandLogo } from '@/components/sinai-brand-logo';
import { SinaiFontSizeSwitch } from '@/components/sinai-font-size-switch';
import { SinaiThemeSwitch } from '@/components/sinai-theme-switch';

/**
 * Opciones compartidas de layout.
 *
 * @see https://fumadocs.dev/docs/ui/navigation/links
 */
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <SinaiBrandLogo />,
      // Entre el logo y el botón de contraer el menú (slot nativo de Fumadocs).
      children: (
        <SinaiFontSizeSwitch key="sinai-font-size" className="sinai-font-size-switch--sidebar-header me-1" />
      ),
    },
    slots: {
      themeSwitch: SinaiThemeSwitch,
    },
  };
}
