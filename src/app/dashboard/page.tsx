import { getPayload } from 'payload';
import Link from 'next/link';

export default async function DashboardPage() {
  const payload = await getPayload({ config: (await import('../../payload.config')).default });
  const docs = await payload.find({ collection: 'business-documentation', limit: 10 });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-4">Content Dashboard</h1>
      <Link href="/editor" className="px-4 py-2 bg-blue-500 text-white rounded mb-4 inline-block">New Document</Link>
      <ul>
        {docs.docs.map((doc) => (
          <li key={doc.id}>
            <Link href={`/preview?id=${doc.id}`}>{doc.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
