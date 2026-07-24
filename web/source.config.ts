import { defineDocs, defineConfig } from 'fumadocs-mdx/config';
import { pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';

const guideTocItemSchema = z.object({
  title: z.string(),
  url: z.string(),
  depth: z.number(),
});

const docsSchema = pageSchema.extend({
  guide: z.boolean().optional(),
  guideToc: z.array(guideTocItemSchema).optional(),
  status: z.string().optional(),
  lastReviewed: z.string().optional(),
}).passthrough();

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: docsSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
});

export default defineConfig();
