import { Metadata } from 'next';
import { Star, thumbsUp as ThumbsUp, Heart } from '@/lib/icon-mapping';

// Quote doesn't exist in our mapping, let's create a simple one
const Quote = ({ className }: { className?: string }) => <span className={className}>"</span>;

export const metadata: Metadata = {
  title: 'Testimonials - Modern Men Salon',
  description: 'Read what our clients say about their experience at Modern Men Salon. Real reviews from satisfied customers.',
  keywords: ['testimonials', 'reviews', 'customer feedback', 'modern men salon']
};

const testimonials = [
  {
    id: 1,
    name: 'James Wilson',
    service: 'Haircut & Beard Trim',
    rating: 5,
    date: '2024-01-15',
    review: 'Absolutely fantastic experience! Mike did an amazing job with my haircut and beard trim. The attention to detail was incredible, and I left feeling like a new man. Highly recommend!',
    stylist: 'Mike Johnson',
    verified: true
  },
  {
    id: 2,
    name: 'David Chen',
    service: 'Traditional Shave',
    rating: 5,
    date: '2024-01-12',
    review: 'Chris gave me the best shave I\'ve ever had. The hot towel treatment was so relaxing, and the straight razor shave was perfect. I\'ll definitely be coming back regularly.',
    stylist: 'Chris Wilson',
    verified: true
  },
  {
    id: 3,
    name: 'Michael Rodriguez',
    service: 'Hair Coloring',
    rating: 5,
    date: '2024-01-10',
    review: 'Sarah is a true artist! She completely transformed my look with some subtle highlights. The color looks natural and the cut is exactly what I wanted. Professional service from start to finish.',
    stylist: 'Sarah Davis',
    verified: true
  },
  {
    id: 4,
    name: 'Robert Thompson',
    service: 'Style Consultation',
    rating: 4,
    date: '2024-01-08',
    review: 'Great consultation with Jake. He really listened to what I wanted and gave me some excellent advice on styling products and maintenance. My hair has never looked better.',
    stylist: 'Jake Martinez',
    verified: true
  },
  {
    id: 5,
    name: 'Andrew Kim',
    service: 'Complete Grooming Package',
    rating: 5,
    date: '2024-01-05',
    review: 'The complete package was worth every penny. Haircut, beard trim, and hot towel shave all done to perfection. The salon atmosphere is relaxed and professional. Will definitely return!',
    stylist: 'Mike Johnson',
    verified: true
  },
  {
    id: 6,
    name: 'Kevin Patel',
    service: 'Haircut',
    rating: 5,
    date: '2024-01-03',
    review: 'Found this place through a friend\'s recommendation and I\'m so glad I did. The haircut exceeded my expectations and the service was top-notch. Very reasonable pricing too.',
    stylist: 'Jake Martinez',
    verified: true
  },
  {
    id: 7,
    name: 'Thomas Anderson',
    service: 'Beard Sculpting',
    rating: 4,
    date: '2023-12-28',
    review: 'Amazing beard work! The stylist really understood what I was going for and executed it perfectly. Great attention to detail and the final result looks professional.',
    stylist: 'Mike Johnson',
    verified: true
  },
  {
    id: 8,
    name: 'Christopher Lee',
    service: 'Haircut & Style',
    rating: 5,
    date: '2023-12-25',
    review: 'Best haircut I\'ve had in years! The stylist took the time to understand my hair type and lifestyle to give me a style that works perfectly for me. Highly recommend!',
    stylist: 'Sarah Davis',
    verified: true
  }
];

const stats = {
  totalReviews: 247,
  averageRating: 4.8,
  fiveStarReviews: 198,
  recommendedPercentage: 96
};

export default function TestimonialsPage() {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={`${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            What Our Clients Say
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it - hear from our satisfied clients about their 
            experience at Modern Men Salon.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.averageRating}</div>
            <div className="flex justify-center mb-2">
              {renderStars(Math.floor(stats.averageRating))}
            </div>
            <div className="text-gray-600 text-sm">Average Rating</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalReviews}</div>
            <div className="text-gray-600 text-sm">Total Reviews</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.fiveStarReviews}</div>
            <div className="text-gray-600 text-sm">5-Star Reviews</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.recommendedPercentage}%</div>
            <div className="text-gray-600 text-sm">Would Recommend</div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {testimonial.verified && (
                    <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                  <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                </div>
                <div className="text-gray-300 text-2xl">"</div>
              </div>

              {/* Rating */}
              <div className="flex items-center mb-3">
                <div className="flex mr-2">
                  {renderStars(testimonial.rating)}
                </div>
                <span className="text-sm text-gray-500">{testimonial.rating}/5</span>
              </div>

              {/* Service Info */}
              <div className="text-sm text-blue-600 mb-3">
                {testimonial.service} • {testimonial.stylist}
              </div>

              {/* Review */}
              <p className="text-gray-700 mb-4 leading-relaxed">
                "{testimonial.review}"
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{new Date(testimonial.date).toLocaleDateString()}</span>
                <div className="flex space-x-2">
                  <button className="text-gray-400 hover:text-blue-600 transition-colors">
                    <ThumbsUp size={16} />
                  </button>
                  <button className="text-gray-400 hover:text-red-500 transition-colors">
                    <Heart size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Reviews */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Reviews</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {testimonials.slice(0, 2).map((testimonial) => (
              <div key={`featured-${testimonial.id}`} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-bold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                    <p className="text-sm text-gray-600">{testimonial.service}</p>
                  </div>
                </div>
                <div className="flex items-center mb-3">
                  {renderStars(testimonial.rating)}
                  <span className="ml-2 text-sm text-gray-500">{testimonial.rating}/5</span>
                </div>
                <p className="text-gray-700 italic">"{testimonial.review}"</p>
                <div className="mt-4 text-sm text-gray-500">
                  Stylist: {testimonial.stylist} • {new Date(testimonial.date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Review Categories */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Reviews by Service</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { service: 'Haircuts', rating: 4.9, count: 89 },
              { service: 'Beard Trims', rating: 4.8, count: 67 },
              { service: 'Traditional Shaves', rating: 5.0, count: 45 },
              { service: 'Hair Coloring', rating: 4.7, count: 23 }
            ].map((category, index) => (
              <div key={index} className="text-center p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">{category.service}</h3>
                <div className="flex justify-center mb-2">
                  {renderStars(Math.floor(category.rating))}
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-1">{category.rating}</div>
                <div className="text-sm text-gray-500">{category.count} reviews</div>
              </div>
            ))}
          </div>
        </div>

        {/* Leave Review Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-8 text-center text-white mb-12">
          <h2 className="text-3xl font-bold mb-4">Share Your Experience</h2>
          <p className="text-xl mb-6 opacity-90">
            We'd love to hear about your experience at Modern Men Salon.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Write a Review
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Rate Us
            </button>
          </div>
        </div>

        {/* Social Proof */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What Makes Us Different</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-blue-600" size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Consistent Quality</h3>
              <p className="text-gray-600 text-sm">
                Every client receives the same high-quality service, regardless of who their stylist is.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-blue-600" size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Client Satisfaction</h3>
              <p className="text-gray-600 text-sm">
                We're not happy until you're happy. Your satisfaction is our top priority.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ThumbsUp className="text-blue-600" size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Proven Track Record</h3>
              <p className="text-gray-600 text-sm">
                Years of experience and thousands of satisfied clients speak for themselves.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
