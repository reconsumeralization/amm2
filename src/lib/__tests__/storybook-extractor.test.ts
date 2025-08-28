import { StorybookExtractor } from '../storybook-extractor';
import fs from 'fs';
import path from 'path';

// Mock fs module
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('StorybookExtractor', () => {
  let extractor: StorybookExtractor;

  beforeEach(() => {
    extractor = new StorybookExtractor('src/components', 'src/stories');
    jest.clearAllMocks();
  });

  describe('extractComponentDocumentation', () => {
    it('should extract documentation from component directories', async () => {
      // Mock directory structure
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync
        .mockReturnValueOnce([
          { name: 'ui', isDirectory: () => true } as any,
          { name: 'layout', isDirectory: () => true } as any,
        ])
        .mockReturnValueOnce([
          'Button.tsx',
          'Button.test.tsx',
          'index.ts',
        ] as any)
        .mockReturnValueOnce([
          'Header.tsx',
          'Header.stories.tsx',
        ] as any);

      // Mock file content
      const buttonContent = `
        /**
         * A versatile button component
         */
        interface ButtonProps {
          /** The button text */
          children: string;
          /** Button variant */
          variant?: 'primary' | 'secondary';
          /** Whether button is disabled */
          disabled?: boolean;
        }
        
        export function Button({ children, variant = 'primary', disabled = false }: ButtonProps) {
          return <button className="btn">{children}</button>;
        }
      `;

      mockFs.readFileSync.mockReturnValue(buttonContent);

      const documentation = await extractor.extractComponentDocumentation();

      expect(documentation).toHaveLength(2); // Button and Header
      expect(documentation[0].name).toBe('Button');
      expect(documentation[0].description).toBe('A versatile button component');
      expect(documentation[0].category).toBe('ui');
    });

    it('should handle extraction errors gracefully', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const documentation = await extractor.extractComponentDocumentation();

      expect(documentation).toEqual([]);
    });
  });

  describe('extractFromComponent', () => {
    it('should extract component name from file path', () => {
      const extractor = new StorybookExtractor();
      const componentName = (extractor as any).extractComponentName('src/components/ui/Button.tsx');
      
      expect(componentName).toBe('Button');
    });

    it('should determine correct category from file path', () => {
      const extractor = new StorybookExtractor();
      
      expect((extractor as any).determineCategory('src/components/ui/Button.tsx')).toBe('ui');
      expect((extractor as any).determineCategory('src/components/layout/Header.tsx')).toBe('layout');
      expect((extractor as any).determineCategory('src/components/charts/Chart.tsx')).toBe('charts');
      expect((extractor as any).determineCategory('src/components/other/Component.tsx')).toBe('ui');
    });

    it('should extract description from JSDoc comments', () => {
      const extractor = new StorybookExtractor();
      const content = `
        /**
         * This is a test component
         */
        export function TestComponent() {}
      `;
      
      const description = (extractor as any).extractDescription(content);
      expect(description).toBe('This is a test component');
    });

    it('should extract props from TypeScript interface', () => {
      const extractor = new StorybookExtractor();
      const content = `
        interface TestProps {
          title: string;
          count?: number;
          enabled: boolean;
        }
      `;
      
      const props = (extractor as any).extractProps(content);
      
      expect(props).toHaveLength(3);
      expect(props[0]).toEqual({
        name: 'title',
        type: 'string',
        description: 'title property',
        required: true,
        defaultValue: undefined,
        examples: ['example text', 'another example'],
      });
      expect(props[1]).toEqual({
        name: 'count',
        type: 'number',
        description: 'count property',
        required: false,
        defaultValue: undefined,
        examples: [0, 1, 100],
      });
    });
  });

  describe('extractDesignTokens', () => {
    it('should extract design tokens from Tailwind classes', () => {
      const extractor = new StorybookExtractor();
      const content = `
        <div className="text-blue-500 bg-gray-100 border-red-300">
          Content
        </div>
      `;
      
      const tokens = (extractor as any).extractDesignTokens(content);
      
      expect(tokens).toContainEqual({
        name: 'text-blue-500',
        value: 'var(--text-blue-500)',
        category: 'typography',
        description: 'Design token for text-blue-500',
      });
      expect(tokens).toContainEqual({
        name: 'bg-gray-100',
        value: 'var(--bg-gray-100)',
        category: 'color',
        description: 'Design token for bg-gray-100',
      });
    });
  });

  describe('extractAccessibilityGuidelines', () => {
    it('should detect ARIA attributes', () => {
      const extractor = new StorybookExtractor();
      const content = `
        <button aria-label="Close dialog" role="button">
          Close
        </button>
      `;
      
      const guidelines = (extractor as any).extractAccessibilityGuidelines(content);
      
      expect(guidelines).toContainEqual({
        rule: 'ARIA attributes',
        description: 'Component uses ARIA attributes for accessibility',
        wcagLevel: 'AA',
        implementation: 'ARIA attributes are properly implemented',
      });
      expect(guidelines).toContainEqual({
        rule: 'Semantic roles',
        description: 'Component defines semantic roles',
        wcagLevel: 'A',
        implementation: 'Semantic roles are defined for screen readers',
      });
    });
  });

  describe('extractRelatedComponents', () => {
    it('should extract related components from imports', () => {
      const extractor = new StorybookExtractor();
      const content = `
        import { Button } from '@/components/ui/Button';
        import { Card } from '@/components/ui/Card';
        import { Icon } from '@/components/ui/Icon';
      `;
      
      const related = (extractor as any).extractRelatedComponents(content);
      
      expect(related).toContain('Button');
      expect(related).toContain('Card');
      expect(related).toContain('Icon');
    });
  });

  describe('generatePropExamples', () => {
    it('should generate appropriate examples for different types', () => {
      const extractor = new StorybookExtractor();
      
      expect((extractor as any).generatePropExamples('string')).toContain('example text');
      expect((extractor as any).generatePropExamples('number')).toContain(0);
      expect((extractor as any).generatePropExamples('boolean')).toContain(true);
      expect((extractor as any).generatePropExamples('"primary" | "secondary"')).toContain('primary');
    });
  });

  describe('extractDesignSystemDocumentation', () => {
    it('should extract complete design system documentation', async () => {
      // Mock component extraction
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync
        .mockReturnValueOnce([
          { name: 'ui', isDirectory: () => true } as any,
        ])
        .mockReturnValueOnce(['Button.tsx'] as any);

      const buttonContent = `
        interface ButtonProps {
          children: string;
        }
        export function Button({ children }: ButtonProps) {
          return <button className="text-blue-500">{children}</button>;
        }
      `;

      mockFs.readFileSync.mockReturnValue(buttonContent);

      const documentation = await extractor.extractDesignSystemDocumentation();

      expect(documentation).toHaveProperty('components');
      expect(documentation).toHaveProperty('designTokens');
      expect(documentation).toHaveProperty('guidelines');
      expect(documentation).toHaveProperty('relationships');
      
      expect(documentation.guidelines).toEqual({
        spacing: 'Use consistent spacing scale based on 4px grid',
        typography: 'Follow type scale with proper hierarchy',
        colors: 'Use semantic color tokens for consistency',
        accessibility: 'Ensure WCAG AA compliance for all components',
      });
    });
  });

  describe('buildComponentRelationships', () => {
    it('should build component relationships correctly', () => {
      const extractor = new StorybookExtractor();
      const components = [
        {
          id: 'ui-button',
          name: 'Button',
          category: 'ui' as const,
          relatedComponents: ['Icon', 'Spinner'],
          description: 'Test button',
          props: [],
          examples: [],
          designTokens: [],
          accessibilityGuidelines: [],
          storybook: {
            storiesPath: '',
            playgroundUrl: '',
            variants: [],
          },
        },
      ];
      
      const relationships = (extractor as any).buildComponentRelationships(components);
      
      expect(relationships).toHaveLength(1);
      expect(relationships[0]).toEqual({
        parent: 'Button',
        children: [],
        dependencies: ['Icon', 'Spinner'],
        usagePatterns: ['Used in ui contexts'],
      });
    });
  });
});