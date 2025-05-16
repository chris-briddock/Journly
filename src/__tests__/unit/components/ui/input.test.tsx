import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/app/components/ui/input';

describe('Input Component', () => {
  it('renders an input with default props', () => {
    render(<Input />);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('data-slot', 'input');
  });

  it('renders an input with custom type', () => {
    render(<Input type="password" />);

    const input = screen.getByTestId('input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'password');
  });

  it('renders an input with custom className', () => {
    render(<Input className="test-class" />);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('test-class');
  });

  it('passes additional props to the input', () => {
    render(<Input placeholder="Enter text" disabled />);

    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toBeDisabled();
  });

  it('handles value changes', async () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'test');

    expect(handleChange).toHaveBeenCalledTimes(4); // Once for each character
  });

  it('handles focus and blur events', async () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();

    render(<Input onFocus={handleFocus} onBlur={handleBlur} />);

    const input = screen.getByRole('textbox');
    await userEvent.click(input); // Focus
    await userEvent.tab(); // Blur

    expect(handleFocus).toHaveBeenCalledTimes(1);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('renders with aria-invalid attribute when specified', () => {
    render(<Input aria-invalid={true} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveClass('aria-invalid:border-destructive');
  });

  it('renders with different input types', () => {
    const { rerender } = render(<Input type="email" />);

    let input = screen.getByTestId('input');
    expect(input).toHaveAttribute('type', 'email');

    rerender(<Input type="number" />);
    input = screen.getByTestId('input');
    expect(input).toHaveAttribute('type', 'number');

    rerender(<Input type="date" />);
    input = screen.getByTestId('input');
    expect(input).toHaveAttribute('type', 'date');
  });
});
