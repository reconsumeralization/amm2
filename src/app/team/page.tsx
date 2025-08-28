import { Metadata } from 'next';
import TeamPage from '@/components/TeamPage';

export const metadata: Metadata = {
  title: 'Our Team - Modern Men Salon',
  description: 'Meet our expert stylists and grooming professionals. Each team member brings unique skills and experience to provide you with the best service.',
  keywords: ['stylists', 'barbers', 'grooming professionals', 'team', 'experts']
};

export default function Team() {
  return <TeamPage />;
}