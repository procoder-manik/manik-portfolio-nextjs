import Editor from '@/components/admin/Editor';
export default async function Page(props) {
  const params = await props.params;
  return <Editor resource={params.resource} id={params.id} />;
}
