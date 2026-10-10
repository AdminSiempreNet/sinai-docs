'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { ROLE_SECTIONS, SECTION_HREFS } from '@/lib/docs-navigation';
import './sidebar-sections.css';

export function SidebarHelp() {
  return (
    <>
      <a
        className="sinai-sidebar-copyright"
        href="https://siempre.net.co/"
        target="_blank"
        rel="noopener noreferrer"
      >
        © SIEMPRE.NET SAS
      </a>
    </>
  );
}

/** Resaltado de rama activa, exclusividad de carpetas y cierre sin cambiar de página. */
export function SidebarMenuDecoration() {
  const pathname = usePathname();

  useEffect(() => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const activeRole = pathSegments[1];
    const activeTopLevel = pathSegments[2];
    const documentRoot = document.documentElement;

    if (['administrativo', 'docente', 'estudiante'].includes(activeRole)) {
      documentRoot.dataset.sinaiRole = activeRole;
    } else {
      delete documentRoot.dataset.sinaiRole;
    }

    const sidebars = [document.getElementById('nd-sidebar'), document.getElementById('nd-sidebar-mobile')].filter(Boolean) as HTMLElement[];
    const siteFooter = document.querySelector<HTMLElement>('.sinai-site-footer');

    // Durante desarrollo, una guía creada o movida puede estar disponible antes
    // de que el árbol serializado del layout se actualice en la navegación del
    // cliente. En ese estado Fumadocs muestra el árbol raíz y aparenta sacar a
    // la persona de su rol. Recargamos una sola vez cuando la ruta no existe
    // dentro del menú actual; después de la recarga se recibe el árbol vigente.
    const isRoleRoute = ['administrativo', 'docente', 'estudiante'].includes(activeRole);
    const isCurrentPageInSidebar = sidebars.some((sidebar) =>
      Array.from(sidebar.querySelectorAll<HTMLAnchorElement>('a[href]')).some(
        (link) => link.getAttribute('href') === pathname,
      ),
    );
    const refreshKey = `sinai-sidebar-tree-refresh:${pathname}`;

    if (isRoleRoute && sidebars.length > 0 && !isCurrentPageInSidebar && !window.sessionStorage.getItem(refreshKey)) {
      window.sessionStorage.setItem(refreshKey, 'true');
      window.location.reload();
      return;
    }

    const toSlug = (value: string) => value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const markSectionTitles = (sidebar: HTMLElement) => {
      const sectionHrefs = new Set<string>(SECTION_HREFS);

      sidebar.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((link) => {
        const href = link.getAttribute('href') ?? '';
        if (!sectionHrefs.has(href)) {
          if (link.hasAttribute('data-sinai-section-title')) {
            link.removeAttribute('data-sinai-section-title');
            link.removeAttribute('data-sinai-active-branch');
          }
          return;
        }

        link.setAttribute('data-sinai-section-title', '');
        const active = pathname === href || pathname.startsWith(`${href}/`);
        if (active) link.setAttribute('data-sinai-active-branch', '');
        else link.removeAttribute('data-sinai-active-branch');
      });
    };

    const markPrimaryFolders = (sidebar: HTMLElement) => {
      if (ROLE_SECTIONS[activeRole]) {
        markSectionTitles(sidebar);
        return;
      }

      sidebar.querySelectorAll<HTMLElement>('[data-state]').forEach((folder) => {
        const parentFolder = folder.parentElement?.closest<HTMLElement>('[data-state]');
        if (parentFolder && parentFolder !== sidebar) return;

        const activator = folder.querySelector<HTMLElement>(':scope > button, :scope > a');
        if (!activator) return;

        if (toSlug(activator.textContent ?? '') === activeTopLevel) {
          activator.setAttribute('data-sinai-active-branch', '');
        } else {
          activator.removeAttribute('data-sinai-active-branch');
        }
      });
    };

    const makeFoldersExclusive = (sidebar: HTMLElement) => {
      const getDirectTrigger = (folder: HTMLElement) =>
        folder.querySelector<HTMLButtonElement>(':scope > button[aria-controls]');

      const getParentFolder = (folder: HTMLElement) => {
        let candidate = folder.parentElement?.closest<HTMLElement>('[data-state]') ?? null;

        while (candidate) {
          if (getDirectTrigger(candidate)) return candidate;
          candidate = candidate.parentElement?.closest<HTMLElement>('[data-state]') ?? null;
        }

        return null;
      };

      const handleFolderClick = (event: MouseEvent) => {
        const trigger = (event.target as Element).closest<HTMLButtonElement>('button');
        if (!trigger || !sidebar.contains(trigger)) return;

        const openedFolder = trigger.parentElement?.closest<HTMLElement>('[data-state]') ?? null;
        if (!openedFolder || openedFolder.dataset.state === 'open') return;

        const directTrigger = getDirectTrigger(openedFolder);
        if (directTrigger !== trigger) return;

        const parentFolder = getParentFolder(openedFolder);

        sidebar.querySelectorAll<HTMLElement>('[data-state="open"]').forEach((folder) => {
          if (folder === openedFolder) return;

          const folderTrigger = getDirectTrigger(folder);
          if (!folderTrigger) return;

          const folderParent = getParentFolder(folder);
          if (folderParent !== parentFolder) return;

          folderTrigger.click();
        });
      };

      sidebar.addEventListener('click', handleFolderClick);
      return () => sidebar.removeEventListener('click', handleFolderClick);
    };

    // Una agrupación cerrada sigue abriendo su guía y el acordeón.
    // Si ya está abierta, el clic solo la recoge: no cambia la página visible.
    const collapseOpenFolderWithoutNavigation = (sidebar: HTMLElement) => {
      const handleClick = (event: MouseEvent) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

        const origin = event.target instanceof Element
          ? event.target
          : event.target instanceof Node
            ? event.target.parentElement
            : null;
        if (!origin || !sidebar.contains(origin)) return;

        // El chevron ya alterna el acordeón sin navegar.
        if (origin.closest('[data-icon]')) return;

        const link = origin.closest<HTMLAnchorElement>('a[href]');
        if (!link || !sidebar.contains(link)) return;

        const folder = link.parentElement;
        if (folder?.dataset.state !== 'open') return;
        if (folder.querySelector(':scope > a[href]') !== link) return;

        const chevron = link.querySelector<HTMLElement>('[data-icon]');
        if (!chevron) return;

        event.preventDefault();
        event.stopPropagation();
        chevron.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      };

      sidebar.addEventListener('click', handleClick, true);
      return () => sidebar.removeEventListener('click', handleClick, true);
    };

    sidebars.forEach(markPrimaryFolders);
    const removeExclusiveHandlers = sidebars.map(makeFoldersExclusive);
    const removeCollapseHandlers = sidebars.map(collapseOpenFolderWithoutNavigation);
    const observers = sidebars.map((sidebar) => {
      const observer = new MutationObserver(() => markPrimaryFolders(sidebar));
      observer.observe(sidebar, { childList: true, subtree: true });
      return observer;
    });
    const footerObserver = siteFooter
      ? new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          documentRoot.dataset.sinaiFooterVisible = '';
        } else {
          delete documentRoot.dataset.sinaiFooterVisible;
        }
      })
      : undefined;

    if (siteFooter) footerObserver?.observe(siteFooter);

    return () => {
      observers.forEach((observer) => observer.disconnect());
      removeExclusiveHandlers.forEach((removeHandler) => removeHandler());
      removeCollapseHandlers.forEach((removeHandler) => removeHandler());
      footerObserver?.disconnect();
      delete documentRoot.dataset.sinaiFooterVisible;
    };
  }, [pathname]);

  return null;
}
