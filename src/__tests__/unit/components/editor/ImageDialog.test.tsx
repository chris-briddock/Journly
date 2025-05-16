import React, { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImageDialog } from '@/app/components/editor/ImageDialog';
import { Editor } from '@tiptap/react';
import '@testing-library/jest-dom';

// Define types for the Dialog components
interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

interface DialogContentProps {
  children: ReactNode;
  className?: string;
}

interface DialogChildProps {
  children: ReactNode;
}

// Mock the Dialog component
jest.mock('@/app/components/ui/dialog', () => ({
  Dialog: ({ open, children }: DialogProps) => (
    open ? <div data-testid="dialog">{children}</div> : null
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
}));

// Create a mock editor with the minimum required functionality
// We're using a type assertion with unknown to avoid TypeScript errors
// This is acceptable in tests when we're only using a small subset of the API
const mockEditor = {
  chain: jest.fn().mockReturnValue({
    focus: jest.fn().mockReturnValue({
      setImage: jest.fn().mockReturnValue({
        run: jest.fn(),
      }),
    }),
  }),
} as unknown as Editor;

describe('ImageDialog Component', () => {
  const mockOnOpenChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dialog when open is true', () => {
    render(
      <ImageDialog
        editor={mockEditor}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    // Check if dialog content is rendered
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Add Image');
    expect(screen.getByTestId('dialog-description')).toHaveTextContent('Insert an image by providing its URL.');

    // Check if form elements are rendered
    expect(screen.getByText('Image URL')).toBeInTheDocument();
    expect(screen.getByText('Alt Text (Optional)')).toBeInTheDocument();

    // Check if buttons are rendered
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add image/i })).toBeInTheDocument();
  });

  it('does not render the dialog when open is false', () => {
    render(
      <ImageDialog
        editor={mockEditor}
        open={false}
        onOpenChange={mockOnOpenChange}
      />
    );

    // Dialog should not be visible
    expect(screen.queryByText('Add Image')).not.toBeInTheDocument();
  });

  it('updates input values when typing', async () => {
    const user = userEvent.setup();
    render(
      <ImageDialog
        editor={mockEditor}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    // Get input fields
    const urlInput = screen.getByLabelText('Image URL');
    const altInput = screen.getByLabelText('Alt Text (Optional)');

    // Type in the inputs
    await user.type(urlInput, 'https://example.com/image.jpg');
    await user.type(altInput, 'Example image');

    // Check if values were updated
    expect(urlInput).toHaveValue('https://example.com/image.jpg');
    expect(altInput).toHaveValue('Example image');
  });

  it('shows error when submitting without URL', async () => {
    const user = userEvent.setup();
    render(
      <ImageDialog
        editor={mockEditor}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    // Submit without entering URL
    await user.click(screen.getByRole('button', { name: /add image/i }));

    // Check if error message is displayed
    expect(screen.getByText('Image URL is required')).toBeInTheDocument();
  });

  it('adds image when form is submitted with valid URL', async () => {
    const user = userEvent.setup();
    render(
      <ImageDialog
        editor={mockEditor}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    // Fill in the form
    await user.type(screen.getByLabelText('Image URL'), 'https://example.com/image.jpg');
    await user.type(screen.getByLabelText('Alt Text (Optional)'), 'Example image');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /add image/i }));

    // Check if image was added
    expect(mockEditor.chain).toHaveBeenCalled();
    const chainResult = mockEditor.chain();
    expect(chainResult.focus).toHaveBeenCalled();
    const focusResult = chainResult.focus();
    expect(focusResult.setImage).toHaveBeenCalledWith({
      src: 'https://example.com/image.jpg',
      alt: 'Example image',
    });

    // Check if dialog was closed
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('adds image without alt text when alt is not provided', async () => {
    const user = userEvent.setup();
    render(
      <ImageDialog
        editor={mockEditor}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    // Fill in only the URL
    await user.type(screen.getByLabelText('Image URL'), 'https://example.com/image.jpg');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /add image/i }));

    // Check if image was added with undefined alt
    expect(mockEditor.chain).toHaveBeenCalled();
    const chainResult = mockEditor.chain();
    expect(chainResult.focus).toHaveBeenCalled();
    const focusResult = chainResult.focus();
    expect(focusResult.setImage).toHaveBeenCalledWith({
      src: 'https://example.com/image.jpg',
      alt: undefined,
    });
  });

  it('shows error when editor is not available', async () => {
    const user = userEvent.setup();
    render(
      <ImageDialog
        editor={null}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    // Fill in the form
    await user.type(screen.getByLabelText('Image URL'), 'https://example.com/image.jpg');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /add image/i }));

    // Check if error message is displayed
    expect(screen.getByText('Editor not available')).toBeInTheDocument();
  });

  it('closes the dialog when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ImageDialog
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
