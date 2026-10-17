import * as L from 'lucide-react';
export default function Icon({ name, ...p }) { const C = L[name] || L.Sparkles; return <C {...p} />; }
