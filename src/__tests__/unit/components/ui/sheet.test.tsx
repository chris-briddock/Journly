/**
 * @jest-environment jsdom
 *
 * Unit tests for the Sheet component
 */

import { render, screen } from '@/__tests__/utils/test-utils';
import {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from '@/app/components/ui/sheet';

describe('Sheet Component', () => {
  /**
   * Test basic rendering
   */
  it('renders the Sheet component with all parts', async () => {
    const { user } = render(
      <Sheet>
        <SheetTrigger data-testid="sheet-trigger">Open Sheet</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Sheet Description</SheetDescription>
          </SheetHeader>
          <div>Sheet Content</div>
          <SheetFooter>
            <SheetClose data-testid="sheet-close">Close Sheet</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );

    // Check if trigger is rendered
    const trigger = screen.getByTestId('sheet-trigger');
    expect(trigger).toBeInTheDocument();

    // Open the sheet
    await user.click(trigger);

    // Check if content is rendered
    expect(screen.getByText('Sheet Title')).toBeInTheDocument();
    expect(screen.getByText('Sheet Description')).toBeInTheDocument();
    expect(screen.getByText('Sheet Content')).toBeInTheDocument();

    // Check if close button is rendered
    const closeButton = screen.getByTestId('sheet-close');
    expect(closeButton).toBeInTheDocument();

    // Close the sheet
    await user.click(closeButton);
  });

  /**
   * Test different side positions
   */
  it('renders with different side positions', async () => {
    const { user, rerender } = render(
      <Sheet>
        <SheetTrigger data-testid="sheet-trigger">Open Sheet</SheetTrigger>
        <SheetContent side="right">
          <div>Right Side Sheet</div>
        </SheetContent>
      </Sheet>
    );

    // Open the sheet
    await user.click(screen.getByTestId('sheet-trigger'));
    expect(screen.getByText('Right Side Sheet')).toBeInTheDocument();

    // Close using the X icon
    await user.click(screen.getByRole('button', { name: 'Close' }));

    // Test left side
    rerender(
      <Sheet>
        <SheetTrigger data-testid="sheet-trigger">Open Sheet</SheetTrigger>
        <SheetContent side="left">
          <div>Left Side Sheet</div>
        </SheetContent>
      </Sheet>
    );

    await user.click(screen.getByTestId('sheet-trigger'));
    expect(screen.getByText('Left Side Sheet')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close' }));

    // Test top side
    rerender(
      <Sheet>
        <SheetTrigger data-testid="sheet-trigger">Open Sheet</SheetTrigger>
        <SheetContent side="top">
          <div>Top Side Sheet</div>
        </SheetContent>
      </Sheet>
    );

    await user.click(screen.getByTestId('sheet-trigger'));
    expect(screen.getByText('Top Side Sheet')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close' }));

    // Test bottom side
    rerender(
      <Sheet>
        <SheetTrigger data-testid="sheet-trigger">Open Sheet</SheetTrigger>
        <SheetContent side="bottom">
          <div>Bottom Side Sheet</div>
        </SheetContent>
      </Sheet>
    );

    await user.click(screen.getByTestId('sheet-trigger'));
    expect(screen.getByText('Bottom Side Sheet')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close' }));
  });

  /**
   * Test custom class names
   */
  it('applies custom class names to components', () => {
    render(
      <Sheet>
        <SheetTrigger className="custom-trigger">Open Sheet</SheetTrigger>
        <SheetContent className="custom-content">
          <SheetHeader className="custom-header">
            <SheetTitle className="custom-title">Sheet Title</SheetTitle>
            <SheetDescription className="custom-description">Sheet Description</SheetDescription>
          </SheetHeader>
          <SheetFooter className="custom-footer">
            <SheetClose className="custom-close">Close Sheet</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );

    // Check if custom classes are applied
    expect(screen.getByText('Open Sheet')).toHaveClass('custom-trigger');
  });
});
