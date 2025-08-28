'use client';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createImageNode } from '../../nodes/ImageNode';
import { $insertNodes } from 'lexical';
import { useState, useEffect } from 'react';

export default function HairSimulatorPlugin({ tenantId = 'tenant-id-placeholder' }) {
  const [editor] = useLexicalComposerContext();
  const [settings, setSettings] = useState<any>({ barbershop: { simulator: { styles: [] } }, editor: { imageOptimization: {} } });

  useEffect(() => {
    const fetchSettings = async () => {
      const res = await fetch(`/api/settings?tenantId=${tenantId}`);
      const data = await res.json();
      setSettings(data);
    };
    fetchSettings();
  }, [tenantId]);

  const insertSimulatorPreview = async (style: string) => {
    try {
      // Placeholder image for simulator
      const formData = new FormData();
      formData.append('file', new File([new Blob()], 'placeholder.jpg', { type: 'image/jpeg' }));
      const uploadRes = await fetch('/api/media', {
        method: 'POST',
        body: formData,
        headers: { 'X-Tenant-ID': tenantId },
      });
      const media = await uploadRes.json();

      // Generate responsive simulator images
      const responsiveImages = await Promise.all(
        settings.editor.imageOptimization.responsiveSizes.map(async (size: any) => {
          const res = await fetch('/api/hair-simulator', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageId: media.id,
              style,
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

      const srcset = responsiveImages
        .flatMap((img: any) =>
          img.urls.map((url: any) => `${url.url} ${img.width}w`)
        )
        .join(', ');
      const sizes = responsiveImages
        .map((img: any) => `(max-width: ${img.width}px) ${img.width}px`)
        .join(', ') + ', 1200px';

      editor.update(() => {
        const imageNode = $createImageNode(
          responsiveImages[0].urls.find((u: any) => u.format === 'jpeg')?.url || media.url,
          `Hair Preview - ${style}`,
          300,
          'auto',
          `Hair style preview: ${style}`
        );
        $insertNodes([imageNode]);
      });
    } catch (error) {
      console.error('Hair simulator preview failed:', error);
    }
  };

  return (
    <div className="p-2">
      <select
        onChange={(e) => insertSimulatorPreview(e.target.value)}
        className="p-1 border rounded"
      >
        <option value="">Select Hair Style</option>
        {settings.barbershop?.simulator?.styles?.map((s: any) => (
          <option key={s.style} value={s.style}>{s.style}</option>
        ))}
      </select>
    </div>
  );
}