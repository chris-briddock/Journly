import { render, screen } from '@/__tests__/utils/test-utils';
import PostCard from '@/app/components/PostCard';
import { formatDistanceToNow } from 'date-fns';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: {
    src: string;
    alt: string;
    className?: string;
    fill?: boolean;
    priority?: boolean;
    onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  }) => {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={props.src}
        alt={props.alt || ''}
        className={props.className}
        data-testid="featured-image"
        data-fill={props.fill ? "true" : "false"}
      />
    );
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

describe('PostCard Component', () => {
  const mockPost = {
    id: 'post-1',
    title: 'Test Post Title',
    excerpt: 'This is a test excerpt for the post card component.',
    featuredImage: 'https://example.com/image.jpg',
    readingTime: 5,
    publishedAt: new Date('2023-01-01'),
    createdAt: new Date('2022-12-31'),
    likeCount: 10,
    commentCount: 5,
    viewCount: 100,
    author: {
      id: 'author-1',
      name: 'Test Author',
      image: 'https://example.com/avatar.jpg',
    },
    categories: [
      { category: { id: 'cat-1', name: 'Technology' } },
      { category: { id: 'cat-2', name: 'Programming' } },
      { category: { id: 'cat-3', name: 'Web Development' } },
    ],
  };

  it('renders the post card with all information', () => {
    render(<PostCard post={mockPost} />);

    // Check title
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();

    // Check excerpt
    expect(screen.getByText('This is a test excerpt for the post card component.')).toBeInTheDocument();

    // Check featured image
    const featuredImage = screen.getByTestId('featured-image');
    expect(featuredImage).toBeInTheDocument();
    expect(featuredImage).toHaveAttribute('src', 'https://example.com/image.jpg');
    expect(featuredImage).toHaveAttribute('alt', 'Test Post Title');

    // Check categories (only first 2 should be visible)
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('Programming')).toBeInTheDocument();
    expect(screen.getByText('+1 more')).toBeInTheDocument();

    // Check author
    expect(screen.getByText('Test Author')).toBeInTheDocument();

    // Check reading time
    expect(screen.getByText('5 min read')).toBeInTheDocument();

    // Check stats
    expect(screen.getByText('10')).toBeInTheDocument(); // likes
    expect(screen.getByText('5')).toBeInTheDocument(); // comments
    expect(screen.getByText('100')).toBeInTheDocument(); // views
  });

  it('renders the post card without a featured image', () => {
    const postWithoutImage = {
      ...mockPost,
      featuredImage: null,
    };

    render(<PostCard post={postWithoutImage} />);

    // Check that the featured image is not rendered
    expect(screen.queryByTestId('featured-image')).not.toBeInTheDocument();

    // Check that other elements are still rendered
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
  });

  it('renders the post card without an excerpt', () => {
    const postWithoutExcerpt = {
      ...mockPost,
      excerpt: null,
    };

    render(<PostCard post={postWithoutExcerpt} />);

    // Check that the excerpt is not rendered
    expect(screen.queryByText('This is a test excerpt for the post card component.')).not.toBeInTheDocument();

    // Check that other elements are still rendered
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
  });

  it('renders the post card with fewer than 3 categories', () => {
    const postWithFewerCategories = {
      ...mockPost,
      categories: [
        { category: { id: 'cat-1', name: 'Technology' } },
      ],
    };

    render(<PostCard post={postWithFewerCategories} />);

    // Check that only one category is rendered
    expect(screen.getByText('Technology')).toBeInTheDocument();

    // Check that the "+X more" badge is not rendered
    expect(screen.queryByText(/\+\d+ more/)).not.toBeInTheDocument();
  });

  it('renders the post card with author initials when no image is provided', () => {
    const postWithoutAuthorImage = {
      ...mockPost,
      author: {
        ...mockPost.author,
        image: null,
      },
    };

    render(<PostCard post={postWithoutAuthorImage} />);

    // Check that the author initials are rendered
    expect(screen.getByText('TA')).toBeInTheDocument(); // Test Author -> TA
  });

  it('renders the post card with createdAt date when publishedAt is null', () => {
    const postWithoutPublishedDate = {
      ...mockPost,
      publishedAt: null,
    };

    render(<PostCard post={postWithoutPublishedDate} />);

    // Check that the date is rendered using createdAt
    const expectedDate = formatDistanceToNow(new Date(postWithoutPublishedDate.createdAt), { addSuffix: true });
    const dateElement = screen.getByText(expectedDate);
    expect(dateElement).toBeInTheDocument();
  });

  it('renders the correct links for post and author', () => {
    render(<PostCard post={mockPost} />);

    // Check post link
    const postLinks = screen.getAllByRole('link', { name: /Test Post Title/i });
    expect(postLinks[0]).toHaveAttribute('href', '/posts/post-1');

    // Check author link
    const authorLink = screen.getByRole('link', { name: /Test Author/i });
    expect(authorLink).toHaveAttribute('href', '/profile/author-1');

    // Check category links
    const technologyLink = screen.getByRole('link', { name: /Technology/i });
    expect(technologyLink).toHaveAttribute('href', '/posts?categoryId=cat-1');

    const programmingLink = screen.getByRole('link', { name: /Programming/i });
    expect(programmingLink).toHaveAttribute('href', '/posts?categoryId=cat-2');
  });
});
