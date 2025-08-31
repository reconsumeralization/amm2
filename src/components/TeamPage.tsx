'use client';

import { TeamMember } from '@/components/features/barber/TeamMember';

interface Stylist {
  id: string;
  name: string;
  role?: string;
  specialty?: string;
  bio?: string;
  image?: string;
}

interface TeamPageProps {
  stylists?: Stylist[];
}

export default function TeamPage({ stylists }: TeamPageProps) {
  // If no stylists provided, use default fallback
  const teamMembers = stylists || [
    { id: '1', name: 'Alex', role: 'Lead Stylist', bio: 'Modern styles and fades.', image: '/images/team/alex.jpg' },
    { id: '2', name: 'Jordan', role: 'Barber', bio: 'Classic cuts and shaves.', image: '/images/team/jordan.jpg' },
    { id: '3', name: 'Sam', role: 'Beard Specialist', bio: 'Precision beard shaping.', image: '/images/team/sam.jpg' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {teamMembers.map((stylist) => (
        <TeamMember
          key={stylist.id}
          name={stylist.name}
          role={stylist.role}
          specialty={stylist.specialty}
          bio={stylist.bio}
          image={stylist.image}
        />
      ))}
    </div>
  );
}
