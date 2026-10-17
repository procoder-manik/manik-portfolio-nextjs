import { Suspense } from 'react';
import { AuthForm } from '@/components/account/Forms';

export const metadata = { title: 'Forgot password' };

export default async function Page(props) {
  return <Suspense><AuthForm mode="forgot" /></Suspense>;
}
