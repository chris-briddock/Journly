/**
 * @jest-environment jsdom
 *
 * Unit tests for the Switch component
 */

import { render, screen } from '@testing-library/react';
import { Switch } from '@/app/components/ui/switch';

// Mock the Radix UI Switch component
jest.mock('@radix-ui/react-switch', () => ({
  Root: ({
    className,
    children,
    ...props
  }: React.ComponentPropsWithoutRef<'button'> & {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    defaultChecked?: boolean;
  }) => (
    <button
      data-testid="switch-root"
      className={className}
      data-state={props.checked ? 'checked' : 'unchecked'}
      {...props}
    >
      {children}
    </button>
  ),
  Thumb: ({ className }: React.ComponentPropsWithoutRef<'span'>) => (
    <span data-testid="switch-thumb" className={className} />
  ),
}));

describe('Switch Component', () => {
  /**
   * Test basic rendering with default props
   */
  it('renders correctly with default props', () => {
    render(<Switch data-testid="switch-test" />);

    const switchRoot = screen.getByTestId('switch-test');
    const switchThumb = screen.getByTestId('switch-thumb');

    expect(switchRoot).toBeInTheDocument();
    expect(switchThumb).toBeInTheDocument();

    // Check if it has the default classes
    expect(switchRoot).toHaveClass('peer');
    expect(switchRoot).toHaveClass('inline-flex');
    expect(switchRoot).toHaveClass('rounded-full');

    // Check thumb classes
    expect(switchThumb).toHaveClass('pointer-events-none');
    expect(switchThumb).toHaveClass('rounded-full');
  });

  /**
   * Test with custom className
   */
  it('applies custom className', () => {
    render(<Switch className="custom-class" data-testid="switch-test" />);

    const switchRoot = screen.getByTestId('switch-test');
    expect(switchRoot).toHaveClass('custom-class');
    // Should still have the default classes
    expect(switchRoot).toHaveClass('peer');
    expect(switchRoot).toHaveClass('inline-flex');
  });

  /**
   * Test checked state
   */
  it('renders with checked state', () => {
    render(<Switch checked data-testid="switch-test" />);

    const switchRoot = screen.getByTestId('switch-test');
    expect(switchRoot).toHaveAttribute('data-state', 'checked');
  });

  /**
   * Test unchecked state
   */
  it('renders with unchecked state', () => {
    render(<Switch checked={false} data-testid="switch-test" />);

    const switchRoot = screen.getByTestId('switch-test');
    expect(switchRoot).toHaveAttribute('data-state', 'unchecked');
  });

  /**
   * Test disabled state
   */
  it('renders with disabled state', () => {
    render(<Switch disabled data-testid="switch-test" />);

    const switchRoot = screen.getByTestId('switch-test');
    expect(switchRoot).toBeDisabled();
  });

  /**
   * Test with additional props
   */
  it('passes additional props to the switch element', () => {
    render(
      <Switch
        data-testid="switch-test"
        aria-label="Toggle switch"
        id="test-switch"
      />
    );

    const switchRoot = screen.getByTestId('switch-test');
    expect(switchRoot).toHaveAttribute('aria-label', 'Toggle switch');
    expect(switchRoot).toHaveAttribute('id', 'test-switch');
  });

  /**
   * Test onChange callback
   */
  it('accepts onCheckedChange prop', () => {
    const handleChange = jest.fn();

    render(
      <Switch
        data-testid="switch-test"
        onCheckedChange={handleChange}
      />
    );

    // We're just verifying that the component renders without errors
    // when the onCheckedChange prop is provided
    const switchRoot = screen.getByTestId('switch-test');
    expect(switchRoot).toBeInTheDocument();
  });

  /**
   * Test with defaultChecked prop
   */
  it('accepts defaultChecked prop', () => {
    render(<Switch defaultChecked data-testid="switch-test" />);

    // We're just verifying that the component renders without errors
    // when the defaultChecked prop is provided
    const switchRoot = screen.getByTestId('switch-test');
    expect(switchRoot).toBeInTheDocument();
  });
});
