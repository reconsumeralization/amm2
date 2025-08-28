/**
 * Automated Changelog Generation
 * Generates changelogs from git commits and pull requests with semantic versioning
 */

import { 
  ChangelogEntry, 
  ChangeItem, 
  SemanticVersion, 
  GitCommitInfo, 
  PullRequestInfo,
  ChangeType,
  ChangeCategory,
  ChangeImpact
} from '@/types/version-control';

export interface ChangelogConfig {
  repository: string;
  baseBranch: string;
  includeCommits: boolean;
  includePullRequests: boolean;
  conventionalCommits: boolean;
  groupByCategory: boolean;
  includeBreakingChanges: boolean;
  includeMigrationGuides: boolean;
  excludePatterns: string[];
  customCategories: Record<string, ChangeCategory>;
}

export class ChangelogGenerator {
  private config: ChangelogConfig;

  constructor(config: ChangelogConfig) {
    this.config = config;
  }

  /**
   * Generate changelog for a specific version
   */
  async generateChangelog(
    version: SemanticVersion,
    fromVersion?: SemanticVersion,
    commits?: GitCommitInfo[],
    pullRequests?: PullRequestInfo[]
  ): Promise<ChangelogEntry> {
    const changes: ChangeItem[] = [];

    // Process commits if enabled
    if (this.config.includeCommits && commits) {
      const commitChanges = await this.processCommits(commits);
      changes.push(...commitChanges);
    }

    // Process pull requests if enabled
    if (this.config.includePullRequests && pullRequests) {
      const prChanges = await this.processPullRequests(pullRequests);
      changes.push(...prChanges);
    }

    // Group changes by category
    const sections = this.groupChangesByCategory(changes);

    // Generate summary
    const summary = this.generateSummary(changes);

    // Extract breaking changes
    const breakingChanges = changes.filter(change => change.impact === 'breaking');

    // Generate migration guide if needed
    const migrationGuide = breakingChanges.length > 0 
      ? this.generateMigrationGuide(breakingChanges)
      : undefined;

    return {
      version,
      releaseDate: new Date(),
      sections,
      summary,
      migrationGuide,
      breakingChanges
    };
  }

  /**
   * Process git commits into change items
   */
  private async processCommits(commits: GitCommitInfo[]): Promise<ChangeItem[]> {
    const changes: ChangeItem[] = [];

    for (const commit of commits) {
      // Skip commits that match exclude patterns
      if (this.shouldExcludeCommit(commit)) {
        continue;
      }

      const change = this.parseCommitMessage(commit);
      if (change) {
        changes.push(change);
      }
    }

    return changes;
  }

  /**
   * Process pull requests into change items
   */
  private async processPullRequests(pullRequests: PullRequestInfo[]): Promise<ChangeItem[]> {
    const changes: ChangeItem[] = [];

    for (const pr of pullRequests) {
      const change = this.parsePullRequest(pr);
      if (change) {
        changes.push(change);
      }
    }

    return changes;
  }

  /**
   * Parse conventional commit message
   */
  private parseCommitMessage(commit: GitCommitInfo): ChangeItem | null {
    if (!this.config.conventionalCommits) {
      return this.parseStandardCommit(commit);
    }

    // Conventional commit format: type(scope): description
    const conventionalPattern = /^(feat|fix|docs|style|refactor|perf|test|chore|build|ci)(\([^)]+\))?: (.+)$/;
    const match = commit.message.match(conventionalPattern);

    if (!match) {
      return this.parseStandardCommit(commit);
    }

    const [, type, scope, description] = match;
    const changeType = this.mapConventionalType(type);
    const category = this.inferCategory(type, scope, commit.files);
    const impact = this.inferImpact(type, description, commit.message);

