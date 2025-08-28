'use client';

import { useMemo } from 'react'

type LexicalTextNode = { type: 'text'; text: string }
type LexicalParagraphNode = { type: 'paragraph'; children?: Array<LexicalTextNode | any> }
type LexicalRoot = { root?: { children?: Array<LexicalParagraphNode | any> } }

function renderLexicalToHtml(json: LexicalRoot): string | null {
  try {
    const root = (json as any)?.root
    if (!root || !Array.isArray(root.children)) return null
    const html = root.children
      .map((node: any) => {
        if (node?.type === 'paragraph') {
          const text = (node.children || [])
            .map((c: any) => (c?.type === 'text' ? c.text : ''))
            .join('')
          return `<p>${text ?? ''}</p>`
        }
        return ''
      })
      .join('')
    return html
  } catch {
    return null
  }
}

export default function ContentRenderer({ content }: { content: any }) {
  const html = useMemo(() => {
    if (!content) return null
    if (typeof content === 'string') return content
    // Try simple Lexical JSON rendering
    const lexicalHtml = renderLexicalToHtml(content as any)
    if (lexicalHtml) return lexicalHtml
    return null
  }, [content])

  if (typeof html === 'string') {
    return <div dangerouslySetInnerHTML={{ __html: html }} />
  }
  if (typeof content === 'object') {
    return <pre>{JSON.stringify(content, null, 2)}</pre>
  }
  return null
}
