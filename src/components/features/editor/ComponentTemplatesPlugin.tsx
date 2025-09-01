'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_TAB_COMMAND, COMMAND_PRIORITY_EDITOR } from 'lexical';
import { templates } from './templates';

export default function ComponentTemplatesPlugin() {
  const [editor] = useLexicalComposerContext();

  const onClick = (payload: any) => {
    editor.dispatchCommand(INSERT_TAB_COMMAND, payload);
  };

  return (
    <div>
      <h3>Component Templates</h3>
      {templates.map((template, index) => (
        <button
          key={index}
          onClick={() => onClick({ type: 'template', template })}
          className="p-2 rounded-lg bg-blue-500 text-white"
        >
          {template.name}
        </button>
      ))}
    </div>
  );
}
