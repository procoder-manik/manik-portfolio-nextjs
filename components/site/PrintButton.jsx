'use client';
import { Printer } from 'lucide-react';
export default function PrintButton({ label = 'Print' }) {
  return <button onClick={() => window.print()} className="btn-ghost btn-sm"><Printer size={15} />{label}</button>;
}
