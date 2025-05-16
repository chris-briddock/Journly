import React, { ReactElement, ReactNode } from 'react';
import { render as rtlRender, RenderOptions, RenderResult, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UserEvent as UserEventType } from '@testing-library/user-event';
import { TooltipProvider } from '@/app/components/ui/tooltip';
import { ThemeProvider } from '@/app/components/ThemeProvider';

/**
 * Interface for the return type of our custom render function
 * Extends RenderResult to include the user event instance
 */
interface CustomRenderResult extends RenderResult {
  user: UserEventType;
}

/**
 * Interface for custom render options
 * Extends RenderOptions to include any custom options we might need
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /**
   * Initial route for the test
   */
  route?: string;
  /**
   * Whether to use the theme provider
   * @default true
   */
  withTheme?: boolean;
  /**
   * Whether to use the tooltip provider
   * @default true
   */
  withTooltip?: boolean;
}

/**
 * Custom render function that includes common providers and returns userEvent
 *
 * @param ui - The React element to render
 * @param options - Custom render options
 * @returns The render result with user event instance
 *
 * @example
 * ```tsx
 * const { user, getByText } = render(<MyComponent />, { route: '/dashboard' });
 * await user.click(getByText('Submit'));
 * ```
 */
function customRender(
  ui: ReactElement,
  options: CustomRenderOptions = {}
): CustomRenderResult {
  const {
    withTheme = true,
    withTooltip = true,
    ...renderOptions
  } = options;

  // Setup user event
  const user = userEvent.setup();

  // Create a wrapper with all the providers we need
  const Wrapper = ({ children }: { children: ReactNode }) => {
    // Apply providers based on options
    let content = children;

    // Apply tooltip provider if requested
    if (withTooltip) {
      content = React.createElement(TooltipProvider, null, content);
    }

    // Apply theme provider if requested
    if (withTheme) {
      content = React.createElement(ThemeProvider, {
        attribute: "class",
        defaultTheme: "system",
        enableSystem: true
      }, content);
    }

    return content as ReactElement;
  };

  // Render with the wrapper
  return {
    user,
    ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method and explicitly re-export waitFor
export { customRender as render, waitFor };

/**
 * Helper function to wait for a specific amount of time
 * Useful for testing animations or debounced functions
 *
 * @param ms - Time to wait in milliseconds
 * @returns A promise that resolves after the specified time
 *
 * @example
 * ```tsx
 * await sleep(500); // Wait for 500ms
 * ```
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));
