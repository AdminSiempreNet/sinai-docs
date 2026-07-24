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
import { ContentImageModal } from '@/components/content-image-modal';
import { getGuidePageData } from '@/lib/guide';
import { GuideFeedback } from '@/components/guide-feedback';

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDXContent = page.data.body;
  const { isGuide, toc } = getGuidePageData(page.data);
  const role = params.slug?.[0];
  const roleClass = role && ['administrativo', 'docente', 'estudiante'].includes(role)
    ? `sinai-role-${role}`
    : undefined;
  const hasToc = toc.length > 0;
  const guideMetadata = page.data as typeof page.data & { status?: string; lastReviewed?: string };
  const guideUrl = `/docs/${params.slug?.join('/') ?? ''}`;
  const pageClassName = [isGuide && 'sinai-guide-page', hasToc && 'sinai-custom-toc', roleClass].filter(Boolean).join(' ') || undefined;

  return (
    <DocsPage
      toc={toc}
      full={page.data.full}
      className={pageClassName}
    >
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
      <DocsBody className={isGuide ? 'sinai-guide-body' : undefined}>
        <MDXContent components={getMDXComponents()} />
      </DocsBody>
      {isGuide && (
        <GuideFeedback
          title={String(page.data.title)}
          url={guideUrl}
          status={guideMetadata.status}
          lastReviewed={guideMetadata.lastReviewed}
        />
      )}
      {hasToc && <GuideToc toc={toc} />}
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
