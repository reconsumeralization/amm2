import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
/* Removed react-icons import; using emoji icons instead */

type Service = {
  title: string;
  description: string;
  price: string;
  icon: ReactNode;
};

const services: Service[] = [
  {
    title: 'Classic Haircut',
    description: 'Precision cut tailored to your style.',
    price: '$30',
    icon: <span className="text-3xl">✂️</span>,
  },
  {
    title: 'Straight Razor Shave',
    description: 'Smooth, close shave with hot towel treatment.',
    price: '$25',
    icon: <span className="text-3xl">🪒</span>,
  },
  {
    title: 'Beard Grooming',
    description: 'Trim, shape, and condition for a polished look.',
    price: '$20',
    icon: <span className="text-3xl">🧔</span>,
  },
];

export const ServiceCard: React.FC = () => {
  return (
    <section id="services" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-display font-light text-center mb-14">Our Services</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {services.map((svc) => (
            <motion.div
              key={svc.title}
              className="card-premium p-8 text-center hover-lift"
              whileHover={{ scale: 1.02 }}
            >
              <div className="mb-4 text-black">{svc.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{svc.title}</h3>
              <p className="text-gray-600 mb-6">{svc.description}</p>
              <span className="inline-block px-4 py-1 rounded-full border border-black text-black font-medium">
                {svc.price}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
