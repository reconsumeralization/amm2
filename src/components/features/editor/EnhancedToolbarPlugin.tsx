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
import {
  Image,
  Upload,
  RefreshCw as Undo,
  RefreshCw as Redo,
  FileText as Heading1,
  FileText as Heading2,
  Check as Bold,
  Type as Italic,
  Minus as Underline,
  MessageSquare as Quote,
  X as Strikethrough,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  List as ListOrdered,
  Link,
  Sparkles,
  Loader2
} from '@/lib/icons';

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
          <Undo size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={redo} title="Redo (Ctrl+Y)">
          <Redo size={16} />
        </ToolbarButton>
      </div>

      {/* Block Formatting */}
      <div className="toolbar-group">
        <ToolbarButton onClick={() => formatBlock('h1')} title="Heading 1">
          <Heading1 size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => formatBlock('h2')} title="Heading 2">
          <Heading2 size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => formatBlock('quote')} title="Quote">
          <Quote size={16} />
        </ToolbarButton>
      </div>

      {/* Text Formatting */}
      <div className="toolbar-group">
        <ToolbarButton 
          onClick={() => formatText('bold')} 
          title="Bold (Ctrl+B)"
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => formatText('italic')} 
          title="Italic (Ctrl+I)"
        >
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => formatText('underline')} 
          title="Underline (Ctrl+U)"
        >
          <Underline size={16} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => formatText('strikethrough')} 
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => formatText('code')} 
          title="Code"
        >
          <Code size={16} />
        </ToolbarButton>
      </div>

      {/* Alignment */}
      <div className="toolbar-group">
        <ToolbarButton 
          onClick={() => formatElement('left')} 
          title="Align Left"
        >
          <AlignLeft size={16} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => formatElement('center')} 
          title="Align Center"
        >
          <AlignCenter size={16} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => formatElement('right')} 
          title="Align Right"
        >
          <AlignRight size={16} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => formatElement('justify')} 
          title="Justify"
        >
          <AlignJustify size={16} />
        </ToolbarButton>
      </div>

      {/* Lists */}
      <div className="toolbar-group">
        <ToolbarButton 
          onClick={() => insertList('unordered')} 
          title="Bullet List"
        >
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => insertList('ordered')} 
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </ToolbarButton>
      </div>

      {/* Media and Links */}
      <div className="toolbar-group">
        <ToolbarButton 
          onClick={triggerImageUpload} 
          title="Insert Image"
        >
          <Image size={16} alt="" />
        </ToolbarButton>
        <ToolbarButton 
          onClick={triggerImageUpload} 
          title="Upload Image"
        >
          <Upload size={16} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={insertLink} 
          title="Insert Link"
        >
          <Link size={16} />
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
