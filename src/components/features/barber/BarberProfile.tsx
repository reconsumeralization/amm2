'use client';
import { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import Image from 'next/image';
import BookingChatbot from '@/components/chatbot/BookingChatbot';
import { getSettings } from '@/utils/settings';
import { getBarberProfile } from '@/utils/api';

interface BarberProfileProps {
  barberId: string;
  tenantId: string;
}

export default function BarberProfile({ barberId, tenantId }: BarberProfileProps) {
  const [cookies] = useCookies(['chatbot_display']);
  const [profile, setProfile] = useState<any>(null);
  const [settings, setSettings] = useState<any>({});
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileData, settingsData] = await Promise.all([
          getBarberProfile(barberId, tenantId),
          getSettings(tenantId),
        ]);
        setProfile(profileData);
        setSettings(settingsData);
        const testimonialsData = await fetch(`/api/testimonials?barberId=${barberId}&tenantId=${tenantId}`).then((res) => res.json());
        setTestimonials(testimonialsData.docs || []);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    }
    fetchData();
  }, [barberId, tenantId]);

  const handleCommentSubmit = async () => {
    try {
      await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': tenantId },
        body: JSON.stringify({ content: newComment, barber: barberId, tenant: tenantId }),
      });
      setNewComment('');
      setTestimonials((prev) => [...prev, { content: newComment, likes: 0, status: 'pending' }]);
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const handleLike = async (testimonialId: string) => {
    try {
      await fetch(`/api/testimonials/${testimonialId}/like`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': tenantId },
      });
      setTestimonials((prev) =>
        prev.map((t) => (t.id === testimonialId ? { ...t, likes: t.likes + 1 } : t))
      );
    } catch (error) {
      console.error('Error liking testimonial:', error);
    }
  };

  const handleShare = (platform: 'facebook' | 'twitter' | 'instagram') => {
    const url = `${window.location.origin}/portal/barbers/${barberId}`;
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=Check out this barber!`,
      instagram: `https://www.instagram.com/?url=${encodeURIComponent(url)}`, // Note: Instagram sharing requires manual posting
    };
    window.open(shareUrls[platform], '_blank');
  };

  if (!settings.barberProfiles?.enabled || !profile) {
    return <div>Profile not available.</div>;
  }

  return (
    <div className="container mx-auto p-4" style={{ backgroundColor: settings.portal?.themeColor }}>
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center mb-4">
          {profile.profilePhoto && (
            <Image
              src={profile.profilePhoto.url}
              alt={`${profile.name}'s profile photo`}
              width={100}
              height={100}
              className="rounded-full mr-4"
              loading="lazy"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            <p className="text-gray-600">{profile.bio}</p>
            <p className="text-gray-600">Specialties: {profile.specialties?.map((s: any) => s.specialty).join(', ')}</p>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold">Portfolio</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {profile.portfolio?.map((image: any) => (
              <Image
                key={image.id}
                src={image.url}
                alt="Portfolio image"
                width={300}
                height={200}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"

                className="rounded-lg"
                loading="lazy"
              />
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold">Testimonials</h2>
          {settings.barberProfiles.allowComments && (
            <div className="mb-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-2 border rounded"
                aria-label="Comment input"
              />
              <button
                onClick={handleCommentSubmit}
                className="mt-2 bg-blue-500 text-white p-2 rounded"
                aria-label="Submit comment"
              >
                Submit
              </button>
            </div>
          )}
          {testimonials
            .filter((t) => t.status === 'approved')
            .map((testimonial) => (
              <div key={testimonial.id} className="border-b py-2">
                <p>{testimonial.content}</p>
                {settings.barberProfiles.allowLikes && (
                  <button
                    onClick={() => handleLike(testimonial.id)}
                    className="text-blue-500"
                    aria-label={`Like ${testimonial.content}`}
                  >
                    Like ({testimonial.likes})
                  </button>
                )}
              </div>
            ))}
        </div>

        {settings.barberProfiles.allowSharing && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Share Profile</h2>
            <button onClick={() => handleShare('facebook')} className="mr-2 bg-blue-600 text-white p-2 rounded">
              Share on Facebook
            </button>
            <button onClick={() => handleShare('twitter')} className="mr-2 bg-blue-400 text-white p-2 rounded">
              Share on Twitter
            </button>
            <button onClick={() => handleShare('instagram')} className="bg-pink-500 text-white p-2 rounded">
              Share on Instagram
            </button>
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold">Book Now</h2>
          {cookies.chatbot_display && settings.chatbot.enabled && (
            <BookingChatbot tenantId={tenantId} />
          )}
        </div>
      </div>
    </div>
  );
}