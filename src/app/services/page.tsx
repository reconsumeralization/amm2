'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const services = [
  {
    id: 'haircut',
    title: 'Signature Haircut',
    description: 'Professional haircut tailored to your style and preferences. Includes consultation, wash, cut, and style.',
    duration: '45 min',
    price: 35,
    features: ['Style consultation', 'Shampoo & conditioning', 'Precision cutting', 'Styling'],
    popular: true
  },
  {
    id: 'beard-trim',
    title: 'Beard Trim & Shape',
    description: 'Professional beard grooming and shaping to maintain your perfect beard style.',
    duration: '30 min',
    price: 20,
    features: ['Beard consultation', 'Precision trimming', 'Shape & edge', 'Hot towel treatment'],
    popular: false
  },
  {
    id: 'shave',
    title: 'Traditional Hot Towel Shave',
    description: 'Classic straight razor shave with hot towel treatment for the ultimate grooming experience.',
    duration: '30 min',
    price: 25,
    features: ['Hot towel prep', 'Straight razor shave', 'Aftershave treatment', 'Skin care advice'],
    popular: true
  },
  {
    id: 'hair-coloring',
    title: 'Hair Coloring & Highlights',
    description: 'Professional hair coloring services including highlights, lowlights, and all-over color.',
    duration: '90 min',
    price: 75,
    features: ['Color consultation', 'Premium products', 'Style included', 'Aftercare advice'],
    popular: false
  },
  {
    id: 'consultation',
    title: 'Style Consultation',
    description: 'One-on-one consultation to discuss your style goals and create a personalized grooming plan.',
    duration: '30 min',
    price: 15,
    features: ['Style assessment', 'Product recommendations', 'Maintenance plan', 'Follow-up support'],
    popular: false
  },
  {
    id: 'package',
    title: 'Complete Grooming Package',
    description: 'Full grooming experience including haircut, beard trim, and hot towel shave.',
    duration: '90 min',
    price: 65,
    features: ['Haircut & style', 'Beard trim', 'Hot towel shave', 'Premium products', 'Aftercare kit'],
    popular: true
  }
];

