'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BookingChatbot from '@/components/features/chatbot/BookingChatbot';

export default function BookPage() {
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

  const features = [
    {
      title: 'Instant Booking',
      description: 'Book your appointment in real-time with our smart scheduling system.',
      icon: '⚡',
      highlight: true
    },
    {
      title: 'Select Your Stylist',
      description: 'Choose from our team of master craftsmen based on your preferences.',
      icon: '✂️',
      highlight: false
    },
    {
      title: 'Flexible Scheduling',
      description: 'Find the perfect time that works with your busy schedule.',
      icon: '📅',
      highlight: false
    },
    {
      title: 'Service Customization',
      description: 'Tailor your grooming experience to your exact specifications.',
      icon: '🎯',
      highlight: true
    }
  ];

  const steps = [
    {
      step: '1',
      title: 'Choose Your Service',
      description: 'Select from our premium grooming services designed for the modern gentleman.'
    },
    {
      step: '2',
      title: 'Pick Your Time',
      description: 'Find the perfect appointment slot that fits your schedule.'
    },
    {
      step: '3',
      title: 'Confirm & Relax',
      description: 'Receive confirmation and prepare for an exceptional grooming experience.'
    }
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
                <div className="h-10 w-10 text-white">📅</div>
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
            Book Your <span className="font-semibold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Experience</span>
          </motion.h1>

          <motion.p
            className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Reserve your appointment with Regina's premier grooming destination.
            Every session is a journey towards refined sophistication and unparalleled style.
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

        {/* Features Section */}
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
              Booking <span className="font-semibold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Made Simple</span>
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Experience seamless appointment scheduling with our intelligent booking system
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="group"
              >
                <Card className={`border-0 shadow-none bg-white hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 relative overflow-hidden ${
                  feature.highlight ? 'ring-2 ring-red-500/20' : ''
                }`}>
                  {/* Popular badge for highlighted features */}
                  {feature.highlight && (
                    <motion.div
                      className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 0.6, delay: index * 0.1 + 0.2 }}
                      viewport={{ once: true }}
                    >
                      <Badge className="bg-red-600 text-white px-4 py-2 rounded-full font-semibold shadow-lg">
                        ⭐ Featured
                      </Badge>
                    </motion.div>
                  )}

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
                        <div className="h-8 w-8 text-red-600 flex items-center justify-center text-2xl">{feature.icon}</div>
                      </div>
                      <div className="absolute inset-0 bg-red-500 rounded-2xl opacity-10 -z-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                    </motion.div>

                    {/* Content */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-black">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed text-sm">{feature.description}</p>
                    </div>

                    {/* Decorative element */}
                    <div className="mt-6 w-12 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto"></div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How It Works Section */}
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
              How It <span className="font-semibold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Works</span>
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Three simple steps to your perfect grooming experience
            </motion.p>
          </div>

          <div className="max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                className="flex items-start space-x-8 group mb-12 last:mb-0"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex-shrink-0 relative">
                  <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300">
                    <span className="text-white font-bold text-xl">{step.step}</span>
                  </div>
                  <div className="absolute -inset-1 bg-red-500 rounded-2xl opacity-20 -z-10 group-hover:opacity-30 transition-opacity duration-300"></div>
                  {/* Connection line */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-20 left-1/2 w-0.5 h-12 bg-gradient-to-b from-red-500 to-red-300 transform -translate-x-1/2"></div>
                  )}
                </div>
                <div className="flex-grow pt-2">
                  <h3 className="font-bold text-black text-2xl mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Booking Section */}
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
              Start Your <span className="font-semibold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Journey</span>
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Our intelligent booking assistant will guide you through the process
            </motion.p>
          </div>

          <motion.div
            className="relative bg-white rounded-3xl shadow-2xl p-8 md:p-12 overflow-hidden max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-red-50 to-transparent rounded-full -translate-y-20 translate-x-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-red-50 to-transparent rounded-full translate-y-16 -translate-x-16"></div>

            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-[0.01]">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23dc2626' fill-opacity='0.2'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
            </div>

            <div className="relative z-10">
              <BookingChatbot />
            </div>
          </motion.div>
        </motion.div>

        {/* Contact Alternative */}
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
                    <div className="h-10 w-10 text-white">📞</div>
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
                Prefer to <span className="font-semibold bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent">Call</span>
              </motion.h2>

              {/* Description */}
              <motion.p
                className="text-xl md:text-2xl mb-12 opacity-90 max-w-4xl mx-auto leading-relaxed font-light"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
                Speak directly with our team to discuss your grooming needs and
                schedule your appointment with personalized service.
              </motion.p>

              {/* CTA Button */}
              <motion.div
                className="flex justify-center"
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
                    className="bg-white text-red-600 hover:bg-gray-100 px-12 py-6 rounded-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 text-2xl group"
                  >
                    <div className="h-8 w-8 mr-4 group-hover:scale-110 transition-transform duration-300">📞</div>
                    (306) 522-4111
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
