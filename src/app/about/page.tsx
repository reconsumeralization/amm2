import { Metadata } from 'next';
import {
  MapPin,
  Clock,
  Star,
  Users,
  Scissors,
  Award,
  Phone,
  Mail
} from '@/lib/icons';

export const metadata: Metadata = {
  title: 'About Us - Modern Men BarberShop',
  description: 'Learn about Modern Men BarberShop\'s story, mission, and commitment to providing exceptional grooming services in Regina.',
  keywords: ['about us', 'modern men BarberShop', 'story', 'mission', 'regina BarberShop']
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About Modern Men
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            More than just a BarberShop - we're a destination for the modern man who values quality, 
            style, and an exceptional grooming experience.
          </p>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Modern Men BarberShop was founded in 2020 by Mike Johnson with a simple vision: to create 
                  a premium grooming destination where men could feel confident, comfortable, and cared for.
                </p>
                <p>
                  What started as a small barbershop in Regina has grown into one of the city's most 
                  respected men's grooming establishments. Our commitment to quality, attention to detail, 
                  and personalized service has earned us a loyal clientele and a reputation for excellence.
                </p>
                <p>
                  Today, we continue to evolve and innovate, staying ahead of trends while maintaining 
                  the timeless techniques that make us stand out. Every client who walks through our doors 
                  becomes part of our story - a story of transformation, confidence, and style.
                </p>
              </div>
            </div>
            <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Scissors size={48} className="mx-auto mb-4" />
                <p className="text-lg font-semibold">Our Story</p>
                <p className="text-sm">Image Coming Soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Values */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              To provide exceptional grooming services that enhance every man's confidence and style, 
              creating a welcoming environment where quality meets craftsmanship.
            </p>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Star className="text-blue-600 mt-1" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-900">Excellence</h3>
                  <p className="text-gray-600 text-sm">Delivering the highest quality service in every appointment</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Users className="text-blue-600 mt-1" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-900">Community</h3>
                  <p className="text-gray-600 text-sm">Building relationships with our clients and the local community</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Award className="text-blue-600 mt-1" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-900">Innovation</h3>
                  <p className="text-gray-600 text-sm">Staying current with trends and techniques</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Choose Us?</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Expert Stylists</h3>
                  <p className="text-gray-600 text-sm">Our team of licensed professionals brings years of experience and continuous training to every service.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Premium Products</h3>
                  <p className="text-gray-600 text-sm">We use only the highest quality products to ensure the best results for your hair and skin.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Personalized Service</h3>
                  <p className="text-gray-600 text-sm">Every client receives individualized attention and customized styling recommendations.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Relaxing Atmosphere</h3>
                  <p className="text-gray-600 text-sm">Our modern, comfortable space is designed to make your grooming experience enjoyable and stress-free.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">3+</div>
            <div className="text-gray-600">Years Experience</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
            <div className="text-gray-600">Happy Clients</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">4.9</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">4</div>
            <div className="text-gray-600">Expert Stylists</div>
          </div>
        </div>

        {/* Location & Hours */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Visit Us</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="text-blue-600 mt-1" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-900">Address</h3>
                  <p className="text-gray-600">425 Victoria Ave East, Regina, SK S4N 0N9</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="text-blue-600 mt-1" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-900">Phone</h3>
                  <p className="text-gray-600">(555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="text-blue-600 mt-1" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-900">Email</h3>
                  <p className="text-gray-600">info@modernmen.com</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Parking</h3>
              <p className="text-gray-600 text-sm">
                Free parking available in our lot. Street parking also available.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Hours</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-medium">Monday - Friday</span>
                <span className="text-gray-600">9:00 AM - 7:00 PM</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-medium">Saturday</span>
                <span className="text-gray-600">9:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-medium">Sunday</span>
                <span className="text-gray-600">Closed</span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Holiday Hours</h3>
              <p className="text-gray-600 text-sm">
                We may have modified hours during holidays. Please call ahead or check our social media for updates.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our expert stylists are passionate about helping you look and feel your best. 
              Each team member brings unique skills and experience to provide you with personalized, professional service.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Mike Johnson', role: 'Senior Stylist & Owner', experience: '15+ years' },
              { name: 'Sarah Davis', role: 'Color Specialist', experience: '10+ years' },
              { name: 'Chris Wilson', role: 'Master Barber', experience: '12+ years' },
              { name: 'Jake Martinez', role: 'Style Specialist', experience: '8+ years' }
            ].map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-600">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-blue-600 text-sm mb-2">{member.role}</p>
                <p className="text-gray-600 text-xs">{member.experience} experience</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
              View Full Team
            </button>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience Modern Men?</h2>
          <p className="text-xl mb-6 opacity-90">
            Book your appointment today and discover why we're Regina's premier destination for men's grooming.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Book Appointment
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
