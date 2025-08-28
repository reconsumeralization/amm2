'use client';

import { useEffect, useState } from 'react';
import { Clock, Star, Scissors, DollarSign, Timer, Zap, CreditCard } from 'lucide-react';

interface Service {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  features: string[];
  popular: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services');
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        const data = await response.json();
        setServices(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Our Services
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional grooming services tailored to the modern man. From classic cuts to contemporary styles, 
            we provide the highest quality service in a relaxed, welcoming atmosphere.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {services.map((service) => (
            <div 
              key={service.id}
              className={`bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105 ${
                service.popular ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {service.popular && (
                <div className="bg-blue-500 text-white text-center py-2 px-4">
                  <Star size={16} className="inline mr-2" />
                  Most Popular
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{service.title}</h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">${service.price}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Clock size={14} className="mr-1" />
                      {service.duration}
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{service.description}</p>
                
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Why Choose Us */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Why Choose Modern Men?</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Scissors className="text-blue-600 mt-1" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-900">Expert Stylists</h3>
                  <p className="text-gray-600">Our team of experienced professionals stays up-to-date with the latest trends and techniques.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="text-blue-600 mt-1" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-900">Convenient Hours</h3>
                  <p className="text-gray-600">Extended hours including evenings and Saturdays to fit your busy schedule.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <DollarSign className="text-blue-600 mt-1" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-900">Competitive Pricing</h3>
                  <p className="text-gray-600">Quality service at fair prices. We also offer package deals and loyalty rewards.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Booking Information</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How to Book</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• Online booking through our website</li>
                  <li>• Call us at (555) 123-4567</li>
                  <li>• Visit us in person</li>
                  <li>• Use our AI chatbot for instant booking</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Cancellation Policy</h3>
                <p className="text-gray-600">
                  Please provide 24 hours notice for cancellations. Late cancellations may incur a fee.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Payment Options</h3>
                <p className="text-gray-600">
                  We accept cash, credit cards, debit cards, and mobile payments.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready for a New Look?</h2>
          <p className="text-xl mb-6 opacity-90">
            Book your appointment today and experience the difference professional grooming makes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Book Online
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Call Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
