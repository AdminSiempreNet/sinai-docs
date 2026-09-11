'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'fumadocs-core/framework';
import { resolveGuideAsideTheme } from '@/lib/guide-aside-theme';

export function GuideAsideArt({
  className = '',
}: {
  className?: string;
}) {
  const pathname = usePathname();
  const theme = resolveGuideAsideTheme(pathname || '');
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const footer = document.querySelector<HTMLElement>('.sinai-site-footer');
    if (!footer) return;

    const observer = new IntersectionObserver(([entry]) => {
      setFooterVisible(entry.isIntersecting);
    });

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <aside
      id="sinai-guide-aside-art"
      className={`sinai-guide-aside-art fixed top-(--fd-docs-row-1) right-0 z-20 hidden h-[calc(var(--fd-docs-height)-var(--fd-docs-row-1))] w-(--fd-toc-width) pe-2 pb-2 transition-opacity duration-150 xl:flex xl:layout:[--fd-toc-width:300px] ${footerVisible ? 'pointer-events-none opacity-0' : ''} ${className}`}
      aria-label={theme.alt}
      aria-hidden={footerVisible || undefined}
    >
      <div className="sinai-guide-aside-art-inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={theme.src}
          alt={theme.alt}
          className="sinai-guide-aside-art-image"
          data-theme={theme.id}
        />
      </div>
    </aside>
  );
}
