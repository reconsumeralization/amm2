import { ComponentDocumentation, DesignSystemDocumentation, StorybookIntegrationConfig } from '@/types/storybook-integration';

// Dynamic import for server-side only functionality
const getStorybookExtractor = async () => {
  if (typeof window === 'undefined') {
    const { StorybookExtractor } = await import('./storybook-extractor');
    return StorybookExtractor;
  }
  throw new Error('StorybookExtractor can only be used on the server side');
};

export class StorybookIntegrationService {
  private extractor: any;
  private config: StorybookIntegrationConfig;

  constructor(config: StorybookIntegrationConfig) {
    this.config = config;
    this.initializeExtractor();
  }

  private async initializeExtractor() {
    if (typeof window === 'undefined') {
      const StorybookExtractor = await getStorybookExtractor();
      this.extractor = new StorybookExtractor();
    }
  }

  /**
   * Initialize Storybook integration
   */
  async initialize(): Promise<void> {
    try {
      console.log('Initializing Storybook integration...');
      
      if (this.config.extractionEnabled) {
        await this.extractDocumentation();
      }
      
      console.log('Storybook integration initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Storybook integration:', error);
      throw error;
    }
  }

  /**
   * Extract all component documentation
   */
  async extractDocumentation(): Promise<DesignSystemDocumentation> {
    try {
      if (!this.extractor) {
        await this.initializeExtractor();
      }

      const documentation = await this.extractor.extractDesignSystemDocumentation();

      // Cache the documentation for performance (server-side only)
      if (typeof window === 'undefined') {
        // In a real implementation, you might cache this in a database or Redis
        console.log('Documentation extracted successfully');
      }

      return documentation;
    } catch (error) {
      console.error('Failed to extract documentation:', error);
      // Return empty documentation on error
      return {
        components: [],
        designTokens: [],
        guidelines: {
          spacing: "Use consistent spacing scale based on 4px grid",
          typography: "Follow type scale with proper hierarchy",
          colors: "Use semantic color tokens for consistency",
          accessibility: "Ensure WCAG AA compliance for all components",
        },
        relationships: [],
      };
    }
  }

  /**
   * Get cached documentation or extract fresh
   */
  async getDocumentation(forceRefresh = false): Promise<DesignSystemDocumentation> {
    // Server-side only - no caching in localStorage for client components
    if (typeof window === 'undefined' || forceRefresh) {
      return this.extractDocumentation();
    }

    // For client-side, we'll need to fetch from an API route
    // This is handled by the API route we'll create
    return this.extractDocumentation();
  }

  /**
   * Get component documentation by name
   */
  async getComponentDocumentation(componentName: string): Promise<ComponentDocumentation | null> {
    const documentation = await this.getDocumentation();
    return documentation.components.find(c => c.name === componentName) || null;
  }

