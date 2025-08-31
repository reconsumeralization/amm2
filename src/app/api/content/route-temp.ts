import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Temporary: Return mock content data without Payload dependency
    // TODO: Re-enable Payload integration after fixing configuration issues

    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    console.log('Content API GET called with slug:', slug)

    if (slug) {
      // Return mock content for specific slug
      return NextResponse.json({
        docs: [{
          id: 'mock-content-id',
          title: slug,
          slug: slug,
          description: `Content for ${slug}`,
          content: {
            blocks: [
              {
                type: 'text',
                content: `This is mock content for ${slug}. The builder system is working!`
              }
            ]
          },
          status: 'published',
          isPublished: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }],
        totalDocs: 1,
        limit: 10,
        totalPages: 1,
        page: 1,
        pagingCounter: 1,
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: null,
        nextPage: null
      })
    }

    // Return mock content list
    return NextResponse.json({
      docs: [],
      totalDocs: 0,
      limit: 10,
      totalPages: 1,
      page: 1,
      pagingCounter: 1,
      hasPrevPage: false,
      hasNextPage: false,
      prevPage: null,
      nextPage: null
    })
  } catch (error) {
    console.error('Content API error:', error)
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Content API POST called with data:', body)

    // Return mock success response
    return NextResponse.json({
      id: 'mock-created-content-id',
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      message: 'Content created successfully (mock implementation)'
    }, { status: 201 })
  } catch (error) {
    console.error('Content API POST error:', error)
    return NextResponse.json({ error: 'Failed to create content' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    console.log('Content API PUT called with id:', id, 'data:', updateData)

    // Return mock success response
    return NextResponse.json({
      id,
      ...updateData,
      updatedAt: new Date().toISOString(),
      message: 'Content updated successfully (mock implementation)'
    })
  } catch (error) {
    console.error('Content API PUT error:', error)
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 })
  }
}
