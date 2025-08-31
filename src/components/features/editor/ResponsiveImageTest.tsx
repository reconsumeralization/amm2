'use client';
import { useState } from 'react';
import Editor from './Editor';

export default function ResponsiveImageTest() {
  const [content, setContent] = useState('');

  const handleSave = (newContent: string) => {
    setContent(newContent);
    console.log('Editor content saved:', newContent);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Responsive Image Editor Test</h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Features</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Upload images with automatic responsive optimization</li>
          <li>Generate multiple sizes (mobile, tablet, desktop)</li>
          <li>Support for JPEG and WebP formats</li>
          <li>Lazy loading and modern HTML attributes</li>
          <li>Settings-driven configuration</li>
          <li>Bunny CDN integration for fast delivery</li>
        </ul>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Editor</h2>
        <Editor 
          onSaveAction={handleSave} 
          tenantId="test-tenant"
        />
      </div>

      {content && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Rendered Content</h2>
          <div 
            className="p-4 border rounded bg-white"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">How to Test</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Upload an image using the file input in the editor</li>
          <li>Check the browser's Network tab to see multiple image sizes being generated</li>
          <li>Inspect the rendered image to see srcset and sizes attributes</li>
          <li>Resize your browser window to see different image sizes load</li>
          <li>Check the Bunny CDN URLs for optimized image delivery</li>
        </ol>
      </div>
    </div>
  );
}
