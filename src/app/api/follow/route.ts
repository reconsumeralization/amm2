import { getPayload } from 'payload';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { userId, barberId, action, tenantId } = await req.json();

  if (!userId || !barberId || !action || !tenantId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (!['follow', 'unfollow'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  try {
    const payload = await getPayload({ config: (await import('../../../payload.config')).default });

    // For simplicity, assuming 'followers' is an array of user IDs on the barber's user document
    // In a real app, you might have a separate Engagements collection or a more robust follow system
    const barber = await payload.findByID({ collection: 'users', id: barberId });
    if (!barber) {
      return NextResponse.json({ error: 'Barber not found' }, { status: 404 });
    }

    let updatedFollowers = barber.followers || [];
    if (action === 'follow') {
      if (!updatedFollowers.includes(userId)) {
        updatedFollowers.push(userId);
      }
    } else {
      updatedFollowers = updatedFollowers.filter((id: string) => id !== userId);
    }

    await payload.update({
      collection: 'users',
      id: barberId,
      data: { followers: updatedFollowers },
    });

    return NextResponse.json({ success: true, action: action });
  } catch (error) {
    console.error('Error processing follow action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}