/* Quote icon replaced with emoji to avoid external dependency */
import React from 'react';
import { motion } from 'framer-motion';

type Testimonial = {
  name: string;
  comment: string;
  avatar: string;
};

const testimonials: Testimonial[] = [
{
    name: 'James K.',
    comment: "Best haircut I've ever had. The vibe is amazing!",
    avatar: '/images/avatar1.jpg',
},
{
    name: 'Maria L.',
    comment: "The straight razor shave is pure perfection.",
    avatar: '/images/avatar2.jpg',
},
{
    name: 'Dylan S.',
    comment: "Friendly staff and top‑notch service every time.",
    avatar: '/images/avatar3.jpg',
},
];

export const BarberTestimonial: React.FC = () => {
  return (
      <section className="py-16 bg-gradient-to-r from-pink-50 to-purple-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Clients Say</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              className="bg-gradient-to-br from-pink-100 to-purple-200 rounded-xl shadow-lg p-6 flex flex-col items-center text-center transform transition duration-300 hover:scale-105"
              whileHover={{ scale: 1.03 }}
            >
              <img
                src={t.avatar}
                alt={t.name}
                className="w-20 h-20 rounded-full mb-4 object-cover"
              />
<span className="text-3xl mb-2">❝</span>
              <p className="italic mb-4">"{t.comment}"</p>
<span className="font-semibold">{t.name}</span>
</motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
