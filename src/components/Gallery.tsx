
import React from 'react';
import Image from 'next/image';

type GalleryItem = {
  id: string;
  title: string;
  description: string;
  image: {
    url: string;
  };
};

const Gallery = ({ items }: { items: GalleryItem[] }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gallery</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {items.map((item: GalleryItem) => (
          <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
            <div className="h-64 bg-gradient-to-br from-blue-400 to-indigo-500 relative">
              <Image src={item.image.url} alt={item.title} layout="fill" objectFit="cover" />
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
              <p className="text-gray-600 text-sm mb-3">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
