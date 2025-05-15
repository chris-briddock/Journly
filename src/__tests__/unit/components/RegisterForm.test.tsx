import { render, screen, waitFor } from '../../utils/test-utils';
import RegisterForm from '@/app/components/RegisterForm';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { UserEvent } from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Using the mocks from jest.setup.js

// Mock fetch
global.fetch = jest.fn();

describe('RegisterForm', () => {
  // Mock setup
  const mockSignIn = signIn as jest.Mock;
  const mockRouter = useRouter();
  const mockFetch = global.fetch as jest.Mock;

  // Test data
  const validName = 'Test User';
  const validEmail = 'test@example.com';
  const validPassword = 'password123';

  // Helper function to fill and submit the form
  const fillAndSubmitForm = async (
    user: UserEvent,
    name = validName,
    email = validEmail,
    password = validPassword
  ) => {
    await user.type(screen.getByLabelText(/name/i), name);
    await user.type(screen.getByLabelText(/email/i), email);
    await user.type(screen.getByLabelText(/password/i), password);

    // Get the submit button directly
    const submitButton = document.querySelector('button[type="submit"]');
    if (!submitButton) {
      throw new Error('Submit button not found');
    }
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

  it('renders the registration form with all required elements', () => {
    render(<RegisterForm />);

    // Check if form elements are rendered with correct attributes
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    // Verify elements are in the document
    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();

    // Verify input types for accessibility
    expect(nameInput).toHaveAttribute('placeholder', 'Enter your name');
    expect(emailInput).toHaveAttribute('placeholder', 'Enter your email');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('placeholder', 'Create a password');

    // Verify help text is present
    expect(screen.getByText(/never share your email/i)).toBeInTheDocument();
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();

    // Verify button is enabled
    expect(submitButton).toBeEnabled();
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

    const { user } = render(<RegisterForm />);

    // Fill and submit form
    await fillAndSubmitForm(user);

    // Check if loading state is shown
    expect(screen.getByText(/creating account/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();

    // Resolve the promise to complete the registration process
    resolvePromise();

    // Wait for the redirect to happen, which indicates the loading state is complete
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('submits the form with valid data', async () => {
    const { user } = render(<RegisterForm />);

    // Fill and submit form
    await fillAndSubmitForm(user);

    // Verify fetch was called with correct data
    expect(mockFetch).toHaveBeenCalledWith('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: validName,
        email: validEmail,
        password: validPassword,
      }),
    });

    // Verify signIn was called after successful registration
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        redirect: false,
        email: validEmail,
        password: validPassword,
      });
    });

    // Verify redirect after successful registration
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
      expect(mockRouter.refresh).toHaveBeenCalled();
    });
  });

  it('shows error message when registration fails', async () => {
    // Mock failed registration
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Email already exists' }),
    });

    const { user } = render(<RegisterForm />);

    // Fill and submit form
    await fillAndSubmitForm(user);

    // Check if error message is displayed
    const errorMessage = await screen.findByText('Email already exists');
    expect(errorMessage).toBeInTheDocument();

    // Verify error has the correct styling
    const errorContainer = errorMessage.closest('div');
    expect(errorContainer).toHaveClass('bg-destructive/10');
    expect(errorContainer).toHaveClass('text-destructive');

    // Verify signIn was not called
    expect(mockSignIn).not.toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('handles unexpected errors during registration', async () => {
    // Mock fetch to throw an error
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { user } = render(<RegisterForm />);

    // Fill and submit form
    await fillAndSubmitForm(user);

    // Check for error message
    const errorMessage = await screen.findByText('Network error');
    expect(errorMessage).toBeInTheDocument();

    // Verify signIn was not called
    expect(mockSignIn).not.toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
