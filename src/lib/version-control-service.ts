/**
 * Version Control Service
 * Manages documentation versioning, changelog generation, and content migration
 */

import { 
  DocumentationVersion, 
  SemanticVersion, 
  DeprecationWarning,
  ContentMigration,
  ChangelogEntry,
  GitCommitInfo,
  PullRequestInfo,
  VersionControlConfig
} from '@/types/version-control';
import { ChangelogGenerator, VersionUtils } from './changelog-generator';
import { ContentMigrationManager } from './content-migration';

export class VersionControlService {
  private changelogGenerator: ChangelogGenerator;
  private migrationManager: ContentMigrationManager;
  private config: VersionControlConfig;
  private versions: Map<string, DocumentationVersion[]> = new Map();
  private deprecationWarnings: Map<string, DeprecationWarning[]> = new Map();

  constructor(config: VersionControlConfig) {
    this.config = config;
    this.changelogGenerator = new ChangelogGenerator({
      repository: 'documentation-system',
      baseBranch: 'main',
      includeCommits: true,
      includePullRequests: true,
      conventionalCommits: true,
      groupByCategory: true,
      includeBreakingChanges: true,
      includeMigrationGuides: true,
      excludePatterns: [
        '^chore:',
        '^docs: update',
        '^test:',
        'merge branch',
        'merge pull request'
      ],
      customCategories: {
        'feat': 'content',
        'fix': 'content',
        'docs': 'content',
        'ui': 'ui',
        'api': 'api'
      }
    });
    this.migrationManager = new ContentMigrationManager();
  }

  /**
   * Get version history for content
   */
  async getVersionHistory(contentId: string): Promise<DocumentationVersion[]> {
    const versions = this.versions.get(contentId) || [];
    return versions.sort((a, b) => 
      new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
    );
  }

  /**
   * Create new version
   */
  async createVersion(
    contentId: string,
    version: SemanticVersion,
    changes: any[],
    author: string,
    authorEmail: string,
    commitHash?: string,
    pullRequestId?: string
  ): Promise<DocumentationVersion> {
    const newVersion: DocumentationVersion = {
      id: `${contentId}_${VersionUtils.formatVersion(version)}`,
      version,
      releaseDate: new Date(),
      changes,
      author,
      authorEmail,
      commitHash,
      pullRequestId,
      deprecated: false,
      breakingChanges: changes.some(change => change.impact === 'breaking'),
      contentId
    };

    // Add to version history
    const existingVersions = this.versions.get(contentId) || [];
    existingVersions.push(newVersion);
    this.versions.set(contentId, existingVersions);

    // Generate changelog if enabled
    if (this.config.automaticChangelog) {
      await this.generateChangelogForVersion(contentId, newVersion);
    }

    return newVersion;
  }

  /**
   * Generate changelog for version
   */
  async generateChangelogForVersion(
    contentId: string,
    version: DocumentationVersion,
    commits?: GitCommitInfo[],
    pullRequests?: PullRequestInfo[]
  ): Promise<ChangelogEntry> {
    return await this.changelogGenerator.generateChangelog(
      version.version,
      undefined, // Previous version would be determined automatically
      commits,
      pullRequests
    );
  }

  /**
   * Get deprecation warnings for content
   */
  async getDeprecationWarnings(contentId: string): Promise<DeprecationWarning[]> {
    return this.deprecationWarnings.get(contentId) || [];
  }

  /**
   * Add deprecation warning
   */
  async addDeprecationWarning(warning: DeprecationWarning): Promise<void> {
    const existing = this.deprecationWarnings.get(warning.contentId) || [];
    existing.push(warning);
    this.deprecationWarnings.set(warning.contentId, existing);
  }

  /**
   * Remove deprecation warning
   */
  async removeDeprecationWarning(contentId: string, warningId: string): Promise<void> {
    const warnings = this.deprecationWarnings.get(contentId) || [];
    const filtered = warnings.filter(w => w.contentId !== warningId);
    this.deprecationWarnings.set(contentId, filtered);
  }

