import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/lib/hooks/use-debounce';

describe('useDebounce', () => {
  // Mock timers for testing debounce
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial value', 500));
    
    expect(result.current).toBe('initial value');
  });

  it('does not update the value before the delay has elapsed', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial value', delay: 500 } }
    );
    
    // Change the value
    rerender({ value: 'new value', delay: 500 });
    
    // Value should still be the initial value
    expect(result.current).toBe('initial value');
    
    // Advance time by 400ms (less than the 500ms delay)
    act(() => {
      jest.advanceTimersByTime(400);
    });
    
    // Value should still be the initial value
    expect(result.current).toBe('initial value');
  });

  it('updates the value after the delay has elapsed', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial value', delay: 500 } }
    );
    
    // Change the value
    rerender({ value: 'new value', delay: 500 });
    
    // Advance time by 500ms (equal to the delay)
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // Value should now be the new value
    expect(result.current).toBe('new value');
  });

  it('resets the timer when the value changes before the delay has elapsed', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial value', delay: 500 } }
    );
    
    // Change the value
    rerender({ value: 'intermediate value', delay: 500 });
    
    // Advance time by 300ms (less than the 500ms delay)
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    // Value should still be the initial value
    expect(result.current).toBe('initial value');
    
    // Change the value again
    rerender({ value: 'final value', delay: 500 });
    
    // Advance time by 300ms more (600ms total, but timer was reset)
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    // Value should still be the initial value
    expect(result.current).toBe('initial value');
    
    // Advance time by 200ms more (800ms total, 500ms since last change)
    act(() => {
      jest.advanceTimersByTime(200);
    });
    
    // Value should now be the final value
    expect(result.current).toBe('final value');
  });

  it('handles delay changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial value', delay: 500 } }
    );
    
    // Change the value and delay
    rerender({ value: 'new value', delay: 1000 });
    
    // Advance time by 600ms (more than the original 500ms delay)
    act(() => {
      jest.advanceTimersByTime(600);
    });
    
    // Value should still be the initial value because we increased the delay
    expect(result.current).toBe('initial value');
    
    // Advance time by 400ms more (1000ms total, equal to the new delay)
    act(() => {
      jest.advanceTimersByTime(400);
    });
    
    // Value should now be the new value
    expect(result.current).toBe('new value');
  });
});
