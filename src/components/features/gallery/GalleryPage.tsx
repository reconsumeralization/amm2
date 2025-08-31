
'use client';

import React, { useEffect, useState } from 'react';
import Gallery from './Gallery';

const GalleryPage = () => {
  const [galleryItems, setGalleryItems] = useState([]);

  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        const response = await fetch('/api/gallery');
        const data = await response.json();
        setGalleryItems(data.docs);
      } catch (error) {
        console.error('Error fetching gallery items:', error);
      }
    };

    fetchGalleryItems();
  }, []);

  return <Gallery items={galleryItems} />;
};

export default GalleryPage;
