import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useToast } from '../../hooks/useToast';

describe('useToast Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with empty toasts array', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toEqual([]);
  });

  it('should add a toast when showToast is called', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Test message', 'info');
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      message: 'Test message',
      type: 'info',
      id: expect.any(Number)
    });
  });

  it('should auto-remove toast after specified duration', async () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Test message', 'info', 1000);
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(result.current.toasts).toHaveLength(0);
    });
  });

  it('should not auto-remove toast when duration is 0', async () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Persistent message', 'info', 0);
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.toasts).toHaveLength(1);
  });

  it('should manually remove toast by id', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Test message', 'info', 0);
    });

    const toastId = result.current.toasts[0].id;

    act(() => {
      result.current.removeToast(toastId);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it('should show success toast', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.success('Success message');
    });

    expect(result.current.toasts[0]).toMatchObject({
      message: 'Success message',
      type: 'success'
    });
  });

  it('should show error toast', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.error('Error message');
    });

    expect(result.current.toasts[0]).toMatchObject({
      message: 'Error message',
      type: 'error'
    });
  });

  it('should show warning toast', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.warning('Warning message');
    });

    expect(result.current.toasts[0]).toMatchObject({
      message: 'Warning message',
      type: 'warning'
    });
  });

  it('should show info toast', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.info('Info message');
    });

    expect(result.current.toasts[0]).toMatchObject({
      message: 'Info message',
      type: 'info'
    });
  });

  it('should handle multiple toasts', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.success('First message');
      result.current.error('Second message');
      result.current.warning('Third message');
    });

    expect(result.current.toasts).toHaveLength(3);
    expect(result.current.toasts[0].message).toBe('First message');
    expect(result.current.toasts[1].message).toBe('Second message');
    expect(result.current.toasts[2].message).toBe('Third message');
  });

  it('should generate unique ids for each toast', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Message 1');
      result.current.showToast('Message 2');
      result.current.showToast('Message 3');
    });

    const ids = result.current.toasts.map(t => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(3);
  });

  it('should use default type of info when not specified', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Default type message');
    });

    expect(result.current.toasts[0].type).toBe('info');
  });

  it('should use default duration of 3000ms when not specified', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Default duration');
    });

    expect(result.current.toasts[0].duration).toBe(3000);
  });

  it('should allow custom duration', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.success('Custom duration', 5000);
    });

    expect(result.current.toasts[0].duration).toBe(5000);
  });
});