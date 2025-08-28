'use client';
import { lexicalHtmlConverter } from '@payloadcms/richtext-lexical/html';

export default function ContentRenderer({ content }: { content: any }) {
  const html = lexicalHtmlConverter(content);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
