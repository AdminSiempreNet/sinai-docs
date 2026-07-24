import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { AISearch, AISearchPanel, AISearchTrigger } from '@/components/ai/search';
import { buttonVariants } from '@/components/ui/button';
import { baseOptions } from '@/lib/layout.shared';
import { cn } from '@/lib/cn';
import { source } from '@/lib/source';
import type { ReactNode } from 'react';
import { Backpack, BriefcaseBusiness, MessageCircleIcon, NotebookPen } from 'lucide-react';
import {
  SidebarHelp,
  SidebarMenuDecoration,
} from '@/components/sidebar-navigation';
import { SinaiSiteFooter } from '@/components/sinai-site-footer';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <DocsLayout
      {...baseOptions()}
      tree={source.pageTree}
      tabs={[
        {
          title: 'Administrativo',
          description: 'Procesos y guías de gestión institucional',
          url: '/docs/administrativo',
          icon: <BriefcaseBusiness className="sinai-menu-icon sinai-role-icon sinai-role-icon-administrativo" aria-hidden="true" />,
        },
        {
          title: 'Docente',
          description: 'Procesos y guías para docentes',
          url: '/docs/docente',
          icon: <NotebookPen className="sinai-menu-icon sinai-role-icon sinai-role-icon-docente" aria-hidden="true" />,
        },
        {
          title: 'Estudiante',
          description: 'Procesos y guías para estudiantes',
          url: '/docs/estudiante',
          icon: <Backpack className="sinai-menu-icon sinai-role-icon sinai-role-icon-estudiante" aria-hidden="true" />,
        },
      ]}
      sidebar={{
        // Las ramas activas se abren automáticamente; las demás permanecen
        // cerradas hasta que la persona las necesite.
        defaultOpenLevel: 0,
        banner: <SidebarMenuDecoration />,
        footer: <SidebarHelp />,
      }}
      >
        <AISearch>
        <input className="sinai-ai-toggle" id="sinai-ai-toggle" type="checkbox" aria-label="Abrir asistente SINAI" />
        <AISearchPanel nativeControlId="sinai-ai-toggle" />
        <AISearchTrigger
          position="float"
          nativeControlId="sinai-ai-toggle"
          className={cn(buttonVariants({
            variant: 'secondary',
            className: 'sinai-ai-ripple w-auto min-w-40 rounded-2xl text-fd-muted-foreground',
          }))}
        >
          <MessageCircleIcon className="sinai-ai-trigger-icon size-4.5" />
          <span className="sinai-ai-trigger-label">Preguntar a SINAI</span>
        </AISearchTrigger>
        </AISearch>
        {children}
      </DocsLayout>
      <SinaiSiteFooter />
    </>
  );
}
