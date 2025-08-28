/**
 * Version Control and Change Management Types
 * Supports semantic versioning, change tracking, and content migration
 */

export interface SemanticVersion {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
  build?: string;
}

export interface DocumentationVersion {
  id: string;
  version: SemanticVersion;
  releaseDate: Date;
  changes: ChangeItem[];
  author: string;
  authorEmail: string;
  commitHash?: string;
  pullRequestId?: string;
  migrationGuide?: string;
  deprecated: boolean;
  deprecationDate?: Date;
  replacedBy?: string;
  breakingChanges: boolean;
  contentId: string;
}

export interface ChangeItem {
  id: string;
  type: ChangeType;
  category: ChangeCategory;
  title: string;
  description: string;
  impact: ChangeImpact;
  affectedSections: string[];
  migrationRequired: boolean;
  migrationInstructions?: string;
  relatedIssues: string[];
  relatedPullRequests: string[];
}

export type ChangeType = 
  | 'added'
  | 'changed' 
  | 'deprecated'
  | 'removed'
  | 'fixed'
  | 'security';

export type ChangeCategory =
  | 'content'
  | 'structure'
  | 'api'
  | 'ui'
  | 'configuration'
  | 'dependencies'
  | 'performance'
  | 'accessibility';

export type ChangeImpact = 'low' | 'medium' | 'high' | 'breaking';

export interface VersionDiff {
  fromVersion: SemanticVersion;
  toVersion: SemanticVersion;
  additions: DiffSection[];
  modifications: DiffSection[];
  deletions: DiffSection[];
  summary: DiffSummary;
}

export interface DiffSection {
  sectionId: string;
  sectionTitle: string;
  contentBefore?: string;
  contentAfter?: string;
  lineChanges: LineChange[];
}

export interface LineChange {
  lineNumber: number;
  type: 'added' | 'removed' | 'modified';
  content: string;
  previousContent?: string;
}

export interface DiffSummary {
  totalChanges: number;
  additionsCount: number;
  modificationsCount: number;
  deletionsCount: number;
  breakingChanges: number;
  migrationRequired: boolean;
}

export interface ChangelogEntry {
  version: SemanticVersion;
  releaseDate: Date;
  sections: ChangelogSection[];
  summary: string;
  migrationGuide?: string;
  breakingChanges: ChangeItem[];
}

export interface ChangelogSection {
  category: ChangeCategory;
  changes: ChangeItem[];
}

export interface DeprecationWarning {
  contentId: string;
  deprecatedVersion: SemanticVersion;
  removalVersion?: SemanticVersion;
  reason: string;
  replacement?: {
    contentId: string;
    title: string;
    url: string;
  };
  migrationInstructions: string;
  severity: 'info' | 'warning' | 'error';
  autoRedirect: boolean;
  redirectDelay?: number;
}

export interface ContentMigration {
  id: string;
  fromVersion: SemanticVersion;
  toVersion: SemanticVersion;
  contentId: string;
  migrationSteps: MigrationStep[];
  automated: boolean;
  rollbackSupported: boolean;
  estimatedDuration: number;
  prerequisites: string[];
}

export interface MigrationStep {
  id: string;
  order: number;
  title: string;
  description: string;
  type: MigrationStepType;
  automated: boolean;
  script?: string;
  validation?: string;
  rollbackScript?: string;
}

export type MigrationStepType =
  | 'content_update'
  | 'structure_change'
  | 'url_redirect'
  | 'metadata_update'
  | 'file_move'
  | 'dependency_update';

export interface VersionControlConfig {
  enableVersioning: boolean;
  semanticVersioning: boolean;
  automaticChangelog: boolean;
  gitIntegration: boolean;
  deprecationWarnings: boolean;
  migrationSupport: boolean;
  rollbackSupport: boolean;
  maxVersionHistory: number;
}

export interface GitCommitInfo {
  hash: string;
  message: string;
  author: string;
  authorEmail: string;
  date: Date;
  files: string[];
  pullRequestId?: string;
}

export interface PullRequestInfo {
  id: string;
  title: string;
  description: string;
  author: string;
  mergeDate: Date;
  labels: string[];
  commits: GitCommitInfo[];
}