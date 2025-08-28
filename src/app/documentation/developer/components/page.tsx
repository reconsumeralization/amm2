'use client';

import React, { useState, useEffect } from 'react';
import { DesignSystemDocs } from '@/components/documentation/DesignSystemDocs';
import { ComponentPlayground } from '@/components/documentation/ComponentPlayground';
import { storybookService } from '@/lib/storybook-integration';
import { DesignSystemDocumentation, ComponentDocumentation } from '@/types/storybook-integration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, ExternalLink, FileText as BookOpen, Settings as Component, Palette, BarChart3, AlertTriangle, CheckCircle, AlertCircle } from '@/lib/icon-mapping';
import { toast } from 'sonner';

export default function ComponentDocumentationPage() {
  const [documentation, setDocumentation] = useState<DesignSystemDocumentation | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<ComponentDocumentation | null>(null);
  const [showPlayground, setShowPlayground] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<any>(null);

  useEffect(() => {
    loadDocumentation();
    loadStats();
    validateIntegration();
  }, []);

  const loadDocumentation = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const docs = await storybookService.getDocumentation(forceRefresh);
      setDocumentation(docs);
      
      if (forceRefresh) {
        toast.success('Documentation refreshed successfully');
      }
    } catch (error) {
      console.error('Failed to load documentation:', error);
      toast.error('Failed to load component documentation');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const componentStats = await storybookService.getComponentStats();
      setStats(componentStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const validateIntegration = async () => {
    try {
      const result = await storybookService.validateIntegration();
      setValidationResult(result);
    } catch (error) {
      console.error('Failed to validate integration:', error);
    }
  };

  const handleComponentSelect = (component: ComponentDocumentation) => {
    setSelectedComponent(component);
    setShowPlayground(false);
  };

  const handlePlaygroundOpen = (componentName: string) => {
    const component = documentation?.components.find(c => c.name === componentName);
    if (component) {
      setSelectedComponent(component);
      setShowPlayground(true);
    }
  };

  const openStorybook = () => {
    window.open('http://localhost:6006', '_blank');
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading component documentation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!documentation) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to Load Documentation</h2>
          <p className="text-muted-foreground mb-4">
            Could not load component documentation. Please check your Storybook configuration.
          </p>
          <Button onClick={() => loadDocumentation(true)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Component Documentation</h1>
          <p className="text-muted-foreground mt-2">
            Interactive component library with Storybook integration
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => loadDocumentation(true)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={openStorybook}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Storybook
          </Button>
        </div>
      </div>

      {/* Stats and Validation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats && (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Component className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold">{stats.totalComponents}</div>
                    <div className="text-sm text-muted-foreground">Components</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold">{stats.totalExamples}</div>
                    <div className="text-sm text-muted-foreground">Examples</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-purple-500" />
                  <div>
                    <div className="text-2xl font-bold">{stats.totalProps}</div>
                    <div className="text-sm text-muted-foreground">Props</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-orange-500" />
                  <div>
                    <div className="text-2xl font-bold">{stats.accessibilityCompliance.percentage}%</div>
                    <div className="text-sm text-muted-foreground">Accessibility</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Validation Status */}
      {validationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {validationResult.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive" />
              )}
              Integration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {validationResult.errors.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-destructive mb-1">Errors:</div>
                  {validationResult.errors.map((error: string, index: number) => (
                    <div key={index} className="text-sm text-destructive">• {error}</div>
                  ))}
                </div>
              )}
              {validationResult.warnings.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-orange-600 mb-1">Warnings:</div>
                  {validationResult.warnings.map((warning: string, index: number) => (
                    <div key={index} className="text-sm text-orange-600">• {warning}</div>
                  ))}
                </div>
              )}
              {validationResult.isValid && validationResult.errors.length === 0 && validationResult.warnings.length === 0 && (
                <div className="text-sm text-green-600">All systems operational</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="playground">Playground</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <DesignSystemDocs
            documentation={documentation}
            onComponentSelect={handleComponentSelect}
            onPlaygroundOpen={handlePlaygroundOpen}
          />
        </TabsContent>

        <TabsContent value="playground" className="space-y-6">
          {selectedComponent && showPlayground ? (
            <ComponentPlayground
              componentName={selectedComponent.name}
              initialProps={{}}
              availableProps={selectedComponent.props}
              codeGeneration={true}
              livePreview={true}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Component className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Component Selected</h3>
                <p className="text-muted-foreground">
                  Select a component from the overview tab to start using the playground.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Components by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.componentsByCategory).map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{category}</Badge>
                        </div>
                        <div className="font-semibold">{count as number}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Accessibility Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Total Components</span>
                      <span className="font-semibold">{stats.accessibilityCompliance.total}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Compliant Components</span>
                      <span className="font-semibold">{stats.accessibilityCompliance.compliant}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Compliance Rate</span>
                      <Badge variant={stats.accessibilityCompliance.percentage >= 80 ? "default" : "destructive"}>
                        {stats.accessibilityCompliance.percentage}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}