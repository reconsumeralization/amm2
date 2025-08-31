// src/payload/utils/withLexicalEditor.ts
import type { CollectionConfig, Field } from 'payload'
import lexicalEditor from '@payloadcms/richtext-lexical'

const lexical = lexicalEditor

function attachEditorRecursively(field: Field): Field {
  // If this is a richText field and no editor is defined, attach lexical
  if ((field as any).type === 'richText' && !(field as any).editor) {
    return {
      ...field,
      editor: lexical,
    } as Field
  }

  // Recurse into nested field containers
  if ((field as any).fields && Array.isArray((field as any).fields)) {
    return {
      ...(field as any),
      fields: ((field as any).fields as Field[]).map(attachEditorRecursively),
    } as Field
  }

  if ((field as any).blocks && Array.isArray((field as any).blocks)) {
    return {
      ...(field as any),
      blocks: ((field as any).blocks as any[]).map((block) => ({
        ...block,
        fields: (block.fields as Field[]).map(attachEditorRecursively),
      })),
    } as Field
  }

  return field
}

/**
 * Ensures all richText fields (including nested) have an `editor` configured.
 */
export function withLexicalEditor(collection: CollectionConfig): CollectionConfig {
  if (!Array.isArray(collection.fields)) return collection

  return {
    ...collection,
    fields: (collection.fields as Field[]).map(attachEditorRecursively),
  }
}

