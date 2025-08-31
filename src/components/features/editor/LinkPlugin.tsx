'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $getSelection, $isRangeSelection, SELECTION_CHANGE_COMMAND, COMMAND_PRIORITY_LOW, createCommand } from 'lexical';
import type { LexicalEditor, EditorState } from 'lexical';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export const TOGGLE_LINK_EDITOR_COMMAND = createCommand();

function LinkEditor({ editor }: { editor: LexicalEditor }) {
  const [linkUrl, setLinkUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const editorRef = useRef<HTMLDivElement | null>(null);

  const updateLinkEditor = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = selection.anchor.getNode();
      const parent = node.getParent();
      if ($isLinkNode(parent)) {
        setLinkUrl(parent.getURL());
        setIsEditing(true);
      } else if ($isLinkNode(node)) {
        setLinkUrl(node.getURL());
        setIsEditing(true);
      } else {
        setLinkUrl('');
        setIsEditing(false);
      }
    }
  }, []);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }: { editorState: EditorState }) => {
      editorState.read(() => {
        updateLinkEditor();
      });
    });
  }, [editor, updateLinkEditor]);

  const handleLinkEdit = () => {
    if (isEditing) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
    }
  };

  const handleLinkInsert = () => {
    if (linkUrl.trim() !== '') {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
    }
  };

  const handleRemoveLink = () => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(event.target as Node)) {
        editor.dispatchCommand(TOGGLE_LINK_EDITOR_COMMAND, false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editor]);

  return (
    <div className="link-editor" ref={editorRef}>
      <input
        value={linkUrl}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLinkUrl(e.target.value)}
        placeholder="Enter URL"
      />
      <button onClick={isEditing ? handleLinkEdit : handleLinkInsert}>
        {isEditing ? 'Save' : 'Insert'}
      </button>
      {isEditing && (
        <button onClick={handleRemoveLink}>Remove</button>
      )}
    </div>
  );
}

export function LinkPlugin() {
  const [editor] = useLexicalComposerContext();
  const [show, setShow] = useState(false);

  const toggleLinkEditor = useCallback((payload: boolean) => {
    setShow(payload);
  }, []);

  useEffect(() => {
    return editor.registerCommand(
      TOGGLE_LINK_EDITOR_COMMAND,
      (payload: boolean) => {
        toggleLinkEditor(payload);
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor, toggleLinkEditor]);

  useEffect(() => {
    return editor.registerCommand(
      TOGGLE_LINK_COMMAND,
      (payload: boolean | null) => {
        if (payload === null) {
          setShow(false);
        }
        return false;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  return show ? createPortal(<LinkEditor editor={editor} />, document.body) : null;
}