  /**
   * Mark content as deprecated
   */
  async deprecateContent(
    contentId: string,
    version: SemanticVersion,
    reason: string,
    replacement?: {
      contentId: string;
      title: string;
      url: string;
    },
    removalVersion?: SemanticVersion
  ): Promise<void> {
    // Mark latest version as deprecated
    const versions = await this.getVersionHistory(contentId);
    if (versions.length > 0) {
      versions[0].deprecated = true;
      versions[0].deprecationDate = new Date();
      if (replacement) {
        versions[0].replacedBy = replacement.contentId;
      }
    }

    // Add deprecation warning
    const warning: DeprecationWarning = {
      contentId,
      deprecatedVersion: version,
      removalVersion,
      reason,
      replacement,
      migrationInstructions: replacement 
        ? `Please migrate to ${replacement.title}. See ${replacement.url} for details.`
        : 'No replacement available. Please contact support for alternatives.',
      severity: removalVersion ? 'warning' : 'info',
      autoRedirect: false
    };

    await this.addDeprecationWarning(warning);
  }

  /**
   * Check if migration is required
   */
  async isMigrationRequired(
    contentId: string,
    fromVersion: SemanticVersion,
    toVersion: SemanticVersion
  ): Promise<boolean> {
    return this.migrationManager.isMigrationRequired(contentId, fromVersion, toVersion);
  }

  /**
   * Execute content migration
   */
  async executeMigration(
    contentId: string,
    fromVersion: SemanticVersion,
    toVersion: SemanticVersion,
    options: {
      dryRun?: boolean;
      backupEnabled?: boolean;
      validationEnabled?: boolean;
    } = {}
  ) {
    return await this.migrationManager.executeMigration({
      contentId,
      fromVersion,
      toVersion,
      dryRun: options.dryRun || false,
      backupEnabled: options.backupEnabled || true,
      validationEnabled: options.validationEnabled || true
    });
  }

  /**
   * Get available migrations
   */
  async getAvailableMigrations(contentId: string): Promise<ContentMigration[]> {
    return this.migrationManager.getAvailableMigrations(contentId);
  }

