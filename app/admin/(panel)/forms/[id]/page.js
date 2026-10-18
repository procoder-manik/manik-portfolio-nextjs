import FormBuilder from '@/components/admin/FormBuilder';
export default async function Page(props) { const { id } = await props.params; return <FormBuilder id={id} />; }
