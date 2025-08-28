import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const images = [
  '/images/gallery1.jpg',
  '/images/gallery2.jpg',
  '/images/gallery3.jpg',
  '/images/gallery4.jpg',
  '/images/gallery5.jpg',
  '/images/gallery6.jpg',
];

export const BarberGallery: React.FC = () => {
  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Our Space</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {images.map((src, idx) => (
            <motion.div
              key={idx}
              className="relative h-64 rounded overflow-hidden shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={src}
                alt={`Gallery ${idx + 1}`}
                layout="fill"
                objectFit="cover"
                className="object-cover"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
