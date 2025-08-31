'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_COMMAND } from '@lexical/helpers/LexicalCommands';
import { $createTabsNode, TabsNode } from '../../../nodes/TabsNode';

export default function TabsPlugin() {
  const [editor] = useLexicalComposerContext();

  const onClick = (payload: any) => {
    editor.dispatchCommand(INSERT_COMMAND, payload);
  };

  return (
    <button
      onClick={() => onClick({ type: 'tabs', tabs: [{title: 'Tab 1', content: 'Tab 1 content'}, {title: 'Tab 2', content: 'Tab 2 content'}] })}
      className="p-2 rounded-lg bg-blue-500 text-white"
    >
      Insert Tabs
    </button>
  );
}
