/**
 * @jest-environment jsdom
 *
 * Unit tests for the Separator component
 */

import { render, screen } from '@testing-library/react';
import { Separator } from '@/app/components/ui/separator';

// Mock the Radix UI Separator component
jest.mock('@radix-ui/react-separator', () => ({
  Root: ({ 
    className, 
    orientation, 
    decorative, 
    ...props 
  }: {
    className?: string;
    orientation?: 'horizontal' | 'vertical';
    decorative?: boolean;
  }) => (
    <div
      data-testid="separator"
      data-orientation={orientation}
      data-decorative={decorative}
      className={className}
      {...props}
    />
  ),
}));

describe('Separator Component', () => {
  /**
   * Test basic rendering with default props
   */
  it('renders correctly with default props', () => {
    render(<Separator data-testid="separator-test" />);
    
    const separator = screen.getByTestId('separator-test');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute('data-orientation', 'horizontal');
    expect(separator).toHaveAttribute('data-decorative', 'true');
    expect(separator).toHaveAttribute('data-slot', 'separator-root');
    
    // Check if it has the default classes
    expect(separator).toHaveClass('bg-border');
    expect(separator).toHaveClass('shrink-0');
  });

  /**
   * Test with vertical orientation
   */
  it('renders with vertical orientation', () => {
    render(<Separator orientation="vertical" data-testid="separator-test" />);
    
    const separator = screen.getByTestId('separator-test');
    expect(separator).toHaveAttribute('data-orientation', 'vertical');
  });

  /**
   * Test with non-decorative setting
   */
  it('renders with decorative set to false', () => {
    render(<Separator decorative={false} data-testid="separator-test" />);
    
    const separator = screen.getByTestId('separator-test');
    expect(separator).toHaveAttribute('data-decorative', 'false');
  });

  /**
   * Test with custom className
   */
  it('applies custom className', () => {
    render(<Separator className="custom-class" data-testid="separator-test" />);
    
    const separator = screen.getByTestId('separator-test');
    expect(separator).toHaveClass('custom-class');
    // Should still have the default classes
    expect(separator).toHaveClass('bg-border');
    expect(separator).toHaveClass('shrink-0');
  });

  /**
   * Test with additional props
   */
  it('passes additional props to the separator element', () => {
    render(
      <Separator 
        data-testid="separator-test" 
        aria-label="Section separator" 
        id="test-separator"
      />
    );
    
    const separator = screen.getByTestId('separator-test');
    expect(separator).toHaveAttribute('aria-label', 'Section separator');
    expect(separator).toHaveAttribute('id', 'test-separator');
  });

  /**
   * Test CSS classes based on orientation
   */
  it('applies correct CSS classes for horizontal orientation', () => {
    render(<Separator orientation="horizontal" data-testid="separator-test" />);
    
    const separator = screen.getByTestId('separator-test');
    expect(separator.className).toContain('data-[orientation=horizontal]:h-px');
    expect(separator.className).toContain('data-[orientation=horizontal]:w-full');
  });

  it('applies correct CSS classes for vertical orientation', () => {
    render(<Separator orientation="vertical" data-testid="separator-test" />);
    
    const separator = screen.getByTestId('separator-test');
    expect(separator.className).toContain('data-[orientation=vertical]:h-full');
    expect(separator.className).toContain('data-[orientation=vertical]:w-px');
  });
});
