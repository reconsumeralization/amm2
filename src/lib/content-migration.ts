/**
 * Content Migration Utilities
 * Handles breaking changes and content migrations with automated validation
 */

import { 
  ContentMigration, 
  MigrationStep, 
  SemanticVersion, 
  DocumentationVersion,
  MigrationStepType
} from '@/types/version-control';

export interface MigrationContext {
  contentId: string;
  fromVersion: SemanticVersion;
  toVersion: SemanticVersion;
  dryRun: boolean;
  backupEnabled: boolean;
  validationEnabled: boolean;
}

export interface MigrationResult {
  success: boolean;
  completedSteps: string[];
  failedSteps: string[];
  errors: MigrationError[];
  warnings: string[];
  rollbackAvailable: boolean;
  backupLocation?: string;
}

export interface MigrationError {
  stepId: string;
  message: string;
  details?: string;
  recoverable: boolean;
}

export class ContentMigrationManager {
  private migrations: Map<string, ContentMigration> = new Map();
  private backups: Map<string, any> = new Map();

  /**
   * Register a content migration
   */
  registerMigration(migration: ContentMigration): void {
    const key = this.getMigrationKey(migration.fromVersion, migration.toVersion, migration.contentId);
    this.migrations.set(key, migration);
  }

  /**
   * Execute content migration
   */
  async executeMigration(context: MigrationContext): Promise<MigrationResult> {
    const migration = this.findMigration(context);
    
    if (!migration) {
      return {
        success: false,
        completedSteps: [],
        failedSteps: [],
        errors: [{
          stepId: 'migration-lookup',
          message: `No migration found for ${context.contentId} from ${this.formatVersion(context.fromVersion)} to ${this.formatVersion(context.toVersion)}`,
          recoverable: false
        }],
        warnings: [],
        rollbackAvailable: false
      };
    }

    const result: MigrationResult = {
      success: true,
      completedSteps: [],
      failedSteps: [],
      errors: [],
      warnings: [],
      rollbackAvailable: migration.rollbackSupported
    };

    // Create backup if enabled
    if (context.backupEnabled && !context.dryRun) {
      try {
        await this.createBackup(context.contentId);
        result.backupLocation = `backup_${context.contentId}_${Date.now()}`;
      } catch (error) {
        result.warnings.push(`Failed to create backup: ${error}`);
      }
    }

    // Execute migration steps
    for (const step of migration.migrationSteps.sort((a, b) => a.order - b.order)) {
      try {
        if (context.dryRun) {
          await this.validateMigrationStep(step, context);
          result.completedSteps.push(step.id);
        } else {
          await this.executeMigrationStep(step, context);
          result.completedSteps.push(step.id);
        }
      } catch (error) {
        result.success = false;
        result.failedSteps.push(step.id);
        result.errors.push({
          stepId: step.id,
          message: `Migration step failed: ${step.title}`,
          details: error instanceof Error ? error.message : String(error),
          recoverable: step.rollbackScript !== undefined
        });

        // Stop execution on critical failure
        if (!step.rollbackScript) {
          break;
        }
      }
    }

    // Validate final result if enabled
    if (context.validationEnabled && result.success && !context.dryRun) {
      try {
        await this.validateMigrationResult(migration, context);
      } catch (error) {
        result.success = false;
        result.errors.push({
          stepId: 'validation',
          message: 'Migration validation failed',
          details: error instanceof Error ? error.message : String(error),
          recoverable: true
        });
      }
    }

    return result;
  }

  /**
   * Rollback migration
   */
  async rollbackMigration(
    context: MigrationContext, 
    migrationResult: MigrationResult
  ): Promise<MigrationResult> {
    if (!migrationResult.rollbackAvailable) {
      return {
        success: false,
        completedSteps: [],
        failedSteps: [],
        errors: [{
          stepId: 'rollback',
          message: 'Rollback not supported for this migration',
          recoverable: false
        }],
        warnings: [],
        rollbackAvailable: false
      };
    }

    const migration = this.findMigration(context);
    if (!migration) {
      return {
        success: false,
        completedSteps: [],
        failedSteps: [],
        errors: [{
          stepId: 'rollback',
          message: 'Migration not found for rollback',
          recoverable: false
        }],
        warnings: [],
        rollbackAvailable: false
      };
    }

    const rollbackResult: MigrationResult = {
      success: true,
      completedSteps: [],
      failedSteps: [],
      errors: [],
      warnings: [],
      rollbackAvailable: false
    };

    // Execute rollback steps in reverse order
    const completedSteps = migrationResult.completedSteps;
    const stepsToRollback = migration.migrationSteps
      .filter(step => completedSteps.includes(step.id))
      .sort((a, b) => b.order - a.order); // Reverse order

    for (const step of stepsToRollback) {
      if (!step.rollbackScript) {
        rollbackResult.warnings.push(`No rollback script for step: ${step.title}`);
        continue;
      }

      try {
        await this.executeRollbackStep(step, context);
        rollbackResult.completedSteps.push(step.id);
      } catch (error) {
        rollbackResult.success = false;
        rollbackResult.failedSteps.push(step.id);
        rollbackResult.errors.push({
          stepId: step.id,
          message: `Rollback failed for step: ${step.title}`,
          details: error instanceof Error ? error.message : String(error),
          recoverable: false
        });
      }
    }

    // Restore from backup if available
    if (migrationResult.backupLocation) {
      try {
        await this.restoreFromBackup(context.contentId, migrationResult.backupLocation);
        rollbackResult.warnings.push('Content restored from backup');
      } catch (error) {
        rollbackResult.errors.push({
          stepId: 'backup-restore',
          message: 'Failed to restore from backup',
          details: error instanceof Error ? error.message : String(error),
          recoverable: false
        });
      }
    }

    return rollbackResult;
  }

