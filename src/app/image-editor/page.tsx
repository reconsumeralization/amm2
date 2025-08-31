'use client';

import { useState } from 'react';
import ModernMenImageEditor from '@/components/image-editor/ModernMenImageEditor';

export default function ImageEditorPage() {
  const [editedImage, setEditedImage] = useState<string | null>(null);

  const handleSave = (imageData: string) => {
    setEditedImage(imageData);
    console.log('Image saved successfully');
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black mb-2">Image Editor</h1>
        <p className="text-gray-600">Professional image editing tools for your Modern Men barber website</p>
      </div>

      {editedImage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">Image saved successfully!</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6">
        <ModernMenImageEditor />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="font-semibold text-black mb-2">Adjustments</h3>
          <p className="text-sm text-gray-600">Brightness, contrast, saturation, and more</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="font-semibold text-black mb-2">Filters</h3>
          <p className="text-sm text-gray-600">Apply professional photo filters</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="font-semibold text-black mb-2">Text Overlay</h3>
          <p className="text-sm text-gray-600">Add text and branding to images</p>
        </div>
      </div>
    </div>
  );
}
