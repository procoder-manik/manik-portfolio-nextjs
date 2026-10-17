/* Splits a heading into words so each one can slide up from behind a mask.
   Server component: the words are in the HTML, so search engines and screen readers read normal text. */
export default function SplitText({ text }) {
  if (typeof text !== 'string' || !text.trim()) return text ?? null;
  const words = text.trim().split(/\s+/);
  return words.map((w, i) => (
    <span key={i}>
      <span className="sw"><span style={{ '--i': i }}>{w}</span></span>{i < words.length - 1 ? ' ' : ''}
    </span>
  ));
}
