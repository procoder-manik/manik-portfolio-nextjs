/* Feature switches from Admin > Site and contact > Features. */
export const caseStudiesOn = (site) => Boolean(site?.features?.caseStudies);
export const isCaseStudyLink = (href = '') => /^\/(#)?case-studies/.test(href) || href === '/#case-studies';
/* Customer accounts at /account. On unless switched off in Site and contact > Features. */
export const accountsOn = (site) => site?.features?.customerAccounts !== false;
/* Floating buttons. The Back to Top button can be switched off and placed on the left or right (Site and contact > Features).
   The built-in chat has its own position (Analytics and integrations > Chat). */
export const backToTopOn = (site) => site?.features?.backToTop !== false;
export const backToTopSide = (site) => (site?.features?.backToTopPosition === 'left' ? 'left' : 'right');
export const chatSide = (chat) => (chat?.position === 'right' ? 'right' : 'left');