  /**
   * rch components by query
   */
  async rchComponents(query: string): Promise<ComponentDocumentation[]> {
    const documentation = await this.getDocumentation();
    const lowercaseQuery = query.toLowerCase();
    
    return documentation.components.filter(component => 
      component.name.toLowerCase().includes(lowercaseQuery) ||
      component.description.toLowerCase().includes(lowercaseQuery) ||
      component.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Get components by category
   */
  async getComponentsByCategory(category: string): Promise<ComponentDocumentation[]> {
    const documentation = await this.getDocumentation();
    return documentation.components.filter(c => c.category === category);
  }

  /**
   * Generate Storybook URL for component
   */
  getStorybookUrl(componentName: string, storyName?: string): string {
    const baseUrl = this.config.baseUrl;
    const path = storyName 
      ? `/story/${componentName.toLowerCase()}--${storyName.toLowerCase()}`
      : `/docs/${componentName.toLowerCase()}`;
    
    return `${baseUrl}${path}`;
  }

  /**
   * Generate playground URL for component
   */
  getPlaygroundUrl(componentName: string): string {
    return this.getStorybookUrl(componentName, 'playground');
  }

  /**
   * Validate Storybook integration
   */
  async validateIntegration(): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check if Storybook is accessible
      if (this.config.baseUrl) {
        try {
          const response = await fetch(`${this.config.baseUrl}/iframe.html`);
          if (!response.ok) {
            errors.push('Storybook is not accessible at the configured URL');
          }
        } catch (error) {
          warnings.push('Could not verify Storybook accessibility (might be expected in development)');
        }
      }

      // Check if documentation can be extracted
      try {
        const documentation = await this.getDocumentation();
        if (documentation.components.length === 0) {
          warnings.push('No components found in documentation extraction');
        }
      } catch (error) {
        errors.push('Failed to extract component documentation');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      errors.push(`Validation failed: ${error}`);
      return {
        isValid: false,
        errors,
        warnings,
      };
    }
  }

  /**
   * Generate component usage examples
   */
  async generateUsageExamples(componentName: string): Promise<string[]> {
    const component = await this.getComponentDocumentation(componentName);
    if (!component) return [];

    const examples: string[] = [];

    // Generate basic usage
    const basicProps = component.props
      .filter(p => p.required)
      .map(p => `${p.name}="${p.examples[0] || 'value'}"`)
      .join(' ');
    
    examples.push(`<${componentName} ${basicProps} />`);

    // Generate examples from stories
    component.examples.forEach(example => {
      examples.push(example.code);
    });

    return examples;
  }

  /**
   * Get component accessibility information
   */
  async getAccessibilityInfo(componentName: string): Promise<{
    guidelines: any[];
    wcagLevel: string;
    recommendations: string[];
  }> {
    const component = await this.getComponentDocumentation(componentName);
    if (!component) {
      return {
        guidelines: [],
        wcagLevel: 'Unknown',
        recommendations: [],
      };
    }

    const wcagLevels = component.accessibilityGuidelines.map(g => g.wcagLevel);
    const highestLevel = wcagLevels.includes('AAA') ? 'AAA' : 
                        wcagLevels.includes('AA') ? 'AA' : 
                        wcagLevels.includes('A') ? 'A' : 'Unknown';

    const recommendations = [
      'Test with screen readers',
      'Verify keyboard navigation',
      'Check color contrast ratios',
      'Validate ARIA attributes',
    ];

    return {
      guidelines: component.accessibilityGuidelines,
      wcagLevel: highestLevel,
      recommendations,
    };
  }

  /**
   * Export documentation as JSON
   */
  async exportDocumentation(): Promise<string> {
    const documentation = await this.getDocumentation();
    return JSON.stringify(documentation, null, 2);
  }

  /**
   * Get component statistics
   */
  async getComponentStats(): Promise<{
    totalComponents: number;
    componentsByCategory: Record<string, number>;
    totalProps: number;
    totalExamples: number;
    accessibilityCompliance: {
      total: number;
      compliant: number;
      percentage: number;
    };
  }> {
    const documentation = await this.getDocumentation();
    
    const componentsByCategory: Record<string, number> = {};
    let totalProps = 0;
    let totalExamples = 0;
    let accessibilityCompliant = 0;

    documentation.components.forEach(component => {
      componentsByCategory[component.category] = (componentsByCategory[component.category] || 0) + 1;
      totalProps += component.props.length;
      totalExamples += component.examples.length;
      
      if (component.accessibilityGuidelines.length > 0) {
        accessibilityCompliant++;
      }
    });

    return {
      totalComponents: documentation.components.length,
      componentsByCategory,
      totalProps,
      totalExamples,
      accessibilityCompliance: {
        total: documentation.components.length,
        compliant: accessibilityCompliant,
        percentage: documentation.components.length > 0 
          ? Math.round((accessibilityCompliant / documentation.components.length) * 100)
          : 0,
      },
    };
  }
}

// Default configuration
export const defaultStorybookConfig: StorybookIntegrationConfig = {
  baseUrl: 'http://localhost:6006',
  apiEndpoint: '/api/storybook',
  extractionEnabled: true,
  playgroundEnabled: true,
  designSystemIntegration: true,
};

// Create default service instance
export const storybookService = new StorybookIntegrationService(defaultStorybookConfig);