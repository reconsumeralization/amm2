import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler, createSuccessResponse } from '@/lib/api-error-handler'
import { storybookService } from '@/lib/storybook-integration'
import { logger } from '@/lib/logger'

async function getStorybookDocumentation(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const component = searchParams.get('component')
    const category = searchParams.get('category')
    const query = searchParams.get('query')

    logger.info('Fetching storybook documentation', {
      component,
      category,
      query
    })

    if (component) {
      // Get specific component documentation
      const componentDoc = await storybookService.getComponentDocumentation(component)
      if (!componentDoc) {
        return NextResponse.json(
          { error: 'Component not found' },
          { status: 404 }
        )
      }
      return createSuccessResponse(componentDoc, 'Component documentation retrieved')
    }

    if (category) {
      // Get components by category
      const components = await storybookService.getComponentsByCategory(category)
      return createSuccessResponse(components, `Components in category: ${category}`)
    }

    if (query) {
      // rch components
      const components = await storybookService.rchComponents(query)
      return createSuccessResponse(components, `rch results for: ${query}`)
    }

    // Get all documentation
    const documentation = await storybookService.getDocumentation()
    return createSuccessResponse(documentation, 'Full documentation retrieved')
  } catch (error) {
    logger.error('Failed to fetch storybook documentation', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error instanceof Error ? error : undefined)

    return NextResponse.json(
      { error: 'Failed to fetch documentation' },
      { status: 500 }
    )
  }
}

// Export with error handling wrapper
export const GET = withErrorHandler(getStorybookDocumentation)