  /**
   * Compare versions
   */
  async compareVersions(
    contentId: string,
    fromVersionId: string,
    toVersionId: string
  ) {
    const versions = await this.getVersionHistory(contentId);
    const fromVersion = versions.find(v => v.id === fromVersionId);
    const toVersion = versions.find(v => v.id === toVersionId);

    if (!fromVersion || !toVersion) {
      throw new Error('Version not found');
    }

    // Generate diff (simplified implementation)
    return {
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
  }

  /**
   * Get current version for content
   */
  async getCurrentVersion(contentId: string): Promise<DocumentationVersion | null> {
    const versions = await this.getVersionHistory(contentId);
    return versions.length > 0 ? versions[0] : null;
  }

  /**
   * Get version by ID
   */
  async getVersion(contentId: string, versionId: string): Promise<DocumentationVersion | null> {
    const versions = await this.getVersionHistory(contentId);
    return versions.find(v => v.id === versionId) || null;
  }

  /**
   * rch versions
   */
  async rchVersions(
    contentId: string,
    query: {
      author?: string;
      dateRange?: { from: Date; to: Date };
      changeType?: string;
      breakingChanges?: boolean;
      deprecated?: boolean;
    }
  ): Promise<DocumentationVersion[]> {
    const versions = await this.getVersionHistory(contentId);
    
    return versions.filter(version => {
      if (query.author && !version.author.toLowerCase().includes(query.author.toLowerCase())) {
        return false;
      }
      
      if (query.dateRange) {
        const releaseDate = new Date(version.releaseDate);
        if (releaseDate < query.dateRange.from || releaseDate > query.dateRange.to) {
          return false;
        }
      }
      
      if (query.changeType && !version.changes.some(c => c.type === query.changeType)) {
        return false;
      }
      
      if (query.breakingChanges !== undefined && version.breakingChanges !== query.breakingChanges) {
        return false;
      }
      
      if (query.deprecated !== undefined && version.deprecated !== query.deprecated) {
        return false;
      }
      
      return true;
    });
  }

  /**
   * Export version history
   */
  async exportVersionHistory(contentId: string, format: 'json' | 'csv' | 'markdown' = 'json') {
    const versions = await this.getVersionHistory(contentId);
    
    switch (format) {
      case 'json':
        return JSON.stringify(versions, null, 2);
      
      case 'csv':
        const headers = ['Version', 'Release Date', 'Author', 'Changes', 'Breaking Changes'];
        const rows = versions.map(v => [
          VersionUtils.formatVersion(v.version),
          v.releaseDate.toISOString(),
          v.author,
          v.changes.length.toString(),
          v.breakingChanges.toString()
        ]);
        return [headers, ...rows].map(row => row.join(',')).join('\n');
      
      case 'markdown':
        let markdown = `# Version History for ${contentId}\n\n`;
        for (const version of versions) {
          markdown += `## v${VersionUtils.formatVersion(version.version)}\n\n`;
          markdown += `**Released:** ${version.releaseDate.toLocaleDateString()}\n`;
          markdown += `**Author:** ${version.author}\n`;
          if (version.deprecated) {
            markdown += `**Status:** Deprecated\n`;
          }
          if (version.breakingChanges) {
            markdown += `**Breaking Changes:** Yes\n`;
          }
          markdown += '\n### Changes\n\n';
          for (const change of version.changes) {
            markdown += `- **${change.type}**: ${change.title}\n`;
          }
          markdown += '\n';
        }
        return markdown;
      
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Initialize sample data for testing
   */
  async initializeSampleData(): Promise<void> {
    // Create sample versions for testing
    const sampleContentId = 'api-documentation';
    
    const v1_0_0: DocumentationVersion = {
      id: `${sampleContentId}_1.0.0`,
      version: { major: 1, minor: 0, patch: 0 },
      releaseDate: new Date('2024-01-01'),
      changes: [
        {
          id: 'init',
          type: 'added',
          category: 'content',
          title: 'Initial API documentation',
          description: 'Created comprehensive API documentation with examples',
          impact: 'medium',
          affectedSections: ['authentication', 'endpoints'],
          migrationRequired: false,
          relatedIssues: [],
          relatedPullRequests: []
        }
      ],
      author: 'John Doe',
      authorEmail: 'john@example.com',
      deprecated: false,
      breakingChanges: false,
      contentId: sampleContentId
    };

    const v1_1_0: DocumentationVersion = {
      id: `${sampleContentId}_1.1.0`,
      version: { major: 1, minor: 1, patch: 0 },
      releaseDate: new Date('2024-02-01'),
      changes: [
        {
          id: 'new-endpoints',
          type: 'added',
          category: 'api',
          title: 'Added new booking endpoints',
          description: 'Added endpoints for appointment booking and management',
          impact: 'medium',
          affectedSections: ['booking'],
          migrationRequired: false,
          relatedIssues: ['#123'],
          relatedPullRequests: ['#45']
        }
      ],
      author: 'Jane Smith',
      authorEmail: 'jane@example.com',
      deprecated: false,
      breakingChanges: false,
      contentId: sampleContentId
    };

    const v2_0_0: DocumentationVersion = {
      id: `${sampleContentId}_2.0.0`,
      version: { major: 2, minor: 0, patch: 0 },
      releaseDate: new Date('2024-03-01'),
      changes: [
        {
          id: 'auth-breaking',
          type: 'changed',
          category: 'api',
          title: 'Updated authentication system',
          description: 'Migrated from API keys to OAuth 2.0',
          impact: 'breaking',
          affectedSections: ['authentication'],
          migrationRequired: true,
          migrationInstructions: 'Update your authentication to use OAuth 2.0 instead of API keys',
          relatedIssues: ['#200'],
          relatedPullRequests: ['#67']
        }
      ],
      author: 'Bob Johnson',
      authorEmail: 'bob@example.com',
      deprecated: false,
      breakingChanges: true,
      contentId: sampleContentId,
      migrationGuide: 'See the OAuth 2.0 migration guide for detailed instructions'
    };

    this.versions.set(sampleContentId, [v2_0_0, v1_1_0, v1_0_0]);

    // Add sample deprecation warning
    const deprecationWarning: DeprecationWarning = {
      contentId: 'old-api-docs',
      deprecatedVersion: { major: 1, minor: 0, patch: 0 },
      removalVersion: { major: 3, minor: 0, patch: 0 },
      reason: 'This API version is deprecated and will be removed in v3.0.0',
      replacement: {
        contentId: 'api-documentation',
        title: 'New API Documentation',
        url: '/documentation/developer/api'
      },
      migrationInstructions: 'Please migrate to the new API endpoints. See the migration guide for details.',
      severity: 'warning',
      autoRedirect: false
    };

    this.deprecationWarnings.set('old-api-docs', [deprecationWarning]);
  }
}