import 'server-only';
import dns from 'dns/promises';
import net from 'net';

const privateIp = (ip) => {
  if (net.isIPv6(ip)) return /^(::1|fc|fd|fe80)/i.test(ip) || ip === '::';
  const [a, b] = ip.split('.').map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
};

/* Fetches a public web page as plain text. Refuses private and local addresses so it cannot be used to reach your own network. */
export async function fetchPageText(url, { max = 24000 } = {}) {
  let u; try { u = new URL(url); } catch { throw new Error('That is not a valid web address.'); }
  if (!/^https?:$/.test(u.protocol)) throw new Error('Only http and https addresses are allowed.');
  if (/^(localhost|.*\.local|.*\.internal)$/i.test(u.hostname)) throw new Error('Local addresses are not allowed.');
  const ips = net.isIP(u.hostname) ? [u.hostname] : (await dns.lookup(u.hostname, { all: true }).catch(() => [])).map((x) => x.address);
  if (!ips.length || ips.some(privateIp)) throw new Error('That address cannot be fetched (private or not found).');
  const r = await fetch(u, { redirect: 'manual', signal: AbortSignal.timeout(10000), headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SiteBrainBot/1.0)', Accept: 'text/html,text/plain' } });
  if (r.status >= 300 && r.status < 400) throw new Error('The page redirects somewhere else. Paste the final address.');
  if (!r.ok) throw new Error(`The page answered with error ${r.status}.`);
  const html = (await r.text()).slice(0, 600000);
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').replace(/\s+/g, ' ').trim();
  const text = html.replace(/<(script|style|noscript|svg|nav|footer|header)[\s\S]*?<\/\1>/gi, ' ').replace(/<br\s*\/?>|<\/(p|div|li|h[1-6]|tr)>/gi, '\n').replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
  return { title, text: text.slice(0, max) };
}
