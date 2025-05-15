import { render, screen, waitFor } from '../../../utils/test-utils';
import { UserSettingsForm } from '@/app/components/dashboard/UserSettingsForm';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { UserEvent } from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Using the mocks from jest.setup.js

// Mock fetch
global.fetch = jest.fn();

describe('UserSettingsForm', () => {
  // Mock setup
  const mockFetch = global.fetch as jest.Mock;
  const mockToastSuccess = toast.success as jest.Mock;
  const mockToastError = toast.error as jest.Mock;
  const mockRouter = useRouter();

  // Test user data
  const testUser = {
    id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    image: 'https://example.com/image.jpg',
    bio: 'This is a test bio',
    location: 'Test City, Test Country',
  };

  // Helper function to fill and submit the form
  const fillAndSubmitForm = async (
    user: UserEvent,
    formData = {
      name: 'Updated Name',
      image: 'https://example.com/new-image.jpg',
      bio: 'Updated bio information',
      location: 'New City, New Country',
    }
  ) => {
    // Fill in the form fields
    await user.clear(screen.getByLabelText(/name/i));
    await user.type(screen.getByLabelText(/name/i), formData.name);

    await user.clear(screen.getByLabelText(/profile image url/i));
    await user.type(screen.getByLabelText(/profile image url/i), formData.image);

    await user.clear(screen.getByLabelText(/bio/i));
    await user.type(screen.getByLabelText(/bio/i), formData.bio);

    await user.clear(screen.getByLabelText(/location/i));
    await user.type(screen.getByLabelText(/location/i), formData.location);

    // Submit the form
    await user.click(screen.getByRole('button', { name: /save changes/i }));
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

  it('renders the form with user data', () => {
    render(<UserSettingsForm user={testUser} />);

    // Check if form elements are rendered with correct values
    expect(screen.getByLabelText(/name/i)).toHaveValue(testUser.name);
    expect(screen.getByLabelText(/profile image url/i)).toHaveValue(testUser.image);
    expect(screen.getByLabelText(/bio/i)).toHaveValue(testUser.bio);
    expect(screen.getByLabelText(/location/i)).toHaveValue(testUser.location);

    // Check if user info is displayed
    expect(screen.getByText(testUser.name)).toBeInTheDocument();
    expect(screen.getByText(testUser.email)).toBeInTheDocument();

    // Check if avatar fallback is rendered with correct initials
    const avatarFallback = screen.getByText('TU'); // Test User initials
    expect(avatarFallback).toBeInTheDocument();

    // Check if buttons are rendered
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('renders with fallback avatar when image is not provided', () => {
    const userWithoutImage = { ...testUser, image: null };
    render(<UserSettingsForm user={userWithoutImage} />);

    // Check if avatar fallback is rendered with correct initials
    const avatarFallback = screen.getByText('TU'); // Test User initials
    expect(avatarFallback).toBeInTheDocument();
  });

  it('handles form input changes', async () => {
    const { user } = render(<UserSettingsForm user={testUser} />);

    // Change name input
    await user.clear(screen.getByLabelText(/name/i));
    await user.type(screen.getByLabelText(/name/i), 'New Name');
    expect(screen.getByLabelText(/name/i)).toHaveValue('New Name');

    // Change image input
    await user.clear(screen.getByLabelText(/profile image url/i));
    await user.type(screen.getByLabelText(/profile image url/i), 'https://example.com/new.jpg');
    expect(screen.getByLabelText(/profile image url/i)).toHaveValue('https://example.com/new.jpg');

    // Change bio input
    await user.clear(screen.getByLabelText(/bio/i));
    await user.type(screen.getByLabelText(/bio/i), 'New bio');
    expect(screen.getByLabelText(/bio/i)).toHaveValue('New bio');

    // Change location input
    await user.clear(screen.getByLabelText(/location/i));
    await user.type(screen.getByLabelText(/location/i), 'New Location');
    expect(screen.getByLabelText(/location/i)).toHaveValue('New Location');
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

    const { user } = render(<UserSettingsForm user={testUser} />);

    // Fill and submit form
    await fillAndSubmitForm(user);

    // Check if loading state is shown
    expect(screen.getByText(/saving/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();

    // Resolve the promise to complete the update process
    resolvePromise();

    // Wait for the success toast to be called
    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('Profile updated successfully');
    });
  });

  it('submits the form with updated data', async () => {
    const { user } = render(<UserSettingsForm user={testUser} />);

    const updatedData = {
      name: 'Updated Name',
      image: 'https://example.com/new-image.jpg',
      bio: 'Updated bio information',
      location: 'New City, New Country',
    };

    // Fill and submit form
    await fillAndSubmitForm(user, updatedData);

    // Verify fetch was called with correct data
    expect(mockFetch).toHaveBeenCalledWith(`/api/users/${testUser.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });

    // Verify success toast was shown and router was refreshed
    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('Profile updated successfully');
      expect(mockRouter.refresh).toHaveBeenCalled();
    });
  });

  it('shows error message when update fails', async () => {
    // Mock failed update
    const errorMessage = 'Failed to update profile';
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: errorMessage }),
    });

    const { user } = render(<UserSettingsForm user={testUser} />);

    // Fill and submit form
    await fillAndSubmitForm(user);

    // Verify error toast was shown
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(errorMessage);
    });

    // Verify router was not refreshed
    expect(mockRouter.refresh).not.toHaveBeenCalled();
  });

  it('handles unexpected errors during update', async () => {
    // Mock fetch to throw an error
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { user } = render(<UserSettingsForm user={testUser} />);

    // Fill and submit form
    await fillAndSubmitForm(user);

    // Verify error toast was shown
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Network error');
    });

    // Verify router was not refreshed
    expect(mockRouter.refresh).not.toHaveBeenCalled();
  });

  it('navigates back when cancel button is clicked', async () => {
    const { user } = render(<UserSettingsForm user={testUser} />);

    // Click cancel button
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    // Verify router.back was called
    expect(mockRouter.back).toHaveBeenCalled();
  });
});
