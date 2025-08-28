import { Metadata } from 'next'
import LexicalEditor from '@/components/editor/LexicalEditor'

export const metadata: Metadata = {
  title: 'Text Editor - Modern Men Salon',
  description: 'Professional rich text editor for creating and editing content with Modern Men branding.',
  keywords: ['text editor', 'rich text', 'content creation', 'lexical editor', 'Modern Men']
}

export default function TextEditorPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Modern Men Text Editor
        </h1>
        <p className="text-gray-600">
          Professional rich text editor for creating compelling content for your salon.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Create New Content</h2>
        <LexicalEditor 
          placeholder="Start writing your content here... Use the toolbar above to format your text."
          className="mb-6"
        />
        
        <div className="flex gap-4">
          <button className="btn-premium px-6 py-2">
            Save Draft
          </button>
          <button className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            Publish
          </button>
        </div>
      </div>

      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">Editor Features</h3>
        <ul className="space-y-2 text-gray-600">
          <li>• <strong>Rich Text Formatting:</strong> Bold, italic, underline, and more</li>
          <li>• <strong>Text Alignment:</strong> Left, center, right, and justify alignment</li>
          <li>• <strong>Lists:</strong> Bullet points and numbered lists</li>
          <li>• <strong>Keyboard Shortcuts:</strong> Ctrl+B for bold, Ctrl+I for italic, etc.</li>
          <li>• <strong>Markdown Support:</strong> Type **bold** or *italic* for quick formatting</li>
          <li>• <strong>Undo/Redo:</strong> Full history support with toolbar buttons</li>
        </ul>
      </div>
    </div>
  )
}
