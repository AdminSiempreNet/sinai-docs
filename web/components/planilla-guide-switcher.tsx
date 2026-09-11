'use client';

import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowLeftRight, Check, Clock3, X, ZoomIn } from 'lucide-react';

const STORAGE_KEY = 'sinai-planilla-registro-calificaciones';
const QUERY_KEY = 'planilla';

export type PlanillaGuideProps = {
  id: string;
  title: string;
  description?: string;
  image: string;
  status?: 'ready' | 'soon';
  children?: ReactNode;
};

export type PlanillaGuideGroupProps = {
  id: string;
  title: string;
  description?: string;
  image: string;
  status?: 'ready' | 'soon';
  /** Explicit group marker for MDX (always true on this component). */
  group?: boolean;
  children?: ReactNode;
};

export type PlanillaGuideSwitcherCopy = {
  eyebrow?: string;
  title?: string;
  /** First intro paragraph under the picker title. */
  introPrimary?: string;
  /** Optional second intro paragraph. */
  introSecondary?: string;
  /** Title when choosing a variant inside a family. */
  variantTitle?: string;
  /** Intro when choosing a variant inside a family. */
  variantIntro?: string;
  previewKicker?: string;
  confirmLabel?: string;
  /** Label for the direct select button on detailed cards. */
  selectLabel?: string;
  changeLabel?: string;
  selectedLabel?: string;
  backLabel?: string;
  /** Preview image helper text under detailed card media. */
  enlargeHint?: string;
};

type PickerItem = {
  id: string;
  title: string;
  description?: string;
  image: string;
  status: 'ready' | 'soon';
  kind: 'leaf' | 'group';
  children?: PlanillaGuideProps[];
  content?: ReactNode;
};

const DEFAULT_COPY = {
  eyebrow: 'Planillas disponibles',
  title: 'Elija la planilla que usa su institución',
  introPrimary:
    'En SINAI coexisten varias planillas de calificaciones. Cada institución educativa trabaja con la que corresponde a su sistema de evaluación, según lo que haya configurado o requerido.',
  introSecondary:
    'Revise el listado, abra la miniatura para confirmar visualmente cuál es la de su IE y selecciónela. Así podrá ver la guía, el video y los pasos específicos de esa planilla.',
  variantTitle: 'Elija la variante de esta planilla',
  variantIntro:
    'Esta planilla tiene más de una versión. Seleccione la que coincide con la pantalla de su institución.',
  previewKicker: 'Vista de planilla',
  confirmLabel: 'Esta es mi planilla',
  changeLabel: 'Cambiar planilla',
  selectedLabel: 'Planilla seleccionada',
  backLabel: 'Volver a planillas',
} as const;

export function PlanillaGuide(_props: PlanillaGuideProps) {
  // Marker component for MDX; rendered by PlanillaGuideSwitcher.
  return null;
}
PlanillaGuide.displayName = 'PlanillaGuide';

export function PlanillaGuideGroup(_props: PlanillaGuideGroupProps) {
  // Marker component for MDX; rendered by PlanillaGuideSwitcher.
  return null;
}
PlanillaGuideGroup.displayName = 'PlanillaGuideGroup';
// Helps MDX/runtime detection even if the component identity is wrapped.
(PlanillaGuideGroup as unknown as { group: true }).group = true;

function isPlanillaGuideLoose(child: ReactNode): child is ReactElement<PlanillaGuideProps> {
  if (!isValidElement(child)) return false;
  if (child.type === PlanillaGuide) return true;
  const type = child.type as { displayName?: string };
  if (typeof type === 'function' && type.displayName === 'PlanillaGuide') return true;
  const props = child.props as Partial<PlanillaGuideProps>;
  return typeof props?.id === 'string' && typeof props?.title === 'string' && typeof props?.image === 'string';
}

function isPlanillaGuideGroup(child: ReactNode): child is ReactElement<PlanillaGuideGroupProps> {
  if (!isValidElement(child)) return false;
  if (child.type === PlanillaGuideGroup) return true;
  const type = child.type as { displayName?: string };
  if (typeof type === 'function' && type.displayName === 'PlanillaGuideGroup') return true;
  const props = child.props as Partial<PlanillaGuideGroupProps> & { group?: boolean };
  return props?.group === true;
}

