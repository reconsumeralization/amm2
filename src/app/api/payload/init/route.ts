import { NextRequest, NextResponse } from 'next/server'
import { initializePayload, checkPayloadHealth, seedInitialData } from '@/lib/payload-init'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'health'

    switch (action) {
      case 'health':
        const health = await checkPayloadHealth()
        return NextResponse.json(health)

      case 'init':
        const payload = await initializePayload()
        return NextResponse.json({
          message: 'Payload CMS initialized successfully',
          collections: payload.config.collections?.length || 0
        })

      case 'seed':
        await seedInitialData()
        return NextResponse.json({
          message: 'Initial data seeded successfully'
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: health, init, or seed' },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('Payload init API error:', { operation: 'payload_init_api' }, error instanceof Error ? error : undefined)
    return NextResponse.json(
      {
        error: 'Payload initialization failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (action === 'full-setup') {
      logger.info('Starting full Payload setup...')

      // Initialize Payload
      await initializePayload()

      // Seed initial data
      await seedInitialData()

      logger.info('✅ Full Payload setup complete!')
      return NextResponse.json({
        message: 'Full Payload setup completed successfully'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use: full-setup' },
      { status: 400 }
    )
  } catch (error) {
    logger.error('Full setup failed:', { operation: 'payload_full_setup' }, error instanceof Error ? error : undefined)
    return NextResponse.json(
      {
        error: 'Full setup failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
