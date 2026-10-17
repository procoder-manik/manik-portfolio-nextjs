/* Re-mounts on every navigation, so each public page gets a short entrance. */
export default function Template({ children }) {
  return <div className="page-enter">{children}</div>;
}