    return {
      id: commit.hash,
      type: changeType,
      category,
      title: description,
      description: commit.message,
      impact,
      affectedSections: this.extractAffectedSections(commit.files),
      migrationRequired: impact === 'breaking',
      migrationInstructions: this.extractMigrationInstructions(commit.message),
      relatedIssues: this.extractIssueReferences(commit.message),
      relatedPullRequests: commit.pullRequestId ? [commit.pullRequestId] : []
    };
  }

  /**
   * Parse standard (non-conventional) commit
   */
  private parseStandardCommit(commit: GitCommitInfo): ChangeItem | null {
    // Use heuristics to determine change type and category
    const changeType = this.inferChangeType(commit.message, commit.files);
    const category = this.inferCategoryFromFiles(commit.files);
    const impact = this.inferImpactFromMessage(commit.message);

    return {
      id: commit.hash,
      type: changeType,
      category,
      title: commit.message.split('\n')[0], // First line as title
      description: commit.message,
      impact,
      affectedSections: this.extractAffectedSections(commit.files),
      migrationRequired: impact === 'breaking',
      migrationInstructions: this.extractMigrationInstructions(commit.message),
      relatedIssues: this.extractIssueReferences(commit.message),
      relatedPullRequests: commit.pullRequestId ? [commit.pullRequestId] : []
    };
  }

  /**
   * Parse pull request into change item
   */
  private parsePullRequest(pr: PullRequestInfo): ChangeItem | null {
    const changeType = this.inferChangeTypeFromLabels(pr.labels);
    const category = this.inferCategoryFromLabels(pr.labels);
    const impact = this.inferImpactFromLabels(pr.labels);

    return {
      id: pr.id,
      type: changeType,
      category,
      title: pr.title,
      description: pr.description,
      impact,
      affectedSections: this.extractAffectedSectionsFromPR(pr),
      migrationRequired: impact === 'breaking' || pr.labels.includes('migration-required'),
      migrationInstructions: this.extractMigrationInstructions(pr.description),
      relatedIssues: this.extractIssueReferences(pr.description),
      relatedPullRequests: [pr.id]
    };
  }

  /**
   * Group changes by category
   */
  private groupChangesByCategory(changes: ChangeItem[]) {
    const grouped = new Map<ChangeCategory, ChangeItem[]>();

    for (const change of changes) {
      if (!grouped.has(change.category)) {
        grouped.set(change.category, []);
      }
      grouped.get(change.category)!.push(change);
    }

    return Array.from(grouped.entries()).map(([category, changes]) => ({
      category,
      changes: changes.sort((a, b) => {
        // Sort by impact (breaking first), then by type
        const impactOrder = { breaking: 0, high: 1, medium: 2, low: 3 };
        const impactDiff = impactOrder[a.impact] - impactOrder[b.impact];
        if (impactDiff !== 0) return impactDiff;
        
        return a.type.localeCompare(b.type);
      })
    }));
  }

  /**
   * Generate summary text
   */
  private generateSummary(changes: ChangeItem[]): string {
    const totalChanges = changes.length;
    const breakingChanges = changes.filter(c => c.impact === 'breaking').length;
    const newFeatures = changes.filter(c => c.type === 'added').length;
    const bugFixes = changes.filter(c => c.type === 'fixed').length;

    let summary = `This release includes ${totalChanges} changes`;
    
    if (newFeatures > 0) {
      summary += ` with ${newFeatures} new features`;
    }
    
    if (bugFixes > 0) {
      summary += ` and ${bugFixes} bug fixes`;
    }

    if (breakingChanges > 0) {
      summary += `. ⚠️ This release contains ${breakingChanges} breaking changes that may require migration.`;
    } else {
      summary += '.';
    }

    return summary;
  }

  /**
   * Generate migration guide for breaking changes
   */
  private generateMigrationGuide(breakingChanges: ChangeItem[]): string {
    let guide = '## Migration Guide\n\n';
    guide += 'This version contains breaking changes that require migration:\n\n';

    for (const change of breakingChanges) {
      guide += `### ${change.title}\n\n`;
      guide += `${change.description}\n\n`;
      
      if (change.migrationInstructions) {
        guide += `**Migration Steps:**\n${change.migrationInstructions}\n\n`;
      }
      
      if (change.affectedSections.length > 0) {
        guide += `**Affected Sections:** ${change.affectedSections.join(', ')}\n\n`;
      }
    }

    return guide;
  }

  // Helper methods for parsing and inference

  private shouldExcludeCommit(commit: GitCommitInfo): boolean {
    return this.config.excludePatterns.some(pattern => 
      new RegExp(pattern).test(commit.message)
    );
  }

  private mapConventionalType(type: string): ChangeType {
    const mapping: Record<string, ChangeType> = {
      feat: 'added',
      fix: 'fixed',
      docs: 'changed',
      style: 'changed',
      refactor: 'changed',
      perf: 'changed',
      test: 'changed',
      chore: 'changed',
      build: 'changed',
      ci: 'changed'
    };
    return mapping[type] || 'changed';
  }

  private inferCategory(type: string, scope: string | undefined, files: string[]): ChangeCategory {
    // Check custom categories first
    const customCategory = this.config.customCategories[type];
    if (customCategory) return customCategory;

    // Infer from scope
    if (scope) {
      if (scope.includes('api')) return 'api';
      if (scope.includes('ui') || scope.includes('component')) return 'ui';
      if (scope.includes('config')) return 'configuration';
    }

    // Infer from files
    return this.inferCategoryFromFiles(files);
  }

  private inferCategoryFromFiles(files: string[]): ChangeCategory {
    if (files.some(f => f.includes('/api/') || f.endsWith('.api.ts'))) return 'api';
    if (files.some(f => f.includes('/components/') || f.includes('/ui/'))) return 'ui';
    if (files.some(f => f.includes('config') || f.includes('.config.'))) return 'configuration';
    if (files.some(f => f.includes('package.json') || f.includes('yarn.lock'))) return 'dependencies';
    if (files.some(f => f.includes('/docs/') || f.includes('.md'))) return 'content';
    return 'content';
  }

  private inferImpact(type: string, description: string, fullMessage: string): ChangeImpact {
    // Check for breaking change indicators
    if (fullMessage.includes('BREAKING CHANGE') || fullMessage.includes('!:')) {
      return 'breaking';
    }

    // Check description for impact keywords
    const highImpactKeywords = ['major', 'significant', 'important', 'critical'];
    const mediumImpactKeywords = ['update', 'improve', 'enhance', 'modify'];
    
    const lowerDescription = description.toLowerCase();
    
    if (highImpactKeywords.some(keyword => lowerDescription.includes(keyword))) {
      return 'high';
    }
    
    if (mediumImpactKeywords.some(keyword => lowerDescription.includes(keyword))) {
      return 'medium';
    }

    return 'low';
  }

  private inferChangeType(message: string, files: string[]): ChangeType {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('add') || lowerMessage.includes('new')) return 'added';
    if (lowerMessage.includes('fix') || lowerMessage.includes('bug')) return 'fixed';
    if (lowerMessage.includes('remove') || lowerMessage.includes('delete')) return 'removed';
    if (lowerMessage.includes('deprecate')) return 'deprecated';
    if (lowerMessage.includes('security')) return 'security';
    
    return 'changed';
  }

  private inferImpactFromMessage(message: string): ChangeImpact {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('breaking') || lowerMessage.includes('major')) return 'breaking';
    if (lowerMessage.includes('important') || lowerMessage.includes('significant')) return 'high';
    if (lowerMessage.includes('minor') || lowerMessage.includes('update')) return 'medium';
    
    return 'low';
  }

  private inferChangeTypeFromLabels(labels: string[]): ChangeType {
    if (labels.includes('feature') || labels.includes('enhancement')) return 'added';
    if (labels.includes('bug') || labels.includes('fix')) return 'fixed';
    if (labels.includes('breaking-change')) return 'changed';
    if (labels.includes('security')) return 'security';
    if (labels.includes('deprecation')) return 'deprecated';
    return 'changed';
  }

  private inferCategoryFromLabels(labels: string[]): ChangeCategory {
    if (labels.includes('api')) return 'api';
    if (labels.includes('ui') || labels.includes('frontend')) return 'ui';
    if (labels.includes('docs') || labels.includes('documentation')) return 'content';
    if (labels.includes('config') || labels.includes('configuration')) return 'configuration';
    if (labels.includes('dependencies')) return 'dependencies';
    if (labels.includes('performance')) return 'performance';
    if (labels.includes('accessibility')) return 'accessibility';
    return 'content';
  }

  private inferImpactFromLabels(labels: string[]): ChangeImpact {
    if (labels.includes('breaking-change') || labels.includes('major')) return 'breaking';
    if (labels.includes('high-impact') || labels.includes('critical')) return 'high';
    if (labels.includes('medium-impact')) return 'medium';
    return 'low';
  }

  private extractAffectedSections(files: string[]): string[] {
    const sections = new Set<string>();
    
    for (const file of files) {
      if (file.includes('/documentation/')) {
        const parts = file.split('/');
        const docIndex = parts.indexOf('documentation');
        if (docIndex >= 0 && docIndex < parts.length - 1) {
          sections.add(parts[docIndex + 1]);
        }
      }
    }
    
    return Array.from(sections);
  }

  private extractAffectedSectionsFromPR(pr: PullRequestInfo): string[] {
    const sections = new Set<string>();
    
    for (const commit of pr.commits) {
      const commitSections = this.extractAffectedSections(commit.files);
      commitSections.forEach(section => sections.add(section));
    }
    
    return Array.from(sections);
  }

  private extractMigrationInstructions(text: string): string | undefined {
    // Look for migration instructions in commit message or PR description
    const migrationPattern = /(?:migration|migrate|breaking change):\s*(.+?)(?:\n\n|\n$|$)/i;
    const match = text.match(migrationPattern);
    return match ? match[1].trim() : undefined;
  }

  private extractIssueReferences(text: string): string[] {
    // Extract issue references like #123, fixes #456, closes #789
    const issuePattern = /(?:fixes?|closes?|resolves?|refs?)\s+#(\d+)|#(\d+)/gi;
    const matches = Array.from(text.matchAll(issuePattern));
    return matches.map(match => match[1] || match[2]).filter(Boolean);
  }
}

