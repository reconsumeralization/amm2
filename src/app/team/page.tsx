import { Metadata } from 'next';
import { Calendar, Star, Award, Instagram, Facebook } from '@/lib/icon-mapping';

export const metadata: Metadata = {
  title: 'Our Team - Modern Men Salon',
  description: 'Meet our expert stylists and grooming professionals. Each team member brings unique skills and experience to provide you with the best service.',
  keywords: ['stylists', 'barbers', 'grooming professionals', 'team', 'experts']
};

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
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Meet Our Team
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our expert stylists are passionate about helping you look and feel your best. 
            Each team member brings unique skills and experience to provide you with personalized, professional service.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
          {stylists.map((stylist) => (
            <div key={stylist.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Stylist Image */}
              <div className="h-64 bg-gradient-to-br from-blue-400 to-indigo-500 relative">
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-600">
                        {stylist.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <p className="text-sm">Photo Coming Soon</p>
                  </div>
                </div>
                
                {/* Rating Badge */}
                <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 flex items-center space-x-1 shadow-md">
                  <Star size={14} className="text-yellow-500 fill-current" />
                  <span className="text-sm font-semibold">{stylist.rating}</span>
                  <span className="text-xs text-gray-500">({stylist.reviews})</span>
                </div>
              </div>

              {/* Stylist Info */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{stylist.name}</h3>
                  <p className="text-blue-600 font-semibold mb-2">{stylist.role}</p>
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Award size={16} className="mr-2" />
                    {stylist.experience} experience
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar size={16} className="mr-2" />
                    {stylist.availability}
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{stylist.bio}</p>

                {/* Specialties */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {stylist.specialties.map((specialty, index) => (
                      <span 
                        key={index}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Social Links & Book Button */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <a 
                      href={`https://instagram.com/${stylist.social.instagram}`}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Instagram size={20} />
                    </a>
                    <a 
                      href={`https://facebook.com/${stylist.social.facebook}`}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Facebook size={20} />
                    </a>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                    Book with {stylist.name.split(' ')[0]}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Why Choose Our Team */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Team?</h2>
            <p className="text-xl text-gray-600">
              Our stylists are more than just professionals - they're artists dedicated to your satisfaction.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-blue-600" size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Certified Professionals</h3>
              <p className="text-gray-600 text-sm">All our stylists are licensed and continuously trained in the latest techniques.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-blue-600" size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Proven Excellence</h3>
              <p className="text-gray-600 text-sm">Consistently high ratings and positive reviews from satisfied clients.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-blue-600" size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Flexible Scheduling</h3>
              <p className="text-gray-600 text-sm">Extended hours and various availability to fit your busy schedule.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Instagram className="text-blue-600" size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Latest Trends</h3>
              <p className="text-gray-600 text-sm">Stay connected with our stylists on social media for style inspiration.</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Book with Your Favorite Stylist</h2>
          <p className="text-xl mb-6 opacity-90">
            Choose your preferred stylist and book your appointment online or give us a call.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Book Appointment
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              View Gallery
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
