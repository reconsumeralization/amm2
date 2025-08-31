'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const stylists = [
  {
    id: 'mike-johnson',
    name: 'Mike Johnson',
    role: 'Senior Stylist & Owner',
    experience: '15+ years',
    specialties: ['Classic Cuts', 'Fade Styles', 'Beard Grooming', 'Color'],
    bio: 'Mike founded Modern Men with a vision to create a premium grooming experience. He specializes in classic cuts and modern fades, ensuring every client leaves looking their best.',
    image: '/images/stylists/mike-johnson.jpg', // Placeholder
    rating: 4.9,
    reviews: 127,
    availability: 'Mon-Sat',
    social: {
      instagram: '@mikejohnson_modernmen',
      facebook: 'mike.johnson.modernmen'
    }
  },
  {
    id: 'sarah-davis',
    name: 'Sarah Davis',
    role: 'Color Specialist',
    experience: '10+ years',
    specialties: ['Hair Coloring', 'Highlights', 'Style Consultation', 'Trendy Cuts'],
    bio: 'Sarah is our color expert, bringing creativity and precision to every client. She stays ahead of trends and loves helping clients discover their perfect style.',
    image: '/images/stylists/sarah-davis.jpg', // Placeholder
    rating: 4.8,
    reviews: 89,
    availability: 'Tue-Sat',
    social: {
      instagram: '@sarahdavis_color',
      facebook: 'sarah.davis.colorspecialist'
    }
  },
  {
    id: 'chris-wilson',
    name: 'Chris Wilson',
    role: 'Master Barber',
    experience: '12+ years',
    specialties: ['Traditional Shaves', 'Beard Styling', 'Classic Cuts', 'Hot Towels'],
    bio: 'Chris is a master of traditional barbering techniques. His attention to detail and commitment to classic grooming makes him a favorite among clients.',
    image: '/images/stylists/chris-wilson.jpg', // Placeholder
    rating: 4.9,
    reviews: 156,
    availability: 'Wed-Sun',
    social: {
      instagram: '@chriswilson_barber',
      facebook: 'chris.wilson.masterbarber'
    }
  },
  {
    id: 'jake-martinez',
    name: 'Jake Martinez',
    role: 'Style Specialist',
    experience: '8+ years',
    specialties: ['Trendy Styles', 'Textured Cuts', 'Product Styling', 'Consultation'],
    bio: 'Jake is our trendsetter, always up-to-date with the latest styles and techniques. He excels at creating textured, modern looks that suit each client perfectly.',
    image: '/images/stylists/jake-martinez.jpg', // Placeholder
    rating: 4.7,
    reviews: 94,
    availability: 'Mon-Fri',
    social: {
      instagram: '@jakemartinez_styles',
      facebook: 'jake.martinez.stylespecialist'
    }
  }
];

