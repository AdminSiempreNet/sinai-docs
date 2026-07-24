import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { SinaiBrandLogo } from '@/components/sinai-brand-logo';
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
    },
    slots: {
      themeSwitch: SinaiThemeSwitch,
    },
  };
}
