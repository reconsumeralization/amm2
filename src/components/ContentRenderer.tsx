'use client';
import { TextHTMLConverter } from '@payloadcms/richtext-lexical/html';

export default function ContentRenderer({ content }: { content: any }) {
  const html = TextHTMLConverter(content);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
