'use client';

import React, { useRef, useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { 
  FORMAT_TEXT_COMMAND, 
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
} from 'lexical';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND } from '@lexical/list';
import { INSERT_IMAGE_COMMAND } from '@/plugins/ImagesPlugin';
import { TOGGLE_LINK_EDITOR_COMMAND } from './LinkPlugin';
// Icons replaced with placeholder divs to avoid lucide-react import issues

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ 
  onClick, 
  isActive = false, 
  disabled = false, 
  children, 
  title 
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`toolbar-button ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
    title={title}
    type="button"
  >
    {children}
  </button>
);

export function EnhancedToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatText = (format: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const formatElement = (format: 'left' | 'center' | 'right' | 'justify') => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, format);
  };

  const formatBlock = (format: 'h1' | 'h2' | 'quote') => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => {
          switch (format) {
            case 'h1':
              return $createHeadingNode('h1');
            case 'h2':
              return $createHeadingNode('h2');
            case 'quote':
              return $createQuoteNode();
            default:
              return $createParagraphNode();
          }
        });
      }
    });
  };

  const insertList = (type: 'ordered' | 'unordered') => {
    if (type === 'ordered') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    }
  };

  const insertLink = useCallback(() => {
    editor.dispatchCommand(TOGGLE_LINK_EDITOR_COMMAND, true);
  }, [editor]);

  const undo = () => {
    editor.dispatchCommand(UNDO_COMMAND, undefined);
  };

  const redo = () => {
    editor.dispatchCommand(REDO_COMMAND, undefined);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const src = e.target?.result as string;
          const alt = file.name.replace(/\.[^/.]+$/, '');
          
          editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
            src,
            alt,
            width: 300,
            height: 'auto',
            caption: ''
          });
        };
        reader.readAsDataURL(file);
      }
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="editor-toolbar">
      {/* History */}
      <div className="toolbar-group">
        <ToolbarButton onClick={undo} title="Undo (Ctrl+Z)">
          <span className="text-sm">↶</span>
        </ToolbarButton>
        <ToolbarButton onClick={redo} title="Redo (Ctrl+Y)">
          <span className="text-sm">↷</span>
        </ToolbarButton>
      </div>

      {/* Block Formatting */}
      <div className="toolbar-group">
        <ToolbarButton onClick={() => formatBlock('h1')} title="Heading 1">
          <span className="text-sm font-bold">H1</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => formatBlock('h2')} title="Heading 2">
          <span className="text-lg">H2</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => formatBlock('quote')} title="Quote">
                      <div className="w-4 h-4">💬</div>
        </ToolbarButton>
      </div>

      {/* Text Formatting */}
      <div className="toolbar-group">
        <ToolbarButton 
          onClick={() => formatText('bold')} 
          title="Bold (Ctrl+B)"
        >
                      <div className="w-4 h-4 font-bold">B</div>
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => formatText('italic')} 
          title="Italic (Ctrl+I)"
        >
                      <div className="w-4 h-4 italic">I</div>
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => formatText('underline')} 
          title="Underline (Ctrl+U)"
        >
                      <div className="w-4 h-4 underline">U</div>
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => formatText('strikethrough')} 
          title="Strikethrough"
        >
                      <div className="w-4 h-4 line-through">S</div>
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => formatText('code')} 
          title="Code"
        >
                      <div className="w-4 h-4 font-mono">{"</>"}</div>
        </ToolbarButton>
      </div>

      {/* Alignment */}
      <div className="toolbar-group">
        <ToolbarButton 
          onClick={() => formatElement('left')} 
          title="Align Left"
        >
                      <div className="w-4 h-4">⬅️</div>
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => formatElement('center')} 
          title="Align Center"
        >
                      <div className="w-4 h-4">↔️</div>
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => formatElement('right')} 
          title="Align Right"
        >
                      <div className="w-4 h-4">➡️</div>
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => formatElement('justify')} 
          title="Justify"
        >
                      <div className="w-4 h-4">↔️</div>
        </ToolbarButton>
      </div>

      {/* Lists */}
      <div className="toolbar-group">
        <ToolbarButton 
          onClick={() => insertList('unordered')} 
          title="Bullet List"
        >
                      <div className="w-4 h-4">•</div>
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => insertList('ordered')} 
          title="Numbered List"
        >
                      <div className="w-4 h-4">1.</div>
        </ToolbarButton>
      </div>

      {/* Media and Links */}
      <div className="toolbar-group">
        <ToolbarButton 
          onClick={triggerImageUpload} 
          title="Insert Image"
        >
          <span className="text-lg">🖼️</span>
        </ToolbarButton>
        <ToolbarButton 
          onClick={triggerImageUpload} 
          title="Upload Image"
        >
          <span className="text-lg">⬆️</span>
        </ToolbarButton>
        <ToolbarButton 
          onClick={insertLink} 
          title="Insert Link"
        >
                      <div className="w-4 h-4">🔗</div>
        </ToolbarButton>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />
    </div>
  );
}
