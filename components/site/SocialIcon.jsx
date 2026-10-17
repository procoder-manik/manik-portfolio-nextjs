import { Linkedin, Facebook, Instagram, Github, Youtube, Twitter, Dribbble, Globe, MessageCircle, Mail, Send } from 'lucide-react';

const MAP = [[/linkedin/i, Linkedin], [/facebook|fb\.com/i, Facebook], [/instagram/i, Instagram], [/github/i, Github], [/youtube|youtu\.be/i, Youtube],
  [/twitter|x\.com/i, Twitter], [/dribbble/i, Dribbble], [/whatsapp|wa\.me|wa\.link/i, MessageCircle], [/t\.me|telegram/i, Send], [/mailto:/i, Mail]];
const LETTERS = [[/fiverr/i, 'fi'], [/upwork/i, 'Up'], [/behance/i, 'Bē'], [/medium/i, 'M'], [/tiktok/i, 'Tk'], [/pinterest/i, 'P'], [/threads/i, '@']];

/* Picks an icon from the profile URL or label. Platforms without an icon get a short lettermark. */
export default function SocialIcon({ label = '', url = '', size = 17 }) {
  const key = `${label} ${url}`;
  const hit = MAP.find(([re]) => re.test(key));
  if (hit) { const I = hit[1]; return <I size={size} strokeWidth={1.8} aria-hidden />; }
  const l = LETTERS.find(([re]) => re.test(key));
  if (l) return <span aria-hidden className="font-display text-[13px] font-bold leading-none">{l[1]}</span>;
  return <Globe size={size} strokeWidth={1.8} aria-hidden />;
}
