'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
// Icons replaced with placeholder divs to avoid lucide-react import issues

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  duration: number;
  category: string;
  capacity: number;
  attendees: string[];
  waitlist: string[];
  price: number;
  image: {
    url: string;
    alt?: string;
  };
  location: {
    type: 'store' | 'online' | 'external';
    address?: string;
    zoomLink?: string;
  };
  instructor?: {
    name: string;
  };
  loyaltyPoints: number;
  featured: boolean;
  isActive: boolean;
}

interface EventsSectionProps {
  userId?: string;
  limit?: number;
  showPast?: boolean;
}

export default function EventsSection({ userId, limit = 6, showPast = false }: EventsSectionProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rsvpLoading, setRsvpLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [showPast]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: limit.toString(),
        isActive: 'true',
        sort: 'date',
      });

      if (!showPast) {
        params.append('date', new Date().toISOString());
      }

      const response = await fetch(`/api/events?${params}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      
      const data = await response.json();
      setEvents(data.docs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (eventId: string, action: 'attend' | 'waitlist' | 'cancel') => {
    if (!userId) {
      setError('Please log in to RSVP for events');
      return;
    }

    try {
      setRsvpLoading(eventId);
      const response = await fetch('/api/events/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, userId, action }),
      });

      if (!response.ok) throw new Error('Failed to process RSVP');

      const responseData = await response.json();
      
      // Update local state
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? { 
                ...event,
                attendees: responseData.attendees || event.attendees,
                waitlist: responseData.waitlist || event.waitlist,
              }
            : event
        )
      );
      
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process RSVP');
    } finally {
      setRsvpLoading(null);
    }
  };

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    const isPast = eventDate < now;
    const isFull = event.attendees.length >= event.capacity;
    const isAttending = userId && event.attendees.includes(userId);
    const isWaitlisted = userId && event.waitlist.includes(userId);

    if (isPast) return { status: 'past', label: 'Past Event', color: 'gray' };
    if (isAttending) return { status: 'attending', label: 'Attending', color: 'green' };
    if (isWaitlisted) return { status: 'waitlisted', label: 'Waitlisted', color: 'yellow' };
    if (isFull) return { status: 'full', label: 'Full', color: 'red' };
    return { status: 'available', label: 'Available', color: 'blue' };
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    return `$${(price / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <Button onClick={fetchEvents} variant="outline" className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="h-12 w-12 mx-auto text-gray-400 mb-4 flex items-center justify-center">📅</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Events Available</h3>
        <p className="text-gray-500">
          {showPast ? 'No past events found.' : 'Check back soon for upcoming events!'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {showPast ? 'Past Events' : 'Upcoming Events'}
        </h2>
        {userId && (
          <Button variant="outline" onClick={() => window.location.href = '/events'}>
            View All Events
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => {
          const status = getEventStatus(event);
          const isPast = new Date(event.date) < new Date();
          const isFull = event.attendees.length >= event.capacity;
          const isAttending = userId && event.attendees.includes(userId);
          const isWaitlisted = userId && event.waitlist.includes(userId);

          return (
            <Card key={event.id} className={`relative ${event.featured ? 'ring-2 ring-yellow-400' : ''}`}>
              {event.featured && (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    <div className="h-3 w-3 mr-1">⭐</div>
                    Featured
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="aspect-video relative overflow-hidden rounded-lg mb-4">
                  <img
                    src={event.image.url}
                    alt={event.image.alt || event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{event.title}</CardTitle>
                    <Badge variant="outline" className="mb-2">
                      {event.category}
                    </Badge>
                    <Badge 
                      variant={status.color === 'green' ? 'default' : 'secondary'}
                      className={`ml-2 ${
                        status.color === 'green' ? 'bg-green-100 text-green-800' :
                        status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        status.color === 'red' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {status.label}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <div className="h-4 w-4 mr-2">📅</div>
                    {formatDate(event.date)}
                  </div>
                  <div className="flex items-center">
                    <div className="h-4 w-4 mr-2">🕐</div>
                    {formatTime(event.date)} • {event.duration} min
                  </div>
                  <div className="flex items-center">
                    <div className="h-4 w-4 mr-2">📍</div>
                    {event.location.type === 'online' ? 'Online Event' :
                     event.location.type === 'external' ? event.location.address :
                     'In-Store Event'}
                  </div>
                  <div className="flex items-center">
                    <div className="h-4 w-4 mr-2">👥</div>  
                    {event.attendees.length}/{event.capacity} attendees
                    {event.waitlist.length > 0 && ` (${event.waitlist.length} waitlisted)`}
                  </div>
                  {event.instructor && (
                    <div className="text-sm">
                      <strong>Instructor:</strong> {event.instructor.name}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold">
                    {formatPrice(event.price)}
                  </div>
                  {event.loyaltyPoints > 0 && (
                    <Badge variant="outline" className="text-xs">
                      +{event.loyaltyPoints} pts
                    </Badge>
                  )}
                </div>

                {!isPast && userId && (
                  <div className="space-y-2">
                    {isAttending ? (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleRSVP(event.id, 'cancel')}
                        disabled={rsvpLoading === event.id}
                      >
                        {rsvpLoading === event.id ? 'Cancelling...' : 'Cancel RSVP'}
                      </Button>
                    ) : isWaitlisted ? (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleRSVP(event.id, 'cancel')}
                        disabled={rsvpLoading === event.id}
                      >
                        {rsvpLoading === event.id ? 'Removing...' : 'Remove from Waitlist'}
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <Button 
                          className="w-full"
                          onClick={() => handleRSVP(event.id, 'attend')}
                          disabled={rsvpLoading === event.id || isFull}
                        >
                          {rsvpLoading === event.id ? 'Processing...' : 
                           isFull ? 'Event Full' : 'RSVP Now'}
                        </Button>
                        {isFull && (
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => handleRSVP(event.id, 'waitlist')}
                            disabled={rsvpLoading === event.id}
                          >
                            {rsvpLoading === event.id ? 'Adding...' : 'Join Waitlist'}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {event.location.type === 'online' && event.location.zoomLink && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.open(event.location.zoomLink, '_blank')}
                  >
                    <div className="h-4 w-4 mr-2">🔗</div>
                    Join Meeting
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
