'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_ACCORDION_COMMAND } from 'lexical';
import { $createAccordionNode, AccordionNode } from '../../../nodes/AccordionNode';

export default function AccordionPlugin() {
  const [editor] = useLexicalComposerContext();

  const onClick = (payload: any) => {
    editor.dispatchCommand(INSERT_COMMAND, payload);
  };

  return (
    <button
      onClick={() => onClick({ type: 'accordion', title: 'Accordion Title', content: 'Accordion Content' })}
      className="p-2 rounded-lg bg-blue-500 text-white"
    >
      Insert Accordion
    </button>
  );
}
