'use client';
import { useState } from 'react';
import { Play } from 'lucide-react';

/* YouTube, Vimeo or a direct video file. Nothing loads from the video host until the visitor presses play. */
function parse(url = '') {
  const u = String(url).trim();
  let m = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/i);
  if (m) return { kind: 'youtube', id: m[1], embed: `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&rel=0&modestbranding=1`, poster: `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg` };
  m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (m) return { kind: 'vimeo', id: m[1], embed: `https://player.vimeo.com/video/${m[1]}?autoplay=1`, poster: '' };
  if (/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(u)) return { kind: 'file', embed: u, poster: '' };
  return null;
}

export default function LandingVideo({ url, poster, title = 'Video' }) {
  const v = parse(url);
  const [on, setOn] = useState(false);
  if (!v) return null;
  const cover = poster || v.poster;
  return (
    <div className="lp-panel lp-pop relative mx-auto aspect-video w-full overflow-hidden rounded-[28px] sm:rounded-[40px]">
      {on ? (
        v.kind === 'file'
          ? <video src={v.embed} controls autoPlay playsInline className="absolute inset-0 h-full w-full bg-black" poster={cover || undefined} />
          : <iframe src={v.embed} title={title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen className="absolute inset-0 h-full w-full border-0" />
      ) : (
        <button type="button" onClick={() => setOn(true)} aria-label={`Play: ${title}`} className="group absolute inset-0 grid place-items-center">
          {cover && /* eslint-disable-next-line @next/next/no-img-element */ <img src={cover} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-[1.03]" />}
          <span className="absolute inset-0 bg-black/25" aria-hidden="true" />
          <span className="lp-glass relative grid h-20 w-20 place-items-center rounded-full text-white transition duration-300 group-hover:scale-110 sm:h-24 sm:w-24"><Play size={30} className="ml-1" fill="currentColor" /></span>
        </button>
      )}
    </div>
  );
}
