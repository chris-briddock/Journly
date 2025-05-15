import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';

// Mock Radix UI components to avoid DOM-related issues in tests
jest.mock('@radix-ui/react-select', () => {
  return {
    Root: ({ children }: { children: React.ReactNode }) => <div data-testid="select-root">{children}</div>,
    Trigger: ({ children, className, ...props }: React.ComponentProps<'button'> & { asChild?: boolean }) => (
      <button data-testid="select-trigger" className={className} {...props}>
        {children}
      </button>
    ),
    Value: ({ children, className, ...props }: React.ComponentProps<'span'> & { placeholder?: string }) => (
      <span data-testid="select-value" className={className} {...props}>
        {children || props.placeholder}
      </span>
    ),
    Icon: ({ children }: { children: React.ReactNode; asChild?: boolean }) => (
      <span data-testid="select-icon">{children}</span>
    ),
    Portal: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="select-portal">{children}</div>
    ),
    Content: ({
      children,
      className,
      ...props
    }: React.ComponentProps<'div'> & {
      position?: 'item-aligned' | 'popper';
      side?: 'top' | 'right' | 'bottom' | 'left';
      align?: 'start' | 'center' | 'end';
    }) => (
      <div data-testid="select-content" className={className} {...props}>
        {children}
      </div>
    ),
    Viewport: ({ children, className }: React.ComponentProps<'div'>) => (
      <div data-testid="select-viewport" className={className}>
        {children}
      </div>
    ),
    Item: ({ children, className, ...props }: React.ComponentProps<'div'> & { value: string }) => (
      <div data-testid="select-item" className={className} {...props}>
        {children}
      </div>
    ),
    ItemText: ({ children }: { children: React.ReactNode }) => (
      <span data-testid="select-item-text">{children}</span>
    ),
    ItemIndicator: ({ children }: { children: React.ReactNode }) => (
      <span data-testid="select-item-indicator">{children}</span>
    ),
    Group: ({ children, className, ...props }: React.ComponentProps<'div'>) => (
      <div data-testid="select-group" className={className} {...props}>
        {children}
      </div>
    ),
    Label: ({ children, className, ...props }: React.ComponentProps<'div'>) => (
      <div data-testid="select-label" className={className} {...props}>
        {children}
      </div>
    ),
    Separator: ({ className, ...props }: React.ComponentProps<'div'>) => (
      <div data-testid="select-separator" className={className} {...props} />
    ),
    ScrollUpButton: ({ className, ...props }: React.ComponentProps<'div'>) => (
      <div data-testid="select-scroll-up" className={className} {...props} />
    ),
    ScrollDownButton: ({ className, ...props }: React.ComponentProps<'div'>) => (
      <div data-testid="select-scroll-down" className={className} {...props} />
    ),
  };
});

describe('Select Component', () => {
  it('renders Select with SelectTrigger and SelectValue', () => {
    render(
      <Select defaultValue="default">
        <SelectTrigger data-testid="select-trigger">
          <SelectValue placeholder="Select an option" data-testid="select-value" />
        </SelectTrigger>
      </Select>
    );

    const trigger = screen.getByTestId('select-trigger');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('data-slot', 'select-trigger');
    expect(trigger).toHaveAttribute('data-size', 'default');
  });

  it('renders SelectTrigger with small size', () => {
    render(
      <Select defaultValue="default">
        <SelectTrigger size="sm" data-testid="select-trigger">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
      </Select>
    );

    const trigger = screen.getByTestId('select-trigger');
    expect(trigger).toHaveAttribute('data-size', 'sm');
  });

  it('renders SelectTrigger with custom className', () => {
    render(
      <Select defaultValue="default">
        <SelectTrigger className="custom-class" data-testid="select-trigger">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
      </Select>
    );

    const trigger = screen.getByTestId('select-trigger');
    expect(trigger).toHaveClass('custom-class');
  });

  it('renders SelectContent with default position', () => {
    render(
      <Select defaultValue="default" open>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent data-testid="select-content">
          <SelectItem value="default">Default</SelectItem>
        </SelectContent>
      </Select>
    );

    const content = screen.getByTestId('select-content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveAttribute('data-slot', 'select-content');
  });

  it('renders SelectContent with custom position', () => {
    render(
      <Select defaultValue="default">
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent position="item-aligned">
          <SelectItem value="default">Default</SelectItem>
        </SelectContent>
      </Select>
    );

    // With our mock, we can verify the component renders
    const content = screen.getByTestId('select-content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveAttribute('position', 'item-aligned');
  });

  it('renders SelectGroup with SelectLabel and SelectItems', () => {
    render(
      <Select defaultValue="default" open>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup data-testid="select-group">
            <SelectLabel data-testid="select-label">Group Label</SelectLabel>
            <SelectItem value="item1" data-testid="select-item-1">Item 1</SelectItem>
            <SelectItem value="item2" data-testid="select-item-2">Item 2</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    );

    const group = screen.getByTestId('select-group');
    const label = screen.getByTestId('select-label');
    const item1 = screen.getByTestId('select-item-1');

    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute('data-slot', 'select-group');
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('data-slot', 'select-label');
    expect(item1).toBeInTheDocument();
    expect(item1).toHaveAttribute('data-slot', 'select-item');
  });

  it('renders SelectSeparator', () => {
    render(
      <Select defaultValue="default" open>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="item1">Item 1</SelectItem>
          <SelectSeparator data-testid="select-separator" />
          <SelectItem value="item2">Item 2</SelectItem>
        </SelectContent>
      </Select>
    );

    const separator = screen.getByTestId('select-separator');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute('data-slot', 'select-separator');
  });

  it('renders SelectValue with placeholder', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" data-testid="select-value" />
        </SelectTrigger>
      </Select>
    );

    const value = screen.getByTestId('select-value');
    expect(value).toBeInTheDocument();
    expect(value).toHaveAttribute('data-slot', 'select-value');
  });

  it('applies custom className to all components', () => {
    render(
      <Select defaultValue="default" open>
        <SelectTrigger className="custom-trigger" data-testid="select-trigger">
          <SelectValue className="custom-value" placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent className="custom-content">
          <SelectGroup className="custom-group">
            <SelectLabel className="custom-label">Group Label</SelectLabel>
            <SelectItem className="custom-item" value="item1">Item 1</SelectItem>
            <SelectSeparator className="custom-separator" />
            <SelectItem value="item2">Item 2</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    );

    // Check that custom classes are applied
    expect(screen.getByTestId('select-trigger')).toHaveClass('custom-trigger');
  });
});
