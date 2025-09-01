---
inclusion: always
---
# Lexical Editor Import Rules

## Node Type Imports
Always import node types from their specific packages, not from `@lexical/react`:

```typescript
// ✅ Correct imports
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table';
import { ImageNode } from '../../nodes/ImageNode'; // Custom ImageNode

// ❌ Incorrect imports
import { HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, ImageNode, TableNode, TableCellNode, TableRowNode } from '@lexical/react';
```

## Custom ImageNode
The project uses a custom ImageNode implementation in [src/nodes/ImageNode.ts](mdc:src/nodes/ImageNode.ts). Use these methods:

```typescript
// Available methods on ImageNode
node.setSrc(src: string)
node.setAlt(alt: string) // Note: NOT setAltText
node.setWidth(width: number)
node.setHeight(height: number | 'auto')
node.setCaption(caption: string)
```

## Plugin Imports
Import Lexical plugins from their specific paths:

```typescript
// ✅ Correct plugin imports
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
```

## Node Registration
When registering nodes in the editor config, only include available node types:

```typescript
const initialConfig = {
  namespace: 'ModernMenEditor',
  nodes: [ListNode, ListItemNode, LinkNode, ImageNode, TableNode, TableCellNode, TableRowNode],
  // Note: HeadingNode and QuoteNode are not available in current packages
};
```

## Node Access Pattern
To access nodes in the editor, use the editor state's node map:

```typescript
editor.update(() => {
  const node = editor.getEditorState()._nodeMap.get(nodeKey) as ImageNode;
  if (node && typeof node.setSrc === 'function') {
    node.setSrc(newSrc);
  }
});
```
description:
globs:
alwaysApply: true
---
