'use client';

import { motion } from 'framer-motion';
// Icons temporarily replaced with emoji placeholders to avoid import issues
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AboutPage() {
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
    { number: '500+', label: 'Happy Clients', icon: '👥', description: 'Satisfied gentlemen served' },
    { number: '4.9/5', label: 'Average Rating', icon: '⭐', description: 'Customer satisfaction score' },
    { number: '15+', label: 'Years Experience', icon: '🏆', description: 'Master craftsmanship' },
    { number: '12', label: 'Industry Awards', icon: '❤️', description: 'Excellence recognition' }
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
            About{' '}
            <span className="font-semibold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              Modern Men
            </span>
          </motion.h1>

          <motion.p
            className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Where sophistication meets craftsmanship. A sanctuary for the discerning gentleman
            who demands excellence in every detail of his grooming experience.
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
              Our Legacy in <span className="font-semibold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Numbers</span>
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              A testament to our commitment to excellence and client satisfaction
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

        {/* Elegant Story Section */}
        <motion.div
          className="relative mb-24"
          {...fadeIn}
        >
          {/* Background with subtle pattern */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.2'%3E%3Cpath d='M40 40c-11 0-20-9-20-20s9-20 20-20 20 9 20 20-9 20-20 20zm20-40c-11 0-20-9-20-20s9-20 20-20 20 9 20 20-9 20-20 20z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          <div className="relative bg-white rounded-3xl shadow-2xl p-12 md:p-16 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-red-50 to-transparent rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-red-50 to-transparent rounded-full translate-x-12 translate-y-12"></div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
              <div>
                <motion.div
                  className="flex items-center mb-8"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <div className="relative">
                    <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center shadow-xl">
                      <div className="h-7 w-7 text-white">❤️</div>
                    </div>
                    <div className="absolute -inset-1 bg-red-500 rounded-2xl opacity-20 -z-10"></div>
                  </div>
                  <div className="ml-6">
                    <h2 className="text-5xl font-light text-black tracking-tight">Our Story</h2>
                    <div className="w-16 h-1 bg-gradient-to-r from-red-500 to-red-600 mt-2"></div>
                  </div>
                </motion.div>

                <motion.div
                  className="space-y-8 text-gray-700 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <p className="text-xl font-light">
                    In 2008, amidst Regina's evolving urban landscape, Mike Johnson envisioned more than just a barbershop.
                    He dreamed of creating a sanctuary—a sophisticated haven where modern gentlemen could rediscover
                    the art of refined grooming.
                  </p>
                  <p className="text-xl font-light">
                    What began as a modest establishment blossomed into Regina's most esteemed gentlemen's grooming destination.
                    Our unwavering dedication to craftsmanship, meticulous attention to detail, and bespoke service philosophy
                    have cultivated an unparalleled reputation for excellence.
                  </p>
                  <p className="text-xl font-light">
                    Today, we continue our legacy of innovation, seamlessly blending contemporary trends with time-honored techniques.
                    Each gentleman who graces our doors becomes an integral chapter in our narrative—a testament to
                    transformation, self-assurance, and impeccable style.
                  </p>
                </motion.div>

                {/* Elegant Timeline */}
                <motion.div
                  className="mt-12 space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-2xl font-semibold text-black mb-8">Our Journey Through Time</h3>
                  <div className="space-y-8">
                    <motion.div
                      className="flex items-start space-x-6 group"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                        <span className="text-white font-bold text-lg">08</span>
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="text-2xl font-light text-red-600">2008</div>
                          <div className="h-px bg-gradient-to-r from-red-600 to-transparent flex-grow"></div>
                        </div>
                        <h4 className="text-lg font-semibold text-black mb-1">The Beginning</h4>
                        <p className="text-gray-600 leading-relaxed">Modern Men opens its doors in Regina, establishing a new standard for gentlemen's grooming with uncompromising quality and sophistication.</p>
                      </div>
                    </motion.div>

                    <motion.div
                      className="flex items-start space-x-6 group"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                        <span className="text-white font-bold text-lg">12</span>
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="text-2xl font-light text-red-600">2012</div>
                          <div className="h-px bg-gradient-to-r from-red-600 to-transparent flex-grow"></div>
                        </div>
                        <h4 className="text-lg font-semibold text-black mb-1">Growth & Excellence</h4>
                        <p className="text-gray-600 leading-relaxed">Expanded our services and welcomed additional master stylists, each bringing their unique expertise and passion for the craft.</p>
                      </div>
                    </motion.div>

                    <motion.div
                      className="flex items-start space-x-6 group"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                        <span className="text-white font-bold text-lg">23</span>
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="text-2xl font-light text-red-600">2023</div>
                          <div className="h-px bg-gradient-to-r from-red-600 to-transparent flex-grow"></div>
                        </div>
                        <h4 className="text-lg font-semibold text-black mb-1">Legacy of Excellence</h4>
                        <p className="text-gray-600 leading-relaxed">Celebrated 15 years of unwavering commitment to excellence, serving thousands of discerning gentlemen with sophistication and style.</p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <div className="relative">
                  {/* Main visual */}
                  <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-2xl p-12 border border-red-100 overflow-hidden">
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-[0.02]">
                      <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23dc2626' fill-opacity='0.3'%3E%3Ccircle cx='50' cy='50' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
                      }}></div>
                    </div>

                    <div className="relative z-10 text-center">
                      <motion.div
                        className="relative inline-block mb-8"
                        whileHover={{ rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="w-32 h-32 bg-black rounded-3xl flex items-center justify-center shadow-xl">
                          <div className="h-16 w-16 text-white">✂️</div>
                        </div>
                        <div className="absolute -inset-2 bg-red-500 rounded-3xl opacity-20 -z-10"></div>
                      </motion.div>

                      <motion.h3
                        className="text-3xl font-light text-black mb-4 tracking-tight"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        viewport={{ once: true }}
                      >
                        Our Journey
                      </motion.h3>

                      <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        viewport={{ once: true }}
                      >
                        <div className="text-6xl font-light text-red-600">15+</div>
                        <div className="text-lg text-gray-600 font-medium">Years of Excellence</div>
                        <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-red-600 mx-auto mt-4"></div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Floating decorative elements */}
                  <div className="absolute -top-6 -right-6 w-12 h-12 bg-red-500 rounded-2xl opacity-10"></div>
                  <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-red-400 rounded-xl opacity-15"></div>
                  <div className="absolute top-1/2 -left-8 w-4 h-4 bg-red-600 rounded-full opacity-20"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Mission & Values */}
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
              Our <span className="font-semibold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Philosophy</span>
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
                      <div className="h-8 w-8 text-white">🎯</div>
                    </div>
                    <div className="absolute -inset-1 bg-red-500 rounded-2xl opacity-20 -z-10"></div>
                  </div>
                  <div className="ml-8">
                    <h2 className="text-5xl font-light text-black tracking-tight">Our Mission</h2>
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
                  To provide exceptional grooming services that enhance every man's confidence and style,
                  creating a welcoming environment where quality meets craftsmanship in perfect harmony.
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
                      <h3 className="font-bold text-black text-xl mb-2">Community</h3>
                      <p className="text-gray-600 leading-relaxed">Building lasting relationships with our clients and contributing to the local community we serve.</p>
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
                      <div className="h-8 w-8 text-white">🛡️</div>
                    </div>
                    <div className="absolute -inset-1 bg-red-500 rounded-2xl opacity-20 -z-10"></div>
                  </div>
                  <div className="ml-8">
                    <h2 className="text-5xl font-light text-black tracking-tight">Why Choose Us?</h2>
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
                      <h3 className="font-bold text-black text-2xl mb-3">Master Craftsmen</h3>
                      <p className="text-gray-600 leading-relaxed text-lg">Our team of licensed professionals brings decades of combined experience and continuous training to every service, ensuring unparalleled expertise in gentlemen's grooming.</p>
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
                      <p className="text-gray-600 leading-relaxed text-lg">We curate only the finest professional-grade products from renowned brands, ensuring optimal results for every hair type and skin condition.</p>
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
                      <h3 className="font-bold text-black text-2xl mb-3">Bespoke Service</h3>
                      <p className="text-gray-600 leading-relaxed text-lg">Every gentleman receives personalized attention with customized styling recommendations tailored to their unique preferences and lifestyle.</p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-start space-x-8 group"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex-shrink-0 relative">
                      <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300">
                        <span className="text-white font-bold text-xl">4</span>
                      </div>
                      <div className="absolute -inset-1 bg-red-500 rounded-2xl opacity-20 -z-10 group-hover:opacity-30 transition-opacity duration-300"></div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-black text-2xl mb-3">Refined Sanctuary</h3>
                      <p className="text-gray-600 leading-relaxed text-lg">Our meticulously designed space creates an atmosphere of tranquility and sophistication, making every grooming experience a moment of pure indulgence.</p>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Elegant Team Section */}
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
              Our <span className="font-semibold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Master Craftsmen</span>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Mike Johnson', role: 'Senior Stylist & Owner', experience: '15+ years', specialty: 'Classic Cuts', gradient: 'from-red-100 to-red-200' },
              { name: 'Sarah Davis', role: 'Color Specialist', experience: '10+ years', specialty: 'Color & Highlights', gradient: 'from-red-100 to-red-200' },
              { name: 'Chris Wilson', role: 'Master Barber', experience: '12+ years', specialty: 'Traditional Shaves', gradient: 'from-red-100 to-red-200' },
              { name: 'Jake Martinez', role: 'Style Specialist', experience: '8+ years', specialty: 'Modern Styles', gradient: 'from-red-100 to-red-200' }
            ].map((member, index) => (
              <motion.div
                key={index}
                className="text-center group"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.3 }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
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
                      <div className={`w-28 h-28 bg-gradient-to-br ${member.gradient} rounded-3xl mx-auto flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300`}>
                        <span className="text-4xl font-bold text-red-600">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                        <div className="h-4 w-4 text-white" />
                      </div>
                      {/* Decorative elements */}
                      <div className="absolute -inset-2 bg-red-500 rounded-3xl opacity-10 -z-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                    </motion.div>

                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className="font-bold text-black text-xl">{member.name}</h3>
                      <p className="text-red-600 font-semibold text-sm">{member.role}</p>
                      <Badge className="bg-red-100 text-red-700 hover:bg-red-200 font-medium">
                        {member.specialty}
                      </Badge>
                      <p className="text-gray-600 text-sm font-medium">{member.experience} experience</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Button className="bg-black hover:bg-gray-900 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 text-lg">
                <div className="h-5 w-5 mr-2">👥</div>
                Meet Our Full Team
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Location & Hours */}
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
              Find <span className="font-semibold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Our Sanctuary</span>
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Located in the heart of Regina, our sophisticated space awaits your visit
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
                      <div className="h-8 w-8 text-white">📍</div>
                    </div>
                    <div className="absolute -inset-1 bg-red-500 rounded-2xl opacity-20 -z-10"></div>
                  </div>
                  <div className="ml-8">
                    <h2 className="text-5xl font-light text-black tracking-tight">Visit Us</h2>
                    <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-red-600 mt-2"></div>
                  </div>
                </motion.div>

                <motion.div
                  className="space-y-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    className="flex items-start space-x-6 group"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <div className="h-7 w-7 text-red-600">📍</div>
                    </div>
                    <div>
                      <h3 className="font-bold text-black text-xl mb-2">Address</h3>
                      <p className="text-gray-600 leading-relaxed">#4 - 425 Victoria Ave East<br />Regina, SK S4N 0P8</p>
                      <p className="text-sm text-red-600 font-medium mt-2">Downtown Regina • Conveniently Located</p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-start space-x-6 group"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <div className="h-7 w-7 text-red-600">📞</div>
                    </div>
                    <div>
                      <h3 className="font-bold text-black text-xl mb-2">Phone</h3>
                      <p className="text-red-600 font-semibold text-2xl">(306) 522-4111</p>
                      <p className="text-sm text-gray-600 mt-1">Call us for appointments or inquiries</p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-start space-x-6 group"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <div className="h-7 w-7 text-red-600">✉️</div>
                    </div>
                    <div>
                      <h3 className="font-bold text-black text-xl mb-2">Email</h3>
                      <p className="text-red-600 font-semibold">info@modernmen.ca</p>
                      <p className="text-sm text-gray-600 mt-1">We respond within 24 hours</p>
                    </div>
                  </motion.div>
                </motion.div>

                <motion.div
                  className="mt-12 p-8 bg-gradient-to-r from-red-50 to-gray-50 rounded-2xl border border-red-100"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center mb-4">
                    <div className="h-6 w-6 text-red-600 mr-3">🏆</div>
                    <h3 className="font-bold text-black text-lg">Parking & Accessibility</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Complimentary parking available in our private lot. Street parking also available.
                    Our location is fully accessible with elevator access and is conveniently located downtown.
                  </p>
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
                      <div className="h-8 w-8 text-white">🕐</div>
                    </div>
                    <div className="absolute -inset-1 bg-red-500 rounded-2xl opacity-20 -z-10"></div>
                  </div>
                  <div className="ml-8">
                    <h2 className="text-5xl font-light text-black tracking-tight">Hours</h2>
                    <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-red-600 mt-2"></div>
                  </div>
                </motion.div>

                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    className="flex justify-between items-center py-4 px-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 group hover:shadow-lg transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="font-bold text-black text-lg">Monday - Friday</span>
                    <span className="text-red-600 font-semibold text-lg">9:00 AM - 8:00 PM</span>
                  </motion.div>

                  <motion.div
                    className="flex justify-between items-center py-4 px-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 group hover:shadow-lg transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="font-bold text-black text-lg">Saturday</span>
                    <span className="text-red-600 font-semibold text-lg">9:00 AM - 8:00 PM</span>
                  </motion.div>

                  <motion.div
                    className="flex justify-between items-center py-4 px-6 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl border border-red-200 group hover:shadow-lg transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="font-bold text-black text-lg">Sunday</span>
                    <span className="text-red-700 font-semibold text-lg">Closed</span>
                  </motion.div>
                </motion.div>

                <motion.div
                  className="mt-12 p-8 bg-gradient-to-r from-red-50 to-gray-50 rounded-2xl border border-red-100"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center mb-4">
                    <div className="h-6 w-6 text-red-600 mr-3">⭐</div>
                    <h3 className="font-bold text-black text-lg">Holiday Hours</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    We may observe modified hours during statutory holidays and special occasions.
                    Please call ahead or check our social media for current holiday schedules.
                  </p>
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
                Every masterpiece begins with a single appointment. Allow our master craftsmen to unveil
                the sophisticated gentleman within. Your journey to unparalleled grooming excellence starts here.
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
