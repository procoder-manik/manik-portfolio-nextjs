import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCustomer } from '@/lib/customers';
import { AuthForm } from '@/components/account/Forms';

export const metadata = { title: 'Sign in' };

export default async function Page(props) {
  const sp = await props.searchParams;
  if (await getCustomer()) redirect(sp.claim && sp.t ? `/order/${encodeURIComponent(sp.claim)}?t=${encodeURIComponent(sp.t)}` : '/account');
  return <Suspense><AuthForm mode="login" /></Suspense>;
}
