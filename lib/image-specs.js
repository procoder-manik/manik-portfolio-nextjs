/* Exact image sizes for every cover and share image, and how the site crops them.
   Shared by the admin (size guide, field hints) and the server (AI image prompts). */
export const IMAGE_SPECS = {
  post: {
    label: 'Blog cover', field: 'Cover image', w: 1600, h: 900, ratio: '16:9', safe: [1400, 760], max: '300 KB',
    shown: ['Article page at 2:1 (about 11% trimmed from the top and bottom)', 'Blog cards at 16:10 (about 10% trimmed from the sides) and 16:9 (not trimmed)', 'Facebook, LinkedIn, X and WhatsApp at 1.91:1 (about 7% trimmed from the top and bottom)'],
  },
  case: {
    label: 'Case study cover', field: 'Cover image', w: 1600, h: 1000, ratio: '16:10', safe: [1400, 800], max: '300 KB',
    shown: ['Case study page at 16:9 (about 10% trimmed from the top and bottom)', 'Large card on the Case studies page at about 1.45:1 (about 9% trimmed from the sides)', 'Grid cards at 16:10 (not trimmed)', 'Social sharing at 1.91:1 (about 16% trimmed from the top and bottom)'],
  },
  project: {
    label: 'Portfolio banner', field: 'Banner image', w: 1600, h: 840, ratio: '40:21 (1.9:1)', ar: '40:21', safe: [1400, 700], max: '300 KB',
    shown: ['Social sharing (Facebook, LinkedIn, X, WhatsApp) at 1.91:1', 'The project page itself shows the full-page screenshot, not this image'],
  },
  page: {
    label: 'Social share image', field: 'Social share image', w: 1200, h: 630, ratio: '40:21 (1.91:1)', ar: '40:21', safe: [1080, 560], max: '300 KB',
    shown: ['Facebook, LinkedIn, X and WhatsApp link previews', 'Google Discover and chat apps that show a link preview'],
  },
};
export const specOf = (kind) => IMAGE_SPECS[kind] || IMAGE_SPECS.page;
export const arOf = (s) => s.ar || s.ratio.split(' ')[0];

/* Other images on the site, so every size is in one place. */
export const OTHER_SIZES = [
  ['Image in a card (Cards and Feature sections)', '1200 x 750', '16:10'],
  ['Popup image at the top', '1600 x 800', '2:1'],
  ['About photo on the home page', '1200 x 1500', '4:5'],
  ['Product logo or icon', '512 x 512', '1:1, transparent PNG'],
  ['Client logo', '400 x 400', '1:1, transparent PNG'],
  ['Full-page screenshot of a website', '1440 wide, any height', 'JPG or WebP, under 1.5 MB'],
];
