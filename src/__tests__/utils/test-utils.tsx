import React from 'react';
import { render, RenderOptions, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { Session } from 'next-auth';

/**
 * Custom render options with session support
 */
export interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  session?: Session | null;
}

/**
 * Simple render function with optional session support
 * @param ui - React component to render
 * @param options - Render options including optional session
 * @returns Rendered component with user event setup
 */
const customRender = (
  ui: React.ReactElement,
  options?: CustomRenderOptions
) => {
  // Extract session from options
  const { session, ...renderOptions } = options || {};

  // Mock the useSession hook if session is provided
  if (session !== undefined) {
    // Import here to avoid circular dependencies
    const nextAuth = jest.requireMock('next-auth/react');

    // Mock the useSession hook to return the provided session
    nextAuth.useSession.mockReturnValue({
      data: session,
      status: session ? 'authenticated' : 'unauthenticated',
    });
  }

  return {
    user: userEvent.setup({ delay: null }),
    ...render(ui, renderOptions),
  };
};

// Re-export everything
export * from '@testing-library/react';

// Override render method and export helpers
export {
  customRender as render,
  screen,
  waitFor,
  within
};
