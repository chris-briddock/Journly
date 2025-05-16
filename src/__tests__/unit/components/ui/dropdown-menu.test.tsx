import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/app/components/ui/dropdown-menu';

// Mock Radix UI components to avoid DOM-related issues in tests
jest.mock('@radix-ui/react-dropdown-menu', () => {
  return {
    Root: ({ children, open }: { children: React.ReactNode; open?: boolean }) => (
      <div data-testid="dropdown-root" data-state={open ? 'open' : 'closed'}>
        {children}
      </div>
    ),
    Portal: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="dropdown-portal">{children}</div>
    ),
    Trigger: ({ children, className, ...props }: React.ComponentProps<'button'>) => (
      <button data-testid="dropdown-trigger" className={className} {...props}>
        {children}
      </button>
    ),
    Content: ({ children, className, ...props }: React.ComponentProps<'div'> & { sideOffset?: number }) => (
      <div data-testid="dropdown-content" className={className} {...props}>
        {children}
      </div>
    ),
    Group: ({ children, className, ...props }: React.ComponentProps<'div'>) => (
      <div data-testid="dropdown-group" className={className} {...props}>
        {children}
      </div>
    ),
    Item: ({ children, className, ...props }: React.ComponentProps<'div'>) => (
      <div data-testid="dropdown-item" className={className} {...props}>
        {children}
      </div>
    ),
    CheckboxItem: ({ children, className, checked, ...props }: React.ComponentProps<'div'> & { checked?: boolean }) => (
      <div data-testid="dropdown-checkbox-item" className={className} data-state={checked ? 'checked' : 'unchecked'} {...props}>
        {children}
      </div>
    ),
    RadioGroup: ({ children, className, ...props }: React.ComponentProps<'div'>) => (
      <div data-testid="dropdown-radio-group" className={className} {...props}>
        {children}
      </div>
    ),
    RadioItem: ({ children, className, ...props }: React.ComponentProps<'div'>) => (
      <div data-testid="dropdown-radio-item" className={className} {...props}>
        {children}
      </div>
    ),
    Label: ({ children, className, ...props }: React.ComponentProps<'div'>) => (
      <div data-testid="dropdown-label" className={className} {...props}>
        {children}
      </div>
    ),
    Separator: ({ className, ...props }: React.ComponentProps<'div'>) => (
      <div data-testid="dropdown-separator" className={className} {...props} />
    ),
    Sub: ({ children, ...props }: { children: React.ReactNode }) => (
      <div data-testid="dropdown-sub" {...props}>
        {children}
      </div>
    ),
    SubTrigger: ({ children, className, ...props }: React.ComponentProps<'div'>) => (
      <div data-testid="dropdown-sub-trigger" className={className} {...props}>
        {children}
      </div>
    ),
    SubContent: ({ children, className, ...props }: React.ComponentProps<'div'>) => (
      <div data-testid="dropdown-sub-content" className={className} {...props}>
        {children}
      </div>
    ),
    ItemIndicator: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="dropdown-item-indicator">{children}</div>
    ),
  };
});

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  CheckIcon: () => <div data-testid="check-icon" />,
  ChevronRightIcon: () => <div data-testid="chevron-right-icon" />,
  CircleIcon: () => <div data-testid="circle-icon" />,
}));

