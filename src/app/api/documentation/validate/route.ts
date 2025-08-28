import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createContentValidator, ValidationConfig } from '@/lib/content-validator'
import { getUserRoleFromSession, hasDocumentationPermission } from '@/lib/documentation-permissions'
import { GuideContent } from '@/types/documentation'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession()
        const userRole = getUserRoleFromSession(session)

        // Check if user can validate documentation content
        if (!hasDocumentationPermission(userRole, '/documentation', 'read')) {
            return NextResponse.json(
                { error: 'Insufficient permissions' },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { content, config } = body

        if (!content) {
            return NextResponse.json(
                { error: 'Content is required for validation' },
                { status: 400 }
            )
        }

        // Create validator with custom config if provided
        const validationConfig: ValidationConfig = {
            enableMarkdownValidation: true,
            enableLinkValidation: true,
            enableCodeValidation: true,
            enableAccessibilityValidation: true,
            enableSpellCheck: false,
            enableReadabilityCheck: true,
            strictMode: false,
            ...config
        }

        const validator = createContentValidator(validationConfig)

        // Convert input to GuideContent format if needed
        let guideContent: GuideContent

        if (content.metadata && content.content) {
            // Already in GuideContent format
            guideContent = content
        } else {
            // Convert from simple content format
            guideContent = {
                metadata: {
                    id: content.id || 'temp-validation-id',
                    title: content.title || 'Validation Content',
                    description: content.description || '',
                    author: content.author || session?.user?.name || 'Unknown',
                    lastUpdated: new Date(),
                    version: content.version || { major: 1, minor: 0, patch: 0 },
                    targetAudience: content.targetAudience || ['developer'],
                    difficulty: content.difficulty || 'beginner',
                    estimatedTime: content.estimatedTime || 5,
                    tags: content.tags || [],
                    locale: content.locale || 'en',
                    deprecated: content.deprecated || false
                },
                content: {
                    introduction: content.introduction || content.content || '',
                    prerequisites: content.prerequisites || [],
                    steps: content.steps || [],
                    troubleshooting: content.troubleshooting || [],
                    relatedContent: content.relatedContent || [],
                    interactiveExamples: content.interactiveExamples || [],
                    codeSnippets: content.codeSnippets || []
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
        }

        // Perform validation
        const validationResult = await validator.validateGuideContent(guideContent)

        // Generate recommendations based on validation results
        const recommendations = generateRecommendations(validationResult)

        return NextResponse.json({
            success: true,
            validation: validationResult,
            recommendations,
            metadata: {
                validatedAt: new Date().toISOString(),
                userRole,
                validatedBy: session?.user?.name || 'Unknown',
                configUsed: validationConfig
            }
        })

    } catch (error) {
        console.error('Content validation error:', error)
        return NextResponse.json(
            {
                error: 'Failed to validate content',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession()
        const userRole = getUserRoleFromSession(session)

        // Check permissions
        if (!hasDocumentationPermission(userRole, '/documentation', 'read')) {
            return NextResponse.json(
                { error: 'Insufficient permissions' },
                { status: 403 }
            )
        }

        // Return validation configuration options
        const validationOptions = {
            enableMarkdownValidation: {
                description: 'Validate markdown syntax and structure',
                default: true,
                checks: [
                    'Header hierarchy',
                    'Malformed links',
                    'Unmatched brackets',
                    'Empty headers',
                    'Document structure'
                ]
            },
            enableLinkValidation: {
                description: 'Validate internal and external links',
                default: true,
                checks: [
                    'URL format validation',
                    'Internal link existence',
                    'Empty link text',
                    'Broken link detection'
                ]
            },
            enableCodeValidation: {
                description: 'Validate code examples and snippets',
                default: true,
                checks: [
                    'Syntax validation by language',
                    'Common code issues',
                    'Placeholder detection',
                    'TODO/FIXME comments'
                ]
            },
            enableAccessibilityValidation: {
                description: 'Check accessibility compliance',
                default: true,
                checks: [
                    'Image alt text',
                    'Heading hierarchy',
                    'Color contrast (basic)',
                    'Semantic structure'
                ]
            },
            enableReadabilityCheck: {
                description: 'Analyze content readability',
                default: true,
                checks: [
                    'Sentence length',
                    'Word repetition',
                    'Content length',
                    'Reading complexity'
                ]
            },
            strictMode: {
                description: 'Enable strict validation rules',
                default: false,
                impact: 'Treats warnings as errors'
            }
        }

        return NextResponse.json({
            success: true,
            validationOptions,
            supportedLanguages: [
                'javascript',
                'typescript',
                'json',
                'bash',
                'shell',
                'python',
                'html',
                'css',
                'markdown'
            ],
            metadata: {
                retrievedAt: new Date().toISOString(),
                userRole
            }
        })

    } catch (error) {
        console.error('Validation options error:', error)
        return NextResponse.json(
            {
                error: 'Failed to retrieve validation options',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

// Helper function to generate recommendations based on validation results
function generateRecommendations(validationResult: any): string[] {
    const recommendations: string[] = []

    if (!validationResult.isValid) {
        recommendations.push('Fix validation errors before publishing content')
    }

    if (validationResult.score < 70) {
        recommendations.push('Consider improving content quality - current score is below recommended threshold')
    }

    // Analyze error patterns
    const errorTypes = new Map<string, number>()
    validationResult.errors.forEach((error: any) => {
        errorTypes.set(error.type, (errorTypes.get(error.type) || 0) + 1)
    })

    if ((errorTypes.get('markdown') ?? 0) > 0) {
        recommendations.push('Review markdown syntax - multiple formatting issues detected')
    }

    if ((errorTypes.get('link') ?? 0) > 0) {
        recommendations.push('Check all links for validity and proper formatting')
    }

    if ((errorTypes.get('accessibility') ?? 0) > 0) {
        recommendations.push('Improve accessibility by adding alt text to images and fixing heading hierarchy')
    }

    if ((errorTypes.get('code') ?? 0) > 0) {
        recommendations.push('Review code examples for syntax errors and best practices')
    }

    // Analyze warning patterns
    const warningTypes = new Map<string, number>()
    validationResult.warnings.forEach((warning: any) => {
        warningTypes.set(warning.type, (warningTypes.get(warning.type) || 0) + 1)
    })

    if ((warningTypes.get('content') ?? 0) > 2) {
        recommendations.push('Consider improving content readability and structure')
    }

    if (validationResult.warnings.length > validationResult.errors.length * 2) {
        recommendations.push('Address warnings to improve overall content quality')
    }

    // Default recommendations if no specific issues
    if (recommendations.length === 0 && validationResult.isValid) {
        recommendations.push('Content validation passed - ready for publication')
    }

    return recommendations
}
