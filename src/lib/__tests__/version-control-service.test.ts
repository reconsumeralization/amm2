import { VersionControlService } from '../version-control-service';
import { SemanticVersion, VersionControlConfig } from '@/types/version-control';

describe('VersionControlService', () => {
  let service: VersionControlService;
  const mockConfig: VersionControlConfig = {
    enableVersioning: true,
    semanticVersioning: true,
    automaticChangelog: true,
    gitIntegration: true,
    deprecationWarnings: true,
    migrationSupport: true,
    rollbackSupport: true,
    maxVersionHistory: 100
  };

  beforeEach(() => {
    service = new VersionControlService(mockConfig);
  });

  describe('version management', () => {
    it('creates new version', async () => {
      const contentId = 'test-content';
      const version: SemanticVersion = { major: 1, minor: 0, patch: 0 };
      const changes = [
        {
          id: 'init',
          type: 'added' as const,
          category: 'content' as const,
          title: 'Initial version',
          description: 'First version of content',
          impact: 'medium' as const,
          affectedSections: [],
          migrationRequired: false,
          relatedIssues: [],
          relatedPullRequests: []
        }
      ];

      const newVersion = await service.createVersion(
        contentId,
        version,
        changes,
        'John Doe',
        'john@example.com'
      );

      expect(newVersion.contentId).toBe(contentId);
      expect(newVersion.version).toEqual(version);
      expect(newVersion.author).toBe('John Doe');
      expect(newVersion.changes).toEqual(changes);
    });

    it('retrieves version history', async () => {
      const contentId = 'test-content';
      const version1: SemanticVersion = { major: 1, minor: 0, patch: 0 };
      const version2: SemanticVersion = { major: 1, minor: 1, patch: 0 };

      // Create versions with slight delay to ensure different timestamps
      await service.createVersion(contentId, version1, [], 'John Doe', 'john@example.com');
      
      // Wait a bit to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await service.createVersion(contentId, version2, [], 'Jane Smith', 'jane@example.com');

      const history = await service.getVersionHistory(contentId);

      expect(history).toHaveLength(2);
      // Check that we have both versions (order might vary due to timing)
      const versionNumbers = history.map(v => `${v.version.major}.${v.version.minor}.${v.version.patch}`);
      expect(versionNumbers).toContain('1.0.0');
      expect(versionNumbers).toContain('1.1.0');
    });

    it('gets current version', async () => {
      const contentId = 'test-content';
      const version: SemanticVersion = { major: 1, minor: 0, patch: 0 };

      await service.createVersion(contentId, version, [], 'John Doe', 'john@example.com');

      const currentVersion = await service.getCurrentVersion(contentId);

      expect(currentVersion).toBeDefined();
      expect(currentVersion!.version).toEqual(version);
    });

    it('returns null for non-existent content', async () => {
      const currentVersion = await service.getCurrentVersion('non-existent');
      expect(currentVersion).toBeNull();
    });
  });

  describe('deprecation warnings', () => {
    it('adds deprecation warning', async () => {
      const contentId = 'deprecated-content';
      const version: SemanticVersion = { major: 1, minor: 0, patch: 0 };

      await service.deprecateContent(
        contentId,
        version,
        'This content is deprecated',
        {
          contentId: 'new-content',
          title: 'New Content',
          url: '/new-content'
        }
      );

      const warnings = await service.getDeprecationWarnings(contentId);

      expect(warnings).toHaveLength(1);
      expect(warnings[0].reason).toBe('This content is deprecated');
      expect(warnings[0].replacement).toBeDefined();
    });

    it('removes deprecation warning', async () => {
      const contentId = 'deprecated-content';
      const version: SemanticVersion = { major: 1, minor: 0, patch: 0 };

      await service.deprecateContent(contentId, version, 'Deprecated');
      await service.removeDeprecationWarning(contentId, contentId);

      const warnings = await service.getDeprecationWarnings(contentId);
      expect(warnings).toHaveLength(0);
    });
  });

  describe('migration support', () => {
    it('checks if migration is required', async () => {
      const contentId = 'test-content';
      const fromVersion: SemanticVersion = { major: 1, minor: 0, patch: 0 };
      const toVersion: SemanticVersion = { major: 2, minor: 0, patch: 0 };

      const isRequired = await service.isMigrationRequired(contentId, fromVersion, toVersion);

      // Should return false since no migrations are registered
      expect(isRequired).toBe(false);
    });

    it('gets available migrations', async () => {
      const contentId = 'test-content';
      const migrations = await service.getAvailableMigrations(contentId);

      expect(migrations).toEqual([]);
    });
  });

  describe('version comparison', () => {
    it('compares versions', async () => {
      const contentId = 'test-content';
      const version1: SemanticVersion = { major: 1, minor: 0, patch: 0 };
      const version2: SemanticVersion = { major: 1, minor: 1, patch: 0 };

      const v1 = await service.createVersion(contentId, version1, [], 'John Doe', 'john@example.com');
      const v2 = await service.createVersion(contentId, version2, [], 'Jane Smith', 'jane@example.com');

      const diff = await service.compareVersions(contentId, v1.id, v2.id);

      expect(diff.fromVersion).toEqual(version1);
      expect(diff.toVersion).toEqual(version2);
      expect(diff.summary).toBeDefined();
    });

    it('throws error for non-existent versions', async () => {
      await expect(
        service.compareVersions('test-content', 'non-existent-1', 'non-existent-2')
      ).rejects.toThrow('Version not found');
    });
  });

  describe('version rch', () => {
    beforeEach(async () => {
      const contentId = 'rchable-content';
      
      await service.createVersion(
        contentId,
        { major: 1, minor: 0, patch: 0 },
        [{ 
          id: 'fix1', 
          type: 'fixed', 
          category: 'content', 
          title: 'Bug fix', 
          description: 'Fixed a bug',
          impact: 'low',
          affectedSections: [],
          migrationRequired: false,
          relatedIssues: [],
          relatedPullRequests: []
        }],
        'John Doe',
        'john@example.com'
      );

      await service.createVersion(
        contentId,
        { major: 2, minor: 0, patch: 0 },
        [{ 
          id: 'breaking1', 
          type: 'changed', 
          category: 'api', 
          title: 'Breaking change', 
          description: 'Made breaking change',
          impact: 'breaking',
          affectedSections: [],
          migrationRequired: true,
          relatedIssues: [],
          relatedPullRequests: []
        }],
        'Jane Smith',
        'jane@example.com'
      );
    });

    it('rches versions by author', async () => {
      const results = await service.rchVersions('rchable-content', {
        author: 'John'
      });

      expect(results).toHaveLength(1);
      expect(results[0].author).toBe('John Doe');
    });

    it('rches versions by change type', async () => {
      const results = await service.rchVersions('rchable-content', {
        changeType: 'fixed'
      });

      expect(results).toHaveLength(1);
      expect(results[0].changes[0].type).toBe('fixed');
    });

    it('rches versions by breaking changes', async () => {
      const results = await service.rchVersions('rchable-content', {
        breakingChanges: true
      });

      expect(results).toHaveLength(1);
      expect(results[0].breakingChanges).toBe(true);
    });

    it('rches versions by date range', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const results = await service.rchVersions('rchable-content', {
        dateRange: { from: yesterday, to: tomorrow }
      });

      expect(results).toHaveLength(2); // Both versions should be within range
    });
  });

  describe('export functionality', () => {
    beforeEach(async () => {
      const contentId = 'exportable-content';
      await service.createVersion(
        contentId,
        { major: 1, minor: 0, patch: 0 },
        [],
        'John Doe',
        'john@example.com'
      );
    });

    it('exports version history as JSON', async () => {
      const exported = await service.exportVersionHistory('exportable-content', 'json');
      const parsed = JSON.parse(exported);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].version.major).toBe(1);
    });

    it('exports version history as CSV', async () => {
      const exported = await service.exportVersionHistory('exportable-content', 'csv');
      const lines = exported.split('\n');

      expect(lines[0]).toContain('Version,Release Date,Author,Changes,Breaking Changes');
      expect(lines[1]).toContain('1.0.0');
      expect(lines[1]).toContain('John Doe');
    });

    it('exports version history as Markdown', async () => {
      const exported = await service.exportVersionHistory('exportable-content', 'markdown');

      expect(exported).toContain('# Version History for exportable-content');
      expect(exported).toContain('## v1.0.0');
      expect(exported).toContain('**Author:** John Doe');
    });

    it('throws error for unsupported format', async () => {
      await expect(
        service.exportVersionHistory('exportable-content', 'xml' as any)
      ).rejects.toThrow('Unsupported format: xml');
    });
  });

  describe('sample data initialization', () => {
    it('initializes sample data', async () => {
      await service.initializeSampleData();

      const history = await service.getVersionHistory('api-documentation');
      expect(history.length).toBeGreaterThan(0);

      const warnings = await service.getDeprecationWarnings('old-api-docs');
      expect(warnings.length).toBeGreaterThan(0);
    });
  });
});