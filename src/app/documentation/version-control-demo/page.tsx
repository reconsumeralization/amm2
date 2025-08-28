'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VersionHistory } from '@/components/documentation/VersionHistory';
import { DeprecationWarnings } from '@/components/documentation/DeprecationWarning';
import { VersionControlService } from '@/lib/version-control-service';
import { 
  DocumentationVersion, 
  DeprecationWarning as DeprecationWarningType,
  VersionControlConfig 
} from '@/types/version-control';

export default function VersionControlDemo() {
  const [versions, setVersions] = useState<DocumentationVersion[]>([]);
  const [warnings, setWarnings] = useState<DeprecationWarningType[]>([]);
  const [service, setService] = useState<VersionControlService | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string>('');

  useEffect(() => {
    const config: VersionControlConfig = {
      enableVersioning: true,
      semanticVersioning: true,
      automaticChangelog: true,
      gitIntegration: true,
      deprecationWarnings: true,
      migrationSupport: true,
      rollbackSupport: true,
      maxVersionHistory: 100
    };

    const versionService = new VersionControlService(config);
    setService(versionService);

    // Initialize with sample data
    const initializeData = async () => {
      await versionService.initializeSampleData();
      const versionHistory = await versionService.getVersionHistory('api-documentation');
      const deprecationWarnings = await versionService.getDeprecationWarnings('old-api-docs');
      
      setVersions(versionHistory);
      setWarnings(deprecationWarnings);
    };

    initializeData();
  }, []);

  const handleVersionSelect = (versionId: string) => {
    setSelectedVersion(versionId);
    console.log('Selected version:', versionId);
  };

  const handleWarningDismiss = (warningId: string) => {
    setWarnings(prev => prev.filter(w => w.contentId !== warningId));
  };

  const handleWarningRedirect = (warningId: string) => {
    const warning = warnings.find(w => w.contentId === warningId);
    if (warning?.replacement) {
      console.log('Redirecting to:', warning.replacement.url);
      // In a real app, this would navigate to the replacement content
    }
  };

  const exportVersionHistory = async (format: 'json' | 'csv' | 'markdown') => {
    if (!service) return;
    
    try {
      const exported = await service.exportVersionHistory('api-documentation', format);
      
      // Create download
      const blob = new Blob([exported], { 
        type: format === 'json' ? 'application/json' : 'text/plain' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `version-history.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Version Control & Change Management Demo</h1>
        <p className="text-muted-foreground">
          This demo showcases the version control and change management system for documentation.
          It includes version history tracking, deprecation warnings, and automated changelog generation.
        </p>
      </div>

      <Tabs defaultValue="versions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="versions">Version History</TabsTrigger>
          <TabsTrigger value="warnings">Deprecation Warnings</TabsTrigger>
          <TabsTrigger value="export">Export & Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="versions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Documentation Version History</CardTitle>
              <CardDescription>
                Track changes, compare versions, and view migration guides for the API documentation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VersionHistory
                contentId="api-documentation"
                versions={versions}
                onVersionSelect={handleVersionSelect}
                showDiff={true}
                currentVersion={versions[0]?.id}
              />
            </CardContent>
          </Card>

          {selectedVersion && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Version Details</CardTitle>
                <CardDescription>
                  Details for version: {selectedVersion}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Version selected: <code>{selectedVersion}</code>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  In a real implementation, this would show the full content for the selected version.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="warnings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Deprecation Warnings</CardTitle>
              <CardDescription>
                Manage deprecation warnings and content migration notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {warnings.length > 0 ? (
                <DeprecationWarnings
                  warnings={warnings}
                  onWarningDismiss={handleWarningDismiss}
                  onWarningRedirect={handleWarningRedirect}
                  maxVisible={5}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No deprecation warnings at this time.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Sample Warning</CardTitle>
              <CardDescription>
                Add a sample deprecation warning to test the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => {
                  const newWarning: DeprecationWarningType = {
                    contentId: `sample-${Date.now()}`,
                    deprecatedVersion: { major: 1, minor: 0, patch: 0 },
                    removalVersion: { major: 2, minor: 0, patch: 0 },
                    reason: 'This is a sample deprecation warning for testing purposes.',
                    replacement: {
                      contentId: 'new-sample',
                      title: 'New Sample Content',
                      url: '/documentation/new-sample'
                    },
                    migrationInstructions: 'Please update your code to use the new API endpoints.',
                    severity: 'warning',
                    autoRedirect: false
                  };
                  setWarnings(prev => [...prev, newWarning]);
                }}
              >
                Add Sample Warning
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Version History</CardTitle>
              <CardDescription>
                Export version history in different formats for external use.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button onClick={() => exportVersionHistory('json')}>
                  Export as JSON
                </Button>
                <Button onClick={() => exportVersionHistory('csv')}>
                  Export as CSV
                </Button>
                <Button onClick={() => exportVersionHistory('markdown')}>
                  Export as Markdown
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Version Control Statistics</CardTitle>
              <CardDescription>
                Overview of version control metrics and statistics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{versions.length}</div>
                  <div className="text-sm text-muted-foreground">Total Versions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {versions.filter(v => v.breakingChanges).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Breaking Changes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {versions.filter(v => v.deprecated).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Deprecated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{warnings.length}</div>
                  <div className="text-sm text-muted-foreground">Active Warnings</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Migration Tools</CardTitle>
              <CardDescription>
                Tools for managing content migrations and version upgrades.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    console.log('Migration check would run here');
                    alert('Migration check completed. No migrations required.');
                  }}
                >
                  Check for Required Migrations
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    console.log('Validation would run here');
                    alert('Content validation completed successfully.');
                  }}
                >
                  Validate Content Integrity
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}