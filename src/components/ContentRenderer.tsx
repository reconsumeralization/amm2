'use client';
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html';

export default function ContentRenderer({ content }: { content: any }) {
  let html = '';
  try {
    html = convertLexicalToHTML({ data: content });
  } catch (error) {
    console.error('Error converting content to HTML:', error);
    html = '<p>Error rendering content</p>';
  }
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
