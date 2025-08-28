'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DocumentationVersion, 
  VersionDiff, 
  SemanticVersion,
  ChangeItem,
  ChangeType,
  ChangeImpact
} from '@/types/version-control';
import { formatDistanceToNow } from 'date-fns';
import { Clock, User, GitCommit, AlertTriangle, HelpCircle, Plus, Minus, Edit, ExternalLink, ChevronDown, ChevronRight } from '@/lib/icon-mapping';

interface VersionHistoryProps {
  contentId: string;
  versions: DocumentationVersion[];
  onVersionSelect: (version: string) => void;
  showDiff?: boolean;
  currentVersion?: string;
  className?: string;
}

export function VersionHistory({
  contentId,
  versions,
  onVersionSelect,
  showDiff = true,
  currentVersion,
  className = ''
}: VersionHistoryProps) {
  const [selectedVersions, setSelectedVersions] = useState<{
    from?: string;
    to?: string;
  }>({});
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());
  const [diff, setDiff] = useState<VersionDiff | null>(null);
  const [loading, setLoading] = useState(false);

  const sortedVersions = [...versions].sort((a, b) => 
    new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
  );

  const formatVersion = (version: SemanticVersion): string => {
    let versionString = `${version.major}.${version.minor}.${version.patch}`;
    if (version.prerelease) {
      versionString += `-${version.prerelease}`;
    }
    if (version.build) {
      versionString += `+${version.build}`;
    }
    return versionString;
  };

  const getChangeTypeIcon = (type: ChangeType) => {
    switch (type) {
      case 'added':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'removed':
        return <Minus className="h-4 w-4 text-red-600" />;
      case 'changed':
        return <Edit className="h-4 w-4 text-blue-600" />;
      case 'deprecated':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'fixed':
        return <div className="icon-placeholder">Info</div>;
      case 'security':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <div className="icon-placeholder">Info</div>;
    }
  };

  const getImpactBadgeColor = (impact: ChangeImpact) => {
    switch (impact) {
      case 'breaking':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const toggleVersionExpansion = (versionId: string) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(versionId)) {
      newExpanded.delete(versionId);
    } else {
      newExpanded.add(versionId);
    }
    setExpandedVersions(newExpanded);
  };

  const handleVersionSelect = (versionId: string) => {
    onVersionSelect(versionId);
  };

  const handleDiffSelection = (versionId: string, type: 'from' | 'to') => {
    setSelectedVersions(prev => ({
      ...prev,
      [type]: versionId
    }));
  };

  const generateDiff = async () => {
    if (!selectedVersions.from || !selectedVersions.to) return;
    
    setLoading(true);
    try {
      // In a real implementation, this would call an API
      // For now, we'll simulate the diff generation
      const fromVersion = versions.find(v => v.id === selectedVersions.from);
      const toVersion = versions.find(v => v.id === selectedVersions.to);
      
      if (fromVersion && toVersion) {
        const mockDiff: VersionDiff = {
          fromVersion: fromVersion.version,
          toVersion: toVersion.version,
          additions: [],
          modifications: [],
          deletions: [],
          summary: {
            totalChanges: toVersion.changes.length,
            additionsCount: toVersion.changes.filter(c => c.type === 'added').length,
            modificationsCount: toVersion.changes.filter(c => c.type === 'changed').length,
            deletionsCount: toVersion.changes.filter(c => c.type === 'removed').length,
            breakingChanges: toVersion.changes.filter(c => c.impact === 'breaking').length,
            migrationRequired: toVersion.changes.some(c => c.migrationRequired)
          }
        };
        setDiff(mockDiff);
      }
    } catch (error) {
      console.error('Failed to generate diff:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedVersions.from && selectedVersions.to) {
      generateDiff();
    }
  }, [selectedVersions]);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Version History</h3>
        {showDiff && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Compare versions</span>
          </div>
        )}
      </div>

      <Tabs defaultValue="history" className="w-full">
        <TabsList>
          <TabsTrigger value="history">Version History</TabsTrigger>
          {showDiff && <TabsTrigger value="diff">Compare Versions</TabsTrigger>}
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          {sortedVersions.map((version) => (
            <Card key={version.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleVersionExpansion(version.id)}
                      className="p-1"
                    >
                      {expandedVersions.has(version.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                    <div>
                      <CardTitle className="text-base">
                        v{formatVersion(version.version)}
                        {currentVersion === version.id && (
                          <Badge variant="default" className="ml-2">Current</Badge>
                        )}
                        {version.deprecated && (
                          <Badge variant="destructive" className="ml-2">Deprecated</Badge>
                        )}
                        {version.breakingChanges && (
                          <Badge variant="destructive" className="ml-2">Breaking</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(version.releaseDate, { addSuffix: true })}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {version.author}
                        </span>
                        {version.commitHash && (
                          <span className="flex items-center gap-1">
                            <GitCommit className="h-3 w-3" />
                            {version.commitHash.substring(0, 7)}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {showDiff && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDiffSelection(version.id, 'from')}
                          className={selectedVersions.from === version.id ? 'bg-blue-50' : ''}
                        >
                          From
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDiffSelection(version.id, 'to')}
                          className={selectedVersions.to === version.id ? 'bg-blue-50' : ''}
                        >
                          To
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVersionSelect(version.id)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedVersions.has(version.id) && (
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {version.changes.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">Changes ({version.changes.length})</h4>
                        <div className="space-y-2">
                          {version.changes.map((change) => (
                            <div key={change.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                              {getChangeTypeIcon(change.type)}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{change.title}</span>
                                  <Badge 
                                    variant={getImpactBadgeColor(change.impact)}
                                    className="text-xs"
                                  >
                                    {change.impact}
                                  </Badge>
                                  {change.migrationRequired && (
                                    <Badge variant="outline" className="text-xs">
                                      Migration Required
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {change.description}
                                </p>
                                {change.affectedSections.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {change.affectedSections.map((section) => (
                                      <Badge key={section} variant="secondary" className="text-xs">
                                        {section}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {version.migrationGuide && (
                      <div>
                        <h4 className="font-medium mb-2">Migration Guide</h4>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm">{version.migrationGuide}</p>
                        </div>
                      </div>
                    )}

                    {version.pullRequestId && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ExternalLink className="h-3 w-3" />
                        <span>Pull Request #{version.pullRequestId}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </TabsContent>

        {showDiff && (
          <TabsContent value="diff" className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-sm font-medium">From:</span>
                  <span className="ml-2 text-sm">
                    {selectedVersions.from 
                      ? `v${formatVersion(versions.find(v => v.id === selectedVersions.from)?.version!)}`
                      : 'Select version'
                    }
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium">To:</span>
                  <span className="ml-2 text-sm">
                    {selectedVersions.to 
                      ? `v${formatVersion(versions.find(v => v.id === selectedVersions.to)?.version!)}`
                      : 'Select version'
                    }
                  </span>
                </div>
              </div>
              <Button 
                onClick={generateDiff}
                disabled={!selectedVersions.from || !selectedVersions.to || loading}
              >
                {loading ? 'Generating...' : 'Generate Diff'}
              </Button>
            </div>

            {diff && (
              <Card>
                <CardHeader>
                  <CardTitle>Version Comparison</CardTitle>
                  <CardDescription>
                    Comparing v{formatVersion(diff.fromVersion)} to v{formatVersion(diff.toVersion)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{diff.summary.additionsCount}</div>
                      <div className="text-sm text-muted-foreground">Additions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{diff.summary.modificationsCount}</div>
                      <div className="text-sm text-muted-foreground">Modifications</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{diff.summary.deletionsCount}</div>
                      <div className="text-sm text-muted-foreground">Deletions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{diff.summary.breakingChanges}</div>
                      <div className="text-sm text-muted-foreground">Breaking</div>
                    </div>
                  </div>

                  {diff.summary.migrationRequired && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Migration Required</span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        This version update requires migration steps. Please review the migration guide before updating.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}