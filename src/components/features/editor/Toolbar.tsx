'use client';
import { useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FORMAT_TEXT_COMMAND, INSERT_TAB_COMMAND, COMMAND_PRIORITY_EDITOR } from 'lexical';

export default function Toolbar() {
  const [editor] = useLexicalComposerContext();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleBold = () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
  const handleItalic = () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/uploads/images', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      
      if (result.success && result.file) {
        // Insert image into editor
        editor.dispatchCommand(INSERT_TAB_COMMAND, {
          src: result.file.url,
          alt: result.file.alt || result.file.filename,
          width: result.file.width || 300,
          height: result.file.height || 200,
        });

        console.log('Image uploaded successfully:', result.file);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error: any) {
      console.error('Image upload error:', error);
      setUploadError(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
      // Clear the input so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-2 p-2 bg-gray-100 border-b">
      <div className="flex gap-2 items-center">
        <button 
          onClick={handleBold} 
          className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Bold
        </button>
        <button 
          onClick={handleItalic} 
          className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Italic
        </button>
        <label className={`px-2 py-1 rounded cursor-pointer transition-colors ${
          isUploading 
            ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
            : 'bg-green-500 text-white hover:bg-green-600'
        }`}>
          {isUploading ? 'Uploading...' : 'Upload Image'}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>
      
      {uploadError && (
        <div className="text-red-600 text-sm bg-red-50 px-2 py-1 rounded">
          {uploadError}
        </div>
      )}
    </div>
  );
}
