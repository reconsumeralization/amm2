/* Quote icon replaced with emoji to avoid external dependency */
import React from 'react';
import { motion } from 'framer-motion';

type Testimonial = {
  name: string;
  comment: string;
};

const testimonials: Testimonial[] = [
  {
    name: 'James K.',
    comment: "Best haircut I've ever had. The vibe is amazing!",
  },
  {
    name: 'Maria L.',
    comment: 'The straight razor shave is pure perfection.',
  },
  {
    name: 'Dylan S.',
    comment: 'Friendly staff and top‑notch service every time.',
  },
];

export const BarberTestimonial: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-display font-light text-center mb-14">What Our Clients Say</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              className="card-premium p-8 text-center hover-lift"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-20 h-20 rounded-full mb-4 bg-black text-white flex items-center justify-center mx-auto font-semibold">
                {t.name.split(' ').map((n) => n[0]).join('').slice(0,2)}
              </div>
              <span className="text-3xl mb-2 block accent-red">❝</span>
              <p className="italic mb-4 text-gray-700">"{t.comment}"</p>
              <span className="font-semibold">{t.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
