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
      replacement: undefined,
      removalVersion: undefined,
      deprecatedVersion: {
        major: 1,
        minor: 0,
        patch: 0
      },
      autoRedirect: false,
      redirectDelay: 0,
      migrationInstructions: '',
    };
    render(<DeprecationWarning warning={mockWarning} />);
  });
});
