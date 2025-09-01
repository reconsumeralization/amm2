#!/usr/bin/env tsx

/**
 * Payload Collections Verification Script
 *
 * This script verifies that all Payload collections referenced in the
 * main index file actually exist and are properly implemented.
 */

import fs from 'fs'
import path from 'path'

interface CollectionInfo {
  name: string
  filePath: string
  exists: boolean
  hasErrors: boolean
  errors: string[]
}

class PayloadCollectionsVerifier {
  private collectionsDir = path.join(process.cwd(), 'src/payload/collections')
  private indexFile = path.join(this.collectionsDir, 'index.ts')

  async verifyAllCollections(): Promise<{
    total: number
    existing: number
    missing: number
    collections: CollectionInfo[]
  }> {
    console.log('🔍 Verifying Payload collections...\n')

    // Read the index file to get all collection imports
    const indexContent = fs.readFileSync(this.indexFile, 'utf-8')
    const collectionImports = this.extractCollectionImports(indexContent)

    console.log(`📋 Found ${collectionImports.length} collection imports\n`)

    const collections: CollectionInfo[] = []

    for (const importInfo of collectionImports) {
      const collectionInfo = await this.verifyCollection(importInfo)
      collections.push(collectionInfo)

      const status = collectionInfo.exists ? '✅' : '❌'
      const errorStatus = collectionInfo.hasErrors ? ' (has errors)' : ''
      console.log(`${status} ${collectionInfo.name} - ${collectionInfo.filePath}${errorStatus}`)
    }

    const existing = collections.filter(c => c.exists).length
    const missing = collections.length - existing

    console.log(`\n📊 Summary:`)
    console.log(`   Total collections: ${collections.length}`)
    console.log(`   Existing: ${existing}`)
    console.log(`   Missing: ${missing}`)

    if (missing > 0) {
      console.log(`\n❌ Missing collections:`)
      collections
        .filter(c => !c.exists)
        .forEach(c => console.log(`   • ${c.name} (${c.filePath})`))
    }

    const withErrors = collections.filter(c => c.hasErrors)
    if (withErrors.length > 0) {
      console.log(`\n⚠️  Collections with errors:`)
      withErrors.forEach(c => {
        console.log(`   • ${c.name}:`)
        c.errors.forEach(error => console.log(`     - ${error}`))
      })
    }

    return {
      total: collections.length,
      existing,
      missing,
      collections
    }
  }

  private extractCollectionImports(content: string): Array<{ name: string; path: string }> {
    const imports: Array<{ name: string; path: string }> = []
    const importRegex = /import\s+{\s*([^}]+)\s*}\s+from\s+['"]([^'"]+)['"]/g

    let match
    while ((match = importRegex.exec(content)) !== null) {
      const importNames = match[1].split(',').map(name => name.trim())
      const importPath = match[2]

      importNames.forEach(name => {
        imports.push({
          name: name,
          path: importPath
        })
      })
    }

