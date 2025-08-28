'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, MapPin, Clock, Calendar, ExternalLink, Facebook, Instagram, Mail, Star, Award, Users } from '@/lib/icon-mapping'

const hours = [
  { day: 'Monday', time: '9am - 6pm' },
  { day: 'Tuesday', time: '9am - 5pm' },
  { day: 'Wednesday', time: '9am - 8pm' },
  { day: 'Thursday', time: '9am - 8pm' },
  { day: 'Friday', time: '9am - 5pm' },
  { day: 'Saturday', time: '9am - 5pm' },
  { day: 'Sunday', time: 'Closed' }
]

const contactStats = [
  { icon: Star, value: '4.9/5', label: 'Average Rating', color: 'from-green-500 to-green-600' },
  { icon: Users, value: '2,500+', label: 'Happy Clients', color: 'from-blue-500 to-blue-600' },
  { icon: Award, value: '20+', label: 'Years Experience', color: 'from-amber-500 to-amber-600' }
]

export function ContactSection() {
  const [activeTab, setActiveTab] = useState('contact')

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50 via-white to-amber-50/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Badge 
              variant="secondary" 
              className="bg-amber-100 text-amber-800 px-4 py-2 text-sm font-medium mb-4"
            >
              📞 Get In Touch
            </Badge>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6">
              Ready to <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">Transform</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Ready to experience the Modern Men difference? Contact us today to schedule 
              your appointment with Regina's premier men's grooming specialists.
            </p>
          </motion.div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {contactStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className={`flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${stat.color} rounded-2xl shadow-lg`}>
                <stat.icon className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="flex bg-white rounded-xl p-1 shadow-lg border border-gray-200">
            {[
              { id: 'contact', label: 'Contact Info', icon: '📞' },
              { id: 'hours', label: 'Hours & Location', icon: '🕒' },
              { id: 'booking', label: 'Quick Booking', icon: '📅' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'contact' && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">Get In Touch</h3>
                    
                    <div className="space-y-6 mb-8">
                      <motion.div 
                        className="flex items-start gap-4 p-4 bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-lg hover:from-amber-100 hover:to-amber-200/50 transition-all duration-300"
                        whileHover={{ x: 5 }}
                      >
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                          <Phone className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-lg">(306) 522-4111</p>
                          <p className="text-sm text-gray-600">Main Line</p>
                          <p className="text-xs text-amber-600 font-medium">Call us anytime during business hours</p>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg hover:from-blue-100 hover:to-blue-200/50 transition-all duration-300"
                        whileHover={{ x: 5 }}
                      >
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <Mail className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-lg">info@modernmen.ca</p>
                          <p className="text-sm text-gray-600">Email Us</p>
                          <p className="text-xs text-blue-600 font-medium">We'll respond within 24 hours</p>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-green-100/50 rounded-lg hover:from-green-100 hover:to-green-200/50 transition-all duration-300"
                        whileHover={{ x: 5 }}
                      >
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                          <MapPin className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-lg">#4 - 425 Victoria Ave East</p>
                          <p className="text-sm text-gray-600">Regina, SK, S4N 0N8</p>
                          <p className="text-xs text-green-600 font-medium">Downtown Regina, easy parking</p>
                        </div>
                      </motion.div>
                    </div>

                    <div className="flex gap-4">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="outline" size="lg" className="border-amber-200 hover:bg-amber-50">
                          <Facebook className="h-5 w-5 mr-2" />
                          Facebook
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="outline" size="lg" className="border-pink-200 hover:bg-pink-50">
                          <Instagram className="h-5 w-5 mr-2" />
                          Instagram
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Hours & Location */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900">Hours & Location</h3>
                    </div>
                    
                    <div className="space-y-4 mb-8">
                      {hours.map((hour, index) => (
                        <motion.div 
                          key={hour.day} 
                          className="flex justify-between items-center p-3 rounded-lg hover:bg-amber-50 transition-colors duration-200"
                          whileHover={{ x: 5 }}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <span className="font-medium text-slate-900">{hour.day}</span>
                          <span className={`font-semibold ${hour.time === 'Closed' ? 'text-red-500' : 'text-amber-600'}`}>
                            {hour.time}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-lg p-4">
                      <h4 className="font-bold text-slate-900 mb-2">📍 Location</h4>
                      <p className="text-sm text-gray-600 mb-2">#4 - 425 Victoria Ave East</p>
                      <p className="text-sm text-gray-600 mb-3">Regina, SK, S4N 0N8</p>
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Get Directions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'hours' && (
            <motion.div
              key="hours"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Hours */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900">Business Hours</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {hours.map((hour, index) => (
                        <motion.div 
                          key={hour.day} 
                          className="flex justify-between items-center p-4 rounded-lg hover:bg-amber-50 transition-colors duration-200"
                          whileHover={{ x: 5 }}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <span className="font-medium text-slate-900">{hour.day}</span>
                          <span className={`font-semibold ${hour.time === 'Closed' ? 'text-red-500' : 'text-amber-600'}`}>
                            {hour.time}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Location */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900">Our Location</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-green-50 to-green-100/50 rounded-lg p-4">
                        <h4 className="font-bold text-slate-900 mb-2">📍 Address</h4>
                        <p className="text-lg text-gray-700 mb-2">#4 - 425 Victoria Ave East</p>
                        <p className="text-gray-600 mb-4">Regina, SK, S4N 0N8</p>
                        <Button variant="outline" size="lg" className="w-full">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Get Directions
                        </Button>
                      </div>
                      
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg p-4">
                        <h4 className="font-bold text-slate-900 mb-2">🚗 Parking</h4>
                        <p className="text-sm text-gray-600 mb-2">Free parking available on-site</p>
                        <p className="text-sm text-gray-600">Street parking also available</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'booking' && (
            <motion.div
              key="booking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">Quick Booking</h3>
                  </div>
                  
                  <p className="text-gray-600 mb-8 text-lg">
                    Ready to get started? Choose your preferred booking method below.
                  </p>
                  
                  <div className="space-y-4">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        size="lg"
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                        asChild
                      >
                        <a href="/booking">
                          <Calendar className="mr-2 h-5 w-5" />
                          Book Online
                        </a>
                      </Button>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="w-full border-amber-200 text-amber-600 hover:bg-amber-50 py-4 text-lg"
                        asChild
                      >
                        <a href="tel:3065224111">
                          <Phone className="mr-2 h-5 w-5" />
                          Call to Book: (306) 522-4111
                        </a>
                      </Button>
                    </motion.div>
                  </div>
                  
                  <div className="mt-8 p-4 bg-amber-50 rounded-lg">
                    <p className="text-sm text-amber-800">
                      💡 <strong>Pro Tip:</strong> Book online for the fastest service and to see all available time slots!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}