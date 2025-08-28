import { ChangelogGenerator, VersionUtils } from '../changelog-generator';
import { 
  SemanticVersion, 
  GitCommitInfo, 
  PullRequestInfo,
  ChangeType,
  ChangeCategory,
  ChangeImpact
} from '@/types/version-control';

describe('ChangelogGenerator', () => {
  let generator: ChangelogGenerator;

  beforeEach(() => {
    generator = new ChangelogGenerator({
      repository: 'test-repo',
      baseBranch: 'main',
      includeCommits: true,
      includePullRequests: true,
      conventionalCommits: true,
      groupByCategory: true,
      includeBreakingChanges: true,
      includeMigrationGuides: true,
      excludePatterns: ['^chore:', '^test:'],
      customCategories: {
        'feat': 'content',
        'fix': 'content'
      }
    });
  });

  describe('generateChangelog', () => {
    it('generates changelog from commits', async () => {
      const version: SemanticVersion = { major: 1, minor: 1, patch: 0 };
      const commits: GitCommitInfo[] = [
        {
          hash: 'abc123',
          message: 'feat: add new booking API',
          author: 'John Doe',
          authorEmail: 'john@example.com',
          date: new Date('2024-01-01'),
          files: ['src/api/booking.ts']
        },
        {
          hash: 'def456',
          message: 'fix: resolve authentication bug',
          author: 'Jane Smith',
          authorEmail: 'jane@example.com',
          date: new Date('2024-01-02'),
          files: ['src/auth/index.ts']
        }
      ];

      const changelog = await generator.generateChangelog(version, undefined, commits);

      expect(changelog.version).toEqual(version);
      expect(changelog.sections).toHaveLength(1); // Grouped by category
      expect(changelog.sections[0].category).toBe('content');
      expect(changelog.sections[0].changes).toHaveLength(2);
      expect(changelog.summary).toContain('2 changes');
    });

    it('generates changelog from pull requests', async () => {
      const version: SemanticVersion = { major: 1, minor: 2, patch: 0 };
      const pullRequests: PullRequestInfo[] = [
        {
          id: '123',
          title: 'Add user management features',
          description: 'Implements user CRUD operations',
          author: 'Bob Johnson',
          mergeDate: new Date('2024-01-15'),
          labels: ['feature', 'api'],
          commits: []
        }
      ];

      const changelog = await generator.generateChangelog(version, undefined, undefined, pullRequests);

      expect(changelog.sections).toHaveLength(1);
      expect(changelog.sections[0].changes).toHaveLength(1);
      expect(changelog.sections[0].changes[0].title).toBe('Add user management features');
    });

    it('includes breaking changes in summary', async () => {
      const version: SemanticVersion = { major: 2, minor: 0, patch: 0 };
      const commits: GitCommitInfo[] = [
        {
          hash: 'abc123',
          message: 'feat!: update authentication system\n\nBREAKING CHANGE: API keys are no longer supported',
          author: 'John Doe',
          authorEmail: 'john@example.com',
          date: new Date('2024-01-01'),
          files: ['src/auth/index.ts']
        }
      ];

      const changelog = await generator.generateChangelog(version, undefined, commits);

      expect(changelog.breakingChanges).toHaveLength(1);
      expect(changelog.summary).toContain('breaking changes');
      expect(changelog.migrationGuide).toBeDefined();
    });

    it('generates migration guide for breaking changes', async () => {
      const version: SemanticVersion = { major: 2, minor: 0, patch: 0 };
      const commits: GitCommitInfo[] = [
        {
          hash: 'abc123',
          message: 'feat!: update API endpoints\n\nBREAKING CHANGE: /api/v1 endpoints removed\n\nMigration: Use /api/v2 endpoints instead',
          author: 'John Doe',
          authorEmail: 'john@example.com',
          date: new Date('2024-01-01'),
          files: ['src/api/index.ts']
        }
      ];

      const changelog = await generator.generateChangelog(version, undefined, commits);

      expect(changelog.migrationGuide).toContain('Migration Guide');
      expect(changelog.migrationGuide).toContain('update API endpoints');
    });
  });

  describe('conventional commit parsing', () => {
    it('parses conventional commit format', async () => {
      const commits: GitCommitInfo[] = [
        {
          hash: 'abc123',
          message: 'feat(api): add booking endpoints',
          author: 'John Doe',
          authorEmail: 'john@example.com',
          date: new Date('2024-01-01'),
          files: ['src/api/booking.ts']
        }
      ];

      const changelog = await generator.generateChangelog(
        { major: 1, minor: 1, patch: 0 },
        undefined,
        commits
      );

      const change = changelog.sections[0].changes[0];
      expect(change.type).toBe('added');
      expect(change.title).toBe('add booking endpoints');
      // The category should be inferred from the scope or files
      expect(['api', 'content']).toContain(change.category);
    });

    it('handles breaking change indicator', async () => {
      const commits: GitCommitInfo[] = [
        {
          hash: 'abc123',
          message: 'feat!: major API update',
          author: 'John Doe',
          authorEmail: 'john@example.com',
          date: new Date('2024-01-01'),
          files: ['src/api/index.ts']
        }
      ];

      const changelog = await generator.generateChangelog(
        { major: 2, minor: 0, patch: 0 },
        undefined,
        commits
      );

      const change = changelog.sections[0].changes[0];
      expect(change.impact).toBe('breaking');
    });
  });

  describe('issue and PR reference extraction', () => {
    it('extracts issue references from commit messages', async () => {
      const commits: GitCommitInfo[] = [
        {
          hash: 'abc123',
          message: 'fix: resolve login issue\n\nFixes #123\nCloses #456',
          author: 'John Doe',
          authorEmail: 'john@example.com',
          date: new Date('2024-01-01'),
          files: ['src/auth/login.ts']
        }
      ];

      const changelog = await generator.generateChangelog(
        { major: 1, minor: 0, patch: 1 },
        undefined,
        commits
      );

      const change = changelog.sections[0].changes[0];
      expect(change.relatedIssues).toContain('123');
      expect(change.relatedIssues).toContain('456');
    });
  });
});

