import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

/**
 * Opciones compartidas de layout.
 *
 * @see https://fumadocs.dev/docs/ui/navigation/links
 */
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'Sinai Docs',
    },
  };
}
