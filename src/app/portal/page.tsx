import BookingChatbot from '@/components/chatbot/BookingChatbot';
import { redirect } from 'next/navigation';

export default async function PortalPage({ params }: { params: Promise<{ userId?: string }> }) {
  try {
    const { getPayloadClient } = await import('@/payload')
    const payload = await getPayloadClient();

    const { userId: paramUserId } = await params;

    // For now, use paramUserId or redirect if not provided
    if (!paramUserId) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Portal</h1>
            <p className="text-gray-600 mb-6">Please sign in to access the portal.</p>
            <a
              href="/auth/signin"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
            >
              Sign In
            </a>
          </div>
        </div>
      );
    }

    const userId = paramUserId;

    const user = await payload.findByID({ collection: 'users', id: userId }).catch(() => null);
    if (!user) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h1>
            <p className="text-gray-600 mb-6">Please sign in again.</p>
            <a
              href="/auth/signin"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
            >
              Sign In
            </a>
          </div>
        </div>
      );
    }

    const tenantId = user.tenant?.id; // Get tenantId from the user object
    if (!tenantId) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Configuration Error</h1>
            <p className="text-gray-600 mb-6">User not assigned to a tenant.</p>
            <a
              href="/auth/signin"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
            >
              Back to Sign In
            </a>
          </div>
        </div>
      );
    }

    const settings = await payload.find({
      collection: 'settings',
      where: { tenant: { equals: tenantId } },
      limit: 1,
    }).catch(() => ({ docs: [] }));

    const config = (settings.docs[0] || {}) as any;

    // All other fetches with error handling
    const appointments = await payload.find({
      collection: 'appointments',
      where: { user: { equals: userId }, status: { in: ['confirmed', 'rescheduled'] } },
    }).catch(() => ({ docs: [] }));

    const clockRecords = await payload.find({
      collection: 'clock-records',
      where: { staff: { equals: userId } },
      sort: '-timestamp',
      limit: 1,
    }).catch(() => ({ docs: [] }));

    const analytics = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/analytics/appointments`)
      .then((res) => res.json())
      .catch(() => ({ length: 0 }));

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
          {/* @ts-ignore */}
          {appointments.docs.map((appt: any) => (
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
  } catch (error) {
    console.error('Portal page error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Portal Unavailable</h1>
          <p className="text-gray-600 mb-6">We're experiencing technical difficulties. Please try again later.</p>
          <a
            href="/"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }
}