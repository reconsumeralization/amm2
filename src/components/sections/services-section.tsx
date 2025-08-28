'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Scissors, Zap, Brush, Star, Award, Calendar, CheckCircle, Clock, Users } from '@/lib/icon-mapping'
import { motion, AnimatePresence } from 'framer-motion'

const services = [
  {
    icon: Scissors,
    title: 'Modern Cut',
    description: 'Precision scissor/clipper work, clean finish, product style',
    price: '$45',
    duration: '45 min',
    popular: true,
    features: ['Precision Scissor Work', 'Clean Finish', 'Product Style', 'Consultation', 'Styling Tips'],
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: Zap,
    title: 'Skin Fade',
    description: 'Seamless gradient, razor-clean edges, prolonged shape retention',
    price: '$45',
    duration: '45 min',
    popular: false,
    features: ['Seamless Gradient', 'Razor-Clean Edges', 'Prolonged Shape Retention', 'Precision Work'],
    color: 'from-green-500 to-green-600'
  },
  {
    icon: Brush,
    title: 'Beard Trim & Line-up',
    description: 'Shape, symmetry, hot towel, oil finish',
    price: '$25',
    duration: '20 min',
    popular: false,
    features: ['Shape & Symmetry', 'Hot Towel Treatment', 'Oil Finish', 'Line-up'],
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: Award,
    title: 'Hot Towel Shave',
    description: 'Pre-shave oil, hot lather, multi-pass shave, cold towel, aftercare',
    price: '$45',
    duration: '45 min',
    popular: true,
    features: ['Pre-shave Oil', 'Hot Lather', 'Multi-pass Shave', 'Cold Towel', 'Aftercare'],
    color: 'from-amber-500 to-amber-600'
  },
  {
    icon: Clock,
    title: 'Express Clean-up',
    description: 'Neck/around ears, quick style—ideal between full cuts',
    price: '$20',
    duration: '15 min',
    popular: false,
    features: ['Neck Clean-up', 'Around Ears', 'Quick Style', 'Between Cuts'],
    color: 'from-orange-500 to-orange-600'
  },
  {
    icon: Users,
    title: 'Kids Cut',
    description: 'Patient, fun experience for the little ones',
    price: '$30',
    duration: '30 min',
    popular: false,
    features: ['Patient Service', 'Fun Experience', 'Kid-friendly', 'Parent Consultation'],
    color: 'from-pink-500 to-pink-600'
  }
]

export function ServicesSection() {
  const [hoveredService, setHoveredService] = useState<number | null>(null)

  return (
    <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-amber-50/30 relative overflow-hidden">
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
              ✂️ Premium Services
            </Badge>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6">
              Our <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">Services</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              We take men's grooming to the highest level of experience and satisfaction. 
              Our mission is to deliver consistency in service that creates long-term value for every client.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              onHoverStart={() => setHoveredService(index)}
              onHoverEnd={() => setHoveredService(null)}
              whileHover={{ y: -8 }}
              className="relative"
            >
              {service.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1 text-xs font-medium shadow-lg">
                    ⭐ Most Popular
                  </Badge>
                </div>
              )}

              <Card className="h-full hover:shadow-2xl transition-all duration-500 border-0 shadow-lg relative overflow-hidden group">
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -translate-x-full group-hover:translate-x-full" style={{ transition: 'transform 1s ease-in-out, opacity 0.5s ease' }} />

                <CardHeader className="text-center pb-4 relative z-10">
                  <motion.div 
                    className={`mx-auto mb-4 p-4 bg-gradient-to-br ${service.color} rounded-2xl w-20 h-20 flex items-center justify-center shadow-lg`}
                    animate={{ 
                      scale: hoveredService === index ? 1.1 : 1,
                      rotate: hoveredService === index ? 5 : 0
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <service.icon className="h-10 w-10 text-white" />
                  </motion.div>
                  
                  <CardTitle className="text-xl font-bold text-slate-900 mb-2">{service.title}</CardTitle>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="text-center space-y-4 relative z-10">
                  {/* Pricing */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-3xl font-bold text-slate-900">{service.price}</span>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
                    <Clock className="h-4 w-4" />
                    <span>{service.duration}</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 text-sm text-gray-600 mb-6">
                    {service.features.map((feature, featureIndex) => (
                      <motion.li 
                        key={feature} 
                        className="flex items-center justify-start gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + featureIndex * 0.05 }}
                        viewport={{ once: true }}
                      >
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <span className="text-left">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                      asChild
                    >
                      <a href="/booking">
                        <Calendar className="mr-2 h-4 w-4" />
                        Book Now
                      </a>
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Not sure which service is right for you? Our expert stylists are here to help you choose the perfect grooming experience.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
              asChild
            >
              <a href="/consultation">
                <Star className="mr-2 h-5 w-5" />
                Free Consultation
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
