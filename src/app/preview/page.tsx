import { getPayload } from 'payload';
import { notFound } from 'next/navigation';

export default async function PreviewPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const payload = await getPayload({ config: await import('../../payload.config') });
  const { id } = await searchParams;

  if (!id) {
    return <div className="container mx-auto p-4">No document ID provided</div>;
  }

  const doc = await payload.findByID({ collection: 'business-documentation', id });
  if (!doc) {
    notFound();
  }

  const html = JSON.stringify(doc.content);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-4">{doc.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