describe('DropdownMenu Component', () => {
  it('renders DropdownMenu with DropdownMenuTrigger', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
      </DropdownMenu>
    );

    const trigger = screen.getByTestId('dropdown-trigger');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent('Open Menu');
    expect(trigger).toHaveAttribute('data-slot', 'dropdown-menu-trigger');
  });

  it('renders DropdownMenuContent with children', () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <div data-testid="dropdown-child">Dropdown Content</div>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const content = screen.getByTestId('dropdown-content');
    const child = screen.getByTestId('dropdown-child');

    expect(content).toBeInTheDocument();
    expect(content).toHaveAttribute('data-slot', 'dropdown-menu-content');
    expect(child).toBeInTheDocument();
    expect(child).toHaveTextContent('Dropdown Content');
  });

  it('renders DropdownMenuGroup with DropdownMenuItems', () => {
    render(
      <DropdownMenu open>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const group = screen.getByTestId('dropdown-group');
    const items = screen.getAllByTestId('dropdown-item');

    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute('data-slot', 'dropdown-menu-group');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveAttribute('data-slot', 'dropdown-menu-item');
    expect(items[0]).toHaveTextContent('Item 1');
    expect(items[1]).toHaveTextContent('Item 2');
  });

  it('renders DropdownMenuLabel', () => {
    render(
      <DropdownMenu open>
        <DropdownMenuContent>
          <DropdownMenuLabel>Menu Label</DropdownMenuLabel>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const label = screen.getByTestId('dropdown-label');
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('data-slot', 'dropdown-menu-label');
    expect(label).toHaveTextContent('Menu Label');
  });

  it('renders DropdownMenuSeparator', () => {
    render(
      <DropdownMenu open>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const separator = screen.getByTestId('dropdown-separator');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute('data-slot', 'dropdown-menu-separator');
    expect(separator).toHaveClass('bg-border');
  });

  it('renders DropdownMenuShortcut', () => {
    render(
      <DropdownMenu open>
        <DropdownMenuContent>
          <DropdownMenuItem>
            Item with shortcut
            <DropdownMenuShortcut>⌘+S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const shortcut = screen.getByText('⌘+S');
    expect(shortcut).toBeInTheDocument();
    expect(shortcut).toHaveAttribute('data-slot', 'dropdown-menu-shortcut');
    expect(shortcut).toHaveClass('text-muted-foreground');
  });

  it('renders DropdownMenuCheckboxItem', () => {
    render(
      <DropdownMenu open>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>Checkbox Item</DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const checkboxItem = screen.getByTestId('dropdown-checkbox-item');
    expect(checkboxItem).toBeInTheDocument();
    expect(checkboxItem).toHaveAttribute('data-slot', 'dropdown-menu-checkbox-item');
    expect(checkboxItem).toHaveTextContent('Checkbox Item');
    expect(checkboxItem).toHaveAttribute('data-state', 'checked');
  });

  it('renders DropdownMenuRadioGroup with DropdownMenuRadioItems', () => {
    render(
      <DropdownMenu open>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value="option1">
            <DropdownMenuRadioItem value="option1">Option 1</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="option2">Option 2</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const radioGroup = screen.getByTestId('dropdown-radio-group');
    const radioItems = screen.getAllByTestId('dropdown-radio-item');

    expect(radioGroup).toBeInTheDocument();
    expect(radioGroup).toHaveAttribute('data-slot', 'dropdown-menu-radio-group');
    expect(radioItems).toHaveLength(2);
    expect(radioItems[0]).toHaveAttribute('data-slot', 'dropdown-menu-radio-item');
    expect(radioItems[0]).toHaveTextContent('Option 1');
    expect(radioItems[1]).toHaveTextContent('Option 2');
  });

  it('renders DropdownMenuSub with SubTrigger and SubContent', () => {
    render(
      <DropdownMenu open>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Sub Menu</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Sub Item</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const sub = screen.getByTestId('dropdown-sub');
    const subTrigger = screen.getByTestId('dropdown-sub-trigger');
    const subContent = screen.getByTestId('dropdown-sub-content');

    expect(sub).toBeInTheDocument();
    expect(sub).toHaveAttribute('data-slot', 'dropdown-menu-sub');
    expect(subTrigger).toBeInTheDocument();
    expect(subTrigger).toHaveAttribute('data-slot', 'dropdown-menu-sub-trigger');
    expect(subTrigger).toHaveTextContent('Sub Menu');
    expect(subContent).toBeInTheDocument();
    expect(subContent).toHaveAttribute('data-slot', 'dropdown-menu-sub-content');
  });

  it('applies custom className to all components', () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger className="custom-trigger">Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent className="custom-content">
          <DropdownMenuLabel className="custom-label">Menu Label</DropdownMenuLabel>
          <DropdownMenuSeparator className="custom-separator" />
          <DropdownMenuGroup className="custom-group">
            <DropdownMenuItem data-testid="custom-item" className="custom-item">Item</DropdownMenuItem>
            <DropdownMenuCheckboxItem className="custom-checkbox" checked>
              Checkbox Item
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="custom-sub-trigger">
              Sub Menu
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="custom-sub-content">
              <DropdownMenuItem>Sub Item</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    expect(screen.getByTestId('dropdown-trigger')).toHaveClass('custom-trigger');
    expect(screen.getByTestId('dropdown-content')).toHaveClass('custom-content');
    expect(screen.getByTestId('dropdown-label')).toHaveClass('custom-label');
    expect(screen.getByTestId('dropdown-separator')).toHaveClass('custom-separator');
    expect(screen.getByTestId('dropdown-group')).toHaveClass('custom-group');
    expect(screen.getByTestId('custom-item')).toHaveClass('custom-item');
    expect(screen.getByTestId('dropdown-checkbox-item')).toHaveClass('custom-checkbox');
    expect(screen.getByTestId('dropdown-sub-trigger')).toHaveClass('custom-sub-trigger');
    expect(screen.getByTestId('dropdown-sub-content')).toHaveClass('custom-sub-content');
  });
});
