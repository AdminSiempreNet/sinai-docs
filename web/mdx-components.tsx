import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { YouTube } from '@/components/youtube';
import { GuideVideoPlaylist } from '@/components/guide-video-playlist';
import { ContentImage } from '@/components/content-image';
import { GuideCallout, GuideDataTable, GuideFAQ, GuideFAQItem, GuideFocusGrid, GuideGallery, GuideImage, GuideImagePending, GuideImageRow, GuideImageSequence, GuideImageTrigger, GuideLink, GuideOverview, GuideScreenshotGrid, GuideStep, GuideSummary, GuideVideoPending, GuideVideos } from '@/components/guide';
import { GuideScreenshot } from '@/components/guide-screenshot';
import { GuideChecklist } from '@/components/guide-checklist';
import { PlanillaGuide, PlanillaGuideGroup, PlanillaGuideSwitcher } from '@/components/planilla-guide-switcher';
import { SinaiDocsHome } from '@/components/sinai-docs-home';
import { InstitutionalConfigHub } from '@/components/institutional-config-hub';
import { SectionHub } from '@/components/section-hub';

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    YouTube,
    GuideCallout,
    GuideDataTable,
    GuideImagePending,
    GuideVideoPending,
    GuideFAQ,
    GuideFAQItem,
    GuideChecklist,
    GuideFocusGrid,
    GuideGallery,
    GuideImage,
    GuideImageSequence,
    GuideImageRow,
    GuideImageTrigger,
    GuideLink,
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
    InstitutionalConfigHub,
    SectionHub,
    img: ContentImage,
    ...components,
  };
}
