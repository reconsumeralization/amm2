'use client';

export default function ContentRenderer({ content }: { content: any }) {
  // For now, just return the content as is or convert to string
  const html = typeof content === 'string' ? content : JSON.stringify(content);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
