'use client';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createParagraphNode, $createTextNode, $insertNodes } from 'lexical';
import { useState, useEffect } from 'react';

export default function ServiceTemplatePlugin({ tenantId = 'tenant-id-placeholder' }: { tenantId?: string }) {
  const [editor] = useLexicalComposerContext();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/features/services?tenantId=${tenantId}`);
        if (res.ok) {
          const data = await res.json();
          setServices(data.docs || []);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [tenantId]);

  const insertTemplate = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    if (!service) return;
    
    editor.update(() => {
      const paragraph = $createParagraphNode();
      const serviceText = `${service.name} - $${(service.price / 100).toFixed(2)}\n${service.description || 'Professional service with expert care.'}`;
      paragraph.append($createTextNode(serviceText));
      $insertNodes([paragraph]);
    });
  };

  return (
    <div className="p-2">
      <select 
        onChange={(e) => insertTemplate(e.target.value)} 
        className="p-2 border border-gray-300 rounded-md text-sm"
        disabled={loading}
      >
        <option value="">
          {loading ? 'Loading services...' : 'Select Service Template'}
        </option>
        {services.map((service) => (
          <option key={service.id} value={service.id}>
            {service.name} - ${(service.price / 100).toFixed(2)}
          </option>
        ))}
      </select>
    </div>
  );
}
