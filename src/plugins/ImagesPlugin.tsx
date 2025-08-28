'use client';
import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodes, COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical';
import { $createImageNode, ImageNode } from '@/nodes/ImageNode';

export const INSERT_IMAGE_COMMAND = createCommand('insertImage');

export default function ImagesPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      throw new Error('ImagesPlugin: ImageNode not registered');
    }

    return editor.registerCommand(
      INSERT_IMAGE_COMMAND,
      (payload: { src: string; alt: string }) => {
        const imageNode = $createImageNode(payload.src, payload.alt);
        $insertNodes([imageNode]);
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  return null;
}