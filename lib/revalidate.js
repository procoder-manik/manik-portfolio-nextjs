import 'server-only';
import { revalidateTag } from 'next/cache';
export function refreshContent() { try { revalidateTag('content'); } catch {} }
