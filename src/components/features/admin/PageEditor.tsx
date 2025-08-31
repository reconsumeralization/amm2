'use client';
import { useState, useEffect, useCallback } from 'react';
import Editor from '@/components/features/editor/Editor';

interface PageEditorProps {
  contentId?: string;
  slug: string;
  tenantId: string;
  title?: string;
}

export default function PageEditor({ contentId, slug, tenantId, title }: PageEditorProps) {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageTitle, setPageTitle] = useState(title || slug);
  const [isPublished, setIsPublished] = useState(false);

  const loadExistingContent = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/content?slug=${slug}`, {
        headers: { 'X-Tenant-ID': tenantId },
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.docs && data.docs.length > 0) {
          const content = data.docs[0];
          setPageTitle(content.title);
          setIsPublished(content.isPublished);
        }
      }
    } catch (err) {
      setError('Failed to load existing content');
    } finally {
      setIsLoading(false);
    }
  }, [slug, tenantId]);

  useEffect(() => {
    if (contentId) {
      loadExistingContent();
    }
  }, [contentId, loadExistingContent]);

  const handleSave = async (content: string) => {
    try {
      setIsLoading(true);
      setError('');

      const payload = {
        title: pageTitle,
        slug,
        content: content,
        isPublished,
        description: `Page content for ${pageTitle}`,
      };

      const url = contentId ? `/api/content` : `/api/content`;
      const method = contentId ? 'PUT' : 'POST';
      const body = contentId ? { ...payload, id: contentId } : payload;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error('Failed to save page');
      }

      const savedContent = await res.json();
      console.log('Page saved successfully:', savedContent);
      
      // Show success message
      alert('Page saved successfully!');
    } catch (err) {
      console.error('Error saving page:', err);
      setError('Failed to save page. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    setIsPublished(true);
    // The save function will handle the publishing
  };

  const handleUnpublish = async () => {
    setIsPublished(false);
    // The save function will handle the unpublishing
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Page: {pageTitle}
          </h1>
          <p className="text-gray-600 mt-1">
            Slug: {slug} | Tenant: {tenantId}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Published:</label>
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={handlePublish}
            disabled={isPublished}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Publish
          </button>
          
          <button
            onClick={handleUnpublish}
            disabled={!isPublished}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Unpublish
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Page Title
        </label>
        <input
          type="text"
          value={pageTitle}
          onChange={(e) => setPageTitle(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter page title"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="text-red-600 text-sm">{error}</div>
        </div>
      )}

      <div className="border border-gray-200 rounded-lg">
        <Editor
          initialContent=""
          onSaveAction={handleSave}
          tenantId={tenantId}
        />
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Page Builder Features</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Drag and drop components to reorder them</li>
          <li>• Add text, images, buttons, and interactive elements</li>
          <li>• Edit images with cropping and effects before adding</li>
          <li>• Integrate booking chatbot and barber profiles</li>
          <li>• All content is automatically optimized for mobile and desktop</li>
        </ul>
      </div>
    </div>
  );
}