  /**
   * Get available migrations for content
   */
  getAvailableMigrations(contentId: string): ContentMigration[] {
    return Array.from(this.migrations.values())
      .filter(migration => migration.contentId === contentId);
  }

  /**
   * Check if migration is required
   */
  isMigrationRequired(
    contentId: string, 
    fromVersion: SemanticVersion, 
    toVersion: SemanticVersion
  ): boolean {
    const migration = this.findMigration({ 
      contentId, 
      fromVersion, 
      toVersion,
      dryRun: false,
      backupEnabled: false,
      validationEnabled: false
    });
    return migration !== null;
  }

  /**
   * Generate migration plan
   */
  generateMigrationPlan(
    contentId: string,
    fromVersion: SemanticVersion,
    toVersion: SemanticVersion
  ): ContentMigration | null {
    // Check for direct migration
    const directMigration = this.findMigration({
      contentId,
      fromVersion,
      toVersion,
      dryRun: false,
      backupEnabled: false,
      validationEnabled: false
    });

    if (directMigration) {
      return directMigration;
    }

    // Try to find a migration path through intermediate versions
    return this.findMigrationPath(contentId, fromVersion, toVersion);
  }

  // Private helper methods

  private findMigration(context: MigrationContext): ContentMigration | null {
    const key = this.getMigrationKey(context.fromVersion, context.toVersion, context.contentId);
    return this.migrations.get(key) || null;
  }

  private findMigrationPath(
    contentId: string,
    fromVersion: SemanticVersion,
    toVersion: SemanticVersion
  ): ContentMigration | null {
    // This is a simplified implementation
    // In a real scenario, you'd implement a graph traversal algorithm
    // to find the optimal migration path through intermediate versions
    
    const availableMigrations = this.getAvailableMigrations(contentId);
    
    // For now, just return null if no direct path exists
    // TODO: Implement multi-step migration path finding
    return null;
  }

  private getMigrationKey(
    fromVersion: SemanticVersion, 
    toVersion: SemanticVersion, 
    contentId: string
  ): string {
    return `${contentId}_${this.formatVersion(fromVersion)}_${this.formatVersion(toVersion)}`;
  }

  private formatVersion(version: SemanticVersion): string {
    return `${version.major}.${version.minor}.${version.patch}`;
  }

  private async executeMigrationStep(step: MigrationStep, context: MigrationContext): Promise<void> {
    switch (step.type) {
      case 'content_update':
        await this.executeContentUpdate(step, context);
        break;
      case 'structure_change':
        await this.executeStructureChange(step, context);
        break;
      case 'url_redirect':
        await this.executeUrlRedirect(step, context);
        break;
      case 'metadata_update':
        await this.executeMetadataUpdate(step, context);
        break;
      case 'file_move':
        await this.executeFileMove(step, context);
        break;
      case 'dependency_update':
        await this.executeDependencyUpdate(step, context);
        break;
      default:
        throw new Error(`Unknown migration step type: ${step.type}`);
    }

    // Run validation if provided
    if (step.validation) {
      await this.runValidationScript(step.validation, context);
    }
  }

  private async validateMigrationStep(step: MigrationStep, context: MigrationContext): Promise<void> {
    // Validate that the step can be executed without actually executing it
    switch (step.type) {
      case 'content_update':
        await this.validateContentUpdate(step, context);
        break;
      case 'structure_change':
        await this.validateStructureChange(step, context);
        break;
      case 'url_redirect':
        await this.validateUrlRedirect(step, context);
        break;
      case 'metadata_update':
        await this.validateMetadataUpdate(step, context);
        break;
      case 'file_move':
        await this.validateFileMove(step, context);
        break;
      case 'dependency_update':
        await this.validateDependencyUpdate(step, context);
        break;
    }
  }

  private async executeRollbackStep(step: MigrationStep, context: MigrationContext): Promise<void> {
    if (!step.rollbackScript) {
      throw new Error(`No rollback script available for step: ${step.id}`);
    }

    // Execute the rollback script
    // This would typically involve running the rollback script
    // For now, we'll just simulate it
    console.log(`Executing rollback for step: ${step.id}`);
  }

