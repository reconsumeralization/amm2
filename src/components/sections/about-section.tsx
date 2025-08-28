'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Award, Users, Clock, Star, MapPin, Calendar } from '@/lib/icon-mapping'

const aboutStats = [
  { icon: Award, value: '20+', label: 'Years Experience', color: 'from-amber-500 to-amber-600' },
  { icon: Users, value: '2,500+', label: 'Happy Clients', color: 'from-blue-500 to-blue-600' },
  { icon: Star, value: '4.9/5', label: 'Average Rating', color: 'from-green-500 to-green-600' },
  { icon: Clock, value: '15min', label: 'Average Wait Time', color: 'from-purple-500 to-purple-600' }
]

const coreValues = [
  {
    title: 'Excellence',
    description: 'We strive for perfection in every cut, style, and service we provide.',
    icon: Award
  },
  {
    title: 'Innovation',
    description: 'Staying ahead of trends with cutting-edge techniques and modern equipment.',
    icon: Star
  },
  {
    title: 'Community',
    description: 'Building lasting relationships with our clients and the Regina community.',
    icon: Users
  }
]

export function AboutSection() {
  const [activeTab, setActiveTab] = useState('story')

  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-amber-50/20 to-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
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
              🏆 Our Story
            </Badge>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6">
              Why Choose <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">Modern Men</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Regina's premier destination for men's grooming, where tradition meets innovation 
              and every client becomes part of our family.
            </p>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="flex bg-gray-100 rounded-xl p-1 shadow-inner">
            {[
              { id: 'story', label: 'Our Story', icon: '📖' },
              { id: 'values', label: 'Core Values', icon: '💎' },
              { id: 'stats', label: 'By The Numbers', icon: '📊' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-white text-amber-600 shadow-md'
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
          {activeTab === 'story' && (
            <motion.div
              key="story"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-3xl font-bold text-slate-900 mb-4">
                    A Legacy of Excellence
                  </h3>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    At Modern Men Salon, we take men's grooming to the highest level of experience 
                    and satisfaction. We are a group of highly skilled individuals who love what we 
                    do and genuinely care about your experience!
                  </p>
                  <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    Our love for this male-focused grooming industry is growing along with the industry 
                    itself and our team of incomparably talented men's stylists and barbers.
                  </p>
                </motion.div>
                
                <div className="space-y-4">
                  {[
                    'Highly skilled and experienced stylists',
                    'Premium products and equipment',
                    'Personalized service for every client',
                    'Modern facility in downtown Regina',
                    'Flexible scheduling and online booking',
                    'Award-winning customer service'
                  ].map((feature, index) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-3 group"
                    >
                      <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-gray-700 group-hover:text-slate-900 transition-colors duration-300">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="pt-6"
                >
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                    asChild
                  >
                    <a href="/booking">
                      <Calendar className="mr-2 h-5 w-5" />
                      Book Your Experience
                    </a>
                  </Button>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                    alt="Modern Men Hair Salon Interior"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-amber-500 to-amber-600 text-white p-6 rounded-xl shadow-xl">
                  <div className="text-center">
                    <div className="text-3xl font-bold">20+</div>
                    <div className="text-sm">Years Experience</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'values' && (
            <motion.div
              key="values"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {coreValues.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg group">
                    <CardContent className="p-8 text-center">
                      <div className="mx-auto mb-6 p-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl w-16 h-16 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <value.icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-4">{value.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {aboutStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}