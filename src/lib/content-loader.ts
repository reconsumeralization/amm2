/**
 * Documentation Content Loading and Parsing System
 * Supports multiple formats with validation and metadata extraction
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { GuideContent, CodeSnippet, InteractiveExample } from '@/types/documentation';
import { createContentValidator, ValidationResult } from './content-validator';

export interface LoadedContent {
  frontmatter: Record<string, any>;
  html: string;
  raw: string;
  filePath: string;
  format: ContentFormat;
  validation?: ValidationResult;
  extractedMetadata: ExtractedMetadata;
}

export interface ExtractedMetadata {
  wordCount: number;
  estimatedReadTime: number;
  headings: HeadingInfo[];
  codeBlocks: CodeBlockInfo[];
  links: LinkInfo[];
  images: ImageInfo[];
}

export interface HeadingInfo {
  level: number;
  text: string;
  id: string;
}

export interface CodeBlockInfo {
  language: string;
  code: string;
  lineCount: number;
}

export interface LinkInfo {
  text: string;
  url: string;
  isExternal: boolean;
}

export interface ImageInfo {
  alt: string;
  src: string;
  title?: string;
}

export type ContentFormat = 'markdown' | 'mdx' | 'html' | 'json' | 'yaml';

export interface ContentLoaderConfig {
  enableValidation: boolean;
  enableMetadataExtraction: boolean;
  supportedFormats: ContentFormat[];
  baseDirectory: string;
}

export class ContentLoader {
  private config: ContentLoaderConfig;
  private validator = createContentValidator();

  constructor(config: ContentLoaderConfig) {
    this.config = config;
  }

  /**
   * Load documentation content from supported file formats
   */
  async loadDocumentation(filePath: string): Promise<LoadedContent> {
    try {
      const absolutePath = path.resolve(this.config.baseDirectory, filePath);
      
      // Check if file exists
      if (!fs.existsSync(absolutePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const raw = await fs.promises.readFile(absolutePath, 'utf-8');
      const format = this.detectFormat(absolutePath);

      // Check if format is supported
      if (!this.config.supportedFormats.includes(format)) {
        throw new Error(`Unsupported format: ${format}`);
      }

      let frontmatter: Record<string, any> = {};
      let content = raw;
      let html = '';

      // Parse based on format
      switch (format) {
        case 'markdown':
        case 'mdx':
          const parsed = matter(raw);
          frontmatter = parsed.data;
          content = parsed.content;
          html = await this.convertMarkdownToHtml(content);
          break;
        
        case 'html':
          html = raw;
          content = this.extractTextFromHtml(raw);
          break;
        
        case 'json':
          const jsonData = JSON.parse(raw);
          frontmatter = jsonData.metadata || {};
          content = jsonData.content || '';
          html = await this.convertMarkdownToHtml(content);
          break;
        
        case 'yaml':
          // For YAML files, treat entire content as frontmatter
          frontmatter = matter(`---\n${raw}\n---`).data;
          content = '';
          html = '';
          break;
      }

      // Extract metadata if enabled
      let extractedMetadata: ExtractedMetadata = {
        wordCount: 0,
        estimatedReadTime: 0,
        headings: [],
        codeBlocks: [],
        links: [],
        images: []
      };

      if (this.config.enableMetadataExtraction) {
        extractedMetadata = this.extractMetadata(content, html);
      }

      // Validate content if enabled
      let validation: ValidationResult | undefined;
      if (this.config.enableValidation && format !== 'yaml') {
        // Convert to GuideContent format for validation
        const guideContent = this.convertToGuideContent(frontmatter, content, extractedMetadata);
        validation = await this.validator.validateGuideContent(guideContent);
      }

      return {
        frontmatter,
        html,
        raw: content,
        filePath: absolutePath,
        format,
        validation,
        extractedMetadata
      };

    } catch (error) {
      throw new Error(`Failed to load content from ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load multiple documentation files
   */
  async loadMultipleDocuments(filePaths: string[]): Promise<LoadedContent[]> {
    const results = await Promise.allSettled(
      filePaths.map(filePath => this.loadDocumentation(filePath))
    );

    const loadedContent: LoadedContent[] = [];
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        loadedContent.push(result.value);
      } else {
        errors.push(`${filePaths[index]}: ${result.reason.message}`);
      }
    });

    if (errors.length > 0) {
      console.warn('Some files failed to load:', errors);
    }

    return loadedContent;
  }

  /**
   * Scan directory for documentation files
   */
  async scanDirectory(directory: string, recursive = true): Promise<string[]> {
    const files: string[] = [];
    const scanDir = path.resolve(this.config.baseDirectory, directory);

    try {
      const entries = await fs.promises.readdir(scanDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(scanDir, entry.name);
        const relativePath = path.relative(this.config.baseDirectory, fullPath);

        if (entry.isDirectory() && recursive) {
          const subFiles = await this.scanDirectory(relativePath, recursive);
          files.push(...subFiles);
        } else if (entry.isFile()) {
          const format = this.detectFormat(fullPath);
          if (this.config.supportedFormats.includes(format)) {
            files.push(relativePath);
          }
        }
      }
    } catch (error) {
      throw new Error(`Failed to scan directory ${directory}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return files;
  }

  // Private helper methods

  private detectFormat(filePath: string): ContentFormat {
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.md':
        return 'markdown';
      case '.mdx':
        return 'mdx';
      case '.html':
      case '.htm':
        return 'html';
      case '.json':
        return 'json';
      case '.yaml':
      case '.yml':
        return 'yaml';
      default:
        return 'markdown'; // Default fallback
    }
  }

  private async convertMarkdownToHtml(markdown: string): Promise<string> {
    // Simple markdown to HTML conversion
    // In a real implementation, you'd use a proper markdown parser like remark
    let html = markdown;
    
    // Convert headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Convert bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    
    // Convert code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Convert line breaks
    html = html.replace(/\n/g, '<br>');
    
    return html;
  }

  private extractTextFromHtml(html: string): string {
    // Simple HTML to text extraction
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  }

  private extractMetadata(content: string, html: string): ExtractedMetadata {
    const metadata: ExtractedMetadata = {
      wordCount: 0,
      estimatedReadTime: 0,
      headings: [],
      codeBlocks: [],
      links: [],
      images: []
    };

    // Calculate word count
    const words = content.split(/\s+/).filter(word => word.trim().length > 0);
    metadata.wordCount = words.length;
    
    // Estimate read time (average 200 words per minute)
    metadata.estimatedReadTime = Math.ceil(words.length / 200);

    // Extract headings
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    let match;
    while ((match = headingRegex.exec(content)) !== null) {
      metadata.headings.push({
        level: match[1].length,
        text: match[2],
        id: this.generateId(match[2])
      });
    }

    // Extract code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    while ((match = codeBlockRegex.exec(content)) !== null) {
      metadata.codeBlocks.push({
        language: match[1] || 'text',
        code: match[2],
        lineCount: match[2].split('\n').length
      });
    }

    // Extract links
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    while ((match = linkRegex.exec(content)) !== null) {
      metadata.links.push({
        text: match[1],
        url: match[2],
        isExternal: this.isExternalUrl(match[2])
      });
    }

    // Extract images
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)(?:\s+"([^"]*)")?\)/g;
    while ((match = imageRegex.exec(content)) !== null) {
      metadata.images.push({
        alt: match[1],
        src: match[2],
        title: match[3]
      });
    }

    return metadata;
  }

  private convertToGuideContent(frontmatter: Record<string, any>, content: string, metadata: ExtractedMetadata): GuideContent {
    // Convert loaded content to GuideContent format for validation
    return {
      metadata: {
        id: frontmatter.id || 'temp-id',
        title: frontmatter.title || 'Untitled',
        description: frontmatter.description || '',
        author: frontmatter.author || 'Unknown',
        lastUpdated: frontmatter.lastUpdated ? new Date(frontmatter.lastUpdated) : new Date(),
        version: frontmatter.version || { major: 1, minor: 0, patch: 0 },
        targetAudience: frontmatter.targetAudience || ['developer'],
        difficulty: frontmatter.difficulty || 'beginner',
        estimatedTime: metadata.estimatedReadTime,
        tags: frontmatter.tags || [],
        locale: frontmatter.locale || 'en',
        deprecated: frontmatter.deprecated || false,
        replacedBy: frontmatter.replacedBy
      },
      content: {
        introduction: content.substring(0, 500), // First 500 chars as intro
        prerequisites: frontmatter.prerequisites || [],
        steps: [], // Would need to parse steps from content
        troubleshooting: [],
        relatedContent: [],
        interactiveExamples: [],
        codeSnippets: metadata.codeBlocks.map((block, index) => ({
          id: `code-${index}`,
          language: block.language,
          code: block.code,
          description: '',
          runnable: false
        }))
      },
      validation: {
        reviewed: false,
        reviewedBy: '',
        reviewDate: new Date(),
        accuracy: 0,
        accessibilityCompliant: false,
        lastValidated: new Date()
      },
      analytics: {
        viewCount: 0,
        completionRate: 0,
        averageRating: 0,
        feedbackCount: 0,
        rchRanking: 0
      },
      versioning: {
        changeHistory: [],
        previousVersions: [],
        migrationNotes: frontmatter.migrationNotes
      }
    };
  }

  private generateId(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }

  private isExternalUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }
}

/**
 * Default content loader configuration
 */
export const defaultContentLoaderConfig: ContentLoaderConfig = {
  enableValidation: true,
  enableMetadataExtraction: true,
  supportedFormats: ['markdown', 'mdx', 'html', 'json'],
  baseDirectory: process.cwd()
};

/**
 * Create a content loader with default configuration
 */
export function createContentLoader(config?: Partial<ContentLoaderConfig>): ContentLoader {
  return new ContentLoader({
    ...defaultContentLoaderConfig,
    ...config
  });
}

/**
 * Convenience function to load a single documentation file
 */
export async function loadDocumentation(filePath: string, config?: Partial<ContentLoaderConfig>): Promise<LoadedContent> {
  const loader = createContentLoader(config);
  return loader.loadDocumentation(filePath);
}
