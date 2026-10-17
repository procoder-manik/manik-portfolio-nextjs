import { Suspense } from 'react';
import { AuthForm } from '@/components/account/Forms';

export const metadata = { title: 'Reset password' };

export default async function Page(props) {
  return <Suspense><AuthForm mode="reset" /></Suspense>;
}
