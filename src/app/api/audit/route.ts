import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '../../../payload'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface AuditLog {
  id: string
  userId: string
  userName: string
  userRole: string
  action: string
  resource: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  timestamp: string
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')
    const resource = searchParams.get('resource')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    // In a real implementation, this would query an audit_logs collection
    // For now, we'll simulate with sample data
    const sampleLogs: AuditLog[] = [
      {
        id: '1',
        userId: session.user?.id || 'user-1',
        userName: session.user?.name || 'Current User',
        userRole: session.user?.role || 'admin',
        action: 'USER_UPDATED',
        resource: 'users',
        resourceId: 'user-123',
        details: { field: 'status', oldValue: 'inactive', newValue: 'active' },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
      },
      {
        id: '2',
        userId: 'user-456',
        userName: 'Jane Smith',
        userRole: 'manager',
        action: 'EMPLOYEE_CREATED',
        resource: 'stylists',
        resourceId: 'stylist-789',
        details: { name: 'New Stylist', email: 'new@salon.com' },
        ipAddress: '192.168.1.101',
        userAgent: 'Chrome/91.0...',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
      },
      {
        id: '3',
        userId: 'user-789',
        userName: 'Mike Johnson',
        userRole: 'stylist',
        action: 'APPOINTMENT_UPDATED',
        resource: 'appointments',
        resourceId: 'apt-123',
        details: { status: { old: 'scheduled', new: 'completed' } },
        ipAddress: '192.168.1.102',
        userAgent: 'Safari/14.0...',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() // 4 hours ago
      }
    ]

    // Filter logs based on query parameters
    let filteredLogs = sampleLogs

    if (userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === userId)
    }

    if (action) {
      filteredLogs = filteredLogs.filter(log => log.action === action)
    }

    if (resource) {
      filteredLogs = filteredLogs.filter(log => log.resource === resource)
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex)

    return NextResponse.json({
      logs: paginatedLogs,
      total: filteredLogs.length,
      page,
      totalPages: Math.ceil(filteredLogs.length / limit),
      hasNext: endIndex < filteredLogs.length,
      hasPrev: page > 1
    })

  } catch (error) {
    console.error('Audit logs error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, resource, resourceId, details } = body

    if (!action || !resource) {
      return NextResponse.json(
        { error: 'Action and resource are required' },
        { status: 400 }
      )
    }

    // Get client info
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    const auditLog = {
      userId: session.user?.id,
      userName: session.user?.name,
      userRole: session.user?.role,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent,
      timestamp: new Date().toISOString()
    }

    // In a real implementation, this would save to the audit_logs collection
    console.log('Audit Log:', auditLog)

    return NextResponse.json({
      success: true,
      log: auditLog
    })

  } catch (error) {
    console.error('Create audit log error:', error)
    return NextResponse.json(
      { error: 'Failed to create audit log' },
      { status: 500 }
    )
  }
}
