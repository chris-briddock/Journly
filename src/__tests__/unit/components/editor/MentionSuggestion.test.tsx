import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MentionSuggestion, MentionSuggestionRef } from '@/app/components/editor/MentionSuggestion';
import '@testing-library/jest-dom';
import { act } from 'react';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: { src: string; alt: string; className?: string; width?: number; height?: number }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} data-testid="mock-image" />;
  },
}));

describe('MentionSuggestion Component', () => {
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
    render(<MentionSuggestion items={mockItems} command={mockCommand} />);

    // Check if all users are rendered
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();

    // Check if avatar is rendered for users with avatar
    const images = screen.getAllByTestId('mock-image');
    expect(images).toHaveLength(2); // Two users have avatars
    expect(images[0]).toHaveAttribute('src', 'https://example.com/avatar1.jpg');
    expect(images[0]).toHaveAttribute('alt', 'John Doe');
    expect(images[1]).toHaveAttribute('src', 'https://example.com/avatar3.jpg');
    expect(images[1]).toHaveAttribute('alt', 'Bob Johnson');

    // Check if fallback avatar is rendered for user without avatar
    const userIcons = screen.getAllByRole('button');
    expect(userIcons[1].querySelector('svg')).toBeInTheDocument();
  });

  it('renders nothing when items array is empty', () => {
    const { container } = render(<MentionSuggestion items={[]} command={mockCommand} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('selects the first item by default', () => {
    render(<MentionSuggestion items={mockItems} command={mockCommand} />);

    const items = screen.getAllByRole('button');
    expect(items[0]).toHaveClass('bg-accent');
    expect(items[1]).not.toHaveClass('bg-accent');
    expect(items[2]).not.toHaveClass('bg-accent');
  });

  it('calls command function when an item is clicked', async () => {
    const user = userEvent.setup();
    render(<MentionSuggestion items={mockItems} command={mockCommand} />);

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
    const ref = React.createRef<MentionSuggestionRef>();

    act(() => {
      render(<MentionSuggestion ref={ref} items={mockItems} command={mockCommand} />);
    });

    // Test that the ref's onKeyDown method returns the expected values
    act(() => {
      expect(ref.current?.onKeyDown({ event: { key: 'ArrowDown' } as KeyboardEvent })).toBe(true);
      expect(ref.current?.onKeyDown({ event: { key: 'ArrowUp' } as KeyboardEvent })).toBe(true);
      expect(ref.current?.onKeyDown({ event: { key: 'Enter' } as KeyboardEvent })).toBe(true);
    });
  });

  it('returns false for unhandled keys', () => {
    const ref = React.createRef<MentionSuggestionRef>();

    act(() => {
      render(<MentionSuggestion ref={ref} items={mockItems} command={mockCommand} />);
    });

    // Press an unhandled key
    act(() => {
      const result = ref.current?.onKeyDown({ event: { key: 'Tab' } as KeyboardEvent });
      expect(result).toBe(false);
    });
  });

  it('selects item with Enter key', () => {
    const ref = React.createRef<MentionSuggestionRef>();

    act(() => {
      render(<MentionSuggestion ref={ref} items={mockItems} command={mockCommand} />);
    });

    // Press Enter to select the first item (which is selected by default)
    act(() => {
      ref.current?.onKeyDown({ event: { key: 'Enter' } as KeyboardEvent });
    });

    // Command should be called with the first item
    expect(mockCommand).toHaveBeenCalledWith(expect.objectContaining({
      id: '1',
      label: 'John Doe',
    }));
  });

  it('navigates through items with arrow keys and selects with Enter', () => {
    const ref = React.createRef<MentionSuggestionRef>();

    act(() => {
      render(<MentionSuggestion ref={ref} items={mockItems} command={mockCommand} />);
    });

    // Navigate to the second item
    act(() => {
      ref.current?.onKeyDown({ event: { key: 'ArrowDown' } as KeyboardEvent });
    });

    // Press Enter to select the second item
    act(() => {
      ref.current?.onKeyDown({ event: { key: 'Enter' } as KeyboardEvent });
    });

    // Command should be called with the second item
    expect(mockCommand).toHaveBeenCalledWith(expect.objectContaining({
      id: '2',
      label: 'Jane Smith',
    }));
  });

  it('resets selection when items change', () => {
    const ref = React.createRef<MentionSuggestionRef>();
    const { rerender } = render(<MentionSuggestion ref={ref} items={mockItems} command={mockCommand} />);

    // Change items
    const newItems = [
      { id: '4', label: 'New User', avatar: null },
      { id: '5', label: 'Another User', avatar: null },
    ];

    act(() => {
      rerender(<MentionSuggestion ref={ref} items={newItems} command={mockCommand} />);
    });

    // Check that new items are rendered
    expect(screen.getByText('New User')).toBeInTheDocument();
    expect(screen.getByText('Another User')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();

    // First item of new list should be selected
    const newItemElements = screen.getAllByRole('button');
    expect(newItemElements[0]).toHaveClass('bg-accent');
  });
});
