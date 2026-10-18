import { notFound } from 'next/navigation';
import { getForm, getSettings } from '@/lib/data';
import FormView from '@/components/site/FormView';
import { getFormMeta } from '@/lib/form-meta';

export async function generateMetadata(props) {
  const { slug } = await props.params;
  return getFormMeta(slug);
}

/* A shareable page for one form: /forms/<name>. Switch it off in the form's Settings tab. */
export default async function FormPage(props) {
  const { slug } = await props.params;
  const form = await getForm(slug);
  if (!form || form.settings?.publicPage === false) notFound();
  return (
    <section className="pb-20 pt-36 sm:pt-44">
      <div className="shell max-w-3xl"><FormView form={form} /></div>
    </section>
  );
}
