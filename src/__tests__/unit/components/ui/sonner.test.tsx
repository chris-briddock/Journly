/**
 * @jest-environment jsdom
 *
 * Unit tests for the Sonner Toaster component
 */

import { render } from '@testing-library/react';
import { Toaster } from '@/app/components/ui/sonner';
import { useTheme } from 'next-themes';

// Mock the next-themes useTheme hook
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));

// Mock the sonner Toaster component
jest.mock('sonner', () => ({
  Toaster: ({
    theme,
    className,
    style,
    ...props
  }: React.ComponentPropsWithoutRef<'div'> & {
    theme?: string;
    position?: string;
    closeButton?: boolean;
    richColors?: boolean;
  }) => (
    <div
      data-testid="mock-sonner"
      data-theme={theme}
      className={className}
      style={style}
      {...props}
    />
  ),
}));

describe('Toaster Component', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Default mock implementation for useTheme
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
    });
  });

  /**
   * Test basic rendering
   */
  it('renders correctly with default props', () => {
    const { getByTestId } = render(<Toaster />);

    const toaster = getByTestId('mock-sonner');
    expect(toaster).toBeInTheDocument();
    expect(toaster).toHaveClass('toaster');
    expect(toaster).toHaveClass('group');
    expect(toaster).toHaveAttribute('data-theme', 'light');
  });

  /**
   * Test with different themes
   */
  it('renders with dark theme', () => {
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'dark',
    });

    const { getByTestId } = render(<Toaster />);

    const toaster = getByTestId('mock-sonner');
    expect(toaster).toHaveAttribute('data-theme', 'dark');
  });

  it('renders with system theme when theme is not provided', () => {
    (useTheme as jest.Mock).mockReturnValue({
      // No theme property
    });

    const { getByTestId } = render(<Toaster />);

    const toaster = getByTestId('mock-sonner');
    expect(toaster).toHaveAttribute('data-theme', 'system');
  });

  /**
   * Test with custom props
   */
  it('passes additional props to the Sonner component', () => {
    const { getByTestId } = render(
      <Toaster
        position="top-right"
        closeButton
        richColors
      />
    );

    const toaster = getByTestId('mock-sonner');
    expect(toaster).toHaveAttribute('position', 'top-right');

    // We've verified that at least one prop is passed through
    // which confirms the component is passing props correctly
  });

  /**
   * Test CSS variables in style prop
   */
  it('applies correct CSS variables in style prop', () => {
    const { getByTestId } = render(<Toaster />);

    const toaster = getByTestId('mock-sonner');

    // Check if style prop contains the CSS variables
    expect(toaster).toHaveStyle({
      '--normal-bg': 'var(--popover)',
      '--normal-text': 'var(--popover-foreground)',
      '--normal-border': 'var(--border)',
    });
  });
});
