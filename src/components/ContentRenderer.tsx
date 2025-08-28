'use client';

export default function ContentRenderer({ content }: { content: any }) {
  if (typeof content === 'string') {
    return <div dangerouslySetInnerHTML={{ __html: content }} />
  }
  return <pre>{JSON.stringify(content, null, 2)}</pre>
}
