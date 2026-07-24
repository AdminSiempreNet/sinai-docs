'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

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

/** Keeps the active top-level section highlighted after its content is collapsed. */
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
    const toSlug = (value: string) => value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const markPrimaryFolders = (sidebar: HTMLElement) => {
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

    sidebars.forEach(markPrimaryFolders);
    const removeExclusiveHandlers = sidebars.map(makeFoldersExclusive);
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
      footerObserver?.disconnect();
      delete documentRoot.dataset.sinaiFooterVisible;
    };
  }, [pathname]);

  return null;
}
