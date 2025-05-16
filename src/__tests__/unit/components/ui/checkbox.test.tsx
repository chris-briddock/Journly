/**
 * @jest-environment jsdom
 *
 * Unit tests for the Checkbox component
 */

import { render, screen } from '@/__tests__/utils/test-utils';
import { Checkbox } from '@/app/components/ui/checkbox';

describe('Checkbox Component', () => {
  /**
   * Test basic rendering
   */
  it('renders correctly', () => {
    render(<Checkbox />);

    // Checkbox should be in the document
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();

    // Checkbox should not be checked by default
    expect(checkbox).not.toBeChecked();
  });

  /**
   * Test checked state
   */
  it('renders in checked state when defaultChecked is true', () => {
    render(<Checkbox defaultChecked />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  /**
   * Test disabled state
   */
  it('renders in disabled state when disabled is true', () => {
    render(<Checkbox disabled />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
  });

  /**
   * Test click interaction
   */
  it('toggles checked state when clicked', async () => {
    const { user } = render(<Checkbox />);

    const checkbox = screen.getByRole('checkbox');

    // Initially not checked
    expect(checkbox).not.toBeChecked();

    // Click the checkbox
    await user.click(checkbox);

    // Should now be checked
    expect(checkbox).toBeChecked();

    // Click again
    await user.click(checkbox);

    // Should be unchecked again
    expect(checkbox).not.toBeChecked();
  });

  /**
   * Test onChange callback
   */
  it('calls onCheckedChange when clicked', async () => {
    const handleCheckedChange = jest.fn();
    const { user } = render(<Checkbox onCheckedChange={handleCheckedChange} />);

    const checkbox = screen.getByRole('checkbox');

    // Click the checkbox
    await user.click(checkbox);

    // onCheckedChange should have been called
    expect(handleCheckedChange).toHaveBeenCalledTimes(1);
    expect(handleCheckedChange).toHaveBeenCalledWith(true);
  });

  /**
   * Test custom className
   */
  it('applies custom className', () => {
    render(<Checkbox className="test-class" />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveClass('test-class');
  });

  /**
   * Test with label using aria-label
   */
  it('renders with aria-label', () => {
    render(<Checkbox aria-label="Test Checkbox" />);

    const checkbox = screen.getByRole('checkbox', { name: 'Test Checkbox' });
    expect(checkbox).toBeInTheDocument();
  });

  /**
   * Test with form integration
   */
  it('works within a form', async () => {
    const handleSubmit = jest.fn((e) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      return formData.get('test-checkbox') === 'on';
    });

    const { user } = render(
      <form onSubmit={handleSubmit}>
        <Checkbox name="test-checkbox" id="test-checkbox" />
        <label htmlFor="test-checkbox">Accept terms</label>
        <button type="submit">Submit</button>
      </form>
    );

    // Click the checkbox
    await user.click(screen.getByLabelText('Accept terms'));

    // Submit the form
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    // Form submission handler should have been called
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });
});