export default function ServicesPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" },
    viewport: { once: true }
  };

  const slideIn = {
    initial: { opacity: 0, x: -30 },
    whileInView: { opacity: 1, x: 0 },
    transition: { duration: 0.8, ease: "easeOut" },
    viewport: { once: true }
  };

  const stats = [
    { number: '6', label: 'Premium Services', icon: '✂️', description: 'Comprehensive grooming offerings' },
    { number: '30min', label: 'Average Duration', icon: '⏱️', description: 'Efficient yet thorough service' },
    { number: '15+', label: 'Years Experience', icon: '🏆', description: 'Master craftsmanship' },
    { number: '100%', label: 'Satisfaction Rate', icon: '⭐', description: 'Client satisfaction guarantee' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-4 py-16">
        {/* Elegant Header */}
        <motion.div
          className="text-center mb-24"
          {...fadeIn}
        >
          {/* Decorative line */}
          <motion.div
            className="w-24 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto mb-8"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          />

          <div className="flex items-center justify-center mb-8">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center shadow-2xl">
                <div className="h-10 w-10 text-white">✂️</div>
              </div>
              <div className="absolute -inset-2 bg-red-500 rounded-2xl opacity-20 -z-10"></div>
            </motion.div>
        </div>

          <motion.h1
            className="text-6xl md:text-7xl font-light text-black mb-8 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Our <span className="font-semibold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Services</span>
          </motion.h1>

          <motion.p
            className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Where sophistication meets craftsmanship. Each service is meticulously designed
            to enhance your natural features and elevate your personal style.
          </motion.p>

          {/* Decorative line */}
          <motion.div
            className="w-24 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto mt-8"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
          />
        </motion.div>

        {/* Elegant Stats Section */}
        <motion.div
          className="mb-24"
          {...fadeIn}
        >
          <div className="text-center mb-16">
            <motion.h2
              className="text-4xl md:text-5xl font-light text-black mb-4 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              Service <span className="font-semibold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Excellence</span>
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              A testament to our commitment to quality and client satisfaction
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="group"
              >
                <Card className="border-0 shadow-none bg-white hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 relative overflow-hidden">
                  {/* Subtle background pattern */}
                  <div className="absolute inset-0 opacity-[0.02]">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.3'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
                    }}></div>
                  </div>

                  <CardContent className="p-8 text-center relative z-10">
                    {/* Icon with elegant styling */}
                    <motion.div
                      className="relative mb-6"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300">
                        <div className="h-8 w-8 text-red-600 flex items-center justify-center text-2xl">{stat.icon}</div>
                      </div>
                      <div className="absolute inset-0 bg-red-500 rounded-2xl opacity-10 -z-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                    </motion.div>

                    {/* Number with elegant typography */}
                    <motion.div
                      className="mb-4"
                      initial={{ scale: 0.8 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                      viewport={{ once: true }}
                    >
                      <div className="text-5xl md:text-6xl font-light text-black mb-2 tracking-tight">
                        {stat.number}
                </div>
                    </motion.div>

                    {/* Label and description */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-black">{stat.label}</h3>
                      <p className="text-sm text-gray-500 font-medium">{stat.description}</p>
                    </div>

                    {/* Decorative element */}
                    <div className="mt-6 w-12 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto"></div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Premium Services Grid */}
        <motion.div
          className="mb-24"
          {...fadeIn}
        >
          <div className="text-center mb-16">
            <motion.h2
              className="text-4xl md:text-5xl font-light text-black mb-4 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              Our <span className="font-semibold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Premium Services</span>
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Meticulously crafted experiences designed for the discerning gentleman
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                className="text-center group"
                whileHover={{ scale: 1.02, y: -5 }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className={`border-0 shadow-xl hover:shadow-2xl bg-white transition-all duration-500 group-hover:shadow-red-200/50 relative overflow-hidden ${
                  service.popular ? 'ring-2 ring-red-500/20' : ''
                }`}>
                  {/* Popular badge */}
                  {service.popular && (
                    <motion.div
                      className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 0.6, delay: index * 0.1 + 0.2 }}
                      viewport={{ once: true }}
                    >
                      <Badge className="bg-red-600 text-white px-4 py-2 rounded-full font-semibold shadow-lg">
                        ⭐ Most Popular
                      </Badge>
                    </motion.div>
                  )}

                  {/* Subtle background pattern */}
                  <div className="absolute inset-0 opacity-[0.02]">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23dc2626' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
                    }}></div>
                  </div>

                  <CardContent className="p-8 relative z-10">
                    {/* Service icon */}
                    <motion.div
                      className="relative mb-6"
                      whileHover={{ rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-3xl mx-auto flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300">
                        <span className="text-3xl font-bold text-red-600">
                          {service.title.split(' ')[0] === 'Signature' ? '✂️' :
                           service.title.split(' ')[0] === 'Beard' ? '🧔' :
                           service.title.split(' ')[0] === 'Traditional' ? '💇' :
                           service.title.split(' ')[0] === 'Hair' ? '🎨' :
                           service.title.split(' ')[0] === 'Style' ? '💡' :
                           '✨'}
                        </span>
                      </div>
                      <div className="absolute -inset-2 bg-red-500 rounded-3xl opacity-10 -z-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                    </motion.div>

                    {/* Content */}
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="font-bold text-black text-2xl mb-2">{service.title}</h3>
                        <p className="text-gray-700 leading-relaxed text-sm">{service.description}</p>
                </div>
                
                      {/* Pricing and duration */}
                      <div className="bg-gradient-to-r from-red-50 to-gray-50 rounded-2xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-center">
                            <div className="text-3xl font-light text-red-600">${service.price}</div>
                            <div className="text-xs text-gray-500 font-medium">Price</div>
                          </div>
                          <div className="h-8 w-px bg-red-200"></div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-black">{service.duration}</div>
                            <div className="text-xs text-gray-500 font-medium">Duration</div>
                          </div>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-3">
                        {service.features.map((feature, featureIndex) => (
                          <motion.div
                            key={featureIndex}
                            className="flex items-center text-sm text-gray-600"
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 + featureIndex * 0.1 }}
                            viewport={{ once: true }}
                          >
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-3 flex-shrink-0"></div>
                            <span className="font-medium">{feature}</span>
                          </motion.div>
                        ))}
              </div>
            </div>
                  </CardContent>
                </Card>
              </motion.div>
          ))}
        </div>
        </motion.div>

        {/* Why Choose Our Services */}
        <motion.div
          className="mb-24"
          {...fadeIn}
        >
          <div className="text-center mb-16">
            <motion.h2
              className="text-4xl md:text-5xl font-light text-black mb-4 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              Why Choose Our <span className="font-semibold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Services</span>
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              The principles that guide our every service and define our commitment to excellence
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div
              className="relative bg-white rounded-3xl shadow-2xl p-12 md:p-16 overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              viewport={{ once: true }}
            >
              {/* Background decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-red-50 to-transparent rounded-full -translate-y-20 translate-x-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-red-50 to-transparent rounded-full translate-y-16 -translate-x-16"></div>

              <div className="relative z-10">
                <motion.div
                  className="flex items-center mb-10"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <div className="relative">
                    <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-xl">
                      <div className="h-8 w-8 text-white">✂️</div>
                    </div>
                    <div className="absolute -inset-1 bg-red-500 rounded-2xl opacity-20 -z-10"></div>
                  </div>
                  <div className="ml-8">
                    <h2 className="text-5xl font-light text-black tracking-tight">Expert Craftsmanship</h2>
                    <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-red-600 mt-2"></div>
                  </div>
                </motion.div>

                <motion.p
                  className="text-xl text-gray-700 leading-relaxed mb-12 font-light"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  Every service is performed by licensed professionals with decades of combined experience,
                  ensuring unparalleled expertise and attention to detail.
                </motion.p>

                <motion.div
                  className="space-y-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    className="flex items-start space-x-6 group"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <div className="h-7 w-7 text-red-600">⭐</div>
                    </div>
                <div>
                      <h3 className="font-bold text-black text-xl mb-2">Licensed Professionals</h3>
                      <p className="text-gray-600 leading-relaxed">All our stylists are fully licensed and continuously trained in the latest techniques.</p>
                </div>
                  </motion.div>

                  <motion.div
                    className="flex items-start space-x-6 group"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <div className="h-7 w-7 text-red-600">🧴</div>
              </div>
                <div>
                      <h3 className="font-bold text-black text-xl mb-2">Premium Products</h3>
                      <p className="text-gray-600 leading-relaxed">We use only the finest professional-grade products from renowned brands.</p>
                </div>
                  </motion.div>

                  <motion.div
                    className="flex items-start space-x-6 group"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <div className="h-7 w-7 text-red-600">⏰</div>
              </div>
                <div>
                      <h3 className="font-bold text-black text-xl mb-2">Flexible Scheduling</h3>
                      <p className="text-gray-600 leading-relaxed">Extended hours including evenings and Saturdays to fit your busy schedule.</p>
                </div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              className="relative bg-white rounded-3xl shadow-2xl p-12 md:p-16 overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
              viewport={{ once: true }}
            >
              {/* Background decorative elements */}
              <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-red-50 to-transparent rounded-full -translate-x-20 -translate-y-20"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-red-50 to-transparent rounded-full translate-x-16 translate-y-16"></div>

              <div className="relative z-10">
                <motion.div
                  className="flex items-center mb-10"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <div className="relative">
                    <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-xl">
                      <div className="h-8 w-8 text-white">📋</div>
                    </div>
                    <div className="absolute -inset-1 bg-red-500 rounded-2xl opacity-20 -z-10"></div>
                  </div>
                  <div className="ml-8">
                    <h2 className="text-5xl font-light text-black tracking-tight">Booking Information</h2>
                    <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-red-600 mt-2"></div>
                  </div>
                </motion.div>

                <motion.div
                  className="space-y-10"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    className="flex items-start space-x-8 group"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex-shrink-0 relative">
                      <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300">
                        <span className="text-white font-bold text-xl">1</span>
                      </div>
                      <div className="absolute -inset-1 bg-red-500 rounded-2xl opacity-20 -z-10 group-hover:opacity-30 transition-opacity duration-300"></div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-black text-2xl mb-3">Online Booking</h3>
                      <p className="text-gray-600 leading-relaxed text-lg">Book your appointment instantly through our website with our user-friendly booking system.</p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-start space-x-8 group"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex-shrink-0 relative">
                      <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300">
                        <span className="text-white font-bold text-xl">2</span>
                      </div>
                      <div className="absolute -inset-1 bg-red-500 rounded-2xl opacity-20 -z-10 group-hover:opacity-30 transition-opacity duration-300"></div>
            </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-black text-2xl mb-3">Phone & Walk-ins</h3>
                      <p className="text-gray-600 leading-relaxed text-lg">Call us at (306) 522-4111 or visit us in person for immediate service availability.</p>
          </div>
                  </motion.div>

                  <motion.div
                    className="flex items-start space-x-8 group"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex-shrink-0 relative">
                      <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300">
                        <span className="text-white font-bold text-xl">3</span>
                      </div>
                      <div className="absolute -inset-1 bg-red-500 rounded-2xl opacity-20 -z-10 group-hover:opacity-30 transition-opacity duration-300"></div>
              </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-black text-2xl mb-3">Flexible Policies</h3>
                      <p className="text-gray-600 leading-relaxed text-lg">24-hour cancellation policy with multiple payment options including mobile payments.</p>
              </div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
            </div>
        </motion.div>

        {/* Elegant Call to Action */}
        <motion.div
          className="relative py-24"
          {...fadeIn}
        >
          {/* Background with subtle pattern */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.3'%3E%3Cpath d='M50 50c-16.5 0-30-13.5-30-30s13.5-30 30-30 30 13.5 30 30-13.5 30-30 30zm30-60c-16.5 0-30-13.5-30-30s13.5-30 30-30 30 13.5 30 30-13.5 30-30 30z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          <div className="relative bg-gradient-to-r from-red-600 via-red-700 to-red-800 rounded-3xl shadow-3xl p-16 md:p-20 text-center text-white overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-24 translate-y-24"></div>
            <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/5 rounded-full -translate-x-16 -translate-y-16"></div>

            {/* Background pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Ccircle cx='40' cy='40' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
        </div>

            <div className="relative z-10">
              {/* Icon */}
              <motion.div
                className="flex items-center justify-center mb-10"
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
                viewport={{ once: true }}
              >
                <div className="relative">
                  <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm shadow-2xl">
                    <div className="h-10 w-10 text-white">✂️</div>
                  </div>
                  <div className="absolute -inset-2 bg-white/10 rounded-3xl -z-10"></div>
                </div>
              </motion.div>

              {/* Heading */}
              <motion.h2
                className="text-5xl md:text-6xl font-light mb-8 tracking-tight"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Ready for Your <span className="font-semibold bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent">Transformation</span>
              </motion.h2>

              {/* Description */}
              <motion.p
                className="text-xl md:text-2xl mb-12 opacity-90 max-w-4xl mx-auto leading-relaxed font-light"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
                Experience the difference that master craftsmanship makes. Each service is designed
                to enhance your natural features and elevate your personal style.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-8 justify-center items-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                viewport={{ once: true }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    className="bg-white text-red-600 hover:bg-gray-100 px-10 py-4 rounded-2xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 text-lg group"
                  >
                    <div className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform duration-300">📅</div>
                    Book Your Service
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="outline"
                    className="border-3 border-white text-white hover:bg-white hover:text-red-600 px-10 py-4 rounded-2xl font-semibold transition-all duration-300 text-lg group"
                  >
                    <div className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform duration-300">📞</div>
                    Call (306) 522-4111
                  </Button>
                </motion.div>
              </motion.div>

              {/* Subtle tagline */}
              <motion.p
                className="mt-12 text-lg opacity-75 font-light tracking-wider"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.75 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                viewport={{ once: true }}
              >
                WHERE SOPHISTICATION MEETS CRAFTSMANSHIP
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