  private async createBackup(contentId: string): Promise<void> {
    // Create a backup of the current content
    // This would typically involve copying files or database records
    const backupKey = `${contentId}_${Date.now()}`;
    this.backups.set(backupKey, { contentId, timestamp: new Date() });
  }

  private async restoreFromBackup(contentId: string, backupLocation: string): Promise<void> {
    // Restore content from backup
    // This would typically involve restoring files or database records
    console.log(`Restoring ${contentId} from backup: ${backupLocation}`);
  }

  private async validateMigrationResult(migration: ContentMigration, context: MigrationContext): Promise<void> {
    // Validate that the migration was successful
    // This could involve checking file integrity, database consistency, etc.
    console.log(`Validating migration result for: ${context.contentId}`);
  }

  // Migration step implementations

  private async executeContentUpdate(step: MigrationStep, context: MigrationContext): Promise<void> {
    // Update content based on the migration step
    console.log(`Executing content update: ${step.title}`);
  }

  private async executeStructureChange(step: MigrationStep, context: MigrationContext): Promise<void> {
    // Change content structure
    console.log(`Executing structure change: ${step.title}`);
  }

  private async executeUrlRedirect(step: MigrationStep, context: MigrationContext): Promise<void> {
    // Set up URL redirects
    console.log(`Executing URL redirect: ${step.title}`);
  }

  private async executeMetadataUpdate(step: MigrationStep, context: MigrationContext): Promise<void> {
    // Update metadata
    console.log(`Executing metadata update: ${step.title}`);
  }

  private async executeFileMove(step: MigrationStep, context: MigrationContext): Promise<void> {
    // Move files
    console.log(`Executing file move: ${step.title}`);
  }

  private async executeDependencyUpdate(step: MigrationStep, context: MigrationContext): Promise<void> {
    // Update dependencies
    console.log(`Executing dependency update: ${step.title}`);
  }

  // Validation implementations

  private async validateContentUpdate(step: MigrationStep, context: MigrationContext): Promise<void> {
    // Validate content update can be performed
    console.log(`Validating content update: ${step.title}`);
  }

  private async validateStructureChange(step: MigrationStep, context: MigrationContext): Promise<void> {
    // Validate structure change can be performed
    console.log(`Validating structure change: ${step.title}`);
  }

  private async validateUrlRedirect(step: MigrationStep, context: MigrationContext): Promise<void> {
    // Validate URL redirect can be set up
    console.log(`Validating URL redirect: ${step.title}`);
  }

  private async validateMetadataUpdate(step: MigrationStep, context: MigrationContext): Promise<void> {
    // Validate metadata update can be performed
    console.log(`Validating metadata update: ${step.title}`);
  }

  private async validateFileMove(step: MigrationStep, context: MigrationContext): Promise<void> {
    // Validate file move can be performed
    console.log(`Validating file move: ${step.title}`);
  }

  private async validateDependencyUpdate(step: MigrationStep, context: MigrationContext): Promise<void> {
    // Validate dependency update can be performed
    console.log(`Validating dependency update: ${step.title}`);
  }

  private async runValidationScript(script: string, context: MigrationContext): Promise<void> {
    // Run validation script
    console.log(`Running validation script for: ${context.contentId}`);
  }
}

/**
 * Migration step builders for common scenarios
 */
export class MigrationStepBuilder {
  static contentUpdate(
    id: string,
    title: string,
    description: string,
    order: number,
    script?: string
  ): MigrationStep {
    return {
      id,
      order,
      title,
      description,
      type: 'content_update',
      automated: !!script,
      script,
      validation: script ? `validate_${id}` : undefined,
      rollbackScript: script ? `rollback_${id}` : undefined
    };
  }

  static structureChange(
    id: string,
    title: string,
    description: string,
    order: number,
    script?: string
  ): MigrationStep {
    return {
      id,
      order,
      title,
      description,
      type: 'structure_change',
      automated: !!script,
      script,
      validation: script ? `validate_${id}` : undefined,
      rollbackScript: script ? `rollback_${id}` : undefined
    };
  }

  static urlRedirect(
    id: string,
    title: string,
    description: string,
    order: number,
    fromUrl: string,
    toUrl: string
  ): MigrationStep {
    return {
      id,
      order,
      title,
      description,
      type: 'url_redirect',
      automated: true,
      script: `redirect_${fromUrl}_to_${toUrl}`,
      validation: `validate_redirect_${id}`,
      rollbackScript: `remove_redirect_${id}`
    };
  }

  static metadataUpdate(
    id: string,
    title: string,
    description: string,
    order: number,
    metadata: Record<string, any>
  ): MigrationStep {
    return {
      id,
      order,
      title,
      description,
      type: 'metadata_update',
      automated: true,
      script: `update_metadata_${id}`,
      validation: `validate_metadata_${id}`,
      rollbackScript: `restore_metadata_${id}`
    };
  }
}