
import React from 'react';
import { render } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';

const AllTheProviders = ({ children }) => {
  return (
    <SessionProvider session={{
      expires: '1',
      user: { email: 'test@test.com', name: 'test', image: '' },
    }}>
      {children}
    </SessionProvider>
  );
};

const customRender = (ui, options?) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';

export { customRender as render };
