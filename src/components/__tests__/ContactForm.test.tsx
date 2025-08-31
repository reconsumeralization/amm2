
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactForm from '../ContactForm';

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  } as any)
);

describe('ContactForm', () => {
  it('submits the form', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText('Name'), 'John Doe');
    await user.type(screen.getByLabelText('Email'), 'john.doe@example.com');
    await user.type(screen.getByLabelText('Message'), 'Test message');

    await user.click(screen.getByText('Submit'));

    await screen.findByText('Thank you for your message!');

    expect(fetch).toHaveBeenCalledWith('/api/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john.doe@example.com',
        message: 'Test message',
      }),
    });
  });
});
