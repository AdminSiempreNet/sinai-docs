import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { YouTube } from '@/components/youtube';
import { GuideVideoPlaylist } from '@/components/guide-video-playlist';
import { ContentImage } from '@/components/content-image';
import { GuideCallout, GuideFAQ, GuideFAQItem, GuideFocusGrid, GuideGallery, GuideImage, GuideImageRow, GuideImageSequence, GuideImageTrigger, GuideOverview, GuideScreenshotGrid, GuideStep, GuideSummary, GuideVideos } from '@/components/guide';
import { GuideScreenshot } from '@/components/guide-screenshot';
import { GuideChecklist } from '@/components/guide-checklist';
import { PlanillaGuide, PlanillaGuideGroup, PlanillaGuideSwitcher } from '@/components/planilla-guide-switcher';
import { SinaiDocsHome } from '@/components/sinai-docs-home';

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    YouTube,
    GuideCallout,
    GuideFAQ,
    GuideFAQItem,
    GuideChecklist,
    GuideFocusGrid,
    GuideGallery,
    GuideImage,
    GuideImageSequence,
    GuideImageRow,
    GuideImageTrigger,
    GuideOverview,
    GuideScreenshot,
    GuideScreenshotGrid,
    GuideStep,
    GuideSummary,
    GuideVideos,
    GuideVideoPlaylist,
    PlanillaGuide,
    PlanillaGuideGroup,
    PlanillaGuideSwitcher,
    SinaiDocsHome,
    img: ContentImage,
    ...components,
  };
}
