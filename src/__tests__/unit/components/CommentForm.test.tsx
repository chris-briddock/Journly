import { render, screen, waitFor } from '@/__tests__/utils/test-utils';
import { CommentForm } from '@/app/components/CommentForm';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('CommentForm Component', () => {
  const mockSession = {
    data: {
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://example.com/avatar.jpg',
      },
      expires: '2023-01-01',
    },
    status: 'authenticated',
  };

  const mockEmptySession = {
    data: null,
    status: 'unauthenticated',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSession as jest.Mock).mockReturnValue(mockSession);
  });

  it('renders the comment form when user is authenticated', () => {
    render(<CommentForm postId="post-1" />);

    // Check if form elements are rendered
    expect(screen.getByPlaceholderText('Write a comment...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Post Comment' })).toBeInTheDocument();
  });

  it('does not render the form when user is not authenticated', () => {
    (useSession as jest.Mock).mockReturnValue(mockEmptySession);

   render(<CommentForm postId="post-1" />);

    // Form should not be rendered
    expect(screen.queryByPlaceholderText('Write a comment...')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Post Comment' })).not.toBeInTheDocument();
  });

  it('renders a reply form when parentId is provided', () => {
    render(<CommentForm postId="post-1" parentId="comment-1" />);

    // Check if reply placeholder is used
    expect(screen.getByPlaceholderText('Write a reply...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Post Reply' })).toBeInTheDocument();
  });

  it('disables the submit button when the comment is empty', async () => {
    const { user } = render(<CommentForm postId="post-1" />);

    // Button should be disabled initially
    const submitButton = screen.getByRole('button', { name: 'Post Comment' });
    expect(submitButton).toBeDisabled();

    // Type something and then clear it
    await user.type(screen.getByPlaceholderText('Write a comment...'), 'Test comment');
    expect(submitButton).not.toBeDisabled();

    await user.clear(screen.getByPlaceholderText('Write a comment...'));
    expect(submitButton).toBeDisabled();
  });

  it('shows loading state during submission', async () => {
    // Mock a delayed response
    mockFetch.mockImplementationOnce(() => new Promise(resolve => {
      setTimeout(() => {
        resolve({
          ok: true,
          json: async () => ({ id: 'comment-1' }),
        });
      }, 100);
    }));

    const { user } = render(<CommentForm postId="post-1" />);

    // Type a comment
    await user.type(screen.getByPlaceholderText('Write a comment...'), 'Test comment');

    // Submit the form
    await user.click(screen.getByRole('button', { name: 'Post Comment' }));

    // Check loading state
    expect(screen.getByText('Posting Comment...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('submits the comment successfully', async () => {
    // Mock successful response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'comment-1' }),
    });

    const onCommentSubmitted = jest.fn();
    const { user } = render(
      <CommentForm postId="post-1" onCommentSubmitted={onCommentSubmitted} />
    );

    // Type a comment
    await user.type(screen.getByPlaceholderText('Write a comment...'), 'Test comment');

    // Submit the form
    await user.click(screen.getByRole('button', { name: 'Post Comment' }));

    // Check if fetch was called with the right arguments
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/comments', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.any(String),
      }));
    });

    // Verify the body contains the comment data
    const fetchCall = mockFetch.mock.calls[0];
    const requestBody = JSON.parse(fetchCall[1].body);
    expect(requestBody).toEqual({
      postId: 'post-1',
      content: 'Test comment',
      parentId: null,
    });

    // Check if success toast was shown
    expect(toast.success).toHaveBeenCalledWith('Comment added successfully');

    // Check if callback was called
    expect(onCommentSubmitted).toHaveBeenCalled();

    // Check if form was reset
    expect(screen.getByPlaceholderText('Write a comment...')).toHaveValue('');
  });

  it('submits a reply successfully', async () => {
    // Mock successful response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'reply-1' }),
    });

    const onCommentSubmitted = jest.fn();
    const { user } = render(
      <CommentForm postId="post-1" parentId="comment-1" onCommentSubmitted={onCommentSubmitted} />
    );

    // Type a reply
    await user.type(screen.getByPlaceholderText('Write a reply...'), 'Test reply');

    // Submit the form
    await user.click(screen.getByRole('button', { name: 'Post Reply' }));

    // Check if fetch was called with the right arguments
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/comments', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('Test reply'),
      }));
    });

    // Verify the body contains the reply data with parentId
    const fetchCall = mockFetch.mock.calls[0];
    const requestBody = JSON.parse(fetchCall[1].body);
    expect(requestBody).toEqual({
      postId: 'post-1',
      content: 'Test reply',
      parentId: 'comment-1',
    });

    // Check if success toast was shown
    expect(toast.success).toHaveBeenCalledWith('Reply added successfully');
  });

  it('handles error during submission', async () => {
    // Mock error response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to add comment' }),
    });

    const { user } = render(<CommentForm postId="post-1" />);

    // Type a comment
    await user.type(screen.getByPlaceholderText('Write a comment...'), 'Test comment');

    // Submit the form
    await user.click(screen.getByRole('button', { name: 'Post Comment' }));

    // Check if error toast was shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to add comment');
    });

    // Form should not be reset on error
    expect(screen.getByPlaceholderText('Write a comment...')).toHaveValue('Test comment');
  });
});
