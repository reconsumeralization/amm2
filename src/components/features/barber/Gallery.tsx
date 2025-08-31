import React from 'react';
import { motion } from 'framer-motion';

export const BarberGallery: React.FC = () => {
  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Our Space</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <motion.div
              key={idx}
              className="relative h-64 rounded overflow-hidden shadow-lg bg-gray-200 flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-gray-500">Image coming soon</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
