import { getPayload } from 'payload';
import Editor from '@/components/editor/Editor';

export default async function EditorPage({ params }: { params: { id?: string } }) {
  const payload = await getPayload({ config: await import('../../payload.config') });
  let initialContent = '';
  if (params.id) {
    const doc = await payload.findByID({ collection: 'business-documentation', id: params.id });
    initialContent = doc.content || '';
  }

  const handleSave = async (content: string) => {
    try {
      await payload.create({
        collection: 'business-documentation',
        data: { content, title: 'New Service Description' },
      });
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-4">Content Editor</h1>
      <Editor initialContent={initialContent} onSave={handleSave} />
    </div>
  );
}