import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DeprecationWarning } from '../DeprecationWarning';

describe('DeprecationWarning', () => {
  it('renders without crashing', () => {
    const mockWarning = {
      contentId: 'test-warning',
      severity: 'warning' as const,
      reason: 'This is a test warning',
      replacement: null,
      removalVersion: null,
      autoRedirect: false,
      redirectDelay: 0,
      migrationInstructions: null,
    };
    render(<DeprecationWarning warning={mockWarning} />);
  });
});
