'use client';

import React, { useState } from 'react';
import { DesignSystemDocumentation, ComponentDocumentation, ComponentCategory } from '@/types/storybook-integration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { rch, Component, Palette, Type, Accessibility, GitBranch, ExternalLink, Eye, Code } from '@/lib/icon-mapping';

interface DesignSystemDocsProps {
  documentation: DesignSystemDocumentation;
  onComponentSelect?: (component: ComponentDocumentation) => void;
  onPlaygroundOpen?: (componentName: string) => void;
}

export function DesignSystemDocs({ 
  documentation, 
  onComponentSelect,
  onPlaygroundOpen 
}: DesignSystemDocsProps) {
  const [rchQuery, setrchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | 'all'>('all');
  const [selectedComponent, setSelectedComponent] = useState<ComponentDocumentation | null>(null);

  const filteredComponents = documentation.components.filter(component => {
    const matchesrch = component.name.toLowerCase().includes(rchQuery.toLowerCase()) ||
                         component.description.toLowerCase().includes(rchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
    return matchesrch && matchesCategory;
  });

  const categories = Array.from(new Set(documentation.components.map(c => c.category)));

  const handleComponentClick = (component: ComponentDocumentation) => {
    setSelectedComponent(component);
    onComponentSelect?.(component);
  };

  const handlePlaygroundClick = (componentName: string) => {
    onPlaygroundOpen?.(componentName);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Design System</h2>
          <p className="text-muted-foreground">
            Component library documentation and design guidelines
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {documentation.components.length} Components
        </Badge>
      </div>

      <Tabs defaultValue="components" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="tokens">Design Tokens</TabsTrigger>
          <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="space-y-4">
          {/* rch and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <rch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="rch components..."
                value={rchQuery}
                onChange={(e) => setrchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as ComponentCategory | 'all')}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Components Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredComponents.map((component) => (
              <ComponentCard
                key={component.id}
                component={component}
                onClick={() => handleComponentClick(component)}
                onPlaygroundClick={() => handlePlaygroundClick(component.name)}
              />
            ))}
          </div>

          {filteredComponents.length === 0 && (
            <div className="text-center py-12">
              <Component className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No components found</h3>
              <p className="text-muted-foreground">
                Try adjusting your rch or filter criteria
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="tokens" className="space-y-4">
          <DesignTokensSection tokens={documentation.designTokens} />
        </TabsContent>

        <TabsContent value="guidelines" className="space-y-4">
          <GuidelinesSection guidelines={documentation.guidelines} />
        </TabsContent>

        <TabsContent value="relationships" className="space-y-4">
          <RelationshipsSection relationships={documentation.relationships} />
        </TabsContent>
      </Tabs>

      {/* Component Detail Modal/Sidebar */}
      {selectedComponent && (
        <ComponentDetailPanel
          component={selectedComponent}
          onClose={() => setSelectedComponent(null)}
          onPlaygroundOpen={() => handlePlaygroundClick(selectedComponent.name)}
        />
      )}
    </div>
  );
}

function ComponentCard({ 
  component, 
  onClick, 
  onPlaygroundClick 
}: { 
  component: ComponentDocumentation;
  onClick: () => void;
  onPlaygroundClick: () => void;
}) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{component.name}</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {component.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {component.description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{component.props.length} props</span>
          <span>{component.examples.length} examples</span>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onClick} className="flex-1">
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button variant="outline" size="sm" onClick={onPlaygroundClick} className="flex-1">
            <Code className="h-3 w-3 mr-1" />
            Playground
          </Button>
        </div>

        {component.storybook.variants.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {component.storybook.variants.slice(0, 3).map((variant, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {variant.name}
              </Badge>
            ))}
            {component.storybook.variants.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{component.storybook.variants.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ComponentDetailPanel({ 
  component, 
  onClose, 
  onPlaygroundOpen 
}: { 
  component: ComponentDocumentation;
  onClose: () => void;
  onPlaygroundOpen: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">{component.name}</CardTitle>
            <p className="text-muted-foreground">{component.description}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onPlaygroundOpen}>
              <Code className="h-4 w-4 mr-2" />
              Playground
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Props */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Props</h3>
            <div className="space-y-3">
              {component.props.map((prop) => (
                <div key={prop.name} className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <code className="font-mono text-sm bg-muted px-2 py-1 rounded">
                      {prop.name}
                    </code>
                    <Badge variant={prop.required ? "destructive" : "secondary"}>
                      {prop.required ? "Required" : "Optional"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{prop.description}</p>
                  <div className="text-sm">
                    <strong>Type:</strong> <code className="bg-muted px-1 rounded ml-1">{prop.type}</code>
                  </div>
                  {prop.defaultValue !== undefined && (
                    <div className="text-sm">
                      <strong>Default:</strong> <code className="bg-muted px-1 rounded ml-1">
                        {JSON.stringify(prop.defaultValue)}
                      </code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Examples */}
          {component.examples.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Examples</h3>
              <div className="space-y-3">
                {component.examples.map((example) => (
                  <Card key={example.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{example.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{example.description}</p>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                        <code>{example.code}</code>
                      </pre>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Accessibility Guidelines */}
          {component.accessibilityGuidelines.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Accessibility className="h-5 w-5 mr-2" />
                Accessibility Guidelines
              </h3>
              <div className="space-y-2">
                {component.accessibilityGuidelines.map((guideline, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Badge variant="outline">{guideline.wcagLevel}</Badge>
                    <div>
                      <div className="font-medium">{guideline.rule}</div>
                      <p className="text-sm text-muted-foreground">{guideline.description}</p>
                      <p className="text-sm mt-1">{guideline.implementation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Components */}
          {component.relatedComponents.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <GitBranch className="h-5 w-5 mr-2" />
                Related Components
              </h3>
              <div className="flex flex-wrap gap-2">
                {component.relatedComponents.map((related) => (
                  <Badge key={related} variant="outline">
                    {related}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DesignTokensSection({ tokens }: { tokens: any[] }) {
  const [rchQuery, setrchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = Array.from(new Set(tokens.map(t => t.category)));
  const filteredTokens = tokens.filter(token => {
    const matchesrch = token.name.toLowerCase().includes(rchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || token.category === selectedCategory;
    return matchesrch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <rch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="rch design tokens..."
            value={rchQuery}
            onChange={(e) => setrchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTokens.map((token, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <code className="text-sm font-mono">{token.name}</code>
                <Badge variant="outline">{token.category}</Badge>
              </div>
              <div className="text-sm text-muted-foreground mb-2">{token.description}</div>
              <code className="text-xs bg-muted px-2 py-1 rounded">{token.value}</code>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function GuidelinesSection({ guidelines }: { guidelines: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Object.entries(guidelines).map(([key, value]) => (
        <Card key={key}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {key === 'spacing' && <div className="h-5 w-5 bg-blue-500 rounded" />}
              {key === 'typography' && <Type className="h-5 w-5" />}
              {key === 'colors' && <Palette className="h-5 w-5" />}
              {key === 'accessibility' && <Accessibility className="h-5 w-5" />}
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{value as string}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RelationshipsSection({ relationships }: { relationships: any[] }) {
  return (
    <div className="space-y-4">
      {relationships.map((relationship, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              {relationship.parent}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {relationship.dependencies.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Dependencies:</div>
                <div className="flex flex-wrap gap-1">
                  {relationship.dependencies.map((dep: string) => (
                    <Badge key={dep} variant="outline">{dep}</Badge>
                  ))}
                </div>
              </div>
            )}
            {relationship.usagePatterns.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Usage Patterns:</div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {relationship.usagePatterns.map((pattern: string, idx: number) => (
                    <li key={idx}>• {pattern}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}