import { DecoratorNode, EditorConfig, NodeKey, SerializedLexicalNode } from 'lexical';

export type SerializedVideoNode = SerializedLexicalNode & {
  src: string;
  type: 'video';
};

export class VideoNode extends DecoratorNode<JSX.Element> {
  __src: string;

  static getType(): string {
    return 'video';
  }

  static clone(node: VideoNode): VideoNode {
    return new VideoNode(node.__src, node.__key);
  }

  constructor(src: string, key?: NodeKey) {
    super(key);
    this.__src = src;
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
    return <iframe width="560" height="315" src={this.__src} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>;
  }

  static importJSON(serializedNode: SerializedVideoNode): VideoNode {
    const node = $createVideoNode(serializedNode.src);
    return node;
  }

  exportJSON(): SerializedVideoNode {
    return {
      src: this.__src,
      type: 'video',
      version: 1,
    };
  }
}

export function $createVideoNode(src: string): VideoNode {
  return new VideoNode(src);
}

export function $isVideoNode(node: any): node is VideoNode {
  return node instanceof VideoNode;
}
