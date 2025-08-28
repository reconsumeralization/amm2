'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Scissors,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Clock,
  Star,
  Heart,
  Award,
  Users
} from '@/lib/icon-mapping';

const footerLinks = {
  services: [
    { name: 'Haircuts & Styling', href: '/services#haircuts' },
    { name: 'Beard Grooming', href: '/services#beard' },
    { name: 'Straight Razor Shave', href: '/services#shave' },
    { name: 'Hot Towel Treatment', href: '/services#hot-towel' },
    { name: 'Color Services', href: '/services#color' },
    { name: 'Scalp Treatment', href: '/services#scalp' }
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Our Team', href: '/team' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Testimonials', href: '/testimonials' },
    { name: 'Contact', href: '/contact' },
    { name: 'Careers', href: '/careers' }
  ],
  support: [
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Booking Policy', href: '/booking-policy' },
    { name: 'Cancellation Policy', href: '/cancellation' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Support', href: '/support' }
  ]
};

const socialLinks = [
  { name: 'Facebook', href: '#', icon: Facebook },
  { name: 'Instagram', href: '#', icon: Instagram },
  { name: 'Phone', href: 'tel:(306)522-4111', icon: Phone },
  { name: 'Email', href: 'mailto:info@modernmen.ca', icon: Mail }
];

const stats = [
  { label: 'Happy Clients', value: '500+', icon: Users },
  { label: 'Years Experience', value: '15+', icon: Award },
  { label: '5-Star Reviews', value: '4.9/5', icon: Star },
  { label: 'Awards Won', value: '12', icon: Heart }
];

export function Footer() {
  return (
    <footer className="bg-black text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-600 rounded-lg">
                <Scissors className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">MODERN MEN</h3>
                <p className="text-red-400 text-sm">Premium barber shop</p>
              </div>
            </div>

            <p className="text-gray-300 mb-6 max-w-md">
              Regina's premier destination for men's grooming. We combine traditional barbering techniques
              with modern styling approaches to deliver exceptional service and timeless looks.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-3"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-red-600 rounded-lg">
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Services Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold text-white mb-4">Services</h4>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-red-400 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-red-400 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Support Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <h4 className="text-lg font-semibold text-white mb-4">Support & Legal</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {footerLinks.support.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-gray-300 hover:text-red-400 transition-colors duration-200 text-sm"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="bg-gray-900 rounded-lg p-6 mb-8"
        >
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-red-400" />
            Visit Us
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h5 className="font-medium text-white mb-2">Address</h5>
              <p className="text-gray-300 text-sm">
                #4 - 425 Victoria Ave East<br />
                Regina, SK S4N 0P8
              </p>
            </div>
            <div>
              <h5 className="font-medium text-white mb-2 flex items-center">
                <Phone className="h-4 w-4 mr-1 text-red-400" />
                Phone
              </h5>
              <a
                href="tel:(306)522-4111"
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                (306) 522-4111
              </a>
            </div>
            <div>
              <h5 className="font-medium text-white mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-1 text-red-400" />
                Hours
              </h5>
              <div className="text-gray-300 text-sm">
                <div>Mon-Fri: 9am-8pm</div>
                <div>Saturday: 9am-8pm</div>
                <div>Sunday: Closed</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Social Links & Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-800"
        >
          <div className="flex space-x-4 mb-4 md:mb-0">
            {socialLinks.map((social) => (
              <motion.a
                key={social.name}
                href={social.href}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-lg transition-colors duration-200"
              >
                <social.icon className="h-5 w-5 text-gray-300 hover:text-white" />
              </motion.a>
            ))}
          </div>

          <div className="text-center md:text-right">
            <p className="text-gray-400 text-sm">
              © 2024 Modern Men barber shop. All rights reserved.
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Made with <Heart className="inline h-3 w-3 text-red-400" /> for exceptional grooming
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}