'use client';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useState, useEffect } from 'react';
import { FORMAT_TEXT_COMMAND, $insertNodes, $getSelection, $isRangeSelection } from 'lexical';

export default function ToolbarPlugin({ tenantId = 'tenant-id-placeholder' }) {
  const [editor] = useLexicalComposerContext();
  const [settings, setSettings] = useState<any>({ editor: { enabledPlugins: [] } });
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`/api/settings?tenantId=${tenantId}`);
        const data = await res.json();
        if (data.editor?.enabledPlugins) {
          setSettings(data);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    fetchSettings();
  }, [tenantId]);

  const formatText = (type: 'bold' | 'italic' | 'underline') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, type);
  };

  const insertHeading = (level: 'h1' | 'h2') => {
    editor.update(() => {
      const text = level === 'h1' ? '# ' : '## ';
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.insertText(text);
      }
    });
  };

  const getSelectedText = () => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      return selection.getTextContent();
    }
    return '';
  };

  const callAI = async (action: 'rewrite' | 'summarize') => {
    setLoadingAI(true);
    try {
      const selectedText = getSelectedText();
      if (!selectedText) {
        alert('Please select text to ' + action);
        return;
      }
      const prompt = action === 'rewrite' ? `Rewrite this text: ${selectedText}` : `Summarize this text: ${selectedText}`;
      const res = await fetch('/api/integrations/openai/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, tenantId }),
      });
      const { text } = await res.json();
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.insertText(text);
        }
      });
    } catch (error) {
      console.error('AI call failed:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border-b border-gray-200">
      {/* Text Formatting */}
      <div className="flex gap-1">
        <button 
          onClick={() => formatText('bold')} 
          className="p-2 bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-700 border border-gray-300 rounded-md transition-colors" 
          aria-label="Bold text"
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button 
          onClick={() => formatText('italic')} 
          className="p-2 bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-700 border border-gray-300 rounded-md transition-colors" 
          aria-label="Italic text"
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button 
          onClick={() => formatText('underline')} 
          className="p-2 bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-700 border border-gray-300 rounded-md transition-colors" 
          aria-label="Underline text"
          title="Underline (Ctrl+U)"
        >
          <u>U</u>
        </button>
      </div>

      {/* Headings */}
      <div className="flex gap-1">
        <button 
          onClick={() => insertHeading('h1')} 
          className="p-2 bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-700 border border-gray-300 rounded-md transition-colors" 
          aria-label="Heading 1"
          title="Heading 1"
        >
          H1
        </button>
        <button 
          onClick={() => insertHeading('h2')} 
          className="p-2 bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-700 border border-gray-300 rounded-md transition-colors" 
          aria-label="Heading 2"
          title="Heading 2"
        >
          H2
        </button>
      </div>

      {/* Quote */}
      <button 
        onClick={() => editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selection.insertText('> ');
          }
        })} 
        className="p-2 bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-700 border border-gray-300 rounded-md transition-colors" 
        aria-label="Insert quote"
        title="Insert quote"
      >
        Quote
      </button>

      {/* AI Content */}
      {settings.editor?.enabledPlugins?.includes('aiContent') && (
        <div className="flex gap-1">
          <button 
            onClick={() => callAI('rewrite')} 
            className="p-2 bg-white hover:bg-purple-50 text-gray-700 hover:text-purple-700 border border-gray-300 rounded-md transition-colors disabled:opacity-50" 
            disabled={loadingAI} 
            aria-label="Rewrite selected text using AI"
            title="Rewrite selected text"
          >
            {loadingAI ? 'Rewriting...' : 'Rewrite'}
          </button>
          <button 
            onClick={() => callAI('summarize')} 
            className="p-2 bg-white hover:bg-purple-50 text-gray-700 hover:text-purple-700 border border-gray-300 rounded-md transition-colors disabled:opacity-50" 
            disabled={loadingAI} 
            aria-label="Summarize selected text using AI"
            title="Summarize selected text"
          >
            {loadingAI ? 'Summarizing...' : 'Summarize'}
          </button>
        </div>
      )}
    </div>
  );
}