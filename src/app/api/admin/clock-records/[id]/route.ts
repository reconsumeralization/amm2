import { getPayload } from 'payload';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Get specific clock record
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await getPayload({ config: (await import('../../../../../payload.config')).default });

    const clockRecord = await payload.findByID({
      collection: 'clock-records',
      id,
    });

    if (!clockRecord) {
      return NextResponse.json({ error: 'Clock record not found' }, { status: 404 });
    }

    // Check access permissions
    if (session.user.role !== 'admin' && session.user.role !== 'manager' && clockRecord.staff !== session.user.id) {
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
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const payload = await getPayload({ config: (await import('../../../../../payload.config')).default });
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
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const payload = await getPayload({ config: (await import('../../../../../payload.config')).default });
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
