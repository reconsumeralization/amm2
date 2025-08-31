import { DecoratorNode, EditorConfig, NodeKey, SerializedLexicalNode } from 'lexical';

export type SerializedAccordionNode = SerializedLexicalNode & {
  title: string;
  content: string;
  type: 'accordion';
};

export class AccordionNode extends DecoratorNode<JSX.Element> {
  __title: string;
  __content: string;

  static getType(): string {
    return 'accordion';
  }

  static clone(node: AccordionNode): AccordionNode {
    return new AccordionNode(node.__title, node.__content, node.__key);
  }

  constructor(title: string, content: string, key?: NodeKey) {
    super(key);
    this.__title = title;
    this.__content = content;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    div.style.display = 'block';
    return div;
  }

  updateDOM(): false {
    return false;
  }

  decorate(): JSX.Element {
    return (
      <details>
        <summary>{this.__title}</summary>
        <p>{this.__content}</p>
      </details>
    );
  }

  static importJSON(serializedNode: SerializedAccordionNode): AccordionNode {
    const node = $createAccordionNode(serializedNode.title, serializedNode.content);
    return node;
  }

  exportJSON(): SerializedAccordionNode {
    return {
      title: this.__title,
      content: this.__content,
      type: 'accordion',
      version: 1,
    };
  }
}

export function $createAccordionNode(title: string, content: string): AccordionNode {
  return new AccordionNode(title, content);
}

export function $isAccordionNode(node: any): node is AccordionNode {
  return node instanceof AccordionNode;
}
