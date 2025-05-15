import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogPortal,
  DialogOverlay,
} from '@/app/components/ui/dialog';

// Mock Radix UI Dialog components to avoid DOM-related issues in tests
jest.mock('@radix-ui/react-dialog', () => {
  const Root = ({ children, open }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => (
    <div data-testid="dialog-root" data-state={open ? 'open' : 'closed'}>
      {children}
    </div>
  );

  const Trigger = ({ children, ...props }: React.ComponentProps<'button'>) => (
    <button data-testid="dialog-trigger" {...props}>
      {children}
    </button>
  );

  const Portal = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-portal">{children}</div>
  );

  const Overlay = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
    ({ children, className, ...props }, ref) => (
      <div ref={ref} data-testid="dialog-overlay" className={className} {...props}>
        {children}
      </div>
    )
  );
  Overlay.displayName = 'DialogOverlay';

  const Content = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
    ({ children, className, ...props }, ref) => (
      <div ref={ref} data-testid="dialog-content" className={className} {...props}>
        {children}
      </div>
    )
  );
  Content.displayName = 'DialogContent';

  const Close = ({ children, ...props }: React.ComponentProps<'button'>) => (
    <button data-testid="dialog-close" {...props}>
      {children}
    </button>
  );

  const Title = React.forwardRef<HTMLHeadingElement, React.ComponentProps<'h2'>>(
    ({ children, className, ...props }, ref) => (
      <h2 ref={ref} data-testid="dialog-title" className={className} {...props}>
        {children}
      </h2>
    )
  );
  Title.displayName = 'DialogTitle';

  const Description = React.forwardRef<HTMLParagraphElement, React.ComponentProps<'p'>>(
    ({ children, className, ...props }, ref) => (
      <p ref={ref} data-testid="dialog-description" className={className} {...props}>
        {children}
      </p>
    )
  );
  Description.displayName = 'DialogDescription';

  return {
    Root,
    Trigger,
    Portal,
    Overlay,
    Content,
    Close,
    Title,
    Description
  };
});

describe('Dialog Component', () => {
  it('renders Dialog with DialogTrigger', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
      </Dialog>
    );

    const trigger = screen.getByTestId('dialog-trigger');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent('Open Dialog');
  });

  it('renders DialogContent with children', () => {
    render(
      <Dialog open>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <div data-testid="dialog-child">Dialog Content</div>
        </DialogContent>
      </Dialog>
    );

    const content = screen.getByTestId('dialog-content');
    const child = screen.getByTestId('dialog-child');

    expect(content).toBeInTheDocument();
    expect(child).toBeInTheDocument();
    expect(child).toHaveTextContent('Dialog Content');
  });

  it('renders DialogHeader, DialogTitle, and DialogDescription', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog Description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    const header = screen.getByText('Dialog Title').closest('div');
    const title = screen.getByTestId('dialog-title');
    const description = screen.getByTestId('dialog-description');

    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('flex flex-col space-y-1.5');
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('Dialog Title');
    expect(title).toHaveClass('text-lg font-semibold');
    expect(description).toBeInTheDocument();
    expect(description).toHaveTextContent('Dialog Description');
    expect(description).toHaveClass('text-sm text-muted-foreground');
  });

  it('renders DialogFooter with children', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogFooter>
            <button data-testid="cancel-button">Cancel</button>
            <button data-testid="submit-button">Submit</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    const footer = screen.getByText('Cancel').closest('div');
    const cancelButton = screen.getByTestId('cancel-button');
    const submitButton = screen.getByTestId('submit-button');

    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass('flex flex-col-reverse sm:flex-row');
    expect(cancelButton).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it('renders DialogClose button', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogClose data-testid="custom-close-button">Close Dialog</DialogClose>
        </DialogContent>
      </Dialog>
    );

    // The DialogContent component adds its own close button, so we need to use a custom test ID
    const closeButton = screen.getByTestId('custom-close-button');
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveTextContent('Close Dialog');

    // Also verify the default close button exists
    const defaultCloseButton = screen.getAllByTestId('dialog-close')[0]; // Get the first one
    expect(defaultCloseButton).toBeInTheDocument();
  });

  it('applies custom className to all components', () => {
    render(
      <Dialog open>
        <DialogTrigger className="custom-trigger">Open Dialog</DialogTrigger>
        <DialogContent className="custom-content">
          <DialogHeader className="custom-header">
            <DialogTitle className="custom-title">Dialog Title</DialogTitle>
            <DialogDescription className="custom-description">Dialog Description</DialogDescription>
          </DialogHeader>
          <DialogFooter className="custom-footer">
            <button>Cancel</button>
            <button>Submit</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByTestId('dialog-trigger')).toHaveClass('custom-trigger');
    expect(screen.getByTestId('dialog-content')).toHaveClass('custom-content');
    expect(screen.getByText('Dialog Title').closest('div')).toHaveClass('custom-header');
    expect(screen.getByTestId('dialog-title')).toHaveClass('custom-title');
    expect(screen.getByTestId('dialog-description')).toHaveClass('custom-description');
    expect(screen.getByText('Cancel').closest('div')).toHaveClass('custom-footer');
  });

  it('renders DialogPortal correctly', () => {
    render(
      <Dialog open>
        <DialogPortal>
          <div data-testid="portal-content">Portal Content</div>
        </DialogPortal>
      </Dialog>
    );

    const portal = screen.getByTestId('dialog-portal');
    const content = screen.getByTestId('portal-content');

    expect(portal).toBeInTheDocument();
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent('Portal Content');
  });

  it('renders DialogOverlay correctly', () => {
    render(
      <Dialog open>
        <DialogPortal>
          <DialogOverlay className="custom-overlay" />
        </DialogPortal>
      </Dialog>
    );

    const overlay = screen.getByTestId('dialog-overlay');

    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass('custom-overlay');
  });
});
