import { marked } from 'marked';
import { slugify } from './utils';

marked.setOptions({ gfm: true, breaks: false });

export function renderMarkdown(md = '') {
  const toc = [];
  const renderer = new marked.Renderer();
  renderer.heading = function ({ tokens, depth }) {
    const text = this.parser.parseInline(tokens);
    const plain = text.replace(/<[^>]+>/g, '');
    const id = slugify(plain);
    if (depth === 2 || depth === 3) toc.push({ id, text: plain, depth });
    return `<h${depth} id="${id}">${text}</h${depth}>`;
  };
  renderer.link = function ({ href, title, tokens }) {
    const text = this.parser.parseInline(tokens);
    const ext = /^https?:\/\//.test(href);
    return `<a href="${href}"${title ? ` title="${title}"` : ''}${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>${text}</a>`;
  };
  renderer.image = function ({ href, title, text }) {
    if (!href || String(href).startsWith('#image-')) return ''; // an AI writer image slot that was never filled
    return `<figure><img src="${href}" alt="${text || ''}" loading="lazy"/>${title ? `<figcaption>${title}</figcaption>` : ''}</figure>`;
  };
  const html = marked.parse(md || '', { renderer });
  return { html, toc };
}
