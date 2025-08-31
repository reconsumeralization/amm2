import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export const BarberHeader: React.FC = () => {
  return (
    <header className="relative bg-black text-white py-24 overflow-hidden">
      <div className="relative container mx-auto px-4 flex flex-col items-center text-center">
        <h1 className="text-5xl font-display font-light mb-4 tracking-tight">Modern Men</h1>
        <p className="text-lg font-body text-gray-200 mb-8 max-w-2xl">
          Premium cuts, classic shaves, and precision grooming.
        </p>
        <Link
          href="/services"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-8 rounded-full transition-colors"
        >
          Explore Services
        </Link>
      </div>
    </header>
  );
};
