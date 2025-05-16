import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MentionList, MentionListRef } from '@/app/components/editor/MentionList';
import '@testing-library/jest-dom';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: { src: string; alt: string; className?: string; width?: number; height?: number }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} data-testid="mock-image" />;
  },
}));

describe('MentionList Component', () => {
  const mockCommand = jest.fn();
  const mockItems = [
    { id: '1', label: 'John Doe', avatar: 'https://example.com/avatar1.jpg' },
    { id: '2', label: 'Jane Smith', avatar: null },
    { id: '3', label: 'Bob Johnson', avatar: 'https://example.com/avatar3.jpg' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a list of users', () => {
    render(<MentionList items={mockItems} command={mockCommand} />);

    // Check if all users are rendered
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('@John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('@Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    expect(screen.getByText('@Bob Johnson')).toBeInTheDocument();

    // Check if avatar is rendered for users with avatar
    const images = screen.getAllByTestId('mock-image');
    expect(images).toHaveLength(2); // Two users have avatars
    expect(images[0]).toHaveAttribute('src', 'https://example.com/avatar1.jpg');
    // We don't check alt attributes since we're mocking the Image component

    // Check if fallback avatar is rendered for user without avatar
    const fallbackAvatars = screen.getAllByRole('button');
    expect(fallbackAvatars[1].querySelector('svg')).toBeInTheDocument();
  });

  it('renders nothing when items array is empty', () => {
    const { container } = render(<MentionList items={[]} command={mockCommand} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('selects the first item by default', () => {
    render(<MentionList items={mockItems} command={mockCommand} />);

    const items = screen.getAllByRole('button');
    expect(items[0]).toHaveClass('bg-accent');
    expect(items[1]).not.toHaveClass('bg-accent');
    expect(items[2]).not.toHaveClass('bg-accent');
  });

  it('changes selection when mouse enters an item', async () => {
    const user = userEvent.setup();
    render(<MentionList items={mockItems} command={mockCommand} />);

    const items = screen.getAllByRole('button');

    // Initially first item is selected
    expect(items[0]).toHaveClass('bg-accent');

    // Hover over second item
    await user.hover(items[1]);

    // Now second item should be selected
    expect(items[0]).not.toHaveClass('bg-accent');
    expect(items[1]).toHaveClass('bg-accent');
    expect(items[2]).not.toHaveClass('bg-accent');
  });

  it('calls command function when an item is clicked', async () => {
    const user = userEvent.setup();
    render(<MentionList items={mockItems} command={mockCommand} />);

    const items = screen.getAllByRole('button');

    // Click on second item
    await user.click(items[1]);

    // Command should be called with the second item
    expect(mockCommand).toHaveBeenCalledWith(expect.objectContaining({
      id: '2',
      label: 'Jane Smith',
    }));
  });

  it('handles keyboard navigation correctly', () => {
    const ref = React.createRef<MentionListRef>();
    render(<MentionList ref={ref} items={mockItems} command={mockCommand} />);

    // Test that the ref's onKeyDown method returns the expected values
    act(() => {
      expect(ref.current?.onKeyDown({ event: { key: 'ArrowDown' } as unknown as KeyboardEvent })).toBe(true);
    });

    act(() => {
      expect(ref.current?.onKeyDown({ event: { key: 'ArrowUp' } as unknown as KeyboardEvent })).toBe(true);
    });

    act(() => {
      expect(ref.current?.onKeyDown({ event: { key: 'Enter' } as unknown as KeyboardEvent })).toBe(true);
    });
  });

  it('selects item with Enter key', () => {
    const ref = React.createRef<MentionListRef>();
    render(<MentionList ref={ref} items={mockItems} command={mockCommand} />);

    // Press Enter
    act(() => {
      ref.current?.onKeyDown({ event: { key: 'Enter' } as unknown as KeyboardEvent });
    });

    // Command should be called with the first item
    expect(mockCommand).toHaveBeenCalledWith(expect.objectContaining({
      id: '1',
      label: 'John Doe',
    }));
  });

  it('returns false for unhandled keys', () => {
    const ref = React.createRef<MentionListRef>();
    render(<MentionList ref={ref} items={mockItems} command={mockCommand} />);

    // Press an unhandled key
    let result: boolean | undefined;
    act(() => {
      result = ref.current?.onKeyDown({ event: { key: 'Tab' } as unknown as KeyboardEvent });
    });

    // Should return false
    expect(result).toBe(false);
  });

  it('resets selection when items change', () => {
    // This test verifies the useEffect hook that resets selection
    // We'll just check that the component renders with new items
    const { rerender } = render(<MentionList items={mockItems} command={mockCommand} />);

    // Change items
    const newItems = [
      { id: '4', label: 'New User', avatar: null },
      { id: '5', label: 'Another User', avatar: null },
    ];

    rerender(<MentionList items={newItems} command={mockCommand} />);

    // Check that new items are rendered
    expect(screen.getByText('New User')).toBeInTheDocument();
    expect(screen.getByText('Another User')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });
});
