'use client';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodes, $createTextNode } from 'lexical';
import { useState, useEffect } from 'react';
import ImageEditor from './ImageEditor';

export default function ImagePlugin({ maxSize = 5242880, tenantId = 'tenant-id-placeholder' }: { maxSize?: number, tenantId?: string }) {
  const [editor] = useLexicalComposerContext();
  const [settings, setSettings] = useState<any>({
    editor: {
      imageOptimization: {
        maxImageSize: maxSize,
        responsiveSizes: [{ width: 320, label: 'mobile' }, { width: 768, label: 'tablet' }, { width: 1200, label: 'desktop' }],
        formats: ['jpeg', 'webp'],
        quality: 80,
      },
      imageEditor: { enabled: true, effects: ['brightness', 'contrast'] },
    },
  });
  const [error, setError] = useState('');
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`/api/settings?tenantId=${tenantId}`);
        const data = await res.json();
        if (data.editor?.imageOptimization) {
          setSettings(data);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    fetchSettings();
  }, [tenantId]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > settings.editor.imageOptimization.maxImageSize) {
      setError(`File size exceeds ${settings.editor.imageOptimization.maxImageSize / 1024 / 1024}MB`);
      return;
    }

    if (settings.editor.imageEditor.enabled) {
      setSelectedFile(file);
      setShowImageEditor(true);
    } else {
      await uploadImage(file, '');
    }
  };

  const uploadImage = async (file: Blob, alt: string) => {
    try {
      setError('');
      
      // Upload original image to Payload CMS
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/media', {
        method: 'POST',
        body: formData,
        headers: { 'X-Tenant-ID': tenantId },
      });
      const media = await uploadRes.json();

      // Generate responsive images
      const responsiveImages = await Promise.all(
        settings.editor.imageOptimization.responsiveSizes.map(async (size: any) => {
          const res = await fetch('/api/image-optimize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mediaId: media.id,
              width: size.width,
              formats: settings.editor.imageOptimization.formats,
              quality: settings.editor.imageOptimization.quality,
              tenantId,
            }),
          });
          const { urls } = await res.json();
          return { width: size.width, label: size.label, urls };
        })
      );

      // Create srcset and sizes
      const srcset = responsiveImages
        .flatMap((img: any) =>
          img.urls.map((url: any) => `${url.url} ${img.width}w`)
        )
        .join(', ');
      const sizes = responsiveImages
        .map((img: any) => `(max-width: ${img.width}px) ${img.width}px`)
        .join(', ') + ', 1200px';

      // Insert image as text representation for now
      editor.update(() => {
        const imageText = `[Image: ${alt || 'Uploaded image'}]\n\n`;
        $insertNodes([$createTextNode(imageText)]);
      });
    } catch (err) {
      setError('Failed to upload and optimize image');
      console.error('Image upload error:', err);
    }
  };

  return (
    <div className="p-2">
      <div className="flex items-center gap-2 mb-2">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageUpload}
          className="p-2 border border-gray-300 rounded-md text-sm"
          aria-label="Upload image"
        />
        {settings.editor.imageEditor.enabled && (
          <span className="text-xs text-gray-500">
            (Image editor enabled)
          </span>
        )}
      </div>
      
      {error && (
        <div className="text-red-500 mt-2 text-sm p-2 bg-red-50 border border-red-200 rounded">
          {error}
        </div>
      )}
      
      {showImageEditor && selectedFile && (
        <ImageEditor
          file={selectedFile}
          onSave={uploadImage}
          onCancel={() => setShowImageEditor(false)}
          tenantId={tenantId}
          settings={settings}
        />
      )}
    </div>
  );
}