function collectGuides(node: ReactNode): PlanillaGuideProps[] {
  const list: PlanillaGuideProps[] = [];
  Children.forEach(node, (child) => {
    if (!isValidElement(child)) return;
    // Skip nested groups; only collect leaf guides.
    if (isPlanillaGuideGroup(child)) return;
    if (!isPlanillaGuideLoose(child)) return;
    // A nested guide that itself wraps more guides is unexpected; collect as leaf metadata.
    list.push({
      id: child.props.id,
      title: child.props.title,
      description: child.props.description,
      image: child.props.image,
      status: child.props.status ?? 'ready',
      children: child.props.children,
    });
  });
  return list;
}

function findLeaf(
  topLevel: PickerItem[],
  id: string,
): { leaf: PlanillaGuideProps; group?: PickerItem } | null {
  for (const item of topLevel) {
    if (item.kind === 'leaf' && item.id === id) {
      return {
        leaf: {
          id: item.id,
          title: item.title,
          description: item.description,
          image: item.image,
          status: item.status,
          children: item.content,
        },
      };
    }
    if (item.kind === 'group' && item.children) {
      const child = item.children.find((c) => c.id === id);
      if (child) return { leaf: child, group: item };
    }
  }
  return null;
}

export function PlanillaGuideSwitcher({
  children,
  defaultId,
  storageKey = STORAGE_KEY,
  queryKey = QUERY_KEY,
  cardLayout = 'thumbnail',
  eyebrow = DEFAULT_COPY.eyebrow,
  title = DEFAULT_COPY.title,
  introPrimary = DEFAULT_COPY.introPrimary,
  introSecondary = DEFAULT_COPY.introSecondary,
  variantTitle = DEFAULT_COPY.variantTitle,
  variantIntro = DEFAULT_COPY.variantIntro,
  previewKicker = DEFAULT_COPY.previewKicker,
  confirmLabel = DEFAULT_COPY.confirmLabel,
  selectLabel = 'Seleccionar esta versión',
  changeLabel = DEFAULT_COPY.changeLabel,
  selectedLabel = DEFAULT_COPY.selectedLabel,
  backLabel = DEFAULT_COPY.backLabel,
}: {
  children: ReactNode;
  defaultId?: string;
  storageKey?: string;
  queryKey?: string;
  /** `detailed` shows description + select CTA; image still opens the preview. */
  cardLayout?: 'thumbnail' | 'detailed';
} & PlanillaGuideSwitcherCopy) {
  const titleId = useId();
  const dialogTitleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const previewTriggerRef = useRef<HTMLButtonElement | null>(null);

  const readQueryId = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    return new URLSearchParams(window.location.search).get(queryKey);
  }, [queryKey]);

  const writeQueryId = useCallback(
    (id: string | null) => {
      if (typeof window === 'undefined') return;
      const url = new URL(window.location.href);
      if (id) url.searchParams.set(queryKey, id);
      else url.searchParams.delete(queryKey);
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    },
    [queryKey],
  );

  const topLevel = useMemo(() => {
    const list: PickerItem[] = [];
    Children.forEach(children, (child) => {
      if (!isValidElement(child)) return;
      const props = child.props as Partial<PlanillaGuideProps & PlanillaGuideGroupProps> & {
        group?: boolean;
      };
      if (
        typeof props.id !== 'string' ||
        typeof props.title !== 'string' ||
        typeof props.image !== 'string'
      ) {
        return;
      }

      const nestedGuides = collectGuides(props.children);
      const asGroup =
        isPlanillaGuideGroup(child) || props.group === true || nestedGuides.length > 0;

      if (asGroup) {
        list.push({
          id: props.id,
          title: props.title,
          description: props.description,
          image: props.image,
          status: props.status ?? (nestedGuides.length === 0 ? 'soon' : 'ready'),
          kind: 'group',
          children: nestedGuides,
        });
        return;
      }

      list.push({
        id: props.id,
        title: props.title,
        description: props.description,
        image: props.image,
        status: props.status ?? 'ready',
        kind: 'leaf',
        content: props.children,
      });
    });
    return list;
  }, [children]);

  const leafIds = useMemo(() => {
    const ids = new Set<string>();
    for (const item of topLevel) {
      if (item.kind === 'leaf') ids.add(item.id);
      item.children?.forEach((c) => ids.add(c.id));
    }
    return ids;
  }, [topLevel]);

  const hasGroups = useMemo(() => topLevel.some((item) => item.kind === 'group'), [topLevel]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [browseGroupId, setBrowseGroupId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const aliases: Record<string, string> = {
      actualizada: 'renovada',
      anterior: 'clasica',
      'personalizados/galeras': 'preescolar/galeras',
      'escuela-nueva/activa-anterior': 'escuela-nueva/activa',
      'tradicional/018': 'tradicional/tradicional',
    };
    const fromQuery = readQueryId();
    const fromStorage = window.localStorage.getItem(storageKey);
    const raw = fromQuery ?? fromStorage ?? defaultId ?? null;
    const candidate = raw ? aliases[raw] ?? raw : null;
    if (candidate && leafIds.has(candidate)) {
      setSelectedId(candidate);
      setBrowseGroupId(null);
    } else {
      setSelectedId(null);
    }
    setHydrated(true);
  }, [defaultId, leafIds, readQueryId, storageKey]);

  const selectLeaf = useCallback(
    (id: string) => {
      setPreviewId(null);
      setBrowseGroupId(null);
      setSelectedId(id);
      writeQueryId(id);
      window.localStorage.setItem(storageKey, id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.dispatchEvent(new CustomEvent('sinai-planilla-change', { detail: { id } }));
    },
    [storageKey, writeQueryId],
  );

  const openGroup = useCallback((id: string) => {
    setPreviewId(null);
    setSelectedId(null);
    setBrowseGroupId(id);
    writeQueryId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.dispatchEvent(new CustomEvent('sinai-planilla-change', { detail: { id: null } }));
  }, [writeQueryId]);

  const clearSelection = useCallback(() => {
    const match = selectedId ? findLeaf(topLevel, selectedId) : null;
    const parentGroupId = match?.group?.id ?? null;

    setSelectedId(null);
    setPreviewId(null);
    setBrowseGroupId(parentGroupId);
    writeQueryId(null);
    window.localStorage.removeItem(storageKey);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.dispatchEvent(new CustomEvent('sinai-planilla-change', { detail: { id: null } }));
  }, [selectedId, storageKey, topLevel, writeQueryId]);

  const backToFamilies = useCallback(() => {
    setBrowseGroupId(null);
    setPreviewId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openPreview = useCallback((id: string, trigger: HTMLButtonElement) => {
    previewTriggerRef.current = trigger;
    setPreviewId(id);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewId(null);
    requestAnimationFrame(() => previewTriggerRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const notify = () => {
      window.dispatchEvent(
        new CustomEvent('sinai-planilla-change', { detail: { id: selectedId } }),
      );
    };
    notify();
    const frame = window.requestAnimationFrame(notify);
    return () => window.cancelAnimationFrame(frame);
  }, [hydrated, selectedId]);

  const activeMatch = selectedId ? findLeaf(topLevel, selectedId) : null;
  const active = activeMatch?.leaf ?? null;
  const activeGroup = activeMatch?.group;

  const browseGroup = browseGroupId
    ? topLevel.find((item) => item.kind === 'group' && item.id === browseGroupId)
    : null;

  const previewSource = useMemo(() => {
    if (!previewId) return null;
    if (browseGroup?.children) {
      const variant = browseGroup.children.find((c) => c.id === previewId);
      if (variant) return { ...variant, kind: 'leaf' as const };
    }
    const top = topLevel.find((item) => item.id === previewId);
    if (top) {
      return {
        id: top.id,
        title: top.title,
        description: top.description,
        image: top.image,
        status: top.status,
        kind: top.kind,
        children: top.children,
      };
    }
    const nested = findLeaf(topLevel, previewId);
    if (nested) return { ...nested.leaf, kind: 'leaf' as const };
    return null;
  }, [browseGroup, previewId, topLevel]);

  useEffect(() => {
    if (!previewSource) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closePreview();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [previewSource, closePreview]);

  const confirmPreview = useCallback(() => {
    if (!previewSource) return;
    if (previewSource.kind === 'group') {
      if (previewSource.status === 'soon') return;
      closePreview();
      openGroup(previewSource.id);
      return;
    }
    if (previewSource.status === 'soon') return;
    selectLeaf(previewSource.id);
  }, [closePreview, openGroup, previewSource, selectLeaf]);

  const pickItem = useCallback(
    (item: PickerItem | PlanillaGuideProps, kind: 'leaf' | 'group') => {
      if (item.status === 'soon') return;
      if (kind === 'group') {
        openGroup(item.id);
        return;
      }
      selectLeaf(item.id);
    },
    [openGroup, selectLeaf],
  );

  const renderFamilyList = (
    items: Array<{
      id: string;
      title: string;
      description?: string;
      status: 'ready' | 'soon';
      kind: 'leaf' | 'group';
    }>,
  ) => (
    <div className="sinai-planilla-family-grid" role="list">
      {items.map((option) => {
        const isSoon = option.status === 'soon';

        return (
          <button
            key={option.id}
            type="button"
            role="listitem"
            className="sinai-planilla-family-card"
            data-status={option.status}
            disabled={isSoon}
            aria-label={`${option.title}${isSoon ? ' (próximamente)' : ''}`}
            onClick={() => pickItem(option, option.kind)}
          >
            <span className="sinai-planilla-family-card-title">{option.title}</span>
            {option.description ? (
              <span className="sinai-planilla-family-card-desc">{option.description}</span>
            ) : null}
            {isSoon ? (
              <span className="sinai-planilla-family-card-soon">
                <Clock3 aria-hidden="true" />
                Próximamente
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );

  const renderCards = (
    items: Array<{
      id: string;
      title: string;
      description?: string;
      image: string;
      status: 'ready' | 'soon';
      kind: 'leaf' | 'group';
    }>,
  ) => (
    <div
      className="sinai-planilla-grid"
      data-layout={cardLayout}
      data-count={items.length}
      role="list"
    >
      {items.map((option) => {
        const isSoon = option.status === 'soon';

        if (cardLayout === 'detailed') {
          return (
            <article
              key={option.id}
              role="listitem"
              className="sinai-planilla-card sinai-planilla-card-detailed"
              data-status={option.status}
            >
              <button
                type="button"
                className="sinai-planilla-card-media"
                data-image-modal-managed=""
                aria-label={`Ampliar vista de ${option.title}`}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  openPreview(option.id, event.currentTarget);
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={option.image} alt="" data-image-modal-managed="" />
                <span className="sinai-planilla-card-zoom" aria-hidden="true">
                  <ZoomIn />
                </span>
                {isSoon ? (
                  <span className="sinai-planilla-badge sinai-planilla-badge-soon">
                    <Clock3 aria-hidden="true" />
                    Próximamente
                  </span>
                ) : null}
              </button>

              <div className="sinai-planilla-card-body">
                <div className="sinai-planilla-card-copy">
                  <h3 className="sinai-planilla-card-title">{option.title}</h3>
                </div>

                <button
                  type="button"
                  className="sinai-planilla-card-select"
                  disabled={isSoon}
                  onClick={() => pickItem(option, option.kind)}
                >
                  <Check aria-hidden="true" />
                  {isSoon ? 'Próximamente' : selectLabel}
                </button>
              </div>
            </article>
          );
        }

        return (
          <button
            key={option.id}
            type="button"
            role="listitem"
            className="sinai-planilla-card"
            data-status={option.status}
            data-image-modal-managed=""
            aria-label={`Ver opción: ${option.title}${isSoon ? ' (próximamente)' : ''}`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              openPreview(option.id, event.currentTarget);
            }}
          >
            <span className="sinai-planilla-card-media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={option.image} alt="" data-image-modal-managed="" />
              <span className="sinai-planilla-card-zoom" aria-hidden="true">
                <ZoomIn />
              </span>
              {isSoon ? (
                <span className="sinai-planilla-badge sinai-planilla-badge-soon">
                  <Clock3 aria-hidden="true" />
                  Próximamente
                </span>
              ) : null}
            </span>
            <span className="sinai-planilla-card-body">
              <span className="sinai-planilla-card-title">{option.title}</span>
            </span>
          </button>
        );
      })}
    </div>
  );

  const previewDialog =
    previewSource && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="sinai-planilla-preview"
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            data-image-modal-managed=""
            onClick={closePreview}
          >
            <div
              className="sinai-planilla-preview-panel"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="sinai-planilla-preview-header">
                <div className="sinai-planilla-preview-heading">
                  <p className="sinai-planilla-preview-kicker">{previewKicker}</p>
                  <h3 id={dialogTitleId}>{previewSource.title}</h3>
                  {previewSource.description ? <p>{previewSource.description}</p> : null}
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  className="sinai-planilla-preview-close"
                  aria-label="Cerrar"
                  onClick={closePreview}
                >
                  <X aria-hidden="true" />
                </button>
              </header>

              <div className="sinai-planilla-preview-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewSource.image}
                  alt={`Vista completa de ${previewSource.title}`}
                  data-image-modal-managed=""
                />
              </div>

              <footer className="sinai-planilla-preview-actions">
                <button type="button" className="sinai-planilla-preview-secondary" onClick={closePreview}>
                  Cerrar
                </button>
                <button
                  type="button"
                  className="sinai-planilla-preview-primary"
                  disabled={previewSource.status === 'soon'}
                  onClick={confirmPreview}
                >
                  <Check aria-hidden="true" />
                  {previewSource.status === 'soon' ? 'Próximamente' : confirmLabel}
                </button>
              </footer>
            </div>
          </div>,
          document.body,
        )
      : null;

  if (!hydrated) {
    return (
      <div className="sinai-planilla-switcher not-prose my-6" aria-busy="true">
        <div className="sinai-planilla-skeleton" />
      </div>
    );
  }

  if (active) {
    const breadcrumb = activeGroup
      ? `${activeGroup.title} › ${active.title}`
      : active.title;

    return (
      <section className="sinai-planilla-switcher my-6" aria-label={`Guía de ${active.title}`}>
        <div className="sinai-planilla-active-bar not-prose">
          <div className="sinai-planilla-active-meta">
            <span className="sinai-planilla-active-check" aria-hidden="true">
              <Check />
            </span>
            <div>
              <p className="sinai-planilla-active-label">{selectedLabel}</p>
              <p className="sinai-planilla-active-name">{breadcrumb}</p>
            </div>
          </div>
          <button type="button" className="sinai-planilla-change" onClick={clearSelection}>
            <ArrowLeftRight aria-hidden="true" />
            {changeLabel}
          </button>
        </div>

        {/* Keep prose outside any ancestor `.not-prose` so lists/callouts render like normal guides. */}
        <div className="sinai-planilla-guide-panel prose prose-neutral dark:prose-invert max-w-none">
          {active.children}
        </div>
      </section>
    );
  }

  if (browseGroup) {
    const variants = (browseGroup.children ?? []).map((variant) => ({
      ...variant,
      status: variant.status ?? 'ready',
      kind: 'leaf' as const,
    }));

    return (
      <>
        <section className="sinai-planilla-switcher not-prose my-6" aria-labelledby={titleId}>
          <header className="sinai-planilla-picker-intro">
            <div className="sinai-planilla-picker-toolbar">
              <p className="sinai-planilla-picker-eyebrow">{browseGroup.title}</p>
              <button type="button" className="sinai-planilla-back" onClick={backToFamilies}>
                <ArrowLeft aria-hidden="true" />
                {backLabel}
              </button>
            </div>
            <h2 id={titleId} className="sinai-planilla-picker-title">
              {variantTitle}
            </h2>
            {variantIntro ? <p className="sinai-planilla-picker-copy">{variantIntro}</p> : null}
          </header>

          {renderCards(variants)}
        </section>
        {previewDialog}
      </>
    );
  }

  const familyItems = topLevel.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    image: item.image,
    status: item.status,
    kind: item.kind,
  }));

  return (
    <>
      <section className="sinai-planilla-switcher not-prose my-6" aria-labelledby={titleId}>
        <header className="sinai-planilla-picker-intro">
          <p className="sinai-planilla-picker-eyebrow">{eyebrow}</p>
          <h2 id={titleId} className="sinai-planilla-picker-title">
            {title}
          </h2>
          {introPrimary ? <p className="sinai-planilla-picker-copy">{introPrimary}</p> : null}
          {introSecondary ? <p className="sinai-planilla-picker-copy">{introSecondary}</p> : null}
        </header>

        {hasGroups ? renderFamilyList(familyItems) : renderCards(familyItems)}
      </section>
      {previewDialog}
    </>
  );
}
