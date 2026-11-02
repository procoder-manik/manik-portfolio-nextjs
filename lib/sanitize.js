import sanitize from 'sanitize-html';

/* Cleans the HTML that Markdown produces, so a post can never run scripts in a visitor's or an admin's browser.
   Keeps normal article formatting, images, tables and video embeds from the listed hosts. */
const COLOR = [/^[#\w\s(),.%-]+$/];
const SIZE = [/^(auto|[\d.]+(px|%|rem|em)?)$/];
const OPTIONS = {
  allowedTags: [...sanitize.defaults.allowedTags, 'img', 'figure', 'figcaption', 'video', 'source', 'iframe', 'details', 'summary', 'ins', 'del', 'kbd', 'mark', 'u', 'input'],
  allowedAttributes: {
    '*': ['id', 'class', 'title', 'style', 'align', 'dir', 'lang'],
    a: ['href', 'name', 'target', 'rel'],
    img: ['src', 'srcset', 'sizes', 'alt', 'width', 'height', 'loading'],
    video: ['src', 'poster', 'controls', 'width', 'height', 'muted', 'loop', 'playsinline'],
    source: ['src', 'type'],
    iframe: ['src', 'width', 'height', 'allow', 'allowfullscreen', 'loading', 'referrerpolicy'],
    th: ['colspan', 'rowspan', 'scope'], td: ['colspan', 'rowspan'], ol: ['start', 'type'], details: ['open'],
    input: ['type', 'checked', 'disabled'], // GitHub-style task lists
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https'], video: ['http', 'https'], source: ['http', 'https'] },
  allowProtocolRelative: false,
  allowedIframeHostnames: ['www.youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com', 'www.loom.com', 'www.google.com', 'calendly.com'],
  allowedStyles: { '*': {
    color: COLOR, 'background-color': COLOR, 'text-align': [/^(left|right|center|justify)$/],
    'font-weight': [/^[\w-]+$/], 'font-style': [/^(normal|italic)$/], 'text-decoration': [/^[\w\s-]+$/],
    width: SIZE, 'max-width': SIZE, height: SIZE,
  } },
};

export const cleanHtml = (html = '') => sanitize(String(html), OPTIONS);
