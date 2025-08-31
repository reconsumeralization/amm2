import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VersionHistory } from '../VersionHistory';

describe('VersionHistory', () => {
  it('renders without crashing', () => {
    const mockOnVersionSelect = jest.fn();
    render(
      <VersionHistory 
        contentId="test-content" 
        versions={[]} 
        onVersionSelect={mockOnVersionSelect}
      />
    );
  });
});
