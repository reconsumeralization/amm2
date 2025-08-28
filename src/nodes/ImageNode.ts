import { DecoratorNode } from 'lexical';
import type { NodeKey, LexicalNode, EditorConfig } from 'lexical';
import React from 'react';

export class ImageNode extends DecoratorNode<React.ReactNode> {
  __src: string;
  __alt: string;
  __width: number;
  __height: number | 'auto';
  __caption?: string;

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src, 
      node.__alt, 
      node.__width, 
      node.__height, 
      node.__caption,
      node.__key
    );
  }

  constructor(
    src: string, 
    alt: string, 
    width: number = 300, 
    height: number | 'auto' = 'auto',
    caption?: string,
    key?: NodeKey
  ) {
    super(key);
    this.__src = src;
    this.__alt = alt;
    this.__width = width;
    this.__height = height;
    this.__caption = caption;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    div.className = 'image-node-container';
    return div;
  }

  updateDOM(prevNode: ImageNode, dom: HTMLElement): boolean {
    return false;
  }

  decorate(): React.ReactNode {
    // Use a simple div with image for now to avoid circular dependencies
    return React.createElement('div', {
      className: 'image-component',
      children: React.createElement('img', {
        src: this.__src,
        alt: this.__alt,
        style: {
          width: `${this.__width}px`,
          height: this.__height === 'auto' ? 'auto' : `${this.__height}px`,
          maxWidth: '100%',
        },
        className: 'image-node',
      }),
    });
  }

  // Getters
  getSrc(): string {
    return this.__src;
  }

  getAlt(): string {
    return this.__alt;
  }

  getWidth(): number {
    return this.__width;
  }

  getHeight(): number | 'auto' {
    return this.__height;
  }

  getCaption(): string | undefined {
    return this.__caption;
  }

  // Setters
  setSrc(src: string): void {
    const writable = this.getWritable();
    writable.__src = src;
  }

  setAlt(alt: string): void {
    const writable = this.getWritable();
    writable.__alt = alt;
  }

  setWidth(width: number): void {
    const writable = this.getWritable();
    writable.__width = width;
  }

  setHeight(height: number | 'auto'): void {
    const writable = this.getWritable();
    writable.__height = height;
  }

  setCaption(caption: string): void {
    const writable = this.getWritable();
    writable.__caption = caption;
  }
}

// Export the command constant
export const INSERT_IMAGE_COMMAND = 'INSERT_IMAGE_COMMAND';

// Export the create function
export function $createImageNode(
  src: string,
  alt: string,
  width: number = 300,
  height: number | 'auto' = 'auto',
  caption?: string
): ImageNode {
  return new ImageNode(src, alt, width, height, caption);
}
