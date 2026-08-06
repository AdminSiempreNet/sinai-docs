'use client';

import { ContentImageTrigger } from '@/components/content-image';

export function GuideScreenshot({
  src,
  alt,
  caption,
  showCaption = false,
}: {
  src: string;
  alt: string;
  caption?: string;
  showCaption?: boolean;
}) {
  return (
    <ContentImageTrigger src={src} alt={alt}>
      {showCaption && caption ? caption : 'Ver ejemplo'}
    </ContentImageTrigger>
  );
}
