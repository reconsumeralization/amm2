"use client"

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import HeroSection from '@/components/sections/hero-section'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TestimonialsCarousel } from '@/components/ui/testimonials-carousel'
import { motion } from 'framer-motion'

const services = [
  {
    title: "Classic Haircut",
    description: "Traditional men's haircut with precision styling",
    price: "$35",
    duration: "45 min",
    features: ["Consultation", "Wash & Style", "Professional Finish"]
  },
  {
    title: "Premium Haircut & Beard Trim",
    description: "Complete grooming package for the modern gentleman",
    price: "$50",
    duration: "60 min",
    features: ["Haircut", "Beard Trim", "Hot Towel", "Styling"]
  },
  {
    title: "Executive Shave",
    description: "Traditional straight razor shave with premium products",
    price: "$40",
    duration: "45 min",
    features: ["Hot Towel", "Straight Razor", "After Care"]
  }
]

const team = [
  {
    name: "Michael Chen",
    role: "Master Stylist",
    experience: "12 years",
    specialties: ["Fades", "Pompadours", "Beard Grooming"]
  },
  {
    name: "David Rodriguez",
    role: "Senior Barber",
    experience: "8 years",
    specialties: ["Classic Cuts", "Straight Razor", "Color"]
  },
  {
    name: "James Wilson",
    role: "Stylist",
    experience: "5 years",
    specialties: ["Modern Styles", "Textured Cuts", "Consultation"]
  }
]

export default function Home() {
  const router = useRouter()
  const { data: session } = useSession()

  const handleBookNow = () => {
    if (session) {
      router.push('/portal/book')
    } else {
      router.push('/auth/signin?callbackUrl=/portal/book')
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
        <HeroSection onBookNow={handleBookNow} />
      
      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-light text-black mb-6">
              Our Services
            </h2>
            <p className="text-xl font-body text-gray-600 max-w-3xl mx-auto">
              Professional grooming services tailored to your style and preferences
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-red-200 h-full">
                  <CardHeader className="text-center bg-gradient-to-r from-red-50 to-gray-50 border-b border-gray-100">
                    <CardTitle className="text-2xl font-display font-medium text-black">
                      {service.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 font-body">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <div className="text-3xl font-display font-bold text-red-600 mb-2">
                        {service.price}
                      </div>
                      <Badge variant="outline" className="border-red-200 text-red-600 bg-red-50">
                        {service.duration}
                      </Badge>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-center text-gray-600 font-body">
                          <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full bg-red-600 hover:bg-red-700 text-white border-0 transition-all duration-200"
                      onClick={handleBookNow}
                    >
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-display font-light text-black mb-6">
                About Modern Men
              </h2>
              <p className="text-lg font-body text-gray-600 mb-6 leading-relaxed">
                Established in 2008, Modern Men has been Regina's premier destination for men's grooming. 
                Our commitment to excellence and attention to detail has made us the trusted choice for 
                discerning gentlemen who demand the best.
              </p>
              <p className="text-lg font-body text-gray-600 mb-8 leading-relaxed">
                We combine traditional barbering techniques with modern styling approaches to create 
                looks that are both timeless and contemporary. Every visit is an experience designed 
                to leave you looking and feeling your best.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-display font-bold text-black mb-2">15+</div>
                  <div className="text-gray-600 font-body">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-display font-bold text-black mb-2">500+</div>
                  <div className="text-gray-600 font-body">Happy Clients</div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                  <span className="text-gray-500 font-body">Salon Image</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-light text-black mb-6">
              Meet Our Team
            </h2>
            <p className="text-xl font-body text-gray-600 max-w-3xl mx-auto">
              Experienced professionals dedicated to delivering exceptional service
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-red-200 text-center h-full">
                  <CardHeader className="bg-gradient-to-r from-red-50 to-gray-50 border-b border-gray-100">
                    <div className="w-32 h-32 mx-auto mb-4 bg-red-100 rounded-full overflow-hidden flex items-center justify-center">
                      <span className="text-red-600 font-bold text-2xl">{member.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <CardTitle className="text-xl font-display font-medium text-black">
                      {member.name}
                    </CardTitle>
                    <CardDescription className="text-gray-600 font-body">
                      {member.role} • {member.experience}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {member.specialties.map((specialty) => (
                        <Badge key={specialty} variant="outline" className="mr-2 mb-2 border-red-200 text-red-600 bg-red-50">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-light text-black mb-6">
              Visit Us
            </h2>
            <p className="text-xl font-body text-gray-600 max-w-3xl mx-auto">
              Located in the heart of Regina, we're easily accessible and ready to serve you
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-premium-lg"
            >
              <div>
                <h3 className="text-2xl font-display font-medium text-black mb-4">Location</h3>
                <p className="text-lg font-body text-gray-600 mb-6">
                  #4 - 425 Victoria Ave East<br />
                  Regina, SK S4N 0P8
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-display font-medium text-black mb-4">Hours</h3>
                <div className="space-y-2 font-body text-gray-600">
                  <div>Monday - Friday: 9:00 AM - 8:00 PM</div>
                  <div>Saturday: 9:00 AM - 8:00 PM</div>
                  <div>Sunday: Closed</div>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-display font-medium text-black mb-4">Contact</h3>
                <p className="text-lg font-body text-gray-600 mb-6">
                  Phone: (306) 522-4111<br />
                  Email: info@modernmen.ca
                </p>
              </div>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white border-0 px-8 py-4 text-lg transition-all duration-200"
                onClick={handleBookNow}
              >
                Book Appointment
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                  <span className="text-gray-500 font-body">Map</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsCarousel />


    </main>
  )
}