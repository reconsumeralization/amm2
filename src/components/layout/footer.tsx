'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Phone, MapPin, Bell, ExternalLink, Facebook, Instagram, Mail, Clock, Award, Users, Star } from '@/lib/icon-mapping'

const footerStats = [
  { icon: Star, value: '4.9/5', label: 'Average Rating' },
  { icon: Users, value: '2,500+', label: 'Happy Clients' },
  { icon: Award, value: '20+', label: 'Years Experience' }
]

const quickLinks = [
  { name: 'Book Appointment', href: '/book', icon: '📅' },
  { name: 'Our Services', href: '/services', icon: '✂️' },
  { name: 'Meet The Team', href: '/team', icon: '👥' },
  { name: 'About Us', href: '/about', icon: 'ℹ️' },
  { name: 'Contact', href: '/contact', icon: '📞' },
  { name: 'Customer Portal', href: '/portal', icon: '🔐' },
  { name: 'FAQ', href: '/faq', icon: '❓' },
  { name: 'Careers', href: '/careers', icon: '💼' },
  { name: 'Gift Cards', href: '/gift-cards', icon: '🎁' },
  { name: 'Privacy Policy', href: '/privacy-policy', icon: '🔒' },
  { name: 'Terms of Service', href: '/terms', icon: '📜' }
]

const services = [
  'Modern Cut',
  'Skin Fade', 
  'Beard Trim & Line-up',
  'Hot Towel Shave',
  'Express Clean-up',
  'Kids Cut'
]

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {footerStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg">
                <stat.icon className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-sm text-gray-300">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Link href="/" className="inline-block mb-6">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow-lg">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">Modern Men</div>
                    <div className="text-sm text-amber-400">Premium BarberShop</div>
                  </div>
                </div>
              </Link>
              
              <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
                Regina's premier destination for men's grooming. Experience the highest level of 
                service and satisfaction with our team of talented stylists and barbers.
              </p>
              
              <div className="flex space-x-4 mb-6">
                <motion.a 
                  href="#" 
                  className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-amber-400 hover:bg-white/20 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Facebook className="h-5 w-5" />
                </motion.a>
                <motion.a 
                  href="#" 
                  className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-amber-400 hover:bg-white/20 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Instagram className="h-5 w-5" />
                </motion.a>
                <motion.a 
                  href="mailto:info@modernmen.ca" 
                  className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-amber-400 hover:bg-white/20 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Mail className="h-5 w-5" />
                </motion.a>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  asChild
                >
                  <Link href="/book">
                    <Clock className="mr-2 h-4 w-4" />
                    Book Your Appointment
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-amber-400" />
              Quick Links
            </h3>
            <div className="space-y-3">
              {quickLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link 
                    href={link.href}
                    className="flex items-center gap-2 text-gray-300 hover:text-amber-400 transition-colors duration-300 group"
                  >
                    <span className="text-sm">{link.icon}</span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {link.name}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-400" />
              Our Services
            </h3>
            <div className="space-y-3">
              {services.map((service, index) => (
                <motion.div
                  key={service}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link 
                    href="/services"
                    className="text-gray-300 hover:text-amber-400 transition-colors duration-300 group flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-amber-400 rounded-full group-hover:scale-150 transition-transform duration-300"></span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {service}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact & Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Phone className="h-5 w-5 text-amber-400" />
              Contact & Hours
            </h3>
            
            {/* Contact Info */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-300">
                <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                  <Phone className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">(306) 522-4111</p>
                  <p className="text-xs text-gray-400">Main Line</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-300">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">#4 - 425 Victoria Ave East</p>
                  <p className="text-xs text-gray-400">Regina, SK, S4N 0N8</p>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5 transition-colors duration-300">
                <span className="text-gray-300 text-sm">Mon</span>
                <span className="text-amber-400 font-medium text-sm">9am - 6pm</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5 transition-colors duration-300">
                <span className="text-gray-300 text-sm">Tue</span>
                <span className="text-amber-400 font-medium text-sm">9am - 5pm</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5 transition-colors duration-300">
                <span className="text-gray-300 text-sm">Wed</span>
                <span className="text-amber-400 font-medium text-sm">9am - 8pm</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5 transition-colors duration-300">
                <span className="text-gray-300 text-sm">Thu</span>
                <span className="text-amber-400 font-medium text-sm">9am - 8pm</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5 transition-colors duration-300">
                <span className="text-gray-300 text-sm">Fri</span>
                <span className="text-amber-400 font-medium text-sm">9am - 5pm</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5 transition-colors duration-300">
                <span className="text-gray-300 text-sm">Sat</span>
                <span className="text-amber-400 font-medium text-sm">9am - 5pm</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5 transition-colors duration-300">
                <span className="text-gray-300 text-sm">Sun</span>
                <span className="text-red-400 font-medium text-sm">Closed</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div 
          className="border-t border-gray-800 mt-16 pt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <p className="text-gray-400 text-sm">
                © 2025 Modern Men Hair BarberShop. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <Link href="/privacy-policy" className="text-gray-400 hover:text-amber-400 text-sm transition-colors duration-300">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-gray-400 hover:text-amber-400 text-sm transition-colors duration-300">
                  Terms of Service
                </Link>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 border-amber-400/30">
                  ⭐ 4.9/5 Rating
                </Badge>
                <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-400/30">
                  🏆 Award Winning
                </Badge>
              </div>
              <p className="text-gray-400 text-sm">
                Please give us 24 hours notice for cancellations
              </p>
            </div>
          </div>
          
          {/* Back to Top Button */}
          <motion.div 
            className="flex justify-center mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            viewport={{ once: true }}
          >
            <motion.button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg transition-all duration-300 border border-white/20 hover:border-white/40"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>↑</span>
              <span>Back to Top</span>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  )
}
