import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmbedDialog } from '@/app/components/editor/EmbedDialog';
import '@testing-library/jest-dom';

// Define interfaces for mock components
interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  id?: string;
}

interface SelectValueProps {
  placeholder: string;
}

interface SelectContentProps {
  children: React.ReactNode;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  'data-testid'?: string;
}

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogChildProps {
  children: React.ReactNode;
}

// Define a mock editor type for testing
interface MockEditorCommands {
  setYoutubeVideo: jest.Mock;
  setEmbed: jest.Mock;
}

interface MockEditor {
  commands: MockEditorCommands;
}

// Create a comment to explain our approach
// We're using @ts-expect-error in the tests because the mock doesn't fully implement the Editor interface
// This is acceptable in tests where we're only testing specific functionality

// Mock the Select component
jest.mock('@/app/components/ui/select', () => ({
  Select: ({ value, onValueChange, children }: SelectProps) => (
    <div data-testid="mock-select">
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        data-testid="select-type"
      >
        <option value="youtube">YouTube</option>
        <option value="twitter">Twitter</option>
        <option value="instagram">Instagram</option>
        <option value="generic">Generic Iframe</option>
      </select>
      {children}
    </div>
  ),
  SelectTrigger: ({ children, id }: SelectTriggerProps) => (
    <div data-testid="select-trigger" id={id}>{children}</div>
  ),
  SelectValue: ({ placeholder }: SelectValueProps) => (
    <div data-testid="select-value">{placeholder}</div>
  ),
  SelectContent: ({ children }: SelectContentProps) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({ value, children, 'data-testid': testId }: SelectItemProps) => (
    <div data-testid={testId || `select-item-${value}`} data-value={value}>{children}</div>
  ),
}));

// Mock the Dialog component
jest.mock('@/app/components/ui/dialog', () => ({
  Dialog: ({ open, children }: Omit<DialogProps, 'onOpenChange'> & { onOpenChange?: DialogProps['onOpenChange'] }) => {
    // We're not using onOpenChange in our mock implementation
    return open ? <div data-testid="dialog">{children}</div> : null;
  },
  DialogContent: ({ children, className }: DialogContentProps) => (
    <div data-testid="dialog-content" className={className}>{children}</div>
  ),
  DialogHeader: ({ children }: DialogChildProps) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: DialogChildProps) => (
    <div data-testid="dialog-title">{children}</div>
  ),
  DialogDescription: ({ children }: DialogChildProps) => (
    <div data-testid="dialog-description">{children}</div>
  ),
  DialogFooter: ({ children }: DialogChildProps) => (
    <div data-testid="dialog-footer">{children}</div>
  ),
}));

// Mock the Editor
const mockEditor: MockEditor = {
  commands: {
    setYoutubeVideo: jest.fn(),
    setEmbed: jest.fn(),
  },
};

describe('EmbedDialog Component', () => {
  const mockOnOpenChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dialog when open is true', () => {
    render(
      <EmbedDialog
        // @ts-expect-error - Mock editor doesn't fully implement Editor interface
        editor={mockEditor}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    // Check if dialog content is rendered
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Add Embed');
    expect(screen.getByTestId('dialog-description')).toHaveTextContent('Insert embedded content from external sources like YouTube, Twitter, etc.');

    // Check if form elements are rendered
    expect(screen.getByText('Embed Type')).toBeInTheDocument();
    expect(screen.getByText('URL')).toBeInTheDocument();

    // Check if buttons are rendered
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add embed/i })).toBeInTheDocument();
  });

  it('does not render the dialog when open is false', () => {
    render(
      <EmbedDialog
        // @ts-expect-error - Mock editor doesn't fully implement Editor interface
        editor={mockEditor}
        open={false}
        onOpenChange={mockOnOpenChange}
      />
    );

    // Dialog should not be visible
    expect(screen.queryByText('Add Embed')).not.toBeInTheDocument();
  });

  it('changes embed type when a different option is selected', async () => {
    // No need for userEvent here since we're using fireEvent directly
    render(
      <EmbedDialog
        // @ts-expect-error - Mock editor doesn't fully implement Editor interface
        editor={mockEditor}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    // Change select value to Twitter
    fireEvent.change(screen.getByTestId('select-type'), { target: { value: 'twitter' } });

    // Check if title input appears (only shown for Twitter, Instagram, and Generic)
    expect(screen.getByLabelText('Title (Optional)')).toBeInTheDocument();

    // Check if URL placeholder changes
    const urlInput = screen.getByLabelText('URL');
    expect(urlInput).toHaveAttribute('placeholder', 'https://twitter.com/user/status/...');
  });

  it('shows error when submitting without URL', async () => {
    const user = userEvent.setup();
    render(
      <EmbedDialog
        // @ts-expect-error - Mock editor doesn't fully implement Editor interface
        editor={mockEditor}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    // Submit without entering URL
    await user.click(screen.getByRole('button', { name: /add embed/i }));

    // Check if error message is displayed
    expect(screen.getByText('URL is required')).toBeInTheDocument();
  });

  it('shows error when submitting invalid YouTube URL', async () => {
    const user = userEvent.setup();
    render(
      <EmbedDialog
        // @ts-expect-error - Mock editor doesn't fully implement Editor interface
        editor={mockEditor}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    // Enter invalid YouTube URL
    await user.type(screen.getByLabelText('URL'), 'https://youtube.com/invalid');

    // Submit form
    await user.click(screen.getByRole('button', { name: /add embed/i }));

    // Check if error message is displayed
    expect(screen.getByText('Invalid YouTube URL')).toBeInTheDocument();
  });

  it('adds YouTube embed when valid YouTube URL is submitted', async () => {
    const user = userEvent.setup();
    render(
      <EmbedDialog
        // @ts-expect-error - Mock editor doesn't fully implement Editor interface
        editor={mockEditor}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    // Enter valid YouTube URL
    await user.type(screen.getByLabelText('URL'), 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');

    // Submit form
    await user.click(screen.getByRole('button', { name: /add embed/i }));

    // Check if YouTube embed command was called with correct parameters
    expect(mockEditor.commands.setYoutubeVideo).toHaveBeenCalledWith({
      src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      width: 640,
      height: 480,
    });

    // Check if dialog was closed
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('adds Twitter embed when valid Twitter URL is submitted', async () => {
    const user = userEvent.setup();
    render(
      <EmbedDialog
        // @ts-expect-error - Mock editor doesn't fully implement Editor interface
        editor={mockEditor}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    // Change select value to Twitter
    fireEvent.change(screen.getByTestId('select-type'), { target: { value: 'twitter' } });

    // Enter valid Twitter URL
    await user.type(screen.getByLabelText('URL'), 'https://twitter.com/user/status/123456789');

    // Enter title
    await user.type(screen.getByLabelText('Title (Optional)'), 'My Tweet');

    // Submit form
    await user.click(screen.getByRole('button', { name: /add embed/i }));

    // Check if Twitter embed command was called with correct parameters
    expect(mockEditor.commands.setEmbed).toHaveBeenCalledWith({
      src: 'https://twitter.com/user/status/123456789',
      type: 'twitter',
      title: 'My Tweet',
    });

    // Check if dialog was closed
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('adds Instagram embed when valid Instagram URL is submitted', async () => {
    const user = userEvent.setup();
    render(
      <EmbedDialog
        // @ts-expect-error - Mock editor doesn't fully implement Editor interface
        editor={mockEditor}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    // Change select value to Instagram
    fireEvent.change(screen.getByTestId('select-type'), { target: { value: 'instagram' } });

    // Enter valid Instagram URL
    await user.type(screen.getByLabelText('URL'), 'https://www.instagram.com/p/abcdef123/');

    // Submit form
    await user.click(screen.getByRole('button', { name: /add embed/i }));

    // Check if Instagram embed command was called with correct parameters
    expect(mockEditor.commands.setEmbed).toHaveBeenCalledWith({
      src: 'https://www.instagram.com/p/abcdef123/',
      type: 'instagram',
      title: 'Instagram post',
    });

    // Check if dialog was closed
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('closes the dialog when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <EmbedDialog
        // @ts-expect-error - Mock editor doesn't fully implement Editor interface
        editor={mockEditor}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    // Click cancel button
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    // Check if dialog was closed
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