export default function TeamPage() {
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
    { number: '15+', label: 'Master Craftsmen', icon: '👥', description: 'Expert stylists in our team' },
    { number: '60+', label: 'Years Combined', icon: '🏆', description: 'Total experience across team' },
    { number: '500+', label: 'Happy Clients', icon: '⭐', description: 'Satisfied gentlemen served' },
    { number: '4.9/5', label: 'Average Rating', icon: '❤️', description: 'Customer satisfaction score' }
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
            Our <span className="font-semibold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Master Craftsmen</span>
          </motion.h1>

          <motion.p
            className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Passionate artisans dedicated to the timeless art of gentlemen's grooming.
            Each master brings decades of expertise, creativity, and uncompromising attention to detail.
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
              Excellence in <span className="font-semibold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Every Detail</span>
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              A testament to our commitment to craftsmanship and client satisfaction
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

        {/* Master Craftsmen Grid */}
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
              Meet Our <span className="font-semibold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Artists</span>
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Passionate professionals dedicated to the art of gentlemen's grooming
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {stylists.map((stylist, index) => (
              <motion.div
                key={stylist.id}
                className="text-center group"
                whileHover={{ scale: 1.02, y: -5 }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 shadow-xl hover:shadow-2xl bg-white transition-all duration-500 group-hover:shadow-red-200/50 relative overflow-hidden">
                  {/* Subtle background pattern */}
                  <div className="absolute inset-0 opacity-[0.02]">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23dc2626' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
                    }}></div>
                  </div>

                  <CardContent className="p-8 relative z-10">
                    {/* Avatar with elegant styling */}
                    <motion.div
                      className="relative mb-6"
                      whileHover={{ rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="w-28 h-28 bg-gradient-to-br from-red-100 to-red-200 rounded-3xl mx-auto flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300">
                        <span className="text-4xl font-bold text-red-600">
                          {stylist.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-sm">{stylist.rating}</span>
                      </div>
                      {/* Decorative elements */}
                      <div className="absolute -inset-2 bg-red-500 rounded-3xl opacity-10 -z-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                    </motion.div>

                    {/* Content */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-bold text-black text-2xl mb-1">{stylist.name}</h3>
                        <p className="text-red-600 font-semibold text-lg">{stylist.role}</p>
                        <p className="text-gray-600 text-sm font-medium">{stylist.experience} experience</p>
                      </div>

                      <p className="text-gray-700 leading-relaxed text-sm">{stylist.bio}</p>

                      {/* Specialties */}
                      <div className="flex flex-wrap justify-center gap-2">
                        {stylist.specialties.map((specialty, index) => (
                          <Badge key={index} className="bg-red-100 text-red-700 hover:bg-red-200 font-medium text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>

                      {/* Availability */}
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500 font-medium mb-2">Available: {stylist.availability}</p>
                        <p className="text-xs text-gray-500">{stylist.reviews} reviews</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Why Choose Our Team */}
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
              Why Choose Our <span className="font-semibold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Team</span>
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              The principles that guide our every action and define our commitment to excellence
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
                      <div className="h-8 w-8 text-white">🏆</div>
                    </div>
                    <div className="absolute -inset-1 bg-red-500 rounded-2xl opacity-20 -z-10"></div>
                  </div>
                  <div className="ml-8">
                    <h2 className="text-5xl font-light text-black tracking-tight">Master Craftsmen</h2>
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
                  Our team of licensed professionals brings decades of combined experience and continuous training
                  to every service, ensuring unparalleled expertise in gentlemen's grooming.
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
                      <h3 className="font-bold text-black text-xl mb-2">Excellence</h3>
                      <p className="text-gray-600 leading-relaxed">Delivering the highest quality service in every appointment, with meticulous attention to every detail.</p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-start space-x-6 group"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <div className="h-7 w-7 text-red-600">👥</div>
                    </div>
                    <div>
                      <h3 className="font-bold text-black text-xl mb-2">Personalized Service</h3>
                      <p className="text-gray-600 leading-relaxed">Every gentleman receives customized styling recommendations tailored to their unique preferences.</p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-start space-x-6 group"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <div className="h-7 w-7 text-red-600">🏆</div>
                    </div>
                    <div>
                      <h3 className="font-bold text-black text-xl mb-2">Innovation</h3>
                      <p className="text-gray-600 leading-relaxed">Staying current with trends and techniques while maintaining time-honored craftsmanship.</p>
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
                      <div className="h-8 w-8 text-white">🎯</div>
                    </div>
                    <div className="absolute -inset-1 bg-red-500 rounded-2xl opacity-20 -z-10"></div>
                  </div>
                  <div className="ml-8">
                    <h2 className="text-5xl font-light text-black tracking-tight">Our Commitment</h2>
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
                      <h3 className="font-bold text-black text-2xl mb-3">Licensed Professionals</h3>
                      <p className="text-gray-600 leading-relaxed text-lg">All our stylists are fully licensed and continuously trained in the latest techniques and safety standards.</p>
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
                      <h3 className="font-bold text-black text-2xl mb-3">Premium Products</h3>
                      <p className="text-gray-600 leading-relaxed text-lg">We curate only the finest professional-grade products from renowned brands for optimal results.</p>
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
                      <h3 className="font-bold text-black text-2xl mb-3">Client Satisfaction</h3>
                      <p className="text-gray-600 leading-relaxed text-lg">Your complete satisfaction is our highest priority, with every detail considered for your experience.</p>
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
                Begin Your <span className="font-semibold bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent">Transformation</span>
              </motion.h2>

              {/* Description */}
              <motion.p
                className="text-xl md:text-2xl mb-12 opacity-90 max-w-4xl mx-auto leading-relaxed font-light"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
                Experience the difference that master craftsmanship makes. Choose your preferred stylist
                and embark on your journey to unparalleled grooming excellence.
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
                    Book Your Experience
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