/**
 * Utility functions for version management
 */
/**
 * Get changelog entries for display
 * This is a simplified function for the changelog page
 */
export async function getChangelogEntries(): Promise<any[]> {
  // Mock changelog entries for demonstration
  // In a real implementation, this would fetch from a database or generate from git history

  return [
    {
      version: { major: 1, minor: 0, patch: 0 },
      date: new Date('2024-01-15'),
      changes: [
        {
          type: 'feature',
          category: 'ui',
          description: 'Added comprehensive error boundary system',
          impact: 'high'
        },
        {
          type: 'feature',
          category: 'monitoring',
          description: 'Implemented Sentry and LogRocket integration',
          impact: 'high'
        },
        {
          type: 'improvement',
          category: 'performance',
          description: 'Enhanced health check system with Redis connectivity',
          impact: 'medium'
        }
      ]
    },
    {
      version: { major: 0, minor: 9, patch: 0 },
      date: new Date('2024-01-10'),
      changes: [
        {
          type: 'feature',
          category: 'authentication',
          description: 'Added NextAuth integration with Supabase',
          impact: 'high'
        },
        {
          type: 'feature',
          category: 'api',
          description: 'Implemented comprehensive API validation with Zod',
          impact: 'high'
        }
      ]
    }
  ]
}

