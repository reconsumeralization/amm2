'use client';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FORMAT_TEXT_COMMAND } from 'lexical';
import { INSERT_IMAGE_COMMAND } from '@/nodes/ImageNode';

export default function Toolbar() {
  const [editor] = useLexicalComposerContext();

  const handleBold = () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
  const handleItalic = () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // TODO: Implement image upload functionality
      console.log('Image upload not yet implemented');
    }
  };

  return (
    <div className="flex gap-2 p-2 bg-gray-100 border-b">
      <button onClick={handleBold} className="px-2 py-1 bg-blue-500 text-white rounded">Bold</button>
      <button onClick={handleItalic} className="px-2 py-1 bg-blue-500 text-white rounded">Italic</button>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="px-2 py-1 bg-green-500 text-white rounded"
      />
    </div>
  );
}
