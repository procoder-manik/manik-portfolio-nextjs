import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { User } from '@/lib/models';

export const dynamic = 'force-dynamic';

/* Open /api/health to check setup. Shows only whether values exist, never the values. */
export async function GET() {
  const set = (k) => Boolean(process.env[k] && String(process.env[k]).trim());
  const env = Object.fromEntries(['MONGODB_URI', 'JWT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD', 'NEXT_PUBLIC_SITE_URL', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 'RESEND_API_KEY', 'SMTP_HOST', 'GEMINI_API_KEY', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY'].map((k) => [k, set(k)]));
  let database = 'not configured'; let adminUsers = null;
  if (env.MONGODB_URI) {
    try { await dbConnect(); adminUsers = await User.countDocuments(); database = 'connected'; }
    catch (e) { database = `error: ${String(e.message).replace(/\/\/[^@]*@/, '//***@').slice(0, 200)}`; }
  }
  return NextResponse.json({ ok: database === 'connected', database, adminUsers, env }, { headers: { 'Cache-Control': 'no-store' } });
}
