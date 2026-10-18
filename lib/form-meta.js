import 'server-only';
import { getForm } from './data';

export async function getFormMeta(slug) {
  const f = await getForm(slug);
  if (!f) return {};
  return { title: f.title || f.name, description: f.description || undefined, robots: { index: false, follow: true }, alternates: { canonical: `/forms/${slug}` } };
}
