import { render, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/use-debounce';
import { useState, useEffect } from 'react';

const TestComponent = ({ value, delay }: { value: any, delay: number }) => {
  const debouncedValue = useDebounce(value, delay);
  const [displayValue, setDisplayValue] = useState(debouncedValue);

  useEffect(() => {
    setDisplayValue(debouncedValue);
  }, [debouncedValue]);

  return <div data-testid="value">{displayValue}</div>;
};

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { getByTestId } = render(<TestComponent value="initial" delay={500} />);
    expect(getByTestId('value')).toHaveTextContent('initial');
  });

  it('updates value after debounce delay', () => {
    const { getByTestId, rerender } = render(<TestComponent value="initial" delay={500} />);

    rerender(<TestComponent value="updated" delay={500} />);

    expect(getByTestId('value')).toHaveTextContent('initial');

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(getByTestId('value')).toHaveTextContent('updated');
  });

  it('cancels previous timeout when value changes', () => {
    const { getByTestId, rerender } = render(<TestComponent value="first" delay={500} />);

    rerender(<TestComponent value="second" delay={500} />);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    rerender(<TestComponent value="third" delay={500} />);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(getByTestId('value')).toHaveTextContent('first');

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(getByTestId('value')).toHaveTextContent('third');
  });

  it('works with different delay values', () => {
    const { getByTestId, rerender } = render(<TestComponent value="initial" delay={1000} />);

    rerender(<TestComponent value="updated" delay={1000} />);

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(getByTestId('value')).toHaveTextContent('initial');

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(getByTestId('value')).toHaveTextContent('updated');
  });

  it('handles zero delay', () => {
    const { getByTestId, rerender } = render(<TestComponent value="initial" delay={0} />);

    rerender(<TestComponent value="updated" delay={0} />);

    expect(getByTestId('value')).toHaveTextContent('updated');
  });
});