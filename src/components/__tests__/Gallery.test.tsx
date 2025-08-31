
import React from 'react';
import { render, screen } from '@testing-library/react';
import Gallery from '../Gallery';

describe('Gallery', () => {
  it('renders gallery items', () => {
    const items = [
      {
        id: '1',
        title: 'Test Image 1',
        description: 'Test Description 1',
        image: { url: '/test-image-1.jpg' },
      },
      {
        id: '2',
        title: 'Test Image 2',
        description: 'Test Description 2',
        image: { url: '/test-image-2.jpg' },
      },
    ];

    render(<Gallery items={items} />);

    expect(screen.getByText('Test Image 1')).toBeInTheDocument();
    expect(screen.getByText('Test Image 2')).toBeInTheDocument();
  });
});
