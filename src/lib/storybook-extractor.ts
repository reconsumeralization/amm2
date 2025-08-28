import {
  ComponentCategory,
  ComponentDocumentation,
  ComponentExample,
  ComponentProp,
  DesignSystemDocumentation,
} from "@/types/storybook-integration";
import fs from "fs";
import path from "path";

// Mark this module as server-side only
export const isServer = typeof window === 'undefined';

export class StorybookExtractor {
  private componentsPath: string;
  private storiesPath: string;

  constructor(componentsPath = "src/components", storiesPath = "src/stories") {
    this.componentsPath = componentsPath;
    this.storiesPath = storiesPath;
  }

  /**
   * Extract component documentation from Storybook stories
   */
  async extractComponentDocumentation(): Promise<ComponentDocumentation[]> {
    const components: ComponentDocumentation[] = [];

    try {
      const componentDirs = await this.getComponentDirectories();

      for (const dir of componentDirs) {
        const componentDocs = await this.extractFromDirectory(dir);
        components.push(...componentDocs);
      }

      return components;
    } catch (error) {
      console.error("Error extracting component documentation:", error);
      return [];
    }
  }

  /**
   * Get all component directories
   */
  private async getComponentDirectories(): Promise<string[]> {
    const dirs: string[] = [];

    const scanDirectory = (dirPath: string) => {
      if (!fs.existsSync(dirPath)) return;

    const items = fs.readdirSync(dirPath);

    for (const name of items) {
      const fullPath = path.join(dirPath, name);
      if (fs.statSync(fullPath).isDirectory() && !name.startsWith(".") && name !== "__tests__") {
        dirs.push(fullPath);
        scanDirectory(fullPath); // Recursive scan
      }
    }
    };

    scanDirectory(this.componentsPath);
    return dirs;
  }

  /**
   * Extract documentation from a specific directory
   */
  private async extractFromDirectory(
    dirPath: string,
  ): Promise<ComponentDocumentation[]> {
    const components: ComponentDocumentation[] = [];

    if (!fs.existsSync(dirPath)) return components;

    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      if (
        file.endsWith(".tsx") && !file.endsWith(".test.tsx") &&
        !file.endsWith(".stories.tsx")
      ) {
        const componentDoc = await this.extractFromComponent(
          path.join(dirPath, file),
        );
        if (componentDoc) {
          components.push(componentDoc);
        }
      }
    }

