import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createContentLoader, LoadedContent } from '@/lib/content-loader'
import { createContentValidator } from '@/lib/content-validator'
import { getUserRoleFromSession, hasDocumentationPermission } from '@/lib/documentation-permissions'

export async function GET(request: NextRequest) {
  try {
    const { rchParams } = new URL(request.url)
    const filePath = rchParams.get('path')
    const validate = rchParams.get('validate') === 'true'
    const extractMetadata = rchParams.get('metadata') === 'true'

    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      )
    }

    // Get user session and check permissions
    const session = await getServerSession()
    const userRole = getUserRoleFromSession(session)

    // Check if user can read documentation content
    if (!hasDocumentationPermission(userRole, '/documentation', 'read')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Load content
    const loader = createContentLoader({
      enableValidation: validate,
      enableMetadataExtraction: extractMetadata,
      supportedFormats: ['markdown', 'mdx', 'html', 'json'],
      baseDirectory: 'content/documentation'
    })

    const content = await loader.loadDocumentation(filePath)

    return NextResponse.json({
      success: true,
      content,
      metadata: {
        loadedAt: new Date().toISOString(),
        userRole,
        validationEnabled: validate,
        metadataExtracted: extractMetadata
      }
    })

  } catch (error) {
    console.error('Content loading error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to load content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    const userRole = getUserRoleFromSession(session)

    // Check if user can create/edit documentation content
    if (!hasDocumentationPermission(userRole, '/documentation', 'edit')) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create content' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { filePath, content, frontmatter, validate = true } = body

    if (!filePath || !content) {
      return NextResponse.json(
        { error: 'File path and content are required' },
        { status: 400 }
      )
    }

    // Validate content if requested
    let validationResult = null
    if (validate) {
      const validator = createContentValidator()
      
      // Convert to GuideContent format for validation
      const guideContent = {
        metadata: {
          id: frontmatter?.id || 'temp-id',
          title: frontmatter?.title || 'Untitled',
          description: frontmatter?.description || '',
          author: frontmatter?.author || session?.user?.name || 'Unknown',
          lastUpdated: new Date(),
          version: frontmatter?.version || { major: 1, minor: 0, patch: 0 },
          targetAudience: frontmatter?.targetAudience || ['developer'],
          difficulty: frontmatter?.difficulty || 'beginner',
          estimatedTime: frontmatter?.estimatedTime || 5,
          tags: frontmatter?.tags || [],
          locale: frontmatter?.locale || 'en',
          deprecated: frontmatter?.deprecated || false
        },
        content: {
          introduction: content.substring(0, 500),
          prerequisites: frontmatter?.prerequisites || [],
          steps: [],
          troubleshooting: [],
          relatedContent: [],
          interactiveExamples: [],
          codeSnippets: []
        },
        validation: {
          reviewed: false,
          reviewedBy: '',
          reviewDate: new Date(),
          accuracy: 0,
          accessibilityCompliant: false,
          lastValidated: new Date()
        },
        analytics: {
          viewCount: 0,
          completionRate: 0,
          averageRating: 0,
          feedbackCount: 0,
          rchRanking: 0
        },
        versioning: {
          changeHistory: [],
          previousVersions: []
        }
      }

      validationResult = await validator.validateGuideContent(guideContent)
    }

    // In a real implementation, you would save the content to your storage system
    // For now, we'll just return the validation result
    
    return NextResponse.json({
      success: true,
      message: 'Content processed successfully',
      validation: validationResult,
      metadata: {
        processedAt: new Date().toISOString(),
        userRole,
        author: session?.user?.name || 'Unknown'
      }
    })

  } catch (error) {
    console.error('Content creation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    const userRole = getUserRoleFromSession(session)

    // Check if user can edit documentation content
    if (!hasDocumentationPermission(userRole, '/documentation', 'edit')) {
      return NextResponse.json(
        { error: 'Insufficient permissions to update content' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { filePath, content, frontmatter, validate = true } = body

    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      )
    }

    // Load existing content first
    const loader = createContentLoader({
      enableValidation: false,
      enableMetadataExtraction: true,
      supportedFormats: ['markdown', 'mdx', 'html', 'json'],
      baseDirectory: 'content/documentation'
    })

    let existingContent: LoadedContent | null = null
    try {
      existingContent = await loader.loadDocumentation(filePath)
    } catch (error) {
      // File doesn't exist, that's okay for updates
    }

    // Validate updated content if requested
    let validationResult = null
    if (validate && content) {
      const validator = createContentValidator()
      
      const guideContent = {
        metadata: {
          id: frontmatter?.id || existingContent?.frontmatter?.id || 'temp-id',
          title: frontmatter?.title || existingContent?.frontmatter?.title || 'Untitled',
          description: frontmatter?.description || existingContent?.frontmatter?.description || '',
          author: frontmatter?.author || existingContent?.frontmatter?.author || session?.user?.name || 'Unknown',
          lastUpdated: new Date(),
          version: frontmatter?.version || existingContent?.frontmatter?.version || { major: 1, minor: 0, patch: 0 },
          targetAudience: frontmatter?.targetAudience || existingContent?.frontmatter?.targetAudience || ['developer'],
          difficulty: frontmatter?.difficulty || existingContent?.frontmatter?.difficulty || 'beginner',
          estimatedTime: frontmatter?.estimatedTime || existingContent?.extractedMetadata?.estimatedReadTime || 5,
          tags: frontmatter?.tags || existingContent?.frontmatter?.tags || [],
          locale: frontmatter?.locale || existingContent?.frontmatter?.locale || 'en',
          deprecated: frontmatter?.deprecated || existingContent?.frontmatter?.deprecated || false
        },
        content: {
          introduction: content.substring(0, 500),
          prerequisites: frontmatter?.prerequisites || [],
          steps: [],
          troubleshooting: [],
          relatedContent: [],
          interactiveExamples: [],
          codeSnippets: []
        },
        validation: {
          reviewed: false,
          reviewedBy: '',
          reviewDate: new Date(),
          accuracy: 0,
          accessibilityCompliant: false,
          lastValidated: new Date()
        },
        analytics: {
          viewCount: 0,
          completionRate: 0,
          averageRating: 0,
          feedbackCount: 0,
          rchRanking: 0
        },
        versioning: {
          changeHistory: [],
          previousVersions: []
        }
      }

      validationResult = await validator.validateGuideContent(guideContent)
    }

    return NextResponse.json({
      success: true,
      message: 'Content updated successfully',
      validation: validationResult,
      existingContent: existingContent ? {
        lastModified: existingContent.frontmatter.lastUpdated,
        wordCount: existingContent.extractedMetadata.wordCount
      } : null,
      metadata: {
        updatedAt: new Date().toISOString(),
        userRole,
        updatedBy: session?.user?.name || 'Unknown'
      }
    })

  } catch (error) {
    console.error('Content update error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    const userRole = getUserRoleFromSession(session)

    // Check if user can delete documentation content
    if (!hasDocumentationPermission(userRole, '/documentation', 'admin')) {
      return NextResponse.json(
        { error: 'Insufficient permissions to delete content' },
        { status: 403 }
      )
    }

    const { rchParams } = new URL(request.url)
    const filePath = rchParams.get('path')

    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      )
    }

    // In a real implementation, you would delete the file from your storage system
    // For now, we'll just return a success message
    
    return NextResponse.json({
      success: true,
      message: 'Content deleted successfully',
      metadata: {
        deletedAt: new Date().toISOString(),
        userRole,
        deletedBy: session?.user?.name || 'Unknown',
        filePath
      }
    })

  } catch (error) {
    console.error('Content deletion error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}