import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/app/components/ui/badge';

describe('Badge Component', () => {
  it('renders a badge with default props', () => {
    render(<Badge>Status</Badge>);
    
    const badge = screen.getByText('Status');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-primary');
    expect(badge).toHaveAttribute('data-slot', 'badge');
  });

  it('renders a badge with custom variant', () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    
    const badge = screen.getByText('Secondary');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-secondary');
  });

  it('renders a badge with custom className', () => {
    render(<Badge className="test-class">Custom Class</Badge>);
    
    const badge = screen.getByText('Custom Class');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('test-class');
  });

  it('renders as a child component when asChild is true', () => {
    render(
      <Badge asChild>
        <a href="https://example.com">Link Badge</a>
      </Badge>
    );
    
    const link = screen.getByRole('link', { name: 'Link Badge' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveClass('bg-primary');
  });

  it('passes additional props to the badge', () => {
    render(<Badge id="test-id">Test ID</Badge>);
    
    const badge = screen.getByText('Test ID');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('id', 'test-id');
  });

  it('applies the correct variant classes', () => {
    const { rerender } = render(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText('Outline')).toHaveClass('text-foreground');
    
    rerender(<Badge variant="destructive">Destructive</Badge>);
    expect(screen.getByText('Destructive')).toHaveClass('bg-destructive');
    
    rerender(<Badge variant="success">Success</Badge>);
    expect(screen.getByText('Success')).toHaveClass('bg-green-100');
  });

  it('renders with an icon', () => {
    render(
      <Badge>
        <svg data-testid="test-icon" />
        With Icon
      </Badge>
    );
    
    const badge = screen.getByText('With Icon');
    const icon = screen.getByTestId('test-icon');
    
    expect(badge).toBeInTheDocument();
    expect(icon).toBeInTheDocument();
    expect(badge).toContainElement(icon);
  });
});
