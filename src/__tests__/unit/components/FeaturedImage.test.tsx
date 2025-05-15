import React from 'react';
import { render, screen } from '@/__tests__/utils/test-utils';
import { FeaturedImage } from '@/app/components/FeaturedImage';

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
        data-testid="mock-image"
        data-fill={props.fill ? "true" : "false"}
        data-priority={props.priority ? "true" : "false"}
      />
    );
  },
}));

describe('FeaturedImage Component', () => {
  const mockSrc = 'https://example.com/image.jpg';
  const mockAlt = 'Test image';

  it('renders the image with default props', () => {
    render(<FeaturedImage src={mockSrc} alt={mockAlt} />);

    const image = screen.getByTestId('mock-image');

    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockSrc);
    expect(image).toHaveAttribute('alt', mockAlt);
    expect(image).toHaveAttribute('class', 'object-cover');
    expect(image).toHaveAttribute('data-priority', 'false');
  });

  it('renders the image with custom className', () => {
    const customClass = 'custom-image-class';
    render(<FeaturedImage src={mockSrc} alt={mockAlt} className={customClass} />);

    const image = screen.getByTestId('mock-image');

    expect(image).toHaveAttribute('class', customClass);
  });

  it('renders the image with priority set to true', () => {
    render(<FeaturedImage src={mockSrc} alt={mockAlt} priority={true} />);

    const image = screen.getByTestId('mock-image');

    expect(image).toHaveAttribute('data-priority', 'true');
  });

  it('handles image loading errors by setting a fallback image', () => {
    // Create a mock implementation of the Image component that captures the onError handler
    let capturedOnErrorHandler: ((e: React.SyntheticEvent<HTMLImageElement, Event>) => void) | undefined;

    // Override the mock for this specific test
    const ImageMock = jest.requireMock('next/image').default;
    const originalImplementation = ImageMock;

    jest.requireMock('next/image').default = (props: {
      src: string;
      alt: string;
      className?: string;
      fill?: boolean;
      priority?: boolean;
      onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
    }) => {
      // Capture the onError handler
      capturedOnErrorHandler = props.onError;
      return originalImplementation(props);
    };

    // Render the component
    render(<FeaturedImage src={mockSrc} alt={mockAlt} />);

    // Verify the image is rendered
    const image = screen.getByTestId('mock-image');
    expect(image).toBeInTheDocument();

    // Verify the onError handler was captured
    expect(capturedOnErrorHandler).toBeDefined();

    // Create a mock HTMLImageElement
    const mockTarget = document.createElement('img');
    mockTarget.src = mockSrc;

    // Create a synthetic event with the mock target
    const mockEvent = {
      target: mockTarget,
      currentTarget: mockTarget,
      nativeEvent: new Event('error'),
      bubbles: true,
      cancelable: true,
      defaultPrevented: false,
      eventPhase: 0,
      isTrusted: false,
      preventDefault: jest.fn(),
      isDefaultPrevented: jest.fn(() => false),
      stopPropagation: jest.fn(),
      isPropagationStopped: jest.fn(() => false),
      persist: jest.fn(),
      timeStamp: Date.now(),
      type: 'error'
    } as unknown as React.SyntheticEvent<HTMLImageElement, Event>;

    // Call the onError handler
    if (capturedOnErrorHandler) {
      capturedOnErrorHandler(mockEvent);
    }

    // Verify the src was changed to the fallback image
    expect(mockTarget.src).toBe('https://placehold.co/600x400?text=Image+Not+Found');

    // Restore the original mock implementation
    jest.requireMock('next/image').default = originalImplementation;
  });
});
