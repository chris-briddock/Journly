/**
 * @jest-environment jsdom
 *
 * Unit tests for the CommentList component
 */

import { render, screen, waitFor } from '@/__tests__/utils/test-utils';
import { CommentList, CommentType } from '@/app/components/CommentList';
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

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

// Mock CommentForm component
jest.mock('@/app/components/CommentForm', () => {
  /**
   * Interface for CommentForm props
   */
  interface CommentFormProps {
    postId: string;
    parentId?: string;
    onCommentSubmitted?: () => void;
  }

  const MockCommentForm = ({ postId, parentId, onCommentSubmitted }: CommentFormProps) => (
    <div data-testid="mock-comment-form">
      <span>Post ID: {postId}</span>
      {parentId && <span>Parent ID: {parentId}</span>}
      <button onClick={() => onCommentSubmitted && onCommentSubmitted()}>
        Submit Comment
      </button>
    </div>
  );

  MockCommentForm.displayName = 'MockCommentForm';

  return {
    CommentForm: MockCommentForm
  };
});

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('CommentList Component', () => {
  // Test data setup
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

  const mockComments: CommentType[] = [
    {
      id: 'comment-1',
      content: 'This is a parent comment',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      postId: 'post-1',
      authorId: 'user-1',
      parentId: null,
      likeCount: 5,
      author: {
        id: 'user-1',
        name: 'Comment Author',
        image: 'https://example.com/avatar1.jpg',
      },
    },
    {
      id: 'comment-2',
      content: 'This is a reply to the first comment',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      postId: 'post-1',
      authorId: 'user-2',
      parentId: 'comment-1',
      likeCount: 2,
      author: {
        id: 'user-2',
        name: 'Reply Author',
        image: 'https://example.com/avatar2.jpg',
      },
    },
    {
      id: 'comment-3',
      content: 'This is another parent comment',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      postId: 'post-1',
      authorId: 'user-3',
      parentId: null,
      likeCount: 0,
      author: {
        id: 'user-3',
        name: 'Another Author',
        image: null,
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useSession as jest.Mock).mockReturnValue(mockSession);
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  /**
   * Basic rendering tests
   */
  it('renders the comment list with correct number of comments', () => {
    render(<CommentList postId="post-1" comments={mockComments} />);

    // Check if the comment count is displayed correctly
    expect(screen.getByText(`Comments (${mockComments.length})`)).toBeInTheDocument();

    // Check if all parent comments are rendered
    expect(screen.getByText('This is a parent comment')).toBeInTheDocument();
    expect(screen.getByText('This is another parent comment')).toBeInTheDocument();

    // Check if the reply is rendered
    expect(screen.getByText('This is a reply to the first comment')).toBeInTheDocument();
  });

  it('renders the CommentForm when user is authenticated', () => {
    render(<CommentList postId="post-1" comments={mockComments} />);

    // Check if the CommentForm is rendered
    expect(screen.getByTestId('mock-comment-form')).toBeInTheDocument();
  });

  it('renders a sign-in link when user is not authenticated', () => {
    (useSession as jest.Mock).mockReturnValue(mockEmptySession);

    render(<CommentList postId="post-1" comments={mockComments} />);

    // Check if sign-in link is rendered
    expect(screen.getByText('Sign in')).toBeInTheDocument();
    expect(screen.getByText('to leave a comment.')).toBeInTheDocument();
  });

  it('renders a message when there are no comments', () => {
    render(<CommentList postId="post-1" comments={[]} />);

    // Check if the empty state message is displayed
    expect(screen.getByText('No comments yet. Be the first to comment!')).toBeInTheDocument();
  });

  // Test getInitials function
  it('displays correct initials in avatar fallback', () => {
    render(<CommentList postId="post-1" comments={mockComments} />);

    // Check if the avatar fallback contains the correct initials
    const avatarFallbacks = screen.getAllByText('CA'); // Comment Author -> CA
    expect(avatarFallbacks.length).toBeGreaterThan(0);
  });

  // Test handling null name
  it('handles null author name correctly', () => {
    const commentsWithNullName = [
      {
        ...mockComments[0],
        author: {
          ...mockComments[0].author,
          name: null,
        },
      },
    ];

    render(<CommentList postId="post-1" comments={commentsWithNullName} />);

    // Check if "Anonymous" is displayed for null name
    expect(screen.getByText('Anonymous')).toBeInTheDocument();

    // Check if the avatar fallback contains "U" for null name
    const avatarFallbacks = screen.getAllByText('U');
    expect(avatarFallbacks.length).toBeGreaterThan(0);
  });

  it('calls onCommentAdded when a comment is submitted', async () => {
    const onCommentAdded = jest.fn();
    const { user } = render(
      <CommentList postId="post-1" comments={mockComments} onCommentAdded={onCommentAdded} />
    );

    // Find and click the submit button in the mock CommentForm
    const submitButton = screen.getByRole('button', { name: 'Submit Comment' });
    await user.click(submitButton);

    // Check if the callback was called
    expect(onCommentAdded).toHaveBeenCalled();
  });

  /**
   * Test edit functionality
   */
  it('allows editing a comment when user is the author', async () => {
    // Mock the session to match the author of the first comment
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: 'user-1', // Same as authorId of comment-1
          name: 'Comment Author',
        },
      },
      status: 'authenticated',
    });

    const { user } = render(<CommentList postId="post-1" comments={mockComments} />);

    // Find the dropdown menu for the first comment (only visible for author)
    const moreButton = screen.getAllByRole('button', { name: /comment actions/i })[0];
    await user.click(moreButton);

    // Click the edit button in the dropdown
    const editButton = screen.getByRole('menuitem', { name: /edit/i });
    await user.click(editButton);

    // Verify the textarea appears with the current comment content
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('This is a parent comment');

    // Change the content
    await user.clear(textarea);
    await user.type(textarea, 'Updated comment content');

    // Mock successful API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Comment updated successfully' }),
    });

    // Click save button
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    // Verify API was called correctly
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/comments/comment-1', expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ content: 'Updated comment content' }),
      }));
    });

    // Verify success toast was shown
    expect(toast.success).toHaveBeenCalledWith('Comment updated successfully');

    // Verify the updated content is displayed
    expect(screen.getByText('Updated comment content')).toBeInTheDocument();
  });
});