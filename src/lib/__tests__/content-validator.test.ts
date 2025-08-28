import { ContentValidator, defaultValidationConfig } from '../content-validator';
import { GuideContent } from '@/types/documentation';

describe('ContentValidator', () => {
  let validator: ContentValidator;

  beforeEach(() => {
    validator = new ContentValidator(defaultValidationConfig);
  });

  const createMockGuideContent = (overrides: Partial<GuideContent> = {}): GuideContent => ({
    metadata: {
      id: 'test-guide',
      title: 'Test Guide',
      description: 'A test guide for validation',
      author: 'Test Author',
      lastUpdated: new Date(),
      version: { major: 1, minor: 0, patch: 0 },
      targetAudience: ['developer'],
      difficulty: 'beginner',
      estimatedTime: 5,
      tags: ['test', 'validation'],
      locale: 'en',
      deprecated: false
    },
    content: {
      introduction: 'This is a test guide introduction.',
      prerequisites: [],
      steps: [
        {
          id: 'step-1',
          title: 'First Step',
          description: 'This is the first step',
          content: 'Step content here',
          codeSnippets: [],
          interactiveExamples: []
        }
      ],
      troubleshooting: [],
      relatedContent: [],
      interactiveExamples: [],
      codeSnippets: [
        {
          id: 'code-1',
          language: 'javascript',
          code: 'console.log("Hello, world!");',
          description: 'A simple console log',
          runnable: true
        }
      ]
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
      previousVersions: []
    },
    ...overrides
  });

  describe('validateGuideContent', () => {
    it('should validate valid content successfully', async () => {
      const content = createMockGuideContent();
      const result = await validator.validateGuideContent(content);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.score).toBeGreaterThan(80);
    });

    it('should detect missing required metadata', async () => {
      const content = createMockGuideContent({
        metadata: {
          ...createMockGuideContent().metadata,
          title: '',
          description: '',
          author: ''
        }
      });

      const result = await validator.validateGuideContent(content);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('Title is required'))).toBe(true);
      expect(result.errors.some(e => e.message.includes('Description is required'))).toBe(true);
      expect(result.errors.some(e => e.message.includes('Author is required'))).toBe(true);
    });

    it('should validate markdown content', async () => {
      const content = createMockGuideContent({
        content: {
          ...createMockGuideContent().content,
          introduction: '# Valid Header\n\n[Valid Link](https://example.com)\n\n```javascript\nconsole.log("test");\n```'
        }
      });

      const result = await validator.validateGuideContent(content);

      expect(result.isValid).toBe(true);
    });

    it('should detect markdown syntax errors', async () => {
      const content = createMockGuideContent({
        content: {
          ...createMockGuideContent().content,
          introduction: '####### Too many hashes\n\n[Unmatched bracket\n\n# \n\nEmpty header above'
        }
      });

      const result = await validator.validateGuideContent(content);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.type === 'markdown')).toBe(true);
    });

    it('should validate code snippets', async () => {
      const content = createMockGuideContent({
        content: {
          ...createMockGuideContent().content,
          codeSnippets: [
            {
              id: 'empty-code',
              language: 'javascript',
              code: '',
              description: 'Empty code snippet',
              runnable: false
            },
            {
              id: 'todo-code',
              language: 'javascript',
              code: 'console.log("test"); // TODO: fix this',
              description: 'Code with TODO',
              runnable: false
            }
          ]
        }
      });

      const result = await validator.validateGuideContent(content);

      expect(result.errors.some(e => e.message.includes('empty'))).toBe(true);
      expect(result.warnings.some(w => w.message.includes('TODO'))).toBe(true);
    });

    it('should validate links', async () => {
      const content = createMockGuideContent({
        content: {
          ...createMockGuideContent().content,
          introduction: '[Empty link text]()\n\n[](https://example.com)\n\n[Valid link](https://example.com)'
        }
      });

      const result = await validator.validateGuideContent(content);

      expect(result.errors.some(e => e.type === 'link')).toBe(true);
      expect(result.warnings.some(w => w.type === 'link')).toBe(true);
    });

    it('should check accessibility compliance', async () => {
      const content = createMockGuideContent({
        content: {
          ...createMockGuideContent().content,
          introduction: '![](image.jpg)\n\n![Alt text too short](image2.jpg)\n\n# Header 1\n\n### Header 3 (skipped level 2)'
        }
      });

      const result = await validator.validateGuideContent(content);

      expect(result.errors.some(e => e.type === 'accessibility')).toBe(true);
      expect(result.warnings.some(w => w.type === 'accessibility')).toBe(true);
    });

    it('should analyze readability', async () => {
      const longSentenceContent = 'This is an extremely long sentence that goes on and on and on and contains way too many words for good readability and should probably be broken up into smaller more digestible pieces for better user experience and comprehension.';
      
      const content = createMockGuideContent({
        content: {
          ...createMockGuideContent().content,
          introduction: longSentenceContent
        }
      });

      const result = await validator.validateGuideContent(content);

      expect(result.warnings.some(w => w.message.includes('sentence length'))).toBe(true);
    });

    it('should handle validation errors gracefully', async () => {
      // Create content that might cause validation to throw
      const content = createMockGuideContent({
        metadata: null as any
      });

      const result = await validator.validateGuideContent(content);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.score).toBe(0);
    });
  });

  describe('language-specific code validation', () => {
    it('should validate JavaScript code', async () => {
      const content = createMockGuideContent({
        content: {
          ...createMockGuideContent().content,
          codeSnippets: [
            {
              id: 'js-code',
              language: 'javascript',
              code: 'var oldStyle = "should use let/const";\nconsole.log("missing semicolon")',
              description: 'JavaScript with issues',
              runnable: false
            }
          ]
        }
      });

      const result = await validator.validateGuideContent(content);

      expect(result.warnings.some(w => w.message.includes('let') || w.message.includes('const'))).toBe(true);
      expect(result.warnings.some(w => w.message.includes('semicolon'))).toBe(true);
    });

    it('should validate TypeScript code', async () => {
      const content = createMockGuideContent({
        content: {
          ...createMockGuideContent().content,
          codeSnippets: [
            {
              id: 'ts-code',
              language: 'typescript',
              code: 'function test(param: any): any { return param; }',
              description: 'TypeScript with any types',
              runnable: false
            }
          ]
        }
      });

      const result = await validator.validateGuideContent(content);

      expect(result.warnings.some(w => w.message.includes('any'))).toBe(true);
    });

    it('should validate JSON code', async () => {
      const content = createMockGuideContent({
        content: {
          ...createMockGuideContent().content,
          codeSnippets: [
            {
              id: 'json-code',
              language: 'json',
              code: '{ "valid": true, "number": 42 }',
              description: 'Valid JSON',
              runnable: false
            },
            {
              id: 'invalid-json',
              language: 'json',
              code: '{ invalid: json }',
              description: 'Invalid JSON',
              runnable: false
            }
          ]
        }
      });

      const result = await validator.validateGuideContent(content);

      expect(result.errors.some(e => e.message.includes('JSON syntax'))).toBe(true);
    });

    it('should validate shell commands', async () => {
      const content = createMockGuideContent({
        content: {
          ...createMockGuideContent().content,
          codeSnippets: [
            {
              id: 'shell-code',
              language: 'bash',
              code: 'rm -rf /important/data\nsudo rm -rf /',
              description: 'Dangerous shell commands',
              runnable: false
            }
          ]
        }
      });

      const result = await validator.validateGuideContent(content);

      expect(result.warnings.some(w => w.message.includes('dangerous'))).toBe(true);
    });
  });

  describe('validation scoring', () => {
    it('should calculate appropriate scores based on errors and warnings', async () => {
      const perfectContent = createMockGuideContent();
      const perfectResult = await validator.validateGuideContent(perfectContent);

      const problematicContent = createMockGuideContent({
        metadata: {
          ...createMockGuideContent().metadata,
          title: '', // Error: -10 points
          tags: [] // Warning: -2 points
        },
        content: {
          ...createMockGuideContent().content,
          introduction: '####### Invalid header', // Error: -5 points
          codeSnippets: [
            {
              id: 'empty',
              language: 'javascript',
              code: '', // Error: -7 points
              description: 'Empty code',
              runnable: false
            }
          ]
        }
      });
      const problematicResult = await validator.validateGuideContent(problematicContent);

      expect(perfectResult.score).toBeGreaterThan(problematicResult.score);
      expect(problematicResult.score).toBeLessThan(80); // Should be significantly lower
    });
  });
});