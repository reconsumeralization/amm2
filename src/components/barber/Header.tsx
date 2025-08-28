import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export const BarberHeader: React.FC = () => {
  return (
<header className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20 overflow-hidden">
      <div className="container mx-auto px-4 flex flex-col items-center text-center">
        <h1 className="text-5xl font-extrabold mb-4">Modern Men Barber Shop</h1>
        <p className="text-xl mb-8">
          Premium cuts, classic shaves, and a vibe you won't find anywhere else.
        </p>
        <Link
          href="#services"
          className="bg-white text-indigo-700 font-semibold py-3 px-6 rounded-full hover:bg-gray-100 transition"
        >
          Explore Services
        </Link>
      </div>
<div className="absolute inset-0 overflow-hidden opacity-30">
<motion.div
  className="absolute inset-0"
  initial={{ scale: 1.2 }}
  animate={{ scale: 1 }}
  transition={{ duration: 1.5, ease: "easeOut" }}
>
  <Image
    src="/images/barber-hero.jpg"
    alt="Barber shop interior"
    layout="fill"
    objectFit="cover"
    priority
  />
</motion.div>
      </div>
    </header>
  );
};
