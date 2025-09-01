/// src/payload/utils/withLexicalEditor.ts
import type { CollectionConfig, Field, RichTextField, GroupField, ArrayField, BlocksField, Block, TabsField, CollapsibleField, RowField, GlobalConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

const lexical = lexicalEditor({
  features: ({ defaultFeatures }: { defaultFeatures: any[] }) => [
    ...defaultFeatures,
    // Add any additional features here if needed
  ],
})

/**
 * Type guards for field types
 */
function isRichTextField(field: Field): field is RichTextField {
  return field.type === 'richText'
}

function isGroupField(field: Field): field is GroupField {
  return field.type === 'group'
}

function isArrayField(field: Field): field is ArrayField {
  return field.type === 'array'
}

function isBlocksField(field: Field): field is BlocksField {
  return field.type === 'blocks'
}

function isTabsField(field: Field): field is TabsField {
  return field.type === 'tabs'
}

function isCollapsibleField(field: Field): field is CollapsibleField {
  return field.type === 'collapsible'
}

function isRowField(field: Field): field is RowField {
  return field.type === 'row'
}

function hasFields(field: Field): field is Field & { fields: Field[] } {
  return 'fields' in field && Array.isArray((field as any).fields)
}

function hasBlocks(field: Field): field is Field & { blocks: Block[] } {
  return 'blocks' in field && Array.isArray((field as any).blocks)
}

/**
 * Configuration options for the lexical editor enhancement
 */
export interface LexicalEditorOptions {
  /** Whether to override existing editors (default: false) */
  overrideExisting?: boolean
  /** Custom editor configuration to use instead of default */
  customEditor?: ReturnType<typeof lexicalEditor>
  /** Fields to exclude from enhancement (by name) */
  excludeFields?: string[]
  /** Only enhance fields with these names */
  includeFields?: string[]
  /** Maximum depth for recursive field processing (default: 10) */
  maxDepth?: number
}

/**
 * Recursively processes a block to attach lexical editor to richText fields
 */
function processBlock(block: Block, options: LexicalEditorOptions = {}, depth = 0): Block {
  if (!block.fields || !Array.isArray(block.fields) || depth > (options.maxDepth || 10)) {
    return block
  }

  return {
    ...block,
    fields: block.fields.map(field => attachEditorRecursively(field, options, depth + 1)),
  }
}

/**
 * Checks if a field should be processed based on include/exclude options
 */
function shouldProcessField(field: Field, options: LexicalEditorOptions): boolean {
  const fieldName = 'name' in field ? field.name : undefined
  
  if (options.excludeFields && fieldName && options.excludeFields.includes(fieldName)) {
    return false
  }
  
  if (options.includeFields && fieldName && !options.includeFields.includes(fieldName)) {
    return false
  }
  
  return true
}

/**
 * Recursively attaches lexical editor to richText fields within a field structure
 */
function attachEditorRecursively(field: Field, options: LexicalEditorOptions = {}, depth = 0): Field {
  // Prevent infinite recursion
  if (depth > (options.maxDepth || 10)) {
    return field
  }

  // Check if field should be processed
  if (!shouldProcessField(field, options)) {
    return field
  }

  // If this is a richText field and conditions are met, attach lexical
  if (isRichTextField(field)) {
    const shouldAttach = options.overrideExisting || !field.editor
    if (shouldAttach) {
      return {
        ...field,
        editor: options.customEditor || lexical,
      }
    }
  }

  // Handle group fields
  if (isGroupField(field)) {
    return {
      ...field,
      fields: field.fields.map(f => attachEditorRecursively(f, options, depth + 1)),
    }
  }

  // Handle array fields
  if (isArrayField(field)) {
    return {
      ...field,
      fields: field.fields.map(f => attachEditorRecursively(f, options, depth + 1)),
    }
  }

  // Handle blocks field type
  if (isBlocksField(field)) {
    return {
      ...field,
      blocks: field.blocks.map(block => processBlock(block, options, depth + 1)),
    }
  }

  // Handle tabs field type
  if (isTabsField(field)) {
    return {
      ...field,
      tabs: field.tabs.map((tab) => ({
        ...tab,
        fields: Array.isArray(tab.fields) 
          ? tab.fields.map(f => attachEditorRecursively(f, options, depth + 1)) 
          : tab.fields,
      })),
    }
  }

  // Handle collapsible field type
  if (isCollapsibleField(field)) {
    return {
      ...field,
      fields: field.fields.map(f => attachEditorRecursively(f, options, depth + 1)),
    }
  }

  // Handle row field type
  if (isRowField(field)) {
    return {
      ...field,
      fields: field.fields.map(f => attachEditorRecursively(f, options, depth + 1)),
    }
  }

  return field
}

/**
 * Processes fields array with the given options
 */
function processFields(fields: Field[], options: LexicalEditorOptions = {}): Field[] {
  return fields.map(field => attachEditorRecursively(field, options))
}

/**
 * Ensures all richText fields (including deeply nested ones) have a lexical editor configured.
 * This utility function recursively traverses all field types that can contain nested fields:
 * - group fields
 * - array fields
 * - blocks fields
 * - tabs fields
 * - collapsible fields
 * - row fields
 * 
 * @param collection - The collection configuration to enhance
 * @param options - Configuration options for the enhancement
 * @returns Enhanced collection configuration with lexical editors attached
 */
export function withLexicalEditor(
  collection: CollectionConfig, 
  options: LexicalEditorOptions = {}
): CollectionConfig {
  if (!collection.fields || !Array.isArray(collection.fields)) {
    return collection
  }

  return {
    ...collection,
    fields: processFields(collection.fields, options),
  }
}

/**
 * Enhances a global configuration with lexical editors
 * 
 * @param global - The global configuration to enhance
 * @param options - Configuration options for the enhancement
 * @returns Enhanced global configuration with lexical editors attached
 */
export function withLexicalEditorGlobal(
  global: GlobalConfig,
  options: LexicalEditorOptions = {}
): GlobalConfig {
  if (!global.fields || !Array.isArray(global.fields)) {
    return global
  }

  return {
    ...global,
    fields: processFields(global.fields, options),
  }
}

/**
 * Alternative function that allows customizing the lexical editor configuration
 * 
 * @param editorConfig - Custom lexical editor configuration
 * @returns Function that enhances a collection with the custom editor
 * @deprecated Use withLexicalEditor with options.customEditor instead
 */
export function withCustomLexicalEditor(editorConfig: ReturnType<typeof lexicalEditor>) {
  return function enhanceCollection(collection: CollectionConfig): CollectionConfig {
    return withLexicalEditor(collection, { customEditor: editorConfig })
  }
}

/**
 * Utility function to create a lexical editor with custom features
 * 
 * @param features - Custom features configuration
 * @returns Configured lexical editor
 */
export function createLexicalEditor(features?: (args: { defaultFeatures: any[] }) => any[]) {
  return lexicalEditor({
    features: features || (({ defaultFeatures }) => [...defaultFeatures]),
  })
}

/**
 * Batch process multiple collections with lexical editors
 * 
 * @param collections - Array of collection configurations
 * @param options - Configuration options for the enhancement
 * @returns Array of enhanced collection configurations
 */
export function withLexicalEditorBatch(
  collections: CollectionConfig[],
  options: LexicalEditorOptions = {}
): CollectionConfig[] {
  return collections.map(collection => withLexicalEditor(collection, options))
}

/**
 * Batch process multiple globals with lexical editors
 * 
 * @param globals - Array of global configurations
 * @param options - Configuration options for the enhancement
 * @returns Array of enhanced global configurations
 */
export function withLexicalEditorGlobalBatch(
  globals: GlobalConfig[],
  options: LexicalEditorOptions = {}
): GlobalConfig[] {
  return globals.map(global => withLexicalEditorGlobal(global, options))
}
