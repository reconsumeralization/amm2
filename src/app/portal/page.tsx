import { getPayload } from 'payload';
import BookingChatbot from '@/components/chatbot/BookingChatbot';

export default async function PortalPage({ params }: { params: Promise<{ userId?: string }> }) {
  const payload = await getPayload({ config: (await import('@/payload.config')).default });

  const { userId: paramUserId } = await params;

  // For now, use paramUserId or redirect if not provided
  if (!paramUserId) {
    // Instead of redirect, we'll handle this in the component
    return (
      <div>
        <p>Please sign in to access the portal.</p>
        <a href="/auth/signin">Sign In</a>
      </div>
    );
  }

  const userId = paramUserId;

  const user = await payload.findByID({ collection: 'users', id: userId });
  if (!user) {
    // Handle case where user ID is invalid or user not found
    return (
      <div>
        <p>User not found. Please sign in again.</p>
        <a href="/auth/signin">Sign In</a>
      </div>
    );
  }

  const tenantId = user.tenant?.id; // Get tenantId from the user object
  if (!tenantId) {
    // Handle case where user has no tenant assigned
    return <div>Error: User not assigned to a tenant.</div>;
  }

  const settings = await payload.find({
    collection: 'settings',
    where: { tenant: { equals: tenantId } },
    limit: 1,
  });
  const config = settings.docs[0] || {}; // Ensure config is an object even if no settings found

  // All other fetches
  const appointments = await payload.find({
    collection: 'appointments',
    where: { user: { equals: userId }, status: { in: ['confirmed', 'rescheduled'] } },
  });
  const clockRecords = await payload.find({
    collection: 'clock-records',
    where: { staff: { equals: userId } },
    sort: '-timestamp',
    limit: 1,
  });
  const analytics = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/analytics/appointments`).then((res) => res.json()); // Use full URL for API calls

  return (
    <div className="container mx-auto p-4" style={{ backgroundColor: config.portal?.themeColor }}>
      <h1 className="text-2xl mb-4">Customer Portal</h1>
      {user.role === 'staff' && config.clock?.enabled && (
        <section className="mb-8">
          <h2 className="text-xl mb-2">Clock Status</h2>
          <p>
            {clockRecords.docs.length
              ? `Last ${clockRecords.docs[0].action} at ${new Date(clockRecords.docs[0].timestamp).toLocaleString()}`
              : 'No clock records found.'}
          </p>
        </section>
      )}
      {config.portal?.showAppointments && (
        <section className="mb-8">
          <h2 className="text-xl mb-2">Your Appointments</h2>
          {appointments.docs.map((appt) => (
            <div key={appt.id}>
              {appt.service} on {new Date(appt.date).toLocaleString()} with {appt.staff?.name || 'Unassigned'} - {appt.status}
            </div>
          ))}
        </section>
      )}
      {config.portal?.showServices && (
        <section className="mb-8">
          <h2 className="text-xl mb-2">Available Services</h2>
          {config.barbershop?.services?.map((service: any) => (
            <div key={service.name}>
              <h3>{service.name} - {config.stripe?.currency?.toUpperCase()} {service.price}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </section>
      )}
      {config.portal?.showTrends && (
        <section className="mb-8">
          <h2 className="text-xl mb-2">Booking Trends</h2>
          <p>{analytics.length} confirmed bookings this month</p>
        </section>
      )}
      {config.chatbot?.enabled && (
        <section>
          <h2 className="text-xl mb-2">Book or Manage Appointments</h2>
          <BookingChatbot userId={userId} tenantId={tenantId} />
        </section>
      )}
    </div>
  );
}