import { sanitizeInline } from '@/lib/rich-inline';

/* Renders a "rich line" saved from the admin (text with optional links). */
export default function RichText({ html, tokens, as: Tag = 'span', className = '' }) {
  if (!html) return null;
  return <Tag className={`rich-inline ${className}`} dangerouslySetInnerHTML={{ __html: sanitizeInline(html, tokens) }} />;
}
