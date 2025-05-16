/**
 * @jest-environment jsdom
 *
 * Unit tests for the Skeleton component
 */

import { render, screen } from '@/__tests__/utils/test-utils';
import { Skeleton } from '@/app/components/ui/skeleton';

describe('Skeleton Component', () => {
  /**
   * Test basic rendering
   */
  it('renders correctly with default props', () => {
    render(<Skeleton data-testid="skeleton" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('bg-accent');
    expect(skeleton).toHaveClass('animate-pulse');
    expect(skeleton).toHaveClass('rounded-md');
  });

  /**
   * Test with custom className
   */
  it('applies custom className', () => {
    render(<Skeleton data-testid="skeleton" className="custom-class" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('custom-class');
    // Should still have the default classes
    expect(skeleton).toHaveClass('bg-accent');
    expect(skeleton).toHaveClass('animate-pulse');
    expect(skeleton).toHaveClass('rounded-md');
  });

  /**
   * Test with custom props
   */
  it('passes additional props to the div element', () => {
    render(
      <Skeleton 
        data-testid="skeleton" 
        aria-label="Loading" 
        style={{ width: '100px', height: '20px' }}
      />
    );
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading');
    expect(skeleton).toHaveStyle({ width: '100px', height: '20px' });
  });

  /**
   * Test with children
   */
  it('renders with children', () => {
    render(
      <Skeleton data-testid="skeleton">
        <div data-testid="child">Child content</div>
      </Skeleton>
    );
    
    const skeleton = screen.getByTestId('skeleton');
    const child = screen.getByTestId('child');
    
    expect(skeleton).toBeInTheDocument();
    expect(child).toBeInTheDocument();
    expect(child).toHaveTextContent('Child content');
  });

  /**
   * Test data-slot attribute
   */
  it('has the correct data-slot attribute', () => {
    render(<Skeleton data-testid="skeleton" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveAttribute('data-slot', 'skeleton');
  });
});
