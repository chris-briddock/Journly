import { render, screen, waitFor } from '@/__tests__/utils/test-utils';
import PostForm from '@/app/components/PostForm';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
  })),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock the Editor component
jest.mock('@/app/components/Editor', () => ({
  __esModule: true,
  Editor: () => <div data-testid="mock-editor">Editor</div>,
}));

// Mock the MultiSelect component
jest.mock('@/app/components/MultiSelect', () => ({
  __esModule: true,
  MultiSelect: () => <div data-testid="mock-multi-select">MultiSelect</div>,
}));

// Mock Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: { src: string; alt: string; className?: string; width?: number; height?: number }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} data-testid="mock-image" />;
  },
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;
global.prompt = jest.fn().mockImplementation(() => 'https://example.com/new-image.jpg');

describe('PostForm', () => {
  // Test data
  const mockCategories = [
    { id: 'cat1', name: 'Technology' },
    { id: 'cat2', name: 'Health' },
    { id: 'cat3', name: 'Business' },
  ];

  const mockInitialData = {
    title: 'Test Post',
    content: '<p>This is a test post content</p>',
    excerpt: 'Test excerpt',
    featuredImage: 'https://example.com/image.jpg',
    status: 'draft',
    categoryIds: ['cat1'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with create post button for new post', () => {
    render(<PostForm categories={mockCategories} />);

    // Check basic form elements
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByTestId('mock-editor')).toBeInTheDocument();
    expect(screen.getByLabelText('Excerpt')).toBeInTheDocument();

    // Use getByText instead of getByLabelText for Featured Image
    const featuredImageLabel = screen.getByText('Featured Image');
    expect(featuredImageLabel).toBeInTheDocument();

    expect(screen.getByTestId('mock-multi-select')).toBeInTheDocument();

    // Check buttons
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Post' })).toBeInTheDocument();
  });

  it('renders the form with update post button for editing', () => {
    render(
      <PostForm
        categories={mockCategories}
        initialData={mockInitialData}
        isEditing={true}
      />
    );

    // Check edit mode button
    expect(screen.getByRole('button', { name: 'Update Post' })).toBeInTheDocument();
  });

  it('handles form submission for creating a new post', async () => {
    // Mock successful response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'new-post-id', title: 'Test Post' }),
    });

    const { user } = render(<PostForm categories={mockCategories} />);

    // Fill in the form
    await user.type(screen.getByLabelText('Title'), 'Test Post Title');
    await user.type(screen.getByLabelText('Excerpt'), 'Test excerpt for the post');

    // Submit the form
    await user.click(screen.getByRole('button', { name: 'Create Post' }));

    // Check if fetch was called with the right arguments
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/posts', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.any(String),
      }));
    });

    // Verify the body contains the form data
    const fetchCall = mockFetch.mock.calls[0];
    const requestBody = JSON.parse(fetchCall[1].body);
    expect(requestBody).toEqual(expect.objectContaining({
      title: 'Test Post Title',
      excerpt: 'Test excerpt for the post',
    }));
  });

  it('handles form submission for updating an existing post', async () => {
    // Mock successful response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'test-post-id', title: 'Updated Post' }),
    });

    const { user } = render(
      <PostForm
        categories={mockCategories}
        initialData={{...mockInitialData, id: 'test-post-id'}}
        isEditing={true}
      />
    );

    // Update the title
    await user.clear(screen.getByLabelText('Title'));
    await user.type(screen.getByLabelText('Title'), 'Updated Post Title');

    // Submit the form
    await user.click(screen.getByRole('button', { name: 'Update Post' }));

    // Check if fetch was called with the right arguments
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/posts/test-post-id', expect.objectContaining({
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.any(String),
      }));
    });

    // Verify the body contains the updated data
    const fetchCall = mockFetch.mock.calls[0];
    const requestBody = JSON.parse(fetchCall[1].body);
    expect(requestBody).toEqual(expect.objectContaining({
      title: 'Updated Post Title',
    }));
  });

  it('displays an error message when form submission fails', async () => {
    // Mock failed response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to create post' }),
    });

    const { user } = render(<PostForm categories={mockCategories} />);

    // Fill in the form
    await user.type(screen.getByLabelText('Title'), 'Test Post Title');

    // Submit the form
    await user.click(screen.getByRole('button', { name: 'Create Post' }));

    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to create post')).toBeInTheDocument();
    });
  });

  it('handles image upload button click', async () => {
    const { user } = render(<PostForm categories={mockCategories} />);

    // Click the image upload button
    await user.click(screen.getAllByRole('button')[0]); // The first button should be the image upload button

    // Check if prompt was called
    expect(global.prompt).toHaveBeenCalled();

    // Check if the image URL was updated in the form
    await waitFor(() => {
      const imagePreview = screen.getByAltText('Featured image preview');
      expect(imagePreview).toBeInTheDocument();
      expect(imagePreview).toHaveAttribute('src', 'https://example.com/new-image.jpg');
    });
  });
});
