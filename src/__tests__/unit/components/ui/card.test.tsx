import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from '@/app/components/ui/card';

describe('Card Component', () => {
  it('renders a card with the correct classes', () => {
    render(<Card data-testid="card">Card Content</Card>);
    
    const card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('bg-card');
    expect(card).toHaveClass('text-card-foreground');
    expect(card).toHaveClass('rounded-xl');
    expect(card).toHaveClass('border');
    expect(card).toHaveClass('shadow-sm');
    expect(card).toHaveTextContent('Card Content');
  });

  it('applies additional className to Card', () => {
    render(<Card data-testid="card" className="custom-class">Card Content</Card>);
    
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('custom-class');
    expect(card).toHaveClass('bg-card'); // Still has the default classes
  });

  it('renders CardHeader with correct classes', () => {
    render(<CardHeader data-testid="card-header">Header Content</CardHeader>);
    
    const header = screen.getByTestId('card-header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveAttribute('data-slot', 'card-header');
    expect(header).toHaveTextContent('Header Content');
  });

  it('renders CardTitle with correct classes', () => {
    render(<CardTitle data-testid="card-title">Card Title</CardTitle>);
    
    const title = screen.getByTestId('card-title');
    expect(title).toBeInTheDocument();
    expect(title).toHaveAttribute('data-slot', 'card-title');
    expect(title).toHaveClass('font-semibold');
    expect(title).toHaveTextContent('Card Title');
  });

  it('renders CardDescription with correct classes', () => {
    render(<CardDescription data-testid="card-description">Card Description</CardDescription>);
    
    const description = screen.getByTestId('card-description');
    expect(description).toBeInTheDocument();
    expect(description).toHaveAttribute('data-slot', 'card-description');
    expect(description).toHaveClass('text-muted-foreground');
    expect(description).toHaveClass('text-sm');
    expect(description).toHaveTextContent('Card Description');
  });

  it('renders CardAction with correct classes', () => {
    render(<CardAction data-testid="card-action">Action Content</CardAction>);
    
    const action = screen.getByTestId('card-action');
    expect(action).toBeInTheDocument();
    expect(action).toHaveAttribute('data-slot', 'card-action');
    expect(action).toHaveClass('col-start-2');
    expect(action).toHaveClass('row-span-2');
    expect(action).toHaveTextContent('Action Content');
  });

  it('renders CardContent with correct classes', () => {
    render(<CardContent data-testid="card-content">Content</CardContent>);
    
    const content = screen.getByTestId('card-content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveAttribute('data-slot', 'card-content');
    expect(content).toHaveClass('px-6');
    expect(content).toHaveTextContent('Content');
  });

  it('renders CardFooter with correct classes', () => {
    render(<CardFooter data-testid="card-footer">Footer Content</CardFooter>);
    
    const footer = screen.getByTestId('card-footer');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveAttribute('data-slot', 'card-footer');
    expect(footer).toHaveClass('flex');
    expect(footer).toHaveClass('items-center');
    expect(footer).toHaveClass('px-6');
    expect(footer).toHaveTextContent('Footer Content');
  });

  it('renders a complete card with all subcomponents', () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
          <CardAction>
            <button>Action</button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
        </CardContent>
        <CardFooter>
          <p>Card Footer</p>
        </CardFooter>
      </Card>
    );
    
    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Description')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Card Content')).toBeInTheDocument();
    expect(screen.getByText('Card Footer')).toBeInTheDocument();
  });

  it('passes additional props to Card', () => {
    render(<Card data-testid="card" aria-label="Test Card">Card Content</Card>);
    
    const card = screen.getByTestId('card');
    expect(card).toHaveAttribute('aria-label', 'Test Card');
  });
});
