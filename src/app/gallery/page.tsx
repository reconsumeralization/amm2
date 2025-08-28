import { Metadata } from 'next';
import { Star, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Gallery - Modern Men Salon',
  description: 'Browse our gallery of hairstyles, transformations, and grooming work. See the quality and creativity of our expert stylists.',
  keywords: ['hairstyles', 'gallery', 'before after', 'transformations', 'haircuts', 'grooming']
};

const galleryItems = [
  {
    id: 1,
    title: 'Classic Fade',
    category: 'Fade',
    description: 'Clean, modern fade with textured top',
    image: '/images/gallery/classic-fade.jpg',
    likes: 127,
    stylist: 'Mike Johnson',
    beforeAfter: true
  },
  {
    id: 2,
    title: 'Business Professional',
    category: 'Classic',
    description: 'Clean-cut style perfect for the office',
    image: '/images/gallery/business-style.jpg',
    likes: 94,
    stylist: 'Chris Wilson',
    beforeAfter: false
  },
  {
    id: 3,
    title: 'Textured Quiff',
    category: 'Modern',
    description: 'Voluminous, textured style with natural movement',
    image: '/images/gallery/textured-quiff.jpg',
    likes: 156,
    stylist: 'Jake Martinez',
    beforeAfter: true
  },
  {
    id: 4,
    title: 'Beard Sculpting',
    category: 'Beard',
    description: 'Precise beard shaping and grooming',
    image: '/images/gallery/beard-sculpt.jpg',
    likes: 203,
    stylist: 'Mike Johnson',
    beforeAfter: true
  },
  {
    id: 5,
    title: 'Silver Fox',
    category: 'Color',
    description: 'Sophisticated gray blending and styling',
    image: '/images/gallery/silver-fox.jpg',
    likes: 89,
    stylist: 'Sarah Davis',
    beforeAfter: false
  },
  {
    id: 6,
    title: 'Undercut Style',
    category: 'Modern',
    description: 'Sharp undercut with styled top section',
    image: '/images/gallery/undercut.jpg',
    likes: 178,
    stylist: 'Jake Martinez',
    beforeAfter: true
  },
  {
    id: 7,
    title: 'Traditional Shave',
    category: 'Shave',
    description: 'Classic hot towel straight razor shave',
    image: '/images/gallery/traditional-shave.jpg',
    likes: 145,
    stylist: 'Chris Wilson',
    beforeAfter: false
  },
  {
    id: 8,
    title: 'Pompadour',
    category: 'Classic',
    description: 'Timeless pompadour with modern edge',
    image: '/images/gallery/pompadour.jpg',
    likes: 112,
    stylist: 'Mike Johnson',
    beforeAfter: true
  },
  {
    id: 9,
    title: 'Color Highlights',
    category: 'Color',
    description: 'Subtle highlights for natural dimension',
    image: '/images/gallery/color-highlights.jpg',
    likes: 167,
    stylist: 'Sarah Davis',
    beforeAfter: true
  }
];

const categories = [
  { id: 'all', name: 'All Styles', count: galleryItems.length },
  { id: 'fade', name: 'Fades', count: galleryItems.filter(item => item.category === 'Fade').length },
  { id: 'classic', name: 'Classic', count: galleryItems.filter(item => item.category === 'Classic').length },
  { id: 'modern', name: 'Modern', count: galleryItems.filter(item => item.category === 'Modern').length },
  { id: 'beard', name: 'Beard', count: galleryItems.filter(item => item.category === 'Beard').length },
  { id: 'color', name: 'Color', count: galleryItems.filter(item => item.category === 'Color').length },
  { id: 'shave', name: 'Shaves', count: galleryItems.filter(item => item.category === 'Shave').length }
];

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Our Gallery
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Browse our collection of hairstyles, transformations, and grooming work. 
            Each image showcases the skill and creativity of our expert stylists.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              className="px-6 py-3 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow font-semibold text-gray-700 hover:text-blue-600 border-2 border-transparent hover:border-blue-200"
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {galleryItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
              {/* Image Placeholder */}
              <div className="h-64 bg-gradient-to-br from-blue-400 to-indigo-500 relative">
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Camera size={48} className="mx-auto mb-2" />
                    <p className="text-sm">{item.title}</p>
                    <p className="text-xs opacity-75">Photo Coming Soon</p>
                  </div>
                </div>
                
                {/* Before/After Badge */}
                {item.beforeAfter && (
                  <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
                    <span>Before/After</span>
                  </div>
                )}
                
                {/* Category Badge */}
                <div className="absolute top-4 right-4 bg-white text-gray-700 text-xs px-2 py-1 rounded-full">
                  {item.category}
                </div>
                
                {/* Like Button */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow">
                    <Heart size={16} className="text-red-500" />
                  </button>
                </div>
                
                {/* Share Button */}
                <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow">
                    <Share2 size={16} className="text-blue-600" />
                  </button>
                </div>
              </div>

              {/* Item Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <Heart size={14} className="mr-1" />
                    {item.likes}
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Users size={14} className="mr-1" />
                    {item.stylist}
                  </div>
                  
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold">
                    Book This Style
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Transformations</h2>
            <p className="text-xl text-gray-600">
              See the amazing before and after results from our expert stylists.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.filter(item => item.beforeAfter).slice(0, 3).map((item) => (
              <div key={`featured-${item.id}`} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Camera size={32} className="mx-auto mb-2" />
                    <p className="text-sm">Before/After</p>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">by {item.stylist}</span>
                  <button className="text-blue-600 text-sm font-semibold hover:text-blue-700">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
            <div className="text-gray-600">Happy Clients</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
            <div className="text-gray-600">Styles Created</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">4.9</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">3</div>
            <div className="text-gray-600">Years Experience</div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready for Your Transformation?</h2>
          <p className="text-xl mb-6 opacity-90">
            Book an appointment with our expert stylists and get the look you've always wanted.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Book Appointment
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Style Consultation
            </button>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Follow Us for More Inspiration</h3>
          <p className="text-gray-600 mb-6">
            Check out our social media for daily style inspiration and behind-the-scenes content.
          </p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
              Instagram
            </a>
            <a href="#" className="bg-blue-800 text-white px-6 py-3 rounded-lg hover:bg-blue-900 transition-colors font-semibold">
              Facebook
            </a>
            <a href="#" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold">
              YouTube
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
