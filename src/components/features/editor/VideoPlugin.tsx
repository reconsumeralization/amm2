'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_COMMAND } from '@lexical/helpers/LexicalCommands';
import { $createVideoNode, VideoNode } from '../../../nodes/VideoNode';

export default function VideoPlugin() {
  const [editor] = useLexicalComposerContext();

  const onClick = (payload: any) => {
    editor.dispatchCommand(INSERT_COMMAND, payload);
  };

  return (
    <button
      onClick={() => onClick({ type: 'video', src: 'https://www.youtube.com/embed/dQw4w9WgXcQ' })}
      className="p-2 rounded-lg bg-blue-500 text-white"
    >
      Insert Video
    </button>
  );
}
