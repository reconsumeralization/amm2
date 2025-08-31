import { DecoratorNode, EditorConfig, NodeKey, SerializedLexicalNode } from 'lexical';

export type SerializedTabsNode = SerializedLexicalNode & {
  tabs: { title: string; content: string }[];
  type: 'tabs';
};

export class TabsNode extends DecoratorNode<JSX.Element> {
  __tabs: { title: string; content: string }[];

  static getType(): string {
    return 'tabs';
  }

  static clone(node: TabsNode): TabsNode {
    return new TabsNode(node.__tabs, node.__key);
  }

  constructor(tabs: { title: string; content: string }[], key?: NodeKey) {
    super(key);
    this.__tabs = tabs;
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
      <div>
        {this.__tabs.map((tab, index) => (
          <details key={index}>
            <summary>{tab.title}</summary>
            <p>{tab.content}</p>
          </details>
        ))}
      </div>
    );
  }

  static importJSON(serializedNode: SerializedTabsNode): TabsNode {
    const node = $createTabsNode(serializedNode.tabs);
    return node;
  }

  exportJSON(): SerializedTabsNode {
    return {
      tabs: this.__tabs,
      type: 'tabs',
      version: 1,
    };
  }
}

export function $createTabsNode(tabs: { title: string; content: string }[]): TabsNode {
  return new TabsNode(tabs);
}

export function $isTabsNode(node: any): node is TabsNode {
  return node instanceof TabsNode;
}
