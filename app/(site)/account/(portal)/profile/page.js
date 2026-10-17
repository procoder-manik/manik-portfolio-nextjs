import { CheckCircle2, MailWarning } from 'lucide-react';
import { getCustomer } from '@/lib/customers';
import { mailEnabled } from '@/lib/mail';
import { serialize, fmtDate } from '@/lib/utils';
import { ProfileForm, PasswordForm, ResendVerify, SignOut } from '@/components/account/Forms';
import { AvatarUpload } from '@/components/account/Growth';
import InfoTip from '@/components/site/InfoTip';

export const metadata = { title: 'Profile' };

export default async function Profile() {
  const me = serialize(await getCustomer());
  return (
    <div className="grid max-w-4xl gap-6">
      <section className="card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><h1 className="text-xl font-semibold">Your details</h1><p className="mt-1 text-sm text-muted">Used to fill in checkout and on your invoices. Member since {fmtDate(me.createdAt, { month: 'long', year: 'numeric' })}.</p></div>
          {me.emailVerified ? <span className="flex items-center gap-1.5 text-sm text-good"><CheckCircle2 size={16} />Email confirmed<InfoTip text="Your email is confirmed, so every order placed with it shows in your account." /></span>
            : <span className="flex flex-col items-end gap-2"><span className="flex items-center gap-1.5 text-sm text-amber"><MailWarning size={16} />Email not confirmed<InfoTip text="Confirm your email to bring in orders you placed before you had an account, and to reset your password if you forget it." /></span>{mailEnabled() && <ResendVerify />}</span>}
        </div>
        <div className="mt-6 border-b border-line pb-6"><AvatarUpload url={me.avatar} name={me.name} /></div>
        <div className="mt-6"><ProfileForm me={{ name: me.name || '', email: me.email, phone: me.phone || '', company: me.company || '', country: me.country || '' }} /></div>
      </section>
      <section className="card p-6 sm:p-8">
        <h2 className="text-xl font-semibold">Password</h2>
        <p className="mb-6 mt-1 text-sm text-muted">Changing it signs you out on every other device.</p>
        <PasswordForm />
      </section>
      <section className="card flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
        <div><h2 className="text-xl font-semibold">Sign out</h2><p className="mt-1 text-sm text-muted">To delete your account, send me a message and I will remove it.</p></div>
        <SignOut />
      </section>
    </div>
  );
}
