import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from '@/app/components/ui/textarea';

describe('Textarea Component', () => {
  it('renders a textarea with default props', () => {
    render(<Textarea />);

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('data-slot', 'textarea');
  });

  it('renders a textarea with custom className', () => {
    render(<Textarea className="test-class" />);

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveClass('test-class');
  });

  it('passes additional props to the textarea', () => {
    render(<Textarea placeholder="Enter text" disabled />);

    const textarea = screen.getByPlaceholderText('Enter text');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toBeDisabled();
  });

  it('handles value changes', async () => {
    const handleChange = jest.fn();
    render(<Textarea onChange={handleChange} />);

    const textarea = screen.getByTestId('textarea');
    await userEvent.type(textarea, 'test');

    expect(handleChange).toHaveBeenCalledTimes(4); // Once for each character
  });

  it('handles focus and blur events', async () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();

    render(<Textarea onFocus={handleFocus} onBlur={handleBlur} />);

    const textarea = screen.getByTestId('textarea');
    await userEvent.click(textarea); // Focus
    await userEvent.tab(); // Blur

    expect(handleFocus).toHaveBeenCalledTimes(1);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('renders with aria-invalid attribute when specified', () => {
    render(<Textarea aria-invalid={true} />);

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(textarea).toHaveClass('aria-invalid:border-destructive');
  });

  it('renders with rows and cols attributes', () => {
    render(<Textarea rows={5} cols={40} />);

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveAttribute('rows', '5');
    expect(textarea).toHaveAttribute('cols', '40');
  });

  it('renders with default min-height class', () => {
    render(<Textarea />);

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveClass('min-h-16');
  });
});
