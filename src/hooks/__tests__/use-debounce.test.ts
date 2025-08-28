import { renderHook, act } from '@testing-library/react-hooks';
import { useDebounce } from '@/hooks/use-debounce'

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))
    expect(result.current).toBe('initial')
  })

  it('updates value after debounce delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    // Change the value
    rerender({ value: 'updated', delay: 500 })

    // Value should not change immediately
    expect(result.current).toBe('initial')

    // Fast-forward time by 500ms
    act(() => {
      jest.advanceTimersByTime(500)
    })

    // Value should now be updated
    expect(result.current).toBe('updated')
  })

  it('cancels previous timeout when value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
      { initialProps: { value: 'first', delay: 500 } }
    )

    // Change value
    rerender({ value: 'second', delay: 500 })

    // Advance time by 300ms (less than delay)
    act(() => {
      jest.advanceTimersByTime(300)
    })

    // Change value again before first debounce completes
    rerender({ value: 'third', delay: 500 })

    // Advance time by another 300ms
    act(() => {
      jest.advanceTimersByTime(300)
    })

    // Should still be first value since all timeouts were cancelled
    expect(result.current).toBe('first')

    // Advance to complete the final debounce
    act(() => {
      jest.advanceTimersByTime(200)
    })

    // Should now be the final value
    expect(result.current).toBe('third')
  })

  it('works with different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 1000 } }
    )

    rerender({ value: 'updated', delay: 1000 })

    // Advance by 500ms (less than delay)
    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(result.current).toBe('initial')

    // Advance by another 500ms to complete debounce
    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(result.current).toBe('updated')
  })

  it('handles zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 0 } }
    )

    rerender({ value: 'updated', delay: 0 })

    // Should update immediately with zero delay
    expect(result.current).toBe('updated')
  })
})
