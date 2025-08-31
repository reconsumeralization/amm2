'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function Footer() {
  const fadeIn = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" },
    viewport: { once: true }
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true },
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  };

  const staggerItem = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <footer className="relative bg-gradient-to-br from-black via-gray-900 to-black text-white mt-24 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23dc2626' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-red-600/10 rounded-full -translate-x-20 -translate-y-20"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-500/10 rounded-full translate-x-16 translate-y-16"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-red-400/5 rounded-full"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <motion.div
          className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 mb-16"
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
        >
          {/* Brand Section */}
          <motion.div variants={staggerItem} className="lg:col-span-1">
            <motion.div
              className="flex items-center mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <div className="h-6 w-6 text-white">✂️</div>
                </div>
                <div className="absolute -inset-1 bg-red-500 rounded-2xl opacity-30 -z-10"></div>
              </div>
              <h3 className="text-3xl font-light ml-4 tracking-tight text-white">
                Modern <span className="font-semibold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">Men</span>
              </h3>
            </motion.div>
            <p className="text-gray-300 leading-relaxed mb-6">
              Regina's premier destination for sophisticated gentlemen's grooming.
              Where traditional craftsmanship meets modern style.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-400">
                <div className="h-4 w-4 mr-3">🏆</div>
                <span>15+ Years of Excellence</span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <div className="h-4 w-4 mr-3">⭐</div>
                <span>500+ Satisfied Clients</span>
              </div>
            </div>
          </motion.div>

          {/* Contact Section */}
          <motion.div variants={staggerItem}>
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center mr-3">
                <div className="h-5 w-5 text-red-600">📍</div>
              </div>
              <h4 className="text-xl font-semibold text-white">Visit Us</h4>
            </div>
            <div className="space-y-4">
              <motion.div
                className="group"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-gray-300 leading-relaxed group-hover:text-white transition-colors duration-200">
                  #4 - 425 Victoria Ave East<br />
                  Regina, SK S4N 0P8
                </p>
              </motion.div>
              <motion.div
                className="group"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center">
                  <div className="h-4 w-4 text-red-400 mr-3">📞</div>
                  <a 
                    href="tel:+13065224111" 
                    className="text-red-400 font-semibold text-lg hover:text-red-300 transition-colors duration-200"
                  >
                    (306) 522-4111
                  </a>
                </div>
              </motion.div>
              <motion.div
                className="group"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center">
                  <div className="h-4 w-4 text-red-400 mr-3">✉️</div>
                  <a 
                    href="mailto:info@modernmen.ca" 
                    className="text-gray-300 hover:text-red-400 transition-colors duration-200"
                  >
                    info@modernmen.ca
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Navigation Section */}
          <motion.div variants={staggerItem}>
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center mr-3">
                <div className="h-5 w-5 text-red-600">🧭</div>
              </div>
              <h4 className="text-xl font-semibold text-white">Navigate</h4>
            </div>
            <ul className="space-y-3">
              {[
                { href: '/services', label: 'Our Services' },
                { href: '/team', label: 'Meet the Team' },
                { href: '/about', label: 'Our Story' },
                { href: '/gallery', label: 'Gallery' },
                { href: '/contact', label: 'Contact Us' },
                { href: '/faq', label: 'FAQ' }
              ].map((link) => (
                <li key={link.href}>
                  <motion.div
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link 
                      href={link.href} 
                      className="text-gray-300 hover:text-red-400 transition-all duration-200 flex items-center group"
                    >
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                      {link.label}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Hours & Social Section */}
          <motion.div variants={staggerItem}>
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center mr-3">
                <div className="h-5 w-5 text-red-600">🕒</div>
              </div>
              <h4 className="text-xl font-semibold text-white">Hours</h4>
            </div>
            <div className="space-y-3 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Mon - Fri</span>
                <span className="text-red-400 font-medium">9AM - 8PM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Saturday</span>
                <span className="text-red-400 font-medium">9AM - 8PM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Sunday</span>
                <span className="text-gray-500 font-medium">Closed</span>
              </div>
            </div>

            <div className="mb-8">
              <h5 className="text-lg font-semibold text-white mb-4">Follow Us</h5>
              <div className="flex gap-4">
                {[
                  { href: '#', label: 'Instagram', icon: '📸' },
                  { href: '#', label: 'Facebook', icon: '👥' },
                  { href: '#', label: 'TikTok', icon: '🎵' }
                ].map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    className="w-12 h-12 bg-gray-800 hover:bg-red-600 rounded-2xl flex items-center justify-center transition-all duration-300 group shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors duration-300">
                      {social.icon}
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Link href="/book">
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 group">
                  <div className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform duration-300">📅</div>
                  Book Appointment
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <motion.div
          className="w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-8"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: true }}
        />

        {/* Bottom Section */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-center"
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
        >
          <motion.div variants={staggerItem} className="mb-4 md:mb-0">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Modern Men Hair barber. All rights reserved.
            </p>
          </motion.div>
          
          <motion.div variants={staggerItem} className="flex items-center space-x-6">
            <Link href="/privacy-policy" className="text-gray-400 hover:text-red-400 text-sm transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-red-400 text-sm transition-colors duration-200">
              Terms of Service
            </Link>
            <div className="flex items-center text-gray-400 text-sm">
              <div className="h-4 w-4 mr-2">❤️</div>
              <span>Crafted in Regina, SK</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Tagline */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.7 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-500 text-xs font-light tracking-widest uppercase">
            WHERE SOPHISTICATION MEETS CRAFTSMANSHIP
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
