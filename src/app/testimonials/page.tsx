import { Metadata } from 'next';
import TestimonialsPage from '@/components/TestimonialsPage';

export const metadata: Metadata = {
  title: 'Testimonials - Modern Men Salon',
  description: 'Read what our clients say about their experience at Modern Men Salon. Real reviews from satisfied customers.',
  keywords: ['testimonials', 'reviews', 'customer feedback', 'modern men salon']
};

export default function Testimonials() {
  return <TestimonialsPage />;
}