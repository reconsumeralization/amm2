import { getPayloadClient } from '@/payload';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// GET - Get specific clock record
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!(session as any)?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();

    const clockRecord = await payload.findByID({
      collection: 'clock-records',
      id,
    });

    if (!clockRecord) {
      return NextResponse.json({ error: 'Clock record not found' }, { status: 404 });
    }

    // Check access permissions
    if ((session as any).user.role !== 'admin' && (session as any).user.role !== 'manager' && clockRecord.staff !== (session as any).user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(clockRecord);
  } catch (error: any) {
    console.error('Error fetching clock record:', error);
    return NextResponse.json({
      error: error.message || 'Failed to fetch clock record'
    }, { status: 500 });
  }
}

// PUT - Update clock record (admin only)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session as any)?.user || ((session as any).user.role !== 'admin' && (session as any).user.role !== 'manager')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    const { id } = await params;
    const data = await req.json();

    // Get existing record
    const existingRecord = await payload.findByID({
      collection: 'clock-records',
      id,
    });

    if (!existingRecord) {
      return NextResponse.json({ error: 'Clock record not found' }, { status: 404 });
    }

    const updatedRecord = await payload.update({
      collection: 'clock-records',
      id,
      data,
    });

    return NextResponse.json(updatedRecord);
  } catch (error: any) {
    console.error('Error updating clock record:', error);
    return NextResponse.json({
      error: error.message || 'Failed to update clock record'
    }, { status: 500 });
  }
}

// DELETE - Delete clock record (admin only)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session as any)?.user || ((session as any).user.role !== 'admin' && (session as any).user.role !== 'manager')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    const { id } = await params;

    // Get existing record
    const existingRecord = await payload.findByID({
      collection: 'clock-records',
      id,
    });

    if (!existingRecord) {
      return NextResponse.json({ error: 'Clock record not found' }, { status: 404 });
    }

    await payload.delete({
      collection: 'clock-records',
      id,
    });

    return NextResponse.json({ message: 'Clock record deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting clock record:', error);
    return NextResponse.json({
      error: error.message || 'Failed to delete clock record'
    }, { status: 500 });
  }
}
