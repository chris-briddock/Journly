import { render, screen, waitFor } from '../../../utils/test-utils';
import { PasswordUpdateForm } from '@/app/components/dashboard/PasswordUpdateForm';
import { toast } from 'sonner';
import type { UserEvent } from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Using the mocks from jest.setup.js

// Mock fetch
global.fetch = jest.fn();

describe('PasswordUpdateForm', () => {
  // Mock setup
  const mockFetch = global.fetch as jest.Mock;
  const mockToastSuccess = toast.success as jest.Mock;
  const mockToastError = toast.error as jest.Mock;

  // Test data
  const validCurrentPassword = 'currentPassword123';
  const validNewPassword = 'newPassword123';
  const validConfirmPassword = 'newPassword123';
  const invalidPassword = 'short';

  // Helper function to fill and submit the form
  const fillAndSubmitForm = async (
    user: UserEvent,
    currentPassword = validCurrentPassword,
    newPassword = validNewPassword,
    confirmPassword = validConfirmPassword
  ) => {
    // Get inputs by their name attribute
    const inputs = screen.getAllByTestId('input');
    const currentPasswordInput = inputs.find(input => input.getAttribute('name') === 'currentPassword');
    const newPasswordInput = inputs.find(input => input.getAttribute('name') === 'newPassword');
    const confirmPasswordInput = inputs.find(input => input.getAttribute('name') === 'confirmPassword');

    if (!currentPasswordInput || !newPasswordInput || !confirmPasswordInput) {
      throw new Error('Could not find password inputs');
    }

    await user.type(currentPasswordInput, currentPassword);
    await user.type(newPasswordInput, newPassword);
    await user.type(confirmPasswordInput, confirmPassword);

    // Get the submit button directly
    const submitButton = screen.getByRole('button', { name: /update password$/i });
    await user.click(submitButton);
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup fetch mock with successful response by default
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  it('renders the password update form with all required elements', () => {
    render(<PasswordUpdateForm />);

    // Check if form elements are rendered with correct attributes
    const inputs = screen.getAllByTestId('input');
    const currentPasswordInput = inputs.find(input => input.getAttribute('name') === 'currentPassword');
    const newPasswordInput = inputs.find(input => input.getAttribute('name') === 'newPassword');
    const confirmPasswordInput = inputs.find(input => input.getAttribute('name') === 'confirmPassword');
    const submitButton = screen.getByRole('button', { name: /update password$/i });

    // Verify elements are in the document
    expect(currentPasswordInput).toBeInTheDocument();
    expect(newPasswordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();

    // Verify input types for security
    expect(currentPasswordInput).toHaveAttribute('type', 'password');
    expect(newPasswordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    // Verify help text is present
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();

    // Verify button is enabled
    expect(submitButton).toBeEnabled();
  });

  it('validates form inputs before submission', async () => {
    const { user } = render(<PasswordUpdateForm />);

    // Get inputs by their name attribute
    const inputs = screen.getAllByTestId('input');
    const currentPasswordInput = inputs.find(input => input.getAttribute('name') === 'currentPassword');
    const newPasswordInput = inputs.find(input => input.getAttribute('name') === 'newPassword');
    const confirmPasswordInput = inputs.find(input => input.getAttribute('name') === 'confirmPassword');

    if (!currentPasswordInput || !newPasswordInput || !confirmPasswordInput) {
      throw new Error('Could not find password inputs');
    }

    // Fill in invalid data
    await user.type(currentPasswordInput, validCurrentPassword);
    await user.type(newPasswordInput, invalidPassword);
    await user.tab(); // Trigger onBlur validation

    // Check for validation messages
    await waitFor(() => {
      const errorMessages = screen.getAllByText(/password must be at least 8 characters/i);
      expect(errorMessages.length).toBeGreaterThan(0);
    });

    // Fill in mismatched passwords
    await user.clear(newPasswordInput);
    await user.type(newPasswordInput, validNewPassword);
    await user.type(confirmPasswordInput, 'differentPassword');
    await user.tab(); // Trigger onBlur validation

    // Check for validation messages
    await waitFor(() => {
      const errorMessages = screen.getAllByText(/passwords do not match/i);
      expect(errorMessages.length).toBeGreaterThan(0);
    });

    // Verify fetch was not called
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('shows loading state during form submission', async () => {
    // Create a promise that we can resolve manually to control timing
    let resolvePromise: () => void = () => {};
    mockFetch.mockImplementation(() => new Promise(resolve => {
      resolvePromise = () => resolve({
        ok: true,
        json: async () => ({ success: true }),
      });
    }));

    const { user } = render(<PasswordUpdateForm />);

    // Fill and submit form
    await fillAndSubmitForm(user);

    // Check if loading state is shown
    expect(screen.getByText(/updating/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /updating/i })).toBeDisabled();

    // Resolve the promise to complete the update process
    resolvePromise();

    // Wait for the success toast to be called
    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('Password updated successfully');
    });
  });

  it('submits the form with valid data', async () => {
    const { user } = render(<PasswordUpdateForm />);

    // Fill and submit form
    await fillAndSubmitForm(user);

    // Verify fetch was called with correct data
    expect(mockFetch).toHaveBeenCalledWith('/api/user/password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPassword: validCurrentPassword,
        newPassword: validNewPassword,
        confirmPassword: validConfirmPassword,
      }),
    });

    // Verify success toast was shown
    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('Password updated successfully');
    });
  });

  it('shows error message when update fails', async () => {
    // Mock failed update
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Current password is incorrect' }),
    });

    const { user } = render(<PasswordUpdateForm />);

    // Fill and submit form
    await fillAndSubmitForm(user);

    // Check if error message is displayed
    const errorMessage = await screen.findByText('Current password is incorrect');
    expect(errorMessage).toBeInTheDocument();

    // Verify error has the correct styling
    const errorContainer = errorMessage.closest('div');
    expect(errorContainer).toHaveClass('bg-destructive/10');
    expect(errorContainer).toHaveClass('text-destructive');

    // Verify error toast was shown
    expect(mockToastError).toHaveBeenCalledWith('Failed to update password');
  });

  it('toggles password visibility when eye icons are clicked', async () => {
    const { user } = render(<PasswordUpdateForm />);

    // Get inputs by their name attribute
    const inputs = screen.getAllByTestId('input');
    const currentPasswordInput = inputs.find(input => input.getAttribute('name') === 'currentPassword');
    const newPasswordInput = inputs.find(input => input.getAttribute('name') === 'newPassword');
    const confirmPasswordInput = inputs.find(input => input.getAttribute('name') === 'confirmPassword');

    if (!currentPasswordInput || !newPasswordInput || !confirmPasswordInput) {
      throw new Error('Could not find password inputs');
    }

    // Check initial state - all passwords should be hidden
    expect(currentPasswordInput).toHaveAttribute('type', 'password');
    expect(newPasswordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    // Click on the eye icons to show passwords
    const eyeButtons = screen.getAllByRole('button', { name: /show password/i });
    await user.click(eyeButtons[0]); // Current password
    await user.click(eyeButtons[1]); // New password
    await user.click(eyeButtons[2]); // Confirm password

    // Check that passwords are now visible
    expect(currentPasswordInput).toHaveAttribute('type', 'text');
    expect(newPasswordInput).toHaveAttribute('type', 'text');
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');

    // Click again to hide passwords
    const hideButtons = screen.getAllByRole('button', { name: /hide password/i });
    await user.click(hideButtons[0]); // Current password
    await user.click(hideButtons[1]); // New password
    await user.click(hideButtons[2]); // Confirm password

    // Check that passwords are hidden again
    expect(currentPasswordInput).toHaveAttribute('type', 'password');
    expect(newPasswordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });
});
