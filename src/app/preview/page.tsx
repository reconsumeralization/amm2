import { getPayloadClient } from '@/payload';
import config from '@/payload.config'
// import { notFound } from 'next/navigation';

export default async function PreviewPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const payload = await getPayloadClient();
  const { id } = await searchParams;

  if (!id) {
    return <div className="container mx-auto p-4">No document ID provided</div>;
  }

  const doc = await payload.findByID({ collection: 'business-documentation', id });
  if (!doc) {
    return <div className="container mx-auto p-4">Document not found</div>;
  }

  const html = JSON.stringify(doc.content);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-4">{doc.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
