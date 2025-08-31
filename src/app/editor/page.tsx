'use client';

import { useState } from 'react';
import Editor from '@/components/features/editor/Editor';

export default function EditorPage() {
  const [savedContent, setSavedContent] = useState('');

  const handleSave = async (content: string) => {
    try {
      // Save to localStorage for demo purposes
      localStorage.setItem('editor-content', content);
      setSavedContent(content);
      console.log('Content saved successfully');
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black mb-2">Content Editor</h1>
        <p className="text-gray-600">Create and edit rich content for your Modern Men barber website</p>
      </div>

      {savedContent && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">Content saved successfully!</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6">
        <Editor
          initialContent={savedContent || localStorage.getItem('editor-content') || ''}
          onSaveAction={handleSave}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="font-semibold text-black mb-2">Rich Text</h3>
          <p className="text-sm text-gray-600">Full rich text editing with formatting</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="font-semibold text-black mb-2">Images</h3>
          <p className="text-sm text-gray-600">Upload and embed images</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="font-semibold text-black mb-2">Templates</h3>
          <p className="text-sm text-gray-600">Service and product templates</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="font-semibold text-black mb-2">AI Content</h3>
          <p className="text-sm text-gray-600">AI-powered content generation</p>
        </div>
      </div>
    </div>
  );
}