export class VersionUtils {
  /**
   * Compare two semantic versions
   */
  static compareVersions(a: SemanticVersion, b: SemanticVersion): number {
    if (a.major !== b.major) return a.major - b.major;
    if (a.minor !== b.minor) return a.minor - b.minor;
    if (a.patch !== b.patch) return a.patch - b.patch;
    
    // Handle prerelease versions
    if (a.prerelease && !b.prerelease) return -1;
    if (!a.prerelease && b.prerelease) return 1;
    if (a.prerelease && b.prerelease) {
      return a.prerelease.localeCompare(b.prerelease);
    }
    
    return 0;
  }

  /**
   * Parse version string to SemanticVersion
   */
  static parseVersion(versionString: string): SemanticVersion {
    const pattern = /^(\d+)\.(\d+)\.(\d+)(?:-([^+]+))?(?:\+(.+))?$/;
    const match = versionString.match(pattern);
    
    if (!match) {
      throw new Error(`Invalid version string: ${versionString}`);
    }
    
    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10),
      prerelease: match[4],
      build: match[5]
    };
  }

  /**
   * Format SemanticVersion to string
   */
  static formatVersion(version: SemanticVersion): string {
    let versionString = `${version.major}.${version.minor}.${version.patch}`;
    
    if (version.prerelease) {
      versionString += `-${version.prerelease}`;
    }
    
    if (version.build) {
      versionString += `+${version.build}`;
    }
    
    return versionString;
  }

  /**
   * Increment version based on change type
   */
  static incrementVersion(
    version: SemanticVersion, 
    changeType: 'major' | 'minor' | 'patch'
  ): SemanticVersion {
    const newVersion = { ...version };
    
    switch (changeType) {
      case 'major':
        newVersion.major += 1;
        newVersion.minor = 0;
        newVersion.patch = 0;
        break;
      case 'minor':
        newVersion.minor += 1;
        newVersion.patch = 0;
        break;
      case 'patch':
        newVersion.patch += 1;
        break;
    }
    
    // Clear prerelease and build for release versions
    newVersion.prerelease = undefined;
    newVersion.build = undefined;
    
    return newVersion;
  }
}