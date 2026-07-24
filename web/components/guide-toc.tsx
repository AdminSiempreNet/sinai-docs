'use client';

import { Text } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

type GuideTocItem = {
  title: ReactNode;
  url: string;
  depth: number;
};

type Position = {
  x: number;
  top: number;
  bottom: number;
  middle: number;
};

function getOffset(depth: number) {
  return depth <= 2 ? 10 : depth === 3 ? 26 : 42;
}

function createPath(positions: Position[], start = 0, end = positions.length - 1) {
  if (positions.length === 0 || start > end) return '';

  let path = `M ${positions[start].x} ${positions[start].top} L ${positions[start].x} ${positions[start].bottom}`;
  for (let index = start + 1; index <= end; index++) {
    const previous = positions[index - 1];
    const current = positions[index];
    path += ` C ${previous.x} ${current.top - 7}, ${current.x} ${previous.bottom + 7}, ${current.x} ${current.top}`;
    path += ` L ${current.x} ${current.bottom}`;
  }

  return path;
}

export function GuideToc({ toc }: { toc: GuideTocItem[] }) {
  const listRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [direction, setDirection] = useState<'up' | 'down'>('down');
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const updateActiveItem = () => {
      // El paso que la persona está leyendo suele encontrarse en el tercio
      // superior de la pantalla, no necesariamente junto al borde superior.
      // Así el recorrido alcanza el último elemento visible de cada sección.
      const offset = Math.min(360, Math.max(180, window.innerHeight * 0.36));
      const nextIndex = toc.findLastIndex((item) => {
        const element = document.getElementById(item.url.slice(1));
        return element ? element.getBoundingClientRect().top <= offset : false;
      });

      setActiveIndex((currentIndex) => {
        const resolvedIndex = nextIndex === -1 ? 0 : nextIndex;
        if (currentIndex !== -1 && currentIndex !== resolvedIndex) {
          setDirection(resolvedIndex < currentIndex ? 'up' : 'down');
        }
        return resolvedIndex;
      });
    };

    updateActiveItem();
    window.addEventListener('scroll', updateActiveItem, { passive: true });
    window.addEventListener('resize', updateActiveItem);

    return () => {
      window.removeEventListener('scroll', updateActiveItem);
      window.removeEventListener('resize', updateActiveItem);
    };
  }, [toc]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const updatePositions = () => {
      setPositions(
        toc.map((item, index) => {
          const element = linkRefs.current[index];
          const top = element?.offsetTop ?? 0;
          const height = element?.offsetHeight ?? 0;

          return {
            x: getOffset(item.depth),
            top: top + 5,
            bottom: top + Math.max(5, height - 5),
            middle: top + height / 2,
          };
        }),
      );
    };

    const observer = new ResizeObserver(updatePositions);
    observer.observe(list);
    updatePositions();
    return () => observer.disconnect();
  }, [toc]);

  useEffect(() => {
    const footer = document.querySelector<HTMLElement>('.sinai-site-footer');
    if (!footer) return;

    const observer = new IntersectionObserver(([entry]) => {
      setFooterVisible(entry.isIntersecting);
    });

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const activeRootIndex = activeIndex === -1
    ? -1
    : toc.slice(0, activeIndex + 1).findLastIndex((item) => item.depth <= 2);
  const activePosition = activeIndex === -1 ? undefined : positions[activeIndex];

  return (
    <aside
      id="sinai-guide-toc"
      className={`fixed top-(--fd-docs-row-1) right-0 z-20 hidden h-[calc(var(--fd-docs-height)-var(--fd-docs-row-1))] w-(--fd-toc-width) pt-12 pe-4 pb-2 transition-opacity duration-150 xl:block xl:layout:[--fd-toc-width:268px] ${footerVisible ? 'pointer-events-none opacity-0' : ''}`}
      aria-labelledby="sinai-guide-toc-title"
      aria-hidden={footerVisible || undefined}
    >
      <h3 id="sinai-guide-toc-title" className="inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground">
        <Text className="size-4" />
        En esta guía
      </h3>
      <div className="relative mt-3 overflow-auto [scrollbar-width:none]">
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full overflow-visible" width="52" height={positions.at(-1)?.bottom ?? 0}>
          <path d={createPath(positions)} className="stroke-fd-foreground/15" strokeWidth="1" fill="none" />
          {activeRootIndex >= 0 && activeIndex >= activeRootIndex && (
            <path d={createPath(positions, activeRootIndex, activeIndex)} className="guide-toc-active-path" strokeWidth="1.5" fill="none" />
          )}
        </svg>
        {activePosition && (
          <span
            aria-hidden="true"
            data-direction={direction}
            className="guide-toc-marker"
            style={{ transform: `translate3d(${activePosition.x - 5}px, ${activePosition.middle - 5}px, 0)` }}
          />
        )}
        <div ref={listRef} className="relative flex flex-col">
          {toc.map((item, index) => (
            <a
              key={item.url}
              ref={(element) => {
                linkRefs.current[index] = element;
              }}
              href={item.url}
              data-active={activeIndex === index}
              className="guide-toc-link py-1.5 text-sm leading-5 text-fd-muted-foreground transition-colors hover:text-fd-foreground data-[active=true]:font-medium"
              style={{ paddingInlineStart: `${getOffset(item.depth) + 16}px` }}
            >
              {item.title}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
