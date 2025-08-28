'use client';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createParagraphNode, $createTextNode, $insertNodes } from 'lexical';
import { useState, useEffect } from 'react';

export default function AIContentPlugin({ onSave, tenantId = 'tenant-id-placeholder' }: { onSave: (content: string) => void; tenantId?: string }) {
  const [editor] = useLexicalComposerContext();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>({ ai: { contentTypes: [] } }); // New state for settings

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`/api/settings?tenantId=${tenantId}`);
        const data = await res.json();
        if (data.ai?.contentTypes) {
          setSettings(data);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    fetchSettings();
  }, [tenantId]);

  const generateContent = async (contentType: string) => {
    setLoading(true);
    try {
      const fullPrompt = `Generate a ${contentType} for: ${prompt}`;
      const res = await fetch('/api/integrations/openai/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt, tenantId }),
      });
      const { text } = await res.json();
      editor.update(() => {
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode(text));
        $insertNodes([paragraph]);
      });
      onSave(text);
    } catch (error) {
      console.error('AI content generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2 flex gap-2">
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter AI prompt (e.g., 'luxury haircut')"
        className="p-1 border rounded flex-1"
        disabled={loading}
      />
      {settings.ai.contentTypes.length > 0 ? (
        <select onChange={(e) => generateContent(e.target.value)} className="p-1 border rounded" disabled={loading}>
          <option value="">Generate as...</option>
          {settings.ai.contentTypes.map((type: string) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      ) : (
        <button onClick={() => generateContent('barbershop service description')} className="p-1 bg-green-500 text-white rounded" disabled={loading}>
          {loading ? 'Generating...' : 'Generate AI Content'}
        </button>
      )}
      {loading && <div className="spinner"></div>} {/* Simple spinner placeholder */}
    </div>
  );
}