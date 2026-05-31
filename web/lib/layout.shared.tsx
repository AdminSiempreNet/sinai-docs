import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { UserMenu } from '@/components/auth/user-menu';

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
    links: [
      {
        type: 'custom',
        children: <UserMenu />,
        secondary: true,
      },
    ],
  };
}
