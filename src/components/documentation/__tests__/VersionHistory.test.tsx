import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VersionHistory } from '../VersionHistory';

describe('VersionHistory', () => {
  it('renders without crashing', () => {
    render(<VersionHistory contentId="test-content" versions={[]} />);
  });
});
