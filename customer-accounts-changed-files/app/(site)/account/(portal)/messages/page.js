import { dbConnect } from '@/lib/db';
import { Message, Customer } from '@/lib/models';
import { getCustomer, customerOrders, messageFilter } from '@/lib/customers';
import { serialize, fmtDate } from '@/lib/utils';
import { MessageForm } from '@/components/account/Forms';

export const metadata = { title: 'Messages' };

const when = (d) => fmtDate(d, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

export default async function Messages() {
  const me = await getCustomer();
  await dbConnect();
  const [threads, orders] = await Promise.all([
    Message.find(messageFilter(me)).sort({ updatedAt: -1 }).limit(100).lean().then(serialize),
    customerOrders(me).then((x) => serialize(x).map((o) => ({ number: o.number, package: { name: o.package?.name } }))),
  ]);
  await Customer.updateOne({ _id: me._id }, { messagesSeenAt: new Date() });

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
      <section className="card h-fit p-6 lg:sticky lg:top-28">
        <h1 className="text-xl font-semibold">Write to me</h1>
        <p className="mb-5 mt-1 text-sm text-muted">Questions, change requests or a new idea. My replies show up here and in your email.</p>
        <MessageForm orders={orders} />
      </section>
      <section>
        <h2 className="text-xl font-semibold">Conversations</h2>
        {threads.length ? (
          <ul className="mt-4 space-y-4">
            {threads.map((t) => (
              <li key={t._id} className="card p-5 sm:p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-semibold text-ink">{t.subject || 'Message'}</h3>
                  {t.orderNumber && <span className="text-xs text-muted">Order {t.orderNumber}</span>}
                </div>
                <div className="mt-4 space-y-3">
                  <Bubble who="You" at={t.createdAt} text={t.message} mine />
                  {(t.replies || []).filter((r) => r.message).map((r, i) => <Bubble key={i} who="Manik" at={r.at} text={r.message} />)}
                  {!(t.replies || []).some((r) => r.message) && <p className="text-xs text-muted">Waiting for a reply. Usually within one working day.</p>}
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="mt-4 rounded-2xl border border-dashed border-line p-8 text-center text-muted">No conversations yet.</p>}
      </section>
    </div>
  );
}

function Bubble({ who, at, text, mine }) {
  return (
    <div className={`rounded-2xl px-4 py-3 ${mine ? 'bg-raised' : 'border border-signal/30 bg-signal/10'}`}>
      <p className="text-xs text-muted"><span className="font-medium text-ink">{who}</span> · {when(at)}</p>
      <p className="mt-1.5 whitespace-pre-wrap text-[0.95rem] text-body">{text}</p>
    </div>
  );
}
