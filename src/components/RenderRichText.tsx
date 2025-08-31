import React from 'react';

// Simple rich text renderer for Payload CMS content
interface RichTextNode {
  type: string;
  children?: RichTextNode[];
  text?: string;
  [key: string]: any;
}

interface RenderRichTextProps {
  content: RichTextNode[] | null | undefined;
  className?: string;
}

const RenderRichText: React.FC<RenderRichTextProps> = ({ content, className = '' }) => {
  if (!content || !Array.isArray(content)) {
    return null;
  }

  const renderNode = (node: RichTextNode, index: number): React.ReactNode => {
    switch (node.type) {
      case 'paragraph':
        return (
          <p key={index} className="mb-4 leading-relaxed">
            {node.children?.map((child, childIndex) => renderNode(child, childIndex))}
          </p>
        );

      case 'heading':
        const level = node.tag || 'h2';
        const headingClass = `font-bold mb-4 mt-6 ${getHeadingClass(level)}`;

        switch (level) {
          case 'h1':
            return (
              <h1 key={index} className={headingClass}>
                {node.children?.map((child, childIndex) => renderNode(child, childIndex))}
              </h1>
            );
          case 'h3':
            return (
              <h3 key={index} className={headingClass}>
                {node.children?.map((child, childIndex) => renderNode(child, childIndex))}
              </h3>
            );
          case 'h4':
            return (
              <h4 key={index} className={headingClass}>
                {node.children?.map((child, childIndex) => renderNode(child, childIndex))}
              </h4>
            );
          case 'h5':
            return (
              <h5 key={index} className={headingClass}>
                {node.children?.map((child, childIndex) => renderNode(child, childIndex))}
              </h5>
            );
          case 'h6':
            return (
              <h6 key={index} className={headingClass}>
                {node.children?.map((child, childIndex) => renderNode(child, childIndex))}
              </h6>
            );
          case 'h2':
          default:
            return (
              <h2 key={index} className={headingClass}>
                {node.children?.map((child, childIndex) => renderNode(child, childIndex))}
              </h2>
            );
        }

      case 'text':
        let className = '';
        if (node.bold) className += ' font-bold';
        if (node.italic) className += ' italic';
        if (node.underline) className += ' underline';
        if (node.strikethrough) className += ' line-through';

        return (
          <span key={index} className={className}>
            {node.text}
          </span>
        );

      case 'link':
        return (
          <a
            key={index}
            href={node.url}
            target={node.newTab ? '_blank' : undefined}
            rel={node.newTab ? 'noopener noreferrer' : undefined}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {node.children?.map((child, childIndex) => renderNode(child, childIndex))}
          </a>
        );

      case 'list':
        const ListTag = node.tag === 'ol' ? 'ol' : 'ul';
        return (
          <ListTag key={index} className="mb-4 ml-6">
            {node.children?.map((child, childIndex) => renderNode(child, childIndex))}
          </ListTag>
        );

      case 'listItem':
        return (
          <li key={index} className="mb-2">
            {node.children?.map((child, childIndex) => renderNode(child, childIndex))}
          </li>
        );

      case 'blockquote':
        return (
          <blockquote key={index} className="border-l-4 border-gray-300 pl-4 italic my-4">
            {node.children?.map((child, childIndex) => renderNode(child, childIndex))}
          </blockquote>
        );

      default:
        return node.children?.map((child, childIndex) => renderNode(child, childIndex)) || null;
    }
  };

  const getHeadingClass = (level: string) => {
    switch (level) {
      case 'h1': return 'text-3xl';
      case 'h2': return 'text-2xl';
      case 'h3': return 'text-xl';
      case 'h4': return 'text-lg';
      case 'h5': return 'text-base';
      case 'h6': return 'text-sm';
      default: return 'text-2xl';
    }
  };

  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      {content.map((node, index) => renderNode(node, index))}
    </div>
  );
};

export default RenderRichText;
