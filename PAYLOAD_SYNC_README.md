# Payload CMS Synchronization Guide

This guide provides comprehensive strategies for keeping Payload CMS synchronized with its database schema and data across different environments.

## 🎯 Synchronization Strategies

### 1. **Migration-Based Schema Changes**

**When to use:** When making structural changes to your database schema.

```bash
# Generate a new migration
npm run sync:migrate "add user preferences field"

# Check migration status
npm run sync:status

# Apply migrations
npm run db:migrate

# Reset database (development only)
npm run db:reset
```

**Benefits:**
- Version control for schema changes
- Rollback capability
- Environment synchronization
- Audit trail of changes

### 2. **Drizzle ORM Integration**

**When to use:** For rapid development and automatic schema syncing.

```bash
# Push schema changes to database
npm run db:push

# Sync and regenerate types
npm run sync:drizzle
```

**Benefits:**
- Automatic schema detection
- Fast development iteration
- TypeScript type generation
- No manual migration files

### 3. **Data Backfill Jobs**

**When to use:** After schema changes that affect existing data.

```bash
# Backfill specific collection
npm run sync:backfill users

# Custom backfill with transform
npm run sync backfill customers transform-user-data.js
```

**Example Transform Function:**
```typescript
// transform-user-data.js
export function transform(doc) {
  // Add new fields to existing documents
  return {
    ...doc,
    preferences: doc.preferences || {
      notifications: true,
      theme: 'light',
    },
    lastLogin: doc.lastLogin || new Date().toISOString(),
  }
}
```

### 4. **Cross-Environment Synchronization**

**When to use:** When deploying changes between staging/production.

```bash
# Sync from staging to production
npm run sync:environments https://staging.modernmen.com https://modernmen.com users,customers,appointments

# Sync specific collections
npm run sync environments http://localhost:3000 https://prod.example.com services,stylists
```

## 📋 Quick Reference Commands

| Command | Description | Use Case |
|---------|-------------|----------|
| `npm run sync:migrate "description"` | Generate migration | Schema changes |
| `npm run sync:status` | Check migration status | Monitoring |
| `npm run db:push` | Push schema with Drizzle | Development |
| `npm run sync:drizzle` | Full Drizzle sync | Development |
| `npm run sync:backfill <collection>` | Backfill collection data | Data migration |
| `npm run sync:environments <src> <tgt>` | Cross-environment sync | Deployment |
| `npm run db:migrate` | Apply migrations | Production |
| `npm run db:reset` | Reset database | Development |

## 🔧 Configuration

Edit `src/config/sync-config.ts` to customize:

```typescript
export const syncConfig: SyncConfig = {
  collections: [
    'users', 'services', 'customers', // Collections to sync
  ],
  environments: {
    development: 'http://localhost:3000',
    staging: 'https://staging.modernmen.com',
    production: 'https://modernmen.com',
  },
  migrations: {
    autoGenerate: true,  // Auto-generate migrations
    autoRun: false,      // Manual control for production
  },
  drizzle: {
    enabled: true,       // Enable Drizzle integration
    autoPush: false,     // Manual schema pushes
  },
}
```

## 🚀 Best Practices

### Development Workflow
```bash
# 1. Make schema changes in payload.config.ts
# 2. Push to database
npm run db:push

# 3. Generate types
npm run generate:types

# 4. Test changes
npm run dev

# 5. Create migration for production
npm run sync:migrate "schema changes"
```

### Production Deployment
```bash
# 1. Deploy code changes
# 2. Apply migrations
npm run db:migrate

# 3. Backfill data if needed
npm run sync:backfill affected-collections

# 4. Verify synchronization
npm run sync:status
```

### Environment Sync
```bash
# Staging to Production
npm run sync:environments https://staging.example.com https://prod.example.com all-collections

# Development to Staging
npm run sync:environments http://localhost:3000 https://staging.example.com critical-data
```

## ⚠️ Important Notes

### Migration Safety
- **Never modify existing migrations** - create new ones instead
- **Test migrations on staging** before production
- **Backup database** before running migrations
- **Use transactions** for multi-step migrations

### Data Integrity
- **Validate data** before backfill operations
- **Use batch processing** for large datasets
- **Monitor memory usage** during large backfills
- **Test transforms** on sample data first

### Environment Variables
```env
# Required
DATABASE_URL=postgresql://user:pass@localhost:5432/db
PAYLOAD_SECRET=your-secret-key

# Optional
SYNC_WEBHOOK_URL=https://hooks.slack.com/your-webhook
NODE_ENV=production
```

## 🔍 Troubleshooting

### Common Issues

**Migration Fails:**
```bash
# Check migration status
npm run sync:status

# Reset and retry (development only)
npm run db:reset
npm run db:migrate
```

**Type Errors After Sync:**
```bash
# Regenerate types
npm run generate:types

# Check TypeScript errors
npm run type-check
```

**Data Sync Issues:**
```bash
# Validate configuration
tsx src/config/sync-config.ts

# Check environment URLs
npm run sync environments --help
```

## 📊 Monitoring & Logging

Enable monitoring in `sync-config.ts`:

```typescript
monitoring: {
  enableLogging: true,
  enableNotifications: true,
  webhookUrl: process.env.SYNC_WEBHOOK_URL,
}
```

## 🎯 Advanced Usage

### Custom Migration Scripts
```typescript
// src/migrations/001-add-user-preferences.ts
import { MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  // Custom migration logic
  const users = await payload.find({ collection: 'users' })

  for (const user of users.docs) {
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        preferences: { theme: 'light', notifications: true }
      }
    })
  }
}
```

### Automated Sync Hooks
```typescript
// src/hooks/post-deploy-sync.ts
import { syncEnvironments } from '../scripts/sync-payload-schema'

export async function postDeploySync() {
  // Sync critical data after deployment
  await syncEnvironments(
    process.env.STAGING_URL,
    process.env.PRODUCTION_URL,
    ['users', 'services']
  )
}
```

## 📚 Resources

- [Payload CMS Migrations](https://payloadcms.com/docs/database/migrations)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Database Schema Evolution](https://www.buildwithmatija.com/blog/schema-evolution-without-data-loss)
- [Payload REST API](https://payloadcms.com/docs/rest-api/overview)

---

## 🎉 Summary

This synchronization system provides multiple strategies:

1. **Migrations** - Version-controlled schema changes
2. **Drizzle** - Rapid development sync
3. **Backfill** - Data transformation after schema changes
4. **Environment Sync** - Cross-environment data synchronization

Choose the right strategy based on your development phase and requirements. Always test on staging before production! 🚀
