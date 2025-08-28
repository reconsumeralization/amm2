import React from 'react'
import { $createImageNode } from '@/nodes/ImageNode'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getSelection, $isRangeSelection, COMMAND_PRIORITY_EDITOR } from 'lexical'
import { createCommand, LexicalCommand } from 'lexical'

// Define the INSERT_IMAGE_COMMAND
export const INSERT_IMAGE_COMMAND: LexicalCommand<{
  src: string;
  alt: string;
  width?: number;
  height?: number | 'auto';
  caption?: string;
}> = createCommand('INSERT_IMAGE_COMMAND')

export function ImagesPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext()

  React.useEffect(() => {
    if (!editor.hasNodes([$createImageNode])) {
      throw new Error('ImagesPlugin: ImageNode not registered on editor')
    }

    return editor.registerCommand(
      INSERT_IMAGE_COMMAND,
      (payload) => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) {
          return false
        }

        const focusNode = selection.focus.getNode()
        if (focusNode !== null) {
          const imageNode = $createImageNode(payload)
          selection.insertNodes([imageNode])
        }

        return true
      },
      COMMAND_PRIORITY_EDITOR
    )
  }, [editor])

  return null
}

export default ImagesPlugin
