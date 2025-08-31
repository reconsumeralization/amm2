import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FeedbackWidget } from '../FeedbackWidget';

describe('FeedbackWidget', () => {
  it('renders without crashing', () => {
    render(<FeedbackWidget contentId="test-content" contentType="guide" onFeedback={() => {}} />);
  });
});
