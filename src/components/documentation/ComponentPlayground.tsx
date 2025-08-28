'use client';

import React, { useState, useEffect } from 'react';
import { ComponentPlaygroundProps, ComponentProp } from '@/types/storybook-integration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Play, RefreshCw } from '@/lib/icon-mapping';
import { toast } from 'sonner';

// Client-side service for fetching documentation
class ClientStorybookService {
  private static async fetchFromAPI(endpoint: string, params?: Record<string, string>) {
    const url = new URL('/api/storybook', window.location.origin)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.rchParams.set(key, value)
      })
    }

    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }
    return response.json()
  }

  static async getComponentDocumentation(componentName: string) {
    try {
      const result = await this.fetchFromAPI('', { component: componentName })
      return result.success ? result.data : null
    } catch (error) {
      console.error('Failed to fetch component documentation:', error)
      return null
    }
  }

  static async getComponentsByCategory(category: string) {
    try {
      const result = await this.fetchFromAPI('', { category })
      return result.success ? result.data : []
    } catch (error) {
      console.error('Failed to fetch components by category:', error)
      return []
    }
  }

  static async rchComponents(query: string) {
    try {
      const result = await this.fetchFromAPI('', { query })
      return result.success ? result.data : []
    } catch (error) {
      console.error('Failed to rch components:', error)
      return []
    }
  }

  static async getAllDocumentation() {
    try {
      const result = await this.fetchFromAPI('')
      return result.success ? result.data : { components: [], designTokens: [], guidelines: {}, relationships: [] }
    } catch (error) {
      console.error('Failed to fetch documentation:', error)
      return { components: [], designTokens: [], guidelines: {}, relationships: [] }
    }
  }
}

interface ComponentPlaygroundState {
  props: Record<string, any>;
  generatedCode: string;
  previewKey: number;
}

export function ComponentPlayground({
  componentName,
  initialProps,
  availableProps,
  codeGeneration = true,
  livePreview = true,
}: ComponentPlaygroundProps) {
  const [state, setState] = useState<ComponentPlaygroundState>({
    props: initialProps,
    generatedCode: '',
    previewKey: 0,
  });

  useEffect(() => {
    if (codeGeneration) {
      setState(prev => ({
        ...prev,
        generatedCode: generateComponentCode(componentName, prev.props),
      }));
    }
  }, [state.props, componentName, codeGeneration]);

  const updateProp = (propName: string, value: any) => {
    setState(prev => ({
      ...prev,
      props: {
        ...prev.props,
        [propName]: value,
      },
    }));
  };

  const resetProps = () => {
    setState(prev => ({
      ...prev,
      props: initialProps,
      previewKey: prev.previewKey + 1,
    }));
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(state.generatedCode);
      toast.success('Code copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  const renderPropControl = (prop: ComponentProp) => {
    const currentValue = state.props[prop.name] ?? prop.defaultValue;

    if (prop.type === 'boolean') {
      return (
        <div className="flex items-center space-x-2">
          <Switch
            id={prop.name}
            checked={currentValue}
            onCheckedChange={(checked) => updateProp(prop.name, checked)}
          />
          <Label htmlFor={prop.name}>{prop.name}</Label>
          {prop.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
        </div>
      );
    }

    if (prop.type.includes('|') && prop.examples.length > 0) {
      return (
        <div className="space-y-2">
          <Label htmlFor={prop.name}>
            {prop.name}
            {prop.required && <Badge variant="destructive" className="ml-2 text-xs">Required</Badge>}
          </Label>
          <Select value={currentValue} onValueChange={(value) => updateProp(prop.name, value)}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${prop.name}`} />
            </SelectTrigger>
            <SelectContent>
              {prop.examples.map((example, index) => (
                <SelectItem key={index} value={String(example)}>
                  {String(example)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (prop.type === 'number') {
      return (
        <div className="space-y-2">
          <Label htmlFor={prop.name}>
            {prop.name}
            {prop.required && <Badge variant="destructive" className="ml-2 text-xs">Required</Badge>}
          </Label>
          <Input
            id={prop.name}
            type="number"
            value={currentValue || ''}
            onChange={(e) => updateProp(prop.name, Number(e.target.value))}
            placeholder={`Enter ${prop.name}`}
          />
        </div>
      );
    }

    // Default to string input
    return (
      <div className="space-y-2">
        <Label htmlFor={prop.name}>
          {prop.name}
          {prop.required && <Badge variant="destructive" className="ml-2 text-xs">Required</Badge>}
        </Label>
        <Input
          id={prop.name}
          type="text"
          value={currentValue || ''}
          onChange={(e) => updateProp(prop.name, e.target.value)}
          placeholder={`Enter ${prop.name}`}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{componentName} Playground</h3>
        <Button variant="outline" size="sm" onClick={resetProps}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      <Tabs defaultValue="playground" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="playground">Playground</TabsTrigger>
          <TabsTrigger value="props">Props</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>

        <TabsContent value="playground" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {availableProps.map((prop) => (
                  <div key={prop.name}>
                    {renderPropControl(prop)}
                    {prop.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {prop.description}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Preview */}
            {livePreview && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-background">
                    <ComponentPreview
                      key={state.previewKey}
                      componentName={componentName}
                      props={state.props}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="props" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Component Props</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableProps.map((prop) => (
                  <div key={prop.name} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {prop.name}
                      </code>
                      <Badge variant={prop.required ? "destructive" : "secondary"}>
                        {prop.required ? "Required" : "Optional"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {prop.description}
                    </p>
                    <div className="text-sm">
                      <strong>Type:</strong> <code className="bg-muted px-1 rounded">{prop.type}</code>
                    </div>
                    {prop.defaultValue !== undefined && (
                      <div className="text-sm">
                        <strong>Default:</strong> <code className="bg-muted px-1 rounded">
                          {JSON.stringify(prop.defaultValue)}
                        </code>
                      </div>
                    )}
                    {prop.examples.length > 0 && (
                      <div className="text-sm">
                        <strong>Examples:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {prop.examples.map((example, index) => (
                            <code key={index} className="bg-muted px-1 rounded text-xs">
                              {JSON.stringify(example)}
                            </code>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code" className="space-y-4">
          {codeGeneration && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Generated Code</CardTitle>
                <Button variant="outline" size="sm" onClick={copyCode}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{state.generatedCode}</code>
                </pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Component Preview wrapper
function ComponentPreview({ componentName, props }: { componentName: string; props: Record<string, any> }) {
  // This would dynamically render the component based on componentName
  // For now, we'll show a placeholder
  return (
    <div className="flex items-center justify-center p-8 text-muted-foreground">
      <div className="text-center">
        <div className="text-lg font-semibold mb-2">{componentName}</div>
        <div className="text-sm">
          Preview with props: {JSON.stringify(props, null, 2)}
        </div>
        <div className="text-xs mt-2 text-muted-foreground">
          Live preview would render the actual component here
        </div>
      </div>
    </div>
  );
}

// Helper function to generate component code
function generateComponentCode(componentName: string, props: Record<string, any>): string {
  const propsString = Object.entries(props)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return `${key}="${value}"`;
      }
      if (typeof value === 'boolean') {
        return value ? key : `${key}={false}`;
      }
      return `${key}={${JSON.stringify(value)}}`;
    })
    .join('\n  ');

  if (propsString) {
    return `<${componentName}\n  ${propsString}\n/>`;
  }

  return `<${componentName} />`;
}