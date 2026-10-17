/* Feature switches from Admin > Site and contact > Features. */
export const caseStudiesOn = (site) => Boolean(site?.features?.caseStudies);
export const isCaseStudyLink = (href = '') => /^\/(#)?case-studies/.test(href) || href === '/#case-studies';
/* Customer accounts at /account. On unless switched off in Site and contact > Features. */
export const accountsOn = (site) => site?.features?.customerAccounts !== false;
