import { SignJWT, jwtVerify } from 'jose';

export const COOKIE = 'mh_admin';
export const CUSTOMER_COOKIE = 'mh_customer';

export const adminCookieOpts = { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 7 };

/* A live site without JWT_SECRET must refuse sign-ins: the development key below is public in the source code. */
const raw = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET is not set. Add it to the server environment, then redeploy.');
  return 'dev-only-secret-change-me-please-32chars';
};
const secret = () => new TextEncoder().encode(raw());
// Customer sessions use a different key, so a customer token can never pass as an admin token.
const customerSecret = () => new TextEncoder().encode(`${raw()}:customer-portal`);

export async function signToken(payload) {
  return new SignJWT({ ...payload, role: 'admin' }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d').sign(secret());
}

export async function verifyToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.role === 'customer' ? null : payload;
  } catch { return null; }
}

export async function signCustomerToken({ id, email, v = 0 }) {
  return new SignJWT({ sub: String(id), email, v, role: 'customer' }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('30d').sign(customerSecret());
}

export async function verifyCustomerToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, customerSecret());
    return payload.role === 'customer' ? payload : null;
  } catch { return null; }
}