    return imports
  }

  private async verifyCollection(importInfo: { name: string; path: string }): Promise<CollectionInfo> {
    // Resolve the file path
    let filePath = importInfo.path

    // Convert relative path to absolute
    if (filePath.startsWith('./')) {
      filePath = path.join(this.collectionsDir, filePath.replace('./', ''))
    } else if (filePath.startsWith('../')) {
      filePath = path.join(this.collectionsDir, filePath)
    }

    // Add .ts extension if not present
    if (!filePath.endsWith('.ts')) {
      filePath += '.ts'
    }

    const exists = fs.existsSync(filePath)

    const collectionInfo: CollectionInfo = {
      name: importInfo.name,
      filePath: path.relative(this.collectionsDir, filePath),
      exists,
      hasErrors: false,
      errors: []
    }

    if (exists) {
      // Check for basic syntax and structure
      try {
        const content = fs.readFileSync(filePath, 'utf-8')
        collectionInfo.errors = this.validateCollectionFile(content, importInfo.name)
        collectionInfo.hasErrors = collectionInfo.errors.length > 0
      } catch (error) {
        collectionInfo.errors = [`Failed to read file: ${error.message}`]
        collectionInfo.hasErrors = true
      }
    }

    return collectionInfo
  }

  private validateCollectionFile(content: string, collectionName: string): string[] {
    const errors: string[] = []

    // Check for basic Payload collection structure
    if (!content.includes('export')) {
      errors.push('Missing export statement')
    }

    if (!content.includes('CollectionConfig')) {
      errors.push('Missing CollectionConfig type import')
    }

    if (!content.includes('slug:')) {
      errors.push('Missing slug field')
    }

    if (!content.includes('fields:')) {
      errors.push('Missing fields array')
    }

    // Check for common issues
    if (content.includes('undefined') && !content.includes('//')) {
      errors.push('Possible undefined reference')
    }

    // Check for proper TypeScript syntax
    const bracketCount = (content.match(/\{/g) || []).length - (content.match(/\}/g) || []).length
    if (bracketCount !== 0) {
      errors.push('Unmatched brackets detected')
    }

    return errors
  }

  async createMissingCollections(collections: CollectionInfo[]): Promise<void> {
    const missingCollections = collections.filter(c => !c.exists)

    if (missingCollections.length === 0) {
      console.log('✅ All collections exist!')
      return
    }

    console.log(`\n🔧 Creating ${missingCollections.length} missing collections...\n`)

    for (const collection of missingCollections) {
      await this.createCollectionTemplate(collection)
      console.log(`✅ Created: ${collection.name}`)
    }

    console.log('\n🎉 All missing collections have been created!')
    console.log('⚠️  Please review and customize the generated collection files.')
  }

  private async createCollectionTemplate(collection: CollectionInfo): Promise<void> {
    const filePath = path.join(this.collectionsDir, collection.filePath)
    const dirPath = path.dirname(filePath)

    // Ensure directory exists
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }

    // Determine domain from path
    const domain = dirPath.split(path.sep).pop() || 'system'
    const collectionName = collection.name

    // Create template based on domain
    const template = this.generateCollectionTemplate(collectionName, domain)

    fs.writeFileSync(filePath, template, 'utf-8')
  }

  private generateCollectionTemplate(collectionName: string, domain: string): string {
    const slug = this.toKebabCase(collectionName)
    const titleField = this.getTitleField(domain)

    return `import { CollectionConfig } from 'payload/types'
import { withDefaultHooks } from '../utils'

const ${collectionName}: CollectionConfig = {
  slug: '${slug}',
  admin: {
    useAsTitle: '${titleField}',
    group: '${this.getDomainDisplayName(domain)}',
  },
  fields: [
    // Basic fields - customize as needed
    {
      name: '${titleField}',
      type: 'text',
      required: true,
      admin: {
        description: 'Display name for this ${slug.replace('-', ' ')}'
      }
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Detailed description'
      }
    },
    // Add more fields based on your requirements
    // {
    //   name: 'status',
    //   type: 'select',
    //   options: [
    //     { label: 'Active', value: 'active' },
    //     { label: 'Inactive', value: 'inactive' }
    //   ],
    //   defaultValue: 'active',
    //   required: true
    // }
  ],
  // Add hooks, access control, etc. as needed
  hooks: {
    // beforeChange: [],
    // afterChange: [],
    // beforeDelete: [],
    // afterDelete: []
  },
  access: {
    read: () => true, // Customize access control
    create: ({ req: { user } }) => {
      // Only authenticated users can create
      return !!user
    },
    update: ({ req: { user } }) => {
      // Only authenticated users can update
      return !!user
    },
    delete: ({ req: { user } }) => {
      // Only admin users can delete
      return user?.role === 'admin'
    }
  }
}

export default ${collectionName}
`
  }

  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase()
  }

  private getTitleField(domain: string): string {
    switch (domain) {
      case 'content':
        return 'title'
      case 'crm':
        return 'name'
      case 'commerce':
        return 'name'
      case 'staff':
        return 'name'
      case 'system':
        return 'name'
      case 'builder':
        return 'name'
      default:
        return 'name'
    }
  }

  private getDomainDisplayName(domain: string): string {
    switch (domain) {
      case 'content':
        return 'Content'
      case 'crm':
        return 'CRM'
      case 'commerce':
        return 'Commerce'
      case 'staff':
        return 'Staff'
      case 'system':
        return 'System'
      case 'builder':
        return 'Visual Builder'
      default:
        return 'General'
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'verify'

  const verifier = new PayloadCollectionsVerifier()

  try {
    switch (command) {
      case 'verify':
        const result = await verifier.verifyAllCollections()
        if (result.missing > 0) {
          console.log('\n💡 Tip: Run "npm run create-collections" to create missing collections')
          process.exit(1)
        }
        break

      case 'create':
        const verifyResult = await verifier.verifyAllCollections()
        await verifier.createMissingCollections(verifyResult.collections)
        break

      case 'fix':
        // Verify and then create missing collections
        const fixResult = await verifier.verifyAllCollections()
        if (fixResult.missing > 0) {
          await verifier.createMissingCollections(fixResult.collections)
        } else {
          console.log('✅ All collections are already implemented!')
        }
        break

      default:
        console.log('Usage:')
        console.log('  npm run verify-collections verify  # Check collection status')
        console.log('  npm run verify-collections create  # Create missing collections')
        console.log('  npm run verify-collections fix     # Verify and fix missing collections')
        break
    }
  } catch (error) {
    console.error('💥 Script failed:', error)
    process.exit(1)
  }
}

// Run the script if called directly
if (require.main === module) {
  main().catch(console.error)
}

export default PayloadCollectionsVerifier
