'use client';

import React, { useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin as LexicalLinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { EnhancedToolbarPlugin } from './EnhancedToolbarPlugin';
import { LinkPlugin } from './LinkPlugin';
import { $getRoot, $getSelection, EditorState } from 'lexical';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { ImageNode } from '@/nodes/ImageNode';
import ImagesPlugin from '@/plugins/ImagesPlugin';

// Theme for styling the editor
const theme = {
  paragraph: 'editor-paragraph',
  text: {
    bold: 'editor-text-bold',
    italic: 'editor-text-italic',
    underline: 'editor-text-underline',
    strikethrough: 'editor-text-strikethrough',
    code: 'editor-text-code',
  },
  heading: {
    h1: 'editor-heading-h1',
    h2: 'editor-heading-h2',
    h3: 'editor-heading-h3',
  },
  quote: 'editor-quote',
  link: 'editor-link',
  list: {
    ul: 'editor-list-ul',
    ol: 'editor-list-ol',
    listitem: 'editor-list-item',
  },
  image: 'image-node',
};

// Handle editor errors
function onError(error: Error) {
  console.error('Lexical editor error:', error);
}

interface LexicalEditorProps {
  initialContent?: string;
  onChange?: (editorState: EditorState) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

export default function LexicalEditor({
  initialContent = '',
  onChange,
  placeholder = 'Enter some text...',
  className = '',
  readOnly = false,
}: LexicalEditorProps) {
  const initialConfig = {
    namespace: 'ModernMenEditor',
    theme,
    onError,
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, ImageNode],
    editorState: initialContent,
    editable: !readOnly,
  };

  const handleChange = (editorState: EditorState) => {
    if (onChange) {
      onChange(editorState);
    }
  };

  return (
    <div className={`lexical-editor ${className}`}>
      <LexicalComposer initialConfig={initialConfig}>
        {!readOnly && <EnhancedToolbarPlugin />}
        <RichTextPlugin
          contentEditable={
            <ContentEditable 
              className="editor-input" 
              readOnly={readOnly}
            />
          }
          placeholder={
            <div className="editor-placeholder">
              {placeholder}
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <ListPlugin />
        <LexicalLinkPlugin />
        <LinkPlugin />
        <MarkdownShortcutPlugin />
        <OnChangePlugin onChange={handleChange} />
        <ImagesPlugin />
      </LexicalComposer>
    </div>
  );
}
