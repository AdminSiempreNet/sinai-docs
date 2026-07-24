import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

export const { GET } = createFromSource(source, {
  language: 'spanish',
  async buildIndex(page) {
    const structuredData = await Promise.resolve(page.data.structuredData);
    const role = page.url.split('/').filter(Boolean)[1];
    const roleTag = ['administrativo', 'docente', 'estudiante'].includes(role)
      ? role
      : undefined;

    return {
      id: page.url,
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      structuredData,
      tag: roleTag ? ['todos', roleTag] : 'todos',
    };
  },
});
