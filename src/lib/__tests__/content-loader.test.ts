import { ContentLoader, createContentLoader, defaultContentLoaderConfig } from '../content-loader';
// @ts-nocheck
import { expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

// Mock fs module
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  promises: {
    readFile: jest.fn(),
    readdir: jest.fn()
  }
}));

const mockFs = fs as jest.Mocked<typeof fs>;

describe('ContentLoader', () => {
  let loader: ContentLoader;
  const testConfig = {
    ...defaultContentLoaderConfig,
    baseDirectory: '/test/content'
  };

  beforeEach(() => {
    loader = new ContentLoader(testConfig);
    jest.clearAllMocks();
  });

  describe('loadDocumentation', () => {
    it('should load markdown content successfully', async () => {
      const markdownContent = `---
title: Test Document
author: Test Author
tags: [test, markdown]
---

# Test Document

This is a test document with some content.

## Code Example

\`\`\`javascript
console.log("Hello, world!");
\`\`\`

[Link to example](https://example.com)

![Test image](test.jpg)
`;

      mockFs.existsSync.mockReturnValue(true);
      (mockFs.promises.readFile as jest.Mock).mockResolvedValue(markdownContent);

      const result = await loader.loadDocumentation('test.md');

      expect(result.format).toBe('markdown');
      expect(result.frontmatter.title).toBe('Test Document');
      expect(result.frontmatter.author).toBe('Test Author');
      expect(result.frontmatter.tags).toEqual(['test', 'markdown']);
      expect(result.raw).toContain('This is a test document');
      expect(result.html).toContain('<h1>Test Document</h1>');
      expect(result.extractedMetadata.wordCount).toBeGreaterThan(0);
      expect(result.extractedMetadata.headings).toHaveLength(2);
      expect(result.extractedMetadata.codeBlocks).toHaveLength(1);
      expect(result.extractedMetadata.links).toHaveLength(1);
      expect(result.extractedMetadata.images).toHaveLength(1);
    });

    it('should load HTML content successfully', async () => {
      const htmlContent = `<h1>Test HTML</h1>
<p>This is HTML content.</p>
<code>console.log("test");</code>`;

      mockFs.existsSync.mockReturnValue(true);
      (mockFs.promises.readFile as jest.Mock).mockResolvedValue(htmlContent);

      const result = await loader.loadDocumentation('test.html');

      expect(result.format).toBe('html');
      expect(result.html).toBe(htmlContent);
      expect(result.raw).toContain('This is HTML content');
      expect(result.extractedMetadata.wordCount).toBeGreaterThan(0);
    });

    it('should load JSON content successfully', async () => {
      const jsonContent = {
        metadata: {
          title: 'JSON Document',
          author: 'JSON Author'
        },
        content: '# JSON Content\n\nThis is content from JSON.'
      };

      mockFs.existsSync.mockReturnValue(true);
      (mockFs.promises.readFile as jest.Mock).mockResolvedValue(JSON.stringify(jsonContent));

      const result = await loader.loadDocumentation('test.json');

      expect(result.format).toBe('json');
      expect(result.frontmatter.title).toBe('JSON Document');
      expect(result.frontmatter.author).toBe('JSON Author');
      expect(result.raw).toContain('This is content from JSON');
    });

    it('should handle file not found error', async () => {
      mockFs.existsSync.mockReturnValue(false);

      await expect(loader.loadDocumentation('nonexistent.md'))
        .rejects.toThrow('File not found: nonexistent.md');
    });

    it('should handle unsupported format error', async () => {
      const loaderWithLimitedFormats = new ContentLoader({
        ...testConfig,
        supportedFormats: ['markdown']
      });

      mockFs.existsSync.mockReturnValue(true);
      (mockFs.promises.readFile as jest.Mock).mockResolvedValue('content');

      await expect(loaderWithLimitedFormats.loadDocumentation('test.html'))
        .rejects.toThrow('Unsupported format: html');
    });

    it('should handle malformed JSON error', async () => {
      mockFs.existsSync.mockReturnValue(true);
      (mockFs.promises.readFile as jest.Mock).mockResolvedValue('{ invalid json }');

      await expect(loader.loadDocumentation('test.json'))
        .rejects.toThrow('Failed to load content');
    });

    it('should validate content when enabled', async () => {
      const validationLoader = new ContentLoader({
        ...testConfig,
        enableValidation: true
      });

      const markdownContent = `---
title: Test Document
author: Test Author
---

# Test Document

This is a test document.
`;

      mockFs.existsSync.mockReturnValue(true);
      (mockFs.promises.readFile as jest.Mock).mockResolvedValue(markdownContent);

      const result = await validationLoader.loadDocumentation('test.md');

      expect(result.validation).toBeDefined();
      expect(result.validation?.isValid).toBeDefined();
    });

    it('should skip validation for YAML files', async () => {
      const yamlContent = `title: YAML Document
author: YAML Author
description: This is a YAML configuration file`;

      mockFs.existsSync.mockReturnValue(true);
      (mockFs.promises.readFile as jest.Mock).mockResolvedValue(yamlContent);

      const result = await loader.loadDocumentation('config.yaml');

      expect(result.format).toBe('yaml');
      expect(result.frontmatter.title).toBe('YAML Document');
      expect(result.validation).toBeUndefined();
    });
  });

  describe('loadMultipleDocuments', () => {
    it('should load multiple documents successfully', async () => {
      const content1 = '---\ntitle: Doc 1\n---\n# Document 1';
      const content2 = '---\ntitle: Doc 2\n---\n# Document 2';

      mockFs.existsSync.mockReturnValue(true);
      (mockFs.promises.readFile as jest.Mock)
        .mockResolvedValueOnce(content1)
        .mockResolvedValueOnce(content2);

      const results = await loader.loadMultipleDocuments(['doc1.md', 'doc2.md']);

      expect(results).toHaveLength(2);
      expect(results[0]?.frontmatter.title).toBe('Doc 1');
      expect(results[1]?.frontmatter.title).toBe('Doc 2');
    });

    it('should handle partial failures gracefully', async () => {
      const content1 = '---\ntitle: Doc 1\n---\n# Document 1';

      mockFs.existsSync
        .mockReturnValueOnce(true)  // First file exists
        .mockReturnValueOnce(false); // Second file doesn't exist

      (mockFs.promises.readFile as jest.Mock).mockResolvedValueOnce(content1);

      const results = await loader.loadMultipleDocuments(['doc1.md', 'nonexistent.md']);

      expect(results).toHaveLength(1);
      expect(results[0]?.frontmatter.title).toBe('Doc 1');
    });
  });

  describe('scanDirectory', () => {
    it('should scan directory for supported files', async () => {
      const mockDirEntries = [
        { name: 'doc1.md', isFile: () => true, isDirectory: () => false },
        { name: 'doc2.html', isFile: () => true, isDirectory: () => false },
        { name: 'unsupported.txt', isFile: () => true, isDirectory: () => false },
        { name: 'subdir', isFile: () => false, isDirectory: () => true }
      ];

      const mockSubDirEntries = [
        { name: 'subdoc.md', isFile: () => true, isDirectory: () => false }
      ];

      (mockFs.promises.readdir as jest.Mock)
        .mockResolvedValueOnce(mockDirEntries as any)
        .mockResolvedValueOnce(mockSubDirEntries as any);

      const files = await loader.scanDirectory('docs', true);

      expect(files).toContain('docs/doc1.md');
      expect(files).toContain('docs/doc2.html');
      expect(files).toContain('docs/subdir/subdoc.md');
      expect(files).not.toContain('docs/unsupported.txt');
    });
    it('should scan directory non-recursively', async () => {
      const mockDirEntries = [
        { name: 'doc1.md', isFile: () => true, isDirectory: () => false },
        { name: 'subdir', isFile: () => false, isDirectory: () => true }
      ];

      (mockFs.promises.readdir as jest.Mock).mockResolvedValueOnce(mockDirEntries as any);

      const files = await loader.scanDirectory('docs', false);

      expect(files).toContain('docs/doc1.md');
      expect(files).toHaveLength(1);
    });

    it('should handle directory scan errors', async () => {
      (mockFs.promises.readdir as jest.Mock).mockRejectedValue(new Error('Permission denied'));

      await expect(loader.scanDirectory('restricted'))
        .rejects.toThrow('Failed to scan directory restricted');
    });
  });

  describe('metadata extraction', () => {
    it('should extract comprehensive metadata', async () => {
      const complexMarkdown = `---
title: Complex Document
---

# Main Title

This document has multiple sections and various content types.

## Section 1

Here's some text with a [link](https://example.com) and an ![image](test.jpg "Test Image").

### Subsection

More content here.

\`\`\`javascript
function test() {
  console.log("Hello, world!");
  return true;
}
\`\`\`

\`\`\`python
def hello():
    print("Hello from Python!")
\`\`\`

Another [internal link](/docs/other) and [external link](https://github.com).

![Another image](image2.png)
`;

      mockFs.existsSync.mockReturnValue(true);
      (mockFs.promises.readFile as jest.Mock).mockResolvedValue(complexMarkdown);

      const result = await loader.loadDocumentation('complex.md');

      expect(result.extractedMetadata.headings).toHaveLength(3);
      expect(result.extractedMetadata.headings![0]).toEqual({
        level: 1,
        text: 'Main Title',
        id: 'main-title'
      });

      expect(result.extractedMetadata.codeBlocks).toHaveLength(2);
      expect(result.extractedMetadata.codeBlocks[0]?.language).toBe('javascript');
      expect(result.extractedMetadata.codeBlocks[1]?.language).toBe('python');

      expect(result.extractedMetadata.links).toHaveLength(3);
      expect(result.extractedMetadata.links[0]?.isExternal).toBe(true);
      expect(result.extractedMetadata.links[1]?.isExternal).toBe(false);

      expect(result.extractedMetadata.images).toHaveLength(2);
      expect(result.extractedMetadata.images[0]?.title).toBe('Test Image');

      expect(result.extractedMetadata.wordCount).toBeGreaterThan(20);
      expect(result.extractedMetadata.estimatedReadTime).toBeGreaterThan(0);
    });

    it('should handle content without metadata extraction', async () => {
      const loaderWithoutMetadata = new ContentLoader({
        ...testConfig,
        enableMetadataExtraction: false
      });

      const content = '# Simple Document\n\nSimple content.';

      mockFs.existsSync.mockReturnValue(true);
      (mockFs.promises.readFile as jest.Mock).mockResolvedValue(content);

      const result = await loaderWithoutMetadata.loadDocumentation('simple.md');

      expect(result.extractedMetadata.wordCount).toBe(0);
      expect(result.extractedMetadata.headings).toHaveLength(0);
    });
  });

  describe('format detection', () => {
    it('should detect formats correctly', async () => {
      const testCases = [
        { file: 'test.md', expectedFormat: 'markdown' },
        { file: 'test.mdx', expectedFormat: 'mdx' },
        { file: 'test.html', expectedFormat: 'html' },
        { file: 'test.htm', expectedFormat: 'html' },
        { file: 'test.json', expectedFormat: 'json' },
        { file: 'test.yaml', expectedFormat: 'yaml' },
        { file: 'test.yml', expectedFormat: 'yaml' },
        { file: 'test.unknown', expectedFormat: 'markdown' }
      ];

      mockFs.existsSync.mockReturnValue(true);
      (mockFs.promises.readFile as jest.Mock).mockResolvedValue('content');

      for (const testCase of testCases) {
        const result = await loader.loadDocumentation(testCase.file);
        expect(result.format).toBe(testCase.expectedFormat);
      }
    });
  });
});

describe('createContentLoader', () => {
  it('should create loader with default config', () => {
    const loader = createContentLoader();
    expect(loader).toBeInstanceOf(ContentLoader);
  });

  it('should create loader with custom config', () => {
    const customConfig = {
      enableValidation: false,
      // Cast to mutable array to satisfy ContentLoaderConfig type
      supportedFormats: ['markdown'] as any
    };

    const loader = createContentLoader(customConfig);
    expect(loader).toBeInstanceOf(ContentLoader);
  });
});
