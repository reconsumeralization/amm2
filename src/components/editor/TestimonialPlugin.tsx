'use client';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createParagraphNode, $createTextNode, $insertNodes } from 'lexical';
import { useState, useEffect } from 'react';

export default function TestimonialPlugin({ tenantId = 'tenant-id-placeholder' }: { tenantId?: string }) {
  const [editor] = useLexicalComposerContext();
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/features/testimonials?tenantId=${tenantId}`);
        if (res.ok) {
          const data = await res.json();
          setTestimonials(data.docs || []);
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, [tenantId]);

  const insertTestimonial = (testimonialId: string) => {
    const testimonial = testimonials.find((t) => t.id === testimonialId);
    if (!testimonial) return;
    
    editor.update(() => {
      const paragraph = $createParagraphNode();
      const testimonialText = `"${testimonial.content}"\n- ${testimonial.customerName || 'Happy Customer'}`;
      paragraph.append($createTextNode(testimonialText));
      $insertNodes([paragraph]);
    });
  };

  return (
    <div className="p-2">
      <select 
        onChange={(e) => insertTestimonial(e.target.value)} 
        className="p-2 border border-gray-300 rounded-md text-sm"
        disabled={loading}
      >
        <option value="">
          {loading ? 'Loading testimonials...' : 'Insert Testimonial'}
        </option>
        {testimonials.map((testimonial) => (
          <option key={testimonial.id} value={testimonial.id}>
            {testimonial.customerName || 'Anonymous'} - {testimonial.content.substring(0, 50)}...
          </option>
        ))}
      </select>
    </div>
  );
}
