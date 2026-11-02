/* A short, readable device name from a browser's user-agent text. */
export function deviceOf(ua = '') {
  const s = String(ua);
  if (!s) return 'Unknown';
  const os = /iPhone|iPad|iOS/i.test(s) ? 'iPhone/iPad' : /Android/i.test(s) ? 'Android' : /Windows/i.test(s) ? 'Windows' : /Mac OS X|Macintosh/i.test(s) ? 'Mac' : /CrOS/i.test(s) ? 'ChromeOS' : /Linux/i.test(s) ? 'Linux' : '';
  const br = /Edg\//i.test(s) ? 'Edge' : /OPR\/|Opera/i.test(s) ? 'Opera' : /Firefox\//i.test(s) ? 'Firefox' : /Chrome\//i.test(s) ? 'Chrome' : /Safari\//i.test(s) ? 'Safari' : /curl|python|node|axios|bot/i.test(s) ? 'Script' : '';
  return [br, os].filter(Boolean).join(' on ') || 'Unknown';
}
