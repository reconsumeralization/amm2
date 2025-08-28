import { getPayload } from 'payload';
import { NextResponse } from 'next/server';
import { sendEmail } from '../../../../utils/email';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

export async function POST(req: Request) {
  const { action, tenantId } = await req.json();
  
  // Get authenticated user from session
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized: User not authenticated' }, { status: 401 });
  }
  
  const userId = session.user.id;
  const payload = await getPayload({ config: (await import('../../../../payload.config')).default });

  // Input validation
  if (!action || !tenantId) {
    return NextResponse.json({ error: 'Missing required fields: action, tenantId' }, { status: 400 });
  }
  if (!['booking', 'referral'].includes(action)) { // Assuming only these actions are supported
    return NextResponse.json({ error: 'Invalid action. Must be "booking" or "referral"' }, { status: 400 });
  }

  try {
    const settings = await payload.find({
      collection: 'settings',
      where: tenantId ? { tenant: { equals: tenantId } } : { tenant: { exists: false } },
      limit: 1,
    });
    const config = settings.docs[0] || {};

    const user = await payload.findByID({ collection: 'users', id: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let points = 0;
    if (action === 'booking') {
      points = config.barbershop.loyalty.pointsPerBooking;
    } else if (action === 'referral') {
      points = config.barbershop.loyalty.pointsPerReferral;
    }

    const updatedUser = await payload.update({
      collection: 'users',
      id: userId,
      data: { loyalty: { points: (user.loyalty?.points || 0) + points } },
    });

    if (updatedUser.loyalty.points >= config.barbershop.loyalty.badgeThreshold) {
      // Assuming 'Loyal Client' badge is always added at this threshold
      await payload.update({
        collection: 'users',
        id: userId,
        data: { loyalty: { badges: { push: { badge: 'Loyal Client' } } } },
      });
    }

    if (updatedUser.loyalty.points >= config.barbershop.loyalty.rewardThreshold) {
      // Assuming 'reward' is always a discount
      await payload.update({
        collection: 'users',
        id: userId,
        data: { loyalty: { rewards: { push: { discount: config.barbershop.loyalty.rewardDiscount } } } },
      });

      if (config.email.enableNotifications) {
        try {
          await sendEmail({
            to: user.email,
            subject: 'Loyalty Reward Earned',
            html: `<p>Congratulations! You've earned a ${config.barbershop.loyalty.rewardDiscount}% discount.</p>${config.email.signature}`,
          });
        } catch (emailError) {
          console.error('Loyalty reward email notification failed:', emailError);
          // Continue processing even if email fails
        }
      }
    }

    return NextResponse.json(updatedUser.loyalty);
  } catch (error: any) {
    console.error('Error in loyalty API:', error);
    if (error.message.includes('Missing required fields') || error.message.includes('Invalid action')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.message.includes('User not found')) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to process loyalty action due to an internal server error' }, { status: 500 });
  }
}