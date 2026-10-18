import { api } from './api';
let tpl = null; let pending = null;
/* The title template from SEO settings (for example "%s | Site name"), fetched once and reused. */
export function getSeoTpl() {
  if (tpl) return Promise.resolve(tpl);
  pending ||= api('/api/admin/settings/seo').then((j) => (tpl = j.item?.titleTemplate || '%s')).catch(() => '%s');
  return pending;
}
