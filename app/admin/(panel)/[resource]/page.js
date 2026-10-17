import List from '@/components/admin/List';
export default async function Page(props) {
  const params = await props.params;
  return <List resource={params.resource} />;
}
