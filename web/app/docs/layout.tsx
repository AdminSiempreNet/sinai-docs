import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';
import type { ReactNode } from 'react';
import { Backpack, BriefcaseBusiness, NotebookPen } from 'lucide-react';
import {
  SidebarHelp,
  SidebarMenuDecoration,
} from '@/components/sidebar-navigation';
import { SinaiFontSizeCollapsedPanel } from '@/components/sinai-font-size-switch';
import { SinaiSiteFooter } from '@/components/sinai-site-footer';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="sinai-docs-frame">
      <DocsLayout
      {...baseOptions()}
      tree={source.pageTree}
      tabs={[
        {
          title: 'Administrativo',
          description: 'Procesos y guías de gestión institucional',
          url: '/docs/administrativo',
          icon: <BriefcaseBusiness key="administrativo" className="sinai-menu-icon sinai-role-icon sinai-role-icon-administrativo" aria-hidden="true" />,
        },
        {
          title: 'Docente',
          description: 'Procesos y guías para docentes',
          url: '/docs/docente',
          icon: <NotebookPen key="docente" className="sinai-menu-icon sinai-role-icon sinai-role-icon-docente" aria-hidden="true" />,
        },
        {
          title: 'Estudiante',
          description: 'Procesos y guías para estudiantes',
          url: '/docs/estudiante',
          icon: <Backpack key="estudiante" className="sinai-menu-icon sinai-role-icon sinai-role-icon-estudiante" aria-hidden="true" />,
        },
      ]}
      sidebar={{
        // Las ramas activas se abren automáticamente; las demás permanecen
        // cerradas hasta que la persona las necesite.
        defaultOpenLevel: 0,
        banner: <SidebarMenuDecoration key="sinai-sidebar-banner" />,
        footer: <SidebarHelp key="sinai-sidebar-footer" />,
      }}
      >
        {children}
      </DocsLayout>
      <SinaiFontSizeCollapsedPanel />
      <SinaiSiteFooter />
    </div>
  );
}
