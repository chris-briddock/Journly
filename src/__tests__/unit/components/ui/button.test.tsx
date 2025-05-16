import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/app/components/ui/button';

describe('Button Component', () => {
  it('renders a button with default props', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('h-9');
  });

  it('renders a button with custom variant', () => {
    render(<Button variant="destructive">Delete</Button>);
    
    const button = screen.getByRole('button', { name: 'Delete' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-destructive');
  });

  it('renders a button with custom size', () => {
    render(<Button size="sm">Small Button</Button>);
    
    const button = screen.getByRole('button', { name: 'Small Button' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('h-8');
  });

  it('renders a button with custom className', () => {
    render(<Button className="test-class">Custom Class</Button>);
    
    const button = screen.getByRole('button', { name: 'Custom Class' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('test-class');
  });

  it('renders as a child component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="https://example.com">Link Button</a>
      </Button>
    );
    
    const link = screen.getByRole('link', { name: 'Link Button' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveClass('bg-primary');
  });

  it('passes additional props to the button', () => {
    render(<Button disabled>Disabled Button</Button>);
    
    const button = screen.getByRole('button', { name: 'Disabled Button' });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    await userEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies the correct variant classes', () => {
    const { rerender } = render(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-background');
    
    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-secondary');
    
    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button')).toHaveClass('hover:bg-accent');
    
    rerender(<Button variant="link">Link</Button>);
    expect(screen.getByRole('button')).toHaveClass('text-primary');
  });

  it('applies the correct size classes', () => {
    const { rerender } = render(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-10');
    
    rerender(<Button size="icon">Icon</Button>);
    expect(screen.getByRole('button')).toHaveClass('size-9');
  });
});
