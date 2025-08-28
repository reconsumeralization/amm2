export interface ComponentDocumentation {
  id: string;
  name: string;
  description: string;
  category: ComponentCategory;
  props: ComponentProp[];
  examples: ComponentExample[];
  designTokens: DesignToken[];
  accessibilityGuidelines: AccessibilityGuideline[];
  relatedComponents: string[];
  storybook: {
    storiesPath: string;
    playgroundUrl: string;
    variants: ComponentVariant[];
  };
}

export interface ComponentProp {
  name: string;
  type: string;
  description: string;
  required: boolean;
  defaultValue?: any;
  examples: any[];
}

export interface ComponentExample {
  id: string;
  title: string;
  description: string;
  code: string;
  preview: string;
  interactive: boolean;
  props: Record<string, any>;
}

export interface ComponentVariant {
  name: string;
  description: string;
  props: Record<string, any>;
  storyId: string;
}

export interface DesignToken {
  name: string;
  value: string;
  category: 'color' | 'spacing' | 'typography' | 'shadow' | 'border';
  description: string;
}

export interface AccessibilityGuideline {
  rule: string;
  description: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
  implementation: string;
}

export type ComponentCategory = 
  | 'ui'
  | 'layout' 
  | 'forms'
  | 'navigation'
  | 'feedback'
  | 'data-display'
  | 'documentation'
  | 'charts'
  | 'admin';

export interface StorybookIntegrationConfig {
  baseUrl: string;
  apiEndpoint: string;
  extractionEnabled: boolean;
  playgroundEnabled: boolean;
  designSystemIntegration: boolean;
}

export interface ComponentPlaygroundProps {
  componentName: string;
  initialProps: Record<string, any>;
  availableProps: ComponentProp[];
  codeGeneration: boolean;
  livePreview: boolean;
}

export interface DesignSystemDocumentation {
  components: ComponentDocumentation[];
  designTokens: DesignToken[];
  guidelines: {
    spacing: string;
    typography: string;
    colors: string;
    accessibility: string;
  };
  relationships: ComponentRelationship[];
}

export interface ComponentRelationship {
  parent: string;
  children: string[];
  dependencies: string[];
  usagePatterns: string[];
}