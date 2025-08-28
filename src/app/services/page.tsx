import { Metadata } from 'next';
import ServicesPage from '@/components/ServicesPage';

export const metadata: Metadata = {
  title: 'Services - Modern Men Salon',
  description: 'Professional grooming services including haircuts, beard trims, shaves, and more. View our complete service menu and pricing.',
  keywords: ['haircuts', 'beard trim', 'shave', 'hair coloring', 'grooming services', 'pricing']
};

export default function Services() {
  return <ServicesPage />;
}