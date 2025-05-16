import React from 'react';
import { render, screen } from '@/__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { LinkDialog } from '@/app/components/editor/LinkDialog';
import { Editor } from '@tiptap/react';
import '@testing-library/jest-dom';

// Define types for the Dialog components
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

// Mock the Dialog component
jest.mock('@/app/components/ui/dialog', () => {
  return {
    Dialog: ({ open, onOpenChange, children }: DialogProps) => (
      open ? <div data-testid="dialog" onClick={() => onOpenChange && onOpenChange(false)}>{children}</div> : null
    ),
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
  };
});

// Define a type for the mock editor
interface MockEditor {
  chain: jest.Mock;
}

// Mock the Editor
const mockEditor: MockEditor = {
  chain: jest.fn().mockReturnValue({
    focus: jest.fn().mockReturnValue({
      extendMarkRange: jest.fn().mockReturnValue({
        setLink: jest.fn().mockReturnValue({
          run: jest.fn(),
        }),
        unsetLink: jest.fn().mockReturnValue({
          run: jest.fn(),
        }),
      }),
    }),
  }),
};

describe('LinkDialog Component', () => {
  const mockOnOpenChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dialog when open is true', () => {
    // Use a simplified approach to test just the rendering
    const { container } = render(
      <LinkDialog
        editor={mockEditor as unknown as Editor}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    // Check if dialog is rendered at all
    expect(container).toBeInTheDocument();

    // Check for basic elements that should be present
    expect(screen.getByText(/URL/i)).toBeInTheDocument();
    expect(screen.getByText(/Leave empty to remove an existing link/i)).toBeInTheDocument();

    // Check for buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('does not render the dialog when open is false', () => {
    render(
      <LinkDialog
        editor={mockEditor as unknown as Editor}
        open={false}
        onOpenChange={mockOnOpenChange}
      />
    );

    // Dialog should not be visible
    expect(screen.queryByText('Add Link')).not.toBeInTheDocument();
  });

  it('initializes with the provided initialUrl', () => {
    const initialUrl = 'https://example.com';
    render(
      <LinkDialog
        editor={mockEditor as unknown as Editor}
        open={true}
        onOpenChange={mockOnOpenChange}
        initialUrl={initialUrl}
      />
    );

    // Check if URL input has the initial value
    expect(screen.getByLabelText('URL')).toHaveValue(initialUrl);
  });

  it('updates URL input when typing', async () => {
    const user = userEvent.setup();
    render(
      <LinkDialog
        editor={mockEditor as unknown as Editor}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    // Get URL input
    const urlInput = screen.getByLabelText('URL');

    // Type in the input
    await user.type(urlInput, 'https://example.com');

    // Check if value was updated
    expect(urlInput).toHaveValue('https://example.com');
  });

  it('sets a link when form is submitted with URL', async () => {
    const user = userEvent.setup();
    render(
      <LinkDialog
        editor={mockEditor as unknown as Editor}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    // Fill in the URL
    await user.type(screen.getByLabelText('URL'), 'https://example.com');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /add link/i }));

    // Check if link was set
    expect(mockEditor.chain).toHaveBeenCalled();
    const chainResult = mockEditor.chain();
    expect(chainResult.focus).toHaveBeenCalled();
    const focusResult = chainResult.focus();
    expect(focusResult.extendMarkRange).toHaveBeenCalledWith('link');
    const extendResult = focusResult.extendMarkRange();
    expect(extendResult.setLink).toHaveBeenCalledWith({ href: 'https://example.com' });

    // Check if dialog was closed
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('unsets a link when form is submitted with empty URL', async () => {
    const user = userEvent.setup();
    render(
      <LinkDialog
        editor={mockEditor as unknown as Editor}
        open={true}
        onOpenChange={mockOnOpenChange}
        initialUrl="https://example.com"
      />
    );

    // Clear the URL
    await user.clear(screen.getByLabelText('URL'));

    // Submit the form
    await user.click(screen.getByRole('button', { name: /remove link/i }));

    // Check if link was unset
    expect(mockEditor.chain).toHaveBeenCalled();
    const chainResult = mockEditor.chain();
    expect(chainResult.focus).toHaveBeenCalled();
    const focusResult = chainResult.focus();
    expect(focusResult.extendMarkRange).toHaveBeenCalledWith('link');
    const extendResult = focusResult.extendMarkRange();
    expect(extendResult.unsetLink).toHaveBeenCalled();

    // Check if dialog was closed
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows error when editor is not available', async () => {
    const user = userEvent.setup();
    render(
      <LinkDialog
        editor={null}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    // Fill in the URL
    await user.type(screen.getByLabelText('URL'), 'https://example.com');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /add link/i }));

    // Check if error message is displayed
    expect(screen.getByText('Editor not available')).toBeInTheDocument();
  });

  it('closes the dialog when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <LinkDialog
        editor={mockEditor as unknown as Editor}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    // Click cancel button
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    // Check if dialog was closed
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('updates URL when initialUrl changes', async () => {
    const { rerender } = render(
      <LinkDialog
        editor={mockEditor as unknown as Editor}
        open={true}
        onOpenChange={mockOnOpenChange}
        initialUrl="https://example.com"
      />
    );

    // Check initial URL
    expect(screen.getByLabelText('URL')).toHaveValue('https://example.com');

    // Rerender with new initialUrl
    rerender(
      <LinkDialog
        editor={mockEditor as unknown as Editor}
        open={true}
        onOpenChange={mockOnOpenChange}
        initialUrl="https://newexample.com"
      />
    );

    // Check if URL was updated
    expect(screen.getByLabelText('URL')).toHaveValue('https://newexample.com');
  });
});
