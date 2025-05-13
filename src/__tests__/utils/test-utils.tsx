import React from 'react';
import { render, RenderOptions, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

// Simple render function without providers
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return {
    user: userEvent.setup({ delay: null }),
    ...render(ui, options),
  };
};

// Re-export everything
export * from '@testing-library/react';

// Override render method and export helpers
export { customRender as render, screen, waitFor, within };
