/**
 * Documentation Content Validation System
 * Validates markdown, links, code examples, and accessibility compliance
 */

import { GuideContent, ValidationError } from '@/types/documentation';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  score: number;
  lastValidated: Date;
}

export interface ValidationConfig {
  enableMarkdownValidation: boolean;
  enableLinkValidation: boolean;
  enableCodeValidation: boolean;
  enableAccessibilityValidation: boolean;
  enableSpellCheck: boolean;
  enableReadabilityCheck: boolean;
  strictMode: boolean;
}

export class ContentValidator {
  private config: ValidationConfig;

  constructor(config: ValidationConfig) {
    this.config = config;
  }

  /**
   * Validate complete guide content
   */
  async validateGuideContent(content: GuideContent): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    let score = 100;

    try {
      // Validate metadata
      const metadataValidation = this.validateMetadata(content);
      errors.push(...metadataValidation.errors);
      warnings.push(...metadataValidation.warnings);
      score -= metadataValidation.errors.length * 10;

      // Validate markdown content
      if (this.config.enableMarkdownValidation) {
        const markdownValidation = await this.validateMarkdown(content.content.introduction);
        errors.push(...markdownValidation.errors);
        warnings.push(...markdownValidation.warnings);
        score -= markdownValidation.errors.length * 5;
      }

      // Validate links
      if (this.config.enableLinkValidation) {
        const linkValidation = await this.validateLinks(content);
        errors.push(...linkValidation.errors);
        warnings.push(...linkValidation.warnings);
        score -= linkValidation.errors.length * 8;
      }

      // Validate code examples
      if (this.config.enableCodeValidation) {
        const codeValidation = await this.validateCodeExamples(content);
        errors.push(...codeValidation.errors);
        warnings.push(...codeValidation.warnings);
        score -= codeValidation.errors.length * 7;
      }

      // Validate accessibility
      if (this.config.enableAccessibilityValidation) {
        const accessibilityValidation = await this.validateAccessibility(content);
        errors.push(...accessibilityValidation.errors);
        warnings.push(...accessibilityValidation.warnings);
        score -= accessibilityValidation.errors.length * 6;
      }

      // Validate readability
      if (this.config.enableReadabilityCheck) {
        const readabilityValidation = this.validateReadability(content);
        warnings.push(...readabilityValidation.warnings);
        score -= readabilityValidation.warnings.length * 2;
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        score: Math.max(0, score),
        lastValidated: new Date()
      };
    } catch (error) {
      errors.push({
        type: 'content',
        message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });

      return {
        isValid: false,
        errors,
        warnings,
        score: 0,
        lastValidated: new Date()
      };
    }
  }

  /**
   * Validate content metadata
   */
  private validateMetadata(content: GuideContent): { errors: ValidationError[]; warnings: ValidationError[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Required fields validation
    if (!content.metadata.title?.trim()) {
      errors.push({
        type: 'content',
        message: 'Title is required',
        severity: 'error'
      });
    }

    if (!content.metadata.description?.trim()) {
      errors.push({
        type: 'content',
        message: 'Description is required',
        severity: 'error'
      });
    }

    if (!content.metadata.author?.trim()) {
      errors.push({
        type: 'content',
        message: 'Author is required',
        severity: 'error'
      });
    }

    // Title length validation
    if (content.metadata.title && content.metadata.title.length > 100) {
      warnings.push({
        type: 'content',
        message: 'Title is too long (max 100 characters)',
        severity: 'warning'
      });
    }

    // Description length validation
    if (content.metadata.description && content.metadata.description.length > 300) {
      warnings.push({
        type: 'content',
        message: 'Description is too long (max 300 characters)',
        severity: 'warning'
      });
    }

    // Tags validation
    if (content.metadata.tags.length === 0) {
      warnings.push({
        type: 'content',
        message: 'No tags specified - content may be harder to discover',
        severity: 'warning'
      });
    }

    if (content.metadata.tags.length > 10) {
      warnings.push({
        type: 'content',
        message: 'Too many tags (max 10 recommended)',
        severity: 'warning'
      });
    }

    // Estimated time validation
    if (content.metadata.estimatedTime <= 0) {
      warnings.push({
        type: 'content',
        message: 'Estimated read time should be greater than 0',
        severity: 'warning'
      });
    }

    return { errors, warnings };
  }

  /**
   * Validate markdown syntax and structure
   */
  private async validateMarkdown(markdown: string): Promise<{ errors: ValidationError[]; warnings: ValidationError[] }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    try {
      // Check for common markdown issues
      const lines = markdown.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNumber = i + 1;

        // Check for malformed headers
        if (line.match(/^#{7,}/)) {
          errors.push({
            type: 'markdown',
            message: 'Headers deeper than 6 levels are not supported',
            line: lineNumber,
            severity: 'error'
          });
        }

        // Check for unmatched brackets
        const openBrackets = (line.match(/\[/g) || []).length;
        const closeBrackets = (line.match(/\]/g) || []).length;
        if (openBrackets !== closeBrackets) {
          warnings.push({
            type: 'markdown',
            message: 'Unmatched brackets detected',
            line: lineNumber,
            severity: 'warning'
          });
        }

        // Check for unmatched parentheses in links
        const openParens = (line.match(/\(/g) || []).length;
        const closeParens = (line.match(/\)/g) || []).length;
        if (openParens !== closeParens && line.includes('[')) {
          warnings.push({
            type: 'markdown',
            message: 'Unmatched parentheses in link',
            line: lineNumber,
            severity: 'warning'
          });
        }

        // Check for empty headers
        if (line.match(/^#+\s*$/)) {
          errors.push({
            type: 'markdown',
            message: 'Empty header detected',
            line: lineNumber,
            severity: 'error'
          });
        }
      }

      // Check document structure
      const hasH1 = markdown.includes('# ');
      if (!hasH1) {
        warnings.push({
          type: 'markdown',
          message: 'Document should have at least one H1 header',
          severity: 'warning'
        });
      }

    } catch (error) {
      errors.push({
        type: 'markdown',
        message: `Markdown validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });
    }

    return { errors, warnings };
  }

  /**
   * Validate links in content
   */
  private async validateLinks(content: GuideContent): Promise<{ errors: ValidationError[]; warnings: ValidationError[] }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    try {
      // Extract all links from content
      const allContent = [
        content.content.introduction,
        ...content.content.steps.map(step => step.content),
        ...content.content.troubleshooting.map(item => item.solution)
      ].join('\n');

      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const links: { text: string; url: string; line?: number }[] = [];
      let match;

      while ((match = linkRegex.exec(allContent)) !== null) {
        links.push({
          text: match[1],
          url: match[2]
        });
      }

      // Validate each link
      for (const link of links) {
        // Check for empty link text
        if (!link.text.trim()) {
          warnings.push({
            type: 'link',
            message: 'Link has empty text',
            severity: 'warning'
          });
        }

        // Check for empty URL
        if (!link.url.trim()) {
          errors.push({
            type: 'link',
            message: 'Link has empty URL',
            severity: 'error'
          });
          continue;
        }

        // Validate URL format
        if (!this.isValidUrl(link.url)) {
          errors.push({
            type: 'link',
            message: `Invalid URL format: ${link.url}`,
            severity: 'error'
          });
        }

        // Check for relative links
        if (link.url.startsWith('/') || link.url.startsWith('./') || link.url.startsWith('../')) {
          // Validate internal links exist (simplified check)
          if (!this.isValidInternalLink(link.url)) {
            warnings.push({
              type: 'link',
              message: `Internal link may be broken: ${link.url}`,
              severity: 'warning'
            });
          }
        }
      }

    } catch (error) {
      errors.push({
        type: 'link',
        message: `Link validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });
    }

    return { errors, warnings };
  }

  /**
   * Validate code examples
   */
  private async validateCodeExamples(content: GuideContent): Promise<{ errors: ValidationError[]; warnings: ValidationError[] }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    try {
      // Validate code snippets
      for (const snippet of content.content.codeSnippets) {
        // Check for empty code
        if (!snippet.code.trim()) {
          errors.push({
            type: 'code',
            message: `Code snippet "${snippet.id}" is empty`,
            severity: 'error'
          });
          continue;
        }

        // Language-specific validation
        if (snippet.language) {
          const langValidation = this.validateCodeByLanguage(snippet.code, snippet.language);
          errors.push(...langValidation.errors);
          warnings.push(...langValidation.warnings);
        }

        // Check for common issues
        if (snippet.code.includes('TODO') || snippet.code.includes('FIXME')) {
          warnings.push({
            type: 'code',
            message: `Code snippet "${snippet.id}" contains TODO/FIXME comments`,
            severity: 'warning'
          });
        }

        // Check for placeholder values
        if (snippet.code.includes('YOUR_API_KEY') || snippet.code.includes('REPLACE_ME')) {
          warnings.push({
            type: 'code',
            message: `Code snippet "${snippet.id}" contains placeholder values`,
            severity: 'warning'
          });
        }
      }

    } catch (error) {
      errors.push({
        type: 'code',
        message: `Code validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });
    }

    return { errors, warnings };
  }

  /**
   * Validate accessibility compliance
   */
  private async validateAccessibility(content: GuideContent): Promise<{ errors: ValidationError[]; warnings: ValidationError[] }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    try {
      // Check for alt text on images
      const allContent = [
        content.content.introduction,
        ...content.content.steps.map(step => step.content)
      ].join('\n');

      const imageRegex = /!\[([^\]]*)\]\([^)]+\)/g;
      let match;

      while ((match = imageRegex.exec(allContent)) !== null) {
        const altText = match[1];
        if (!altText.trim()) {
          errors.push({
            type: 'accessibility',
            message: 'Image missing alt text',
            severity: 'error'
          });
        } else if (altText.length < 3) {
          warnings.push({
            type: 'accessibility',
            message: 'Image alt text is too short',
            severity: 'warning'
          });
        }
      }

      // Check heading structure
      const headingRegex = /^(#{1,6})\s+(.+)$/gm;
      const headings: { level: number; text: string }[] = [];

      while ((match = headingRegex.exec(allContent)) !== null) {
        headings.push({
          level: match[1].length,
          text: match[2]
        });
      }

      // Validate heading hierarchy
      for (let i = 1; i < headings.length; i++) {
        const current = headings[i];
        const previous = headings[i - 1];

        if (current.level > previous.level + 1) {
          warnings.push({
            type: 'accessibility',
            message: `Heading level skipped: H${previous.level} to H${current.level}`,
            severity: 'warning'
          });
        }
      }

    } catch (error) {
      errors.push({
        type: 'accessibility',
        message: `Accessibility validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });
    }

    return { errors, warnings };
  }

  /**
   * Validate content readability
   */
  private validateReadability(content: GuideContent): { warnings: ValidationError[] } {
    const warnings: ValidationError[] = [];

    try {
      const allText = [
        content.content.introduction,
        ...content.content.steps.map(step => step.content)
      ].join(' ');

      // Calculate basic readability metrics
      const sentences = allText.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const words = allText.split(/\s+/).filter(w => w.trim().length > 0);
      const avgWordsPerSentence = words.length / sentences.length;

      // Check for overly long sentences
      if (avgWordsPerSentence > 25) {
        warnings.push({
          type: 'content',
          message: 'Average sentence length is too long (consider breaking up complex sentences)',
          severity: 'warning'
        });
      }

      // Check for very short content
      if (words.length < 50) {
        warnings.push({
          type: 'content',
          message: 'Content is very short - consider adding more detail',
          severity: 'warning'
        });
      }

      // Check for repetitive words
      const wordFreq = new Map<string, number>();
      words.forEach(word => {
        const normalized = word.toLowerCase().replace(/[^\w]/g, '');
        if (normalized.length > 3) {
          wordFreq.set(normalized, (wordFreq.get(normalized) || 0) + 1);
        }
      });

      const totalWords = words.length;
      for (const [word, count] of wordFreq) {
        if (count / totalWords > 0.05) { // More than 5% of content
          warnings.push({
            type: 'content',
            message: `Word "${word}" appears frequently (${count} times) - consider using synonyms`,
            severity: 'warning'
          });
        }
      }

    } catch (error) {
      warnings.push({
        type: 'content',
        message: `Readability check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'warning'
      });
    }

    return { warnings };
  }

  // Helper methods

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      // Check for relative URLs
      return url.startsWith('/') || url.startsWith('./') || url.startsWith('../') || url.startsWith('#');
    }
  }

  private isValidInternalLink(url: string): boolean {
    // Simplified internal link validation
    // In a real implementation, this would check against actual routes/files
    const commonPaths = [
      '/documentation',
      '/api',
      '/components',
      '/guides'
    ];

    return commonPaths.some(path => url.startsWith(path)) || url.startsWith('#');
  }

  private validateCodeByLanguage(code: string, language: string): { errors: ValidationError[]; warnings: ValidationError[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    switch (language.toLowerCase()) {
      case 'javascript':
      case 'js':
        return this.validateJavaScript(code);
      case 'typescript':
      case 'ts':
        return this.validateTypeScript(code);
      case 'json':
        return this.validateJSON(code);
      case 'bash':
      case 'shell':
        return this.validateShell(code);
      default:
        return { errors, warnings };
    }
  }

  private validateJavaScript(code: string): { errors: ValidationError[]; warnings: ValidationError[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Basic syntax checks
    try {
      // Check for common syntax issues
      if (code.includes('var ')) {
        warnings.push({
          type: 'code',
          message: 'Consider using "let" or "const" instead of "var"',
          severity: 'warning'
        });
      }

      // Check for missing semicolons (simplified)
      const lines = code.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && !line.endsWith(';') && !line.endsWith('{') && !line.endsWith('}') && !line.startsWith('//')) {
          warnings.push({
            type: 'code',
            message: 'Consider adding semicolon',
            line: i + 1,
            severity: 'warning'
          });
        }
      }

    } catch (error) {
      errors.push({
        type: 'code',
        message: 'JavaScript syntax error detected',
        severity: 'error'
      });
    }

    return { errors, warnings };
  }

  private validateTypeScript(code: string): { errors: ValidationError[]; warnings: ValidationError[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Basic TypeScript checks
    if (code.includes(': any')) {
      warnings.push({
        type: 'code',
        message: 'Consider using specific types instead of "any"',
        severity: 'warning'
      });
    }

    return { errors, warnings };
  }

  private validateJSON(code: string): { errors: ValidationError[]; warnings: ValidationError[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    try {
      JSON.parse(code);
    } catch (error) {
      errors.push({
        type: 'code',
        message: 'Invalid JSON syntax',
        severity: 'error'
      });
    }

    return { errors, warnings };
  }

  private validateShell(code: string): { errors: ValidationError[]; warnings: ValidationError[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Check for potentially dangerous commands
    const dangerousCommands = ['rm -rf', 'sudo rm', 'format', 'del /f'];
    
    for (const cmd of dangerousCommands) {
      if (code.includes(cmd)) {
        warnings.push({
          type: 'code',
          message: `Potentially dangerous command detected: ${cmd}`,
          severity: 'warning'
        });
      }
    }

    return { errors, warnings };
  }
}

/**
 * Default validation configuration
 */
export const defaultValidationConfig: ValidationConfig = {
  enableMarkdownValidation: true,
  enableLinkValidation: true,
  enableCodeValidation: true,
  enableAccessibilityValidation: true,
  enableSpellCheck: false, // Requires external service
  enableReadabilityCheck: true,
  strictMode: false
};

/**
 * Create a content validator with default configuration
 */
export function createContentValidator(config?: Partial<ValidationConfig>): ContentValidator {
  return new ContentValidator({
    ...defaultValidationConfig,
    ...config
  });
}