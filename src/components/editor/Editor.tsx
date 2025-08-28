// Start of Selection
'use client';
import { useState, useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import ImagePlugin from './ImagePlugin';
import ServiceTemplatePlugin from './ServiceTemplatePlugin';
import ProductEmbedPlugin from './ProductEmbedPlugin';
import AIContentPlugin from './AIContentPlugin';
import HairSimulatorPlugin from './HairSimulatorPlugin';
import TestimonialPlugin from './TestimonialPlugin';
import PageBuilder from './PageBuilder';
import ToolbarPlugin from './ToolbarPlugin';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table';
import { ImageNode } from '../../nodes/ImageNode';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

export default function Editor({ initialContent, onSaveAction, tenantId = 'tenant-id-placeholder' }: { initialContent?: string; onSaveAction: (content: string) => void; tenantId?: string }) {
  const [error, setError] = useState('');
  const [settings, setSettings] = useState<any>({ 
    editor: { 
      enabledPlugins: ['image', 'serviceTemplate', 'productEmbed', 'aiContent', 'hairSimulator'], 
      theme: {}, 
      imageOptimization: {
        maxImageSize: 5242880,
        responsiveSizes: [{ width: 320, label: 'mobile' }, { width: 768, label: 'tablet' }, { width: 1200, label: 'desktop' }],
        formats: ['jpeg', 'webp'],
        quality: 80,
      }
    } 
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`/api/settings?tenantId=${tenantId}`);
        if (!res.ok) {
          console.warn('Failed to fetch settings, using defaults');
          return;
        }
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.warn('Settings fetch failed, using defaults:', err);
      }
    };
    fetchSettings();
  }, [tenantId]);

  const initialConfig = {
    namespace: 'ModernMenEditor',
    nodes: [ListNode, ListItemNode, LinkNode, ImageNode, TableNode, TableCellNode, TableRowNode],
    onError: (err: Error) => {
      console.error('Lexical Editor Error:', err);
      setError(err.message);
    },
    theme: {
      heading: { 
        h1: settings.editor?.theme?.heading || 'text-2xl font-bold', 
        h2: 'text-xl font-semibold' 
      },
      list: { ul: 'list-disc pl-5', ol: 'list-decimal pl-5' },
      link: settings.editor?.theme?.link || 'text-blue-500 underline hover:text-blue-700',
      image: 'max-w-full h-auto responsive-image rounded-lg shadow-sm',
      table: 'border-collapse border border-gray-300 w-full',
      tableCell: 'border border-gray-300 p-2',
      root: `font-family: ${settings.editor?.theme?.fontFamily || 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'}`,
    },
    editorState: initialContent
      ? () => {
          try {
            const root = $getRoot();
            root.clear();
            const paragraph = $createParagraphNode();
            paragraph.append($createTextNode(initialContent));
            root.append(paragraph);
          } catch (err) {
            console.error('Failed to initialize editor state:', err);
            setError('Failed to load initial content');
          }
        }
      : null,
  };

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm bg-white">
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin tenantId={tenantId} />
        <RichTextPlugin
          contentEditable={
            <ContentEditable 
              className="min-h-[300px] p-4 border-0 focus:outline-none focus:ring-0 resize-none" 
              aria-label="Rich text editor"
            />
          }
          placeholder={
            <div className="text-gray-400 p-4 pointer-events-none">
              Start typing your content here...
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <ListPlugin />
        <LinkPlugin />
        <TablePlugin />
        
        {/* Conditional Plugin Loading */}
        {settings.editor?.enabledPlugins?.includes('image') && (
          <ImagePlugin 
            maxSize={settings.editor?.imageOptimization?.maxImageSize || 5242880} 
            tenantId={tenantId} 
          />
        )}
        {settings.editor?.enabledPlugins?.includes('serviceTemplate') && (
          <ServiceTemplatePlugin tenantId={tenantId} />
        )}
        {settings.editor?.enabledPlugins?.includes('productEmbed') && (
          <ProductEmbedPlugin tenantId={tenantId} />
        )}
        {settings.editor?.enabledPlugins?.includes('aiContent') && (
          <AIContentPlugin onSave={onSaveAction} tenantId={tenantId} />
        )}
        {settings.editor?.enabledPlugins?.includes('hairSimulator') && (
          <HairSimulatorPlugin tenantId={tenantId} />
        )}
        {settings.editor?.enabledPlugins?.includes('testimonials') && (
          <TestimonialPlugin tenantId={tenantId} />
        )}
        {settings.editor?.enabledPlugins?.includes('pageBuilder') && (
          <PageBuilder tenantId={tenantId} settings={settings} onSave={onSaveAction} />
        )}
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-b-lg">
            <div className="text-red-600 text-sm">{error}</div>
          </div>
        )}
      </LexicalComposer>
    </div>
  );
}