describe('VersionUtils', () => {
  describe('compareVersions', () => {
    it('compares major versions correctly', () => {
      const v1: SemanticVersion = { major: 1, minor: 0, patch: 0 };
      const v2: SemanticVersion = { major: 2, minor: 0, patch: 0 };

      expect(VersionUtils.compareVersions(v1, v2)).toBeLessThan(0);
      expect(VersionUtils.compareVersions(v2, v1)).toBeGreaterThan(0);
      expect(VersionUtils.compareVersions(v1, v1)).toBe(0);
    });

    it('compares minor versions correctly', () => {
      const v1: SemanticVersion = { major: 1, minor: 0, patch: 0 };
      const v2: SemanticVersion = { major: 1, minor: 1, patch: 0 };

      expect(VersionUtils.compareVersions(v1, v2)).toBeLessThan(0);
      expect(VersionUtils.compareVersions(v2, v1)).toBeGreaterThan(0);
    });

    it('compares patch versions correctly', () => {
      const v1: SemanticVersion = { major: 1, minor: 0, patch: 0 };
      const v2: SemanticVersion = { major: 1, minor: 0, patch: 1 };

      expect(VersionUtils.compareVersions(v1, v2)).toBeLessThan(0);
      expect(VersionUtils.compareVersions(v2, v1)).toBeGreaterThan(0);
    });

    it('handles prerelease versions', () => {
      const v1: SemanticVersion = { major: 1, minor: 0, patch: 0, prerelease: 'alpha' };
      const v2: SemanticVersion = { major: 1, minor: 0, patch: 0 };

      expect(VersionUtils.compareVersions(v1, v2)).toBeLessThan(0);
      expect(VersionUtils.compareVersions(v2, v1)).toBeGreaterThan(0);
    });
  });

  describe('parseVersion', () => {
    it('parses basic version string', () => {
      const version = VersionUtils.parseVersion('1.2.3');
      
      expect(version.major).toBe(1);
      expect(version.minor).toBe(2);
      expect(version.patch).toBe(3);
      expect(version.prerelease).toBeUndefined();
      expect(version.build).toBeUndefined();
    });

    it('parses version with prerelease', () => {
      const version = VersionUtils.parseVersion('1.2.3-alpha.1');
      
      expect(version.major).toBe(1);
      expect(version.minor).toBe(2);
      expect(version.patch).toBe(3);
      expect(version.prerelease).toBe('alpha.1');
    });

    it('parses version with build metadata', () => {
      const version = VersionUtils.parseVersion('1.2.3+build.123');
      
      expect(version.major).toBe(1);
      expect(version.minor).toBe(2);
      expect(version.patch).toBe(3);
      expect(version.build).toBe('build.123');
    });

    it('parses version with prerelease and build', () => {
      const version = VersionUtils.parseVersion('1.2.3-alpha.1+build.123');
      
      expect(version.major).toBe(1);
      expect(version.minor).toBe(2);
      expect(version.patch).toBe(3);
      expect(version.prerelease).toBe('alpha.1');
      expect(version.build).toBe('build.123');
    });

    it('throws error for invalid version string', () => {
      expect(() => VersionUtils.parseVersion('invalid')).toThrow('Invalid version string');
      expect(() => VersionUtils.parseVersion('1.2')).toThrow('Invalid version string');
      expect(() => VersionUtils.parseVersion('1.2.3.4')).toThrow('Invalid version string');
    });
  });

  describe('formatVersion', () => {
    it('formats basic version', () => {
      const version: SemanticVersion = { major: 1, minor: 2, patch: 3 };
      expect(VersionUtils.formatVersion(version)).toBe('1.2.3');
    });

    it('formats version with prerelease', () => {
      const version: SemanticVersion = { major: 1, minor: 2, patch: 3, prerelease: 'alpha.1' };
      expect(VersionUtils.formatVersion(version)).toBe('1.2.3-alpha.1');
    });

    it('formats version with build', () => {
      const version: SemanticVersion = { major: 1, minor: 2, patch: 3, build: 'build.123' };
      expect(VersionUtils.formatVersion(version)).toBe('1.2.3+build.123');
    });

    it('formats version with prerelease and build', () => {
      const version: SemanticVersion = { 
        major: 1, 
        minor: 2, 
        patch: 3, 
        prerelease: 'alpha.1', 
        build: 'build.123' 
      };
      expect(VersionUtils.formatVersion(version)).toBe('1.2.3-alpha.1+build.123');
    });
  });

  describe('incrementVersion', () => {
    it('increments major version', () => {
      const version: SemanticVersion = { major: 1, minor: 2, patch: 3 };
      const incremented = VersionUtils.incrementVersion(version, 'major');
      
      expect(incremented.major).toBe(2);
      expect(incremented.minor).toBe(0);
      expect(incremented.patch).toBe(0);
    });

    it('increments minor version', () => {
      const version: SemanticVersion = { major: 1, minor: 2, patch: 3 };
      const incremented = VersionUtils.incrementVersion(version, 'minor');
      
      expect(incremented.major).toBe(1);
      expect(incremented.minor).toBe(3);
      expect(incremented.patch).toBe(0);
    });

    it('increments patch version', () => {
      const version: SemanticVersion = { major: 1, minor: 2, patch: 3 };
      const incremented = VersionUtils.incrementVersion(version, 'patch');
      
      expect(incremented.major).toBe(1);
      expect(incremented.minor).toBe(2);
      expect(incremented.patch).toBe(4);
    });

    it('clears prerelease and build on increment', () => {
      const version: SemanticVersion = { 
        major: 1, 
        minor: 2, 
        patch: 3, 
        prerelease: 'alpha.1', 
        build: 'build.123' 
      };
      const incremented = VersionUtils.incrementVersion(version, 'patch');
      
      expect(incremented.prerelease).toBeUndefined();
      expect(incremented.build).toBeUndefined();
    });
  });
});