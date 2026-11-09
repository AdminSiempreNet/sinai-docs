import { source } from '@/lib/source';
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/mdx-components';
import type { Metadata } from 'next';
import { GuideToc } from '@/components/guide-toc';
import { GuideBackLink } from '@/components/guide-back-link';
import { ContentImageModal } from '@/components/content-image-modal';
import { getGuidePageData } from '@/lib/guide';
import { GuideFeedback } from '@/components/guide-feedback';
import { RoleLandingBanner } from '@/components/role-landing-banner';
import { SectionLandingBanner } from '@/components/section-landing-banner';
import { SectionHub } from '@/components/section-hub';
import { StudentGuideReady } from '@/components/student-guide-scene';

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDXContent = page.data.body;
  const { isGuide, toc } = getGuidePageData(page.data);
  const role = params.slug?.[0];
  const pageMeta = page.data as typeof page.data & {
    status?: string;
    lastReviewed?: string;
    section?: boolean;
    hub?: boolean;
  };
  const isRoleLanding =
    params.slug?.length === 1 &&
    !!role &&
    ['administrativo', 'docente', 'estudiante'].includes(role);
  const isSectionLanding = !isRoleLanding && !isGuide && pageMeta.section === true;
  const isInstitutionalConfigLanding =
    params.slug?.join('/') === 'administrativo/configuracion-institucional';
  const sectionKey = params.slug?.join('/') ?? '';
  const isModuleHub = isRoleLanding && ['administrativo', 'docente', 'estudiante'].includes(role ?? '');
  const isSectionHub =
    isModuleHub ||
    sectionKey === 'generales' ||
    (pageMeta.section === true &&
      ['administrativo', 'docente', 'estudiante'].includes(role ?? ''));
  const isStudentGuide = isGuide && role === 'estudiante';
  const roleClass = role && ['administrativo', 'docente', 'estudiante'].includes(role)
    ? `sinai-role-${role}`
    : undefined;
  const showGuideToc = toc.length > 0 && !isSectionHub;
  const guideUrl = `/docs/${params.slug?.join('/') ?? ''}`;
  const pageClassName = [
    isGuide && 'sinai-guide-page',
    showGuideToc && 'sinai-custom-toc',
    isRoleLanding && 'sinai-role-landing-page',
    isSectionLanding && 'sinai-section-landing-page',
    isSectionHub && 'sinai-section-hub-page',
    isInstitutionalConfigLanding && 'sinai-institutional-config-page',
    roleClass,
  ].filter(Boolean).join(' ') || undefined;

  return (
    <DocsPage
      toc={isSectionHub ? [] : toc}
      tableOfContent={isSectionHub ? { enabled: false } : undefined}
      tableOfContentPopover={isSectionHub ? { enabled: false } : undefined}
      full={isSectionHub || page.data.full}
      className={pageClassName}
    >
      <GuideBackLink />
      {isSectionHub ? null : isRoleLanding && role ? (
        <RoleLandingBanner
          role={role}
          title={String(page.data.title)}
          description={page.data.description ? String(page.data.description) : undefined}
        />
      ) : isSectionLanding ? (
        <SectionLandingBanner
          title={String(page.data.title)}
          description={page.data.description ? String(page.data.description) : undefined}
        />
      ) : (
        <div className={isGuide ? 'sinai-guide-heading' : undefined}>
          <DocsTitle
            className={isGuide
              ? '!text-4xl !leading-[1.1] sm:!text-5xl'
              : undefined}
          >
            {page.data.title}
          </DocsTitle>
          <DocsDescription className={isGuide ? 'text-[1.05rem] leading-7' : undefined}>{page.data.description}</DocsDescription>
        </div>
      )}
      <DocsBody className={isGuide ? 'sinai-guide-body' : undefined}>
        {isSectionHub ? (
          <SectionHub section={sectionKey} />
        ) : (
          <>
            <MDXContent components={getMDXComponents()} />
            {isStudentGuide && <StudentGuideReady slug={sectionKey} />}
          </>
        )}
      </DocsBody>
      {isGuide && (
        <GuideFeedback
          title={String(page.data.title)}
          url={guideUrl}
          status={pageMeta.status}
          lastReviewed={pageMeta.lastReviewed}
        />
      )}
      {showGuideToc && <GuideToc toc={toc} />}
      <ContentImageModal />
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
