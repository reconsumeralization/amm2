import React from 'react';
import { motion } from 'framer-motion';
/* Removed react-icons import; using emoji icons instead */

type Service = {
  title: string;
  description: string;
  price: string;
  icon: React.ReactNode;
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
    <section id="services" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {services.map((svc) => (
          <motion.div
            key={svc.title}
            className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl shadow-lg p-6 flex flex-col items-center text-center transform transition duration-300 hover:scale-105"
            whileHover={{ scale: 1.03 }}
          >
              <div className="text-indigo-600 mb-4">{svc.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{svc.title}</h3>
              <p className="text-gray-600 mb-4">{svc.description}</p>
              <span className="text-indigo-700 font-bold">{svc.price}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