    return components;
  }

  /**
   * Extract documentation from a single component file
   */
  private async extractFromComponent(
    filePath: string,
  ): Promise<ComponentDocumentation | null> {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const componentName = this.extractComponentName(filePath);
      const category = this.determineCategory(filePath);

      return {
        id: this.generateId(componentName, category),
        name: componentName,
        description: this.extractDescription(content),
        category,
        props: this.extractProps(content),
        examples: await this.extractExamples(componentName, filePath),
        designTokens: this.extractDesignTokens(content),
        accessibilityGuidelines: this.extractAccessibilityGuidelines(content),
        relatedComponents: this.extractRelatedComponents(content),
        storybook: {
          storiesPath: this.getStoriesPath(componentName),
          playgroundUrl: this.getPlaygroundUrl(componentName),
          variants: await this.extractVariants(componentName),
        },
      };
    } catch (error) {
      console.error(
        `Error extracting component documentation from ${filePath}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Extract component name from file path
   */
  private extractComponentName(filePath: string): string {
    const fileName = path.basename(filePath, ".tsx");
    return fileName.charAt(0).toUpperCase() + fileName.slice(1);
  }

  /**
   * Determine component category based on file path
   */
  private determineCategory(filePath: string): ComponentCategory {
    const pathParts = filePath.split(/[/\\]/); // Handle both Unix and Windows paths

    if (pathParts.includes("ui")) return "ui";
    if (pathParts.includes("layout")) return "layout";
    if (pathParts.includes("charts")) return "charts";
    if (pathParts.includes("admin")) return "admin";
    if (pathParts.includes("documentation")) return "documentation";
    if (pathParts.includes("sections")) return "data-display";

    return "ui"; // Default category
  }

  /**
   * Extract component description from JSDoc comments
   */
  private extractDescription(content: string): string {
    const jsdocMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.+?)\s*\n\s*\*\//);
    if (jsdocMatch) {
      return jsdocMatch[1].trim();
    }

    // Fallback: look for component comment
    const commentMatch = content.match(
      /\/\/\s*(.+?)\n[\s\S]*?export.*?function/,
    );
    if (commentMatch) {
      return commentMatch[1].trim();
    }

    return "Component description not available";
  }

  /**
   * Extract component props from TypeScript interface
   */
  private extractProps(content: string): ComponentProp[] {
    const props: ComponentProp[] = [];

    // Extract interface definitions
    const interfaceMatches = content.matchAll(
      /interface\s+(\w+Props)\s*{([^}]+)}/g,
    );

    for (const match of Array.from(interfaceMatches)) {
      const interfaceBody = match[2];
      const propMatches = interfaceBody.matchAll(/(\w+)(\?)?:\s*([^;]+);?/g);

      for (const propMatch of Array.from(propMatches)) {
        const [, name, optional, type] = propMatch;
        props.push({
          name,
          type: type.trim(),
          description: this.extractPropDescription(content, name),
          required: !optional,
          defaultValue: this.extractDefaultValue(content, name),
          examples: this.generatePropExamples(type.trim()),
        });
      }
    }

    return props;
  }

  /**
   * Extract prop description from comments
   */
  private extractPropDescription(content: string, propName: string): string {
    const commentPattern = new RegExp(`//\\s*(.+?)\\n\\s*${propName}`, "i");
    const match = content.match(commentPattern);
    return match ? match[1].trim() : `${propName} property`;
  }

  /**
   * Extract default value for a prop
   */
  private extractDefaultValue(content: string, propName: string): any {
    const defaultPattern = new RegExp(`${propName}\\s*=\\s*([^,}]+)`, "i");
    const match = content.match(defaultPattern);
    if (match) {
      const value = match[1].trim();
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return undefined;
  }

  /**
   * Generate example values for prop types
   */
  private generatePropExamples(type: string): any[] {
    const examples: any[] = [];

    if (type.includes("string")) {
      examples.push("example text", "another example");
    }
    if (type.includes("number")) {
      examples.push(0, 1, 100);
    }
    if (type.includes("boolean")) {
      examples.push(true, false);
    }
    if (type.includes("|")) {
      const unionTypes = type.split("|").map((t) =>
        t.trim().replace(/['"]/g, "")
      );
      examples.push(...unionTypes.slice(0, 3));
    }

    return examples;
  }

  /**
   * Extract examples from component usage
   */
  private async extractExamples(
    componentName: string,
    filePath: string,
  ): Promise<ComponentExample[]> {
    const examples: ComponentExample[] = [];

    // Look for stories file
    const storiesPath = this.getStoriesPath(componentName);
    if (fs.existsSync(storiesPath)) {
      const storiesContent = fs.readFileSync(storiesPath, "utf-8");
      const storyMatches = storiesContent.matchAll(
        /export\s+const\s+(\w+)\s*=\s*{([^}]+)}/g,
      );

      for (const match of Array.from(storyMatches)) {
        const [, storyName, storyConfig] = match;
        examples.push({
          id: `${componentName}-${storyName}`,
          title: this.formatStoryName(storyName),
          description: `${storyName} variant of ${componentName}`,
          code: this.generateExampleCode(componentName, storyConfig),
          preview:
            `storybook-iframe:${componentName}--${storyName.toLowerCase()}`,
          interactive: true,
          props: this.parseStoryProps(storyConfig),
        });
      }
    }

    return examples;
  }

  /**
   * Format story name for display
   */
  private formatStoryName(storyName: string): string {
    return storyName.replace(/([A-Z])/g, " $1").trim();
  }

  /**
   * Generate example code from story configuration
   */
  private generateExampleCode(
    componentName: string,
    storyConfig: string,
  ): string {
    const props = this.parseStoryProps(storyConfig);
    const propsString = Object.entries(props)
      .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
      .join(" ");

    return `<${componentName} ${propsString} />`;
  }

  /**
   * Parse props from story configuration
   */
  private parseStoryProps(storyConfig: string): Record<string, any> {
    const props: Record<string, any> = {};

    try {
      // Simple parsing - in a real implementation, you'd use a proper parser
      const argsMatch = storyConfig.match(/args:\s*{([^}]+)}/);
      if (argsMatch) {
        const argsString = argsMatch[1];
        const propMatches = argsString.matchAll(/(\w+):\s*([^,]+)/g);

        for (const match of Array.from(propMatches)) {
          const [, key, value] = match;
          try {
            props[key] = JSON.parse(value.trim());
          } catch {
            props[key] = value.trim().replace(/['"]/g, "");
          }
        }
      }
    } catch (error) {
      console.error("Error parsing story props:", error);
    }

    return props;
  }

  /**
   * Extract design tokens from component
   */
  private extractDesignTokens(content: string): any[] {
    const tokens: any[] = [];

    // Extract Tailwind classes and map to design tokens
    const classMatches = content.matchAll(/className.*?["']([^"']+)["']/g);

    for (const match of Array.from(classMatches)) {
      const classes = match[1].split(" ");
      for (const cls of classes) {
        if (
          cls.startsWith("text-") || cls.startsWith("bg-") ||
          cls.startsWith("border-")
        ) {
          tokens.push({
            name: cls,
            value: this.getTokenValue(cls),
            category: this.getTokenCategory(cls),
            description: `Design token for ${cls}`,
          });
        }
      }
    }

    return Array.from(new Set(tokens)); // Remove duplicates
  }

  /**
   * Get design token value
   */
  private getTokenValue(token: string): string {
    // This would typically map to your design system values
    return `var(--${token})`;
  }

  /**
   * Get design token category
   */
  private getTokenCategory(token: string): string {
    if (token.startsWith("text-")) return "typography";
    if (token.startsWith("bg-")) return "color";
    if (token.startsWith("border-")) return "border";
    if (token.startsWith("p-") || token.startsWith("m-")) return "spacing";
    return "other";
  }

  /**
   * Extract accessibility guidelines
   */
  private extractAccessibilityGuidelines(content: string): any[] {
    const guidelines: any[] = [];

    // Look for accessibility-related attributes and patterns
    if (content.includes("aria-")) {
      guidelines.push({
        rule: "ARIA attributes",
        description: "Component uses ARIA attributes for accessibility",
        wcagLevel: "AA",
        implementation: "ARIA attributes are properly implemented",
      });
    }

    if (content.includes("role=")) {
      guidelines.push({
        rule: "Semantic roles",
        description: "Component defines semantic roles",
        wcagLevel: "A",
        implementation: "Semantic roles are defined for screen readers",
      });
    }

    return guidelines;
  }

  /**
   * Extract related components
   */
  private extractRelatedComponents(content: string): string[] {
    const related: string[] = [];

    // Extract import statements to find related components
    const importMatches = content.matchAll(
      /import.*?from\s+['"]@\/components\/([^'"]+)['"]/g,
    );

    for (const match of Array.from(importMatches)) {
      const componentPath = match[1];
      const componentName = path.basename(componentPath);
      if (componentName !== "index") {
        related.push(componentName);
      }
    }

    return related;
  }

  /**
   * Get stories file path for component
   */
  private getStoriesPath(componentName: string): string {
    return path.join(this.storiesPath, `${componentName}.stories.tsx`);
  }

  /**
   * Get playground URL for component
   */
  private getPlaygroundUrl(componentName: string): string {
    return `/storybook/?path=/story/${componentName.toLowerCase()}--playground`;
  }

  /**
   * Extract component variants from stories
   */
  private async extractVariants(componentName: string): Promise<any[]> {
    const variants: any[] = [];
    const storiesPath = this.getStoriesPath(componentName);

    if (fs.existsSync(storiesPath)) {
      const content = fs.readFileSync(storiesPath, "utf-8");
      const storyMatches = content.matchAll(
        /export\s+const\s+(\w+)\s*=\s*{([^}]+)}/g,
      );

      for (const match of Array.from(storyMatches)) {
        const [, storyName, storyConfig] = match;
        variants.push({
          name: this.formatStoryName(storyName),
          description: `${storyName} variant`,
          props: this.parseStoryProps(storyConfig),
          storyId: `${componentName}--${storyName.toLowerCase()}`,
        });
      }
    }

    return variants;
  }

  /**
   * Generate unique ID for component
   */
  private generateId(name: string, category: ComponentCategory): string {
    return `${category}-${name.toLowerCase()}`;
  }

  /**
   * Extract complete design system documentation
   */
  async extractDesignSystemDocumentation(): Promise<DesignSystemDocumentation> {
    const components = await this.extractComponentDocumentation();

    return {
      components,
      designTokens: this.extractAllDesignTokens(components),
      guidelines: {
        spacing: "Use consistent spacing scale based on 4px grid",
        typography: "Follow type scale with proper hierarchy",
        colors: "Use semantic color tokens for consistency",
        accessibility: "Ensure WCAG AA compliance for all components",
      },
      relationships: this.buildComponentRelationships(components),
    };
  }

  /**
   * Extract all design tokens from components
   */
  private extractAllDesignTokens(components: ComponentDocumentation[]): any[] {
    const allTokens: any[] = [];

    for (const component of components) {
      allTokens.push(...component.designTokens);
    }

    // Remove duplicates and sort
    return Array.from(new Set(allTokens)).sort((a: any, b: any) => a.name.localeCompare(b.name));
  }

  /**
   * Build component relationships
   */
  private buildComponentRelationships(
    components: ComponentDocumentation[],
  ): any[] {
    const relationships: any[] = [];

    for (const component of components) {
      relationships.push({
        parent: component.name,
        children: [],
        dependencies: component.relatedComponents,
        usagePatterns: [`Used in ${component.category} contexts`],
      });
    }

    return relationships;
  }
}
