import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Toast from '../../components/Toast';

describe('Toast Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render toast with message', () => {
    const mockOnClose = vi.fn();
    render(<Toast message="Test message" onClose={mockOnClose} duration={0} />);
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should render success icon for success type', () => {
    const mockOnClose = vi.fn();
    const { container } = render(
      <Toast message="Success" type="success" onClose={mockOnClose} duration={0} />
    );
    
    const icon = container.querySelector('.bg-green-100');
    expect(icon).toBeInTheDocument();
  });

  it('should render error icon for error type', () => {
    const mockOnClose = vi.fn();
    const { container } = render(
      <Toast message="Error" type="error" onClose={mockOnClose} duration={0} />
    );
    
    const icon = container.querySelector('.bg-red-100');
    expect(icon).toBeInTheDocument();
  });

  it('should render warning icon for warning type', () => {
    const mockOnClose = vi.fn();
    const { container } = render(
      <Toast message="Warning" type="warning" onClose={mockOnClose} duration={0} />
    );
    
    const icon = container.querySelector('.bg-yellow-100');
    expect(icon).toBeInTheDocument();
  });

  it('should render info icon for info type', () => {
    const mockOnClose = vi.fn();
    const { container } = render(
      <Toast message="Info" type="info" onClose={mockOnClose} duration={0} />
    );
    
    const icon = container.querySelector('.bg-blue-100');
    expect(icon).toBeInTheDocument();
  });

  it('should default to info type when no type provided', () => {
    const mockOnClose = vi.fn();
    const { container } = render(
      <Toast message="Default" onClose={mockOnClose} duration={0} />
    );
    
    const icon = container.querySelector('.bg-blue-100');
    expect(icon).toBeInTheDocument();
  });

  it('should call onClose after duration', () => {
    const mockOnClose = vi.fn();
    render(<Toast message="Test" onClose={mockOnClose} duration={1000} />);
    
    expect(mockOnClose).not.toHaveBeenCalled();
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not auto-close when duration is 0', () => {
    const mockOnClose = vi.fn();
    render(<Toast message="Test" onClose={mockOnClose} duration={0} />);
    
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should use default duration of 3000ms', () => {
    const mockOnClose = vi.fn();
    render(<Toast message="Test" onClose={mockOnClose} />);
    
    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(mockOnClose).not.toHaveBeenCalled();
    
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should cleanup timer on unmount', () => {
    const mockOnClose = vi.fn();
    const { unmount } = render(<Toast message="Test" onClose={mockOnClose} duration={1000} />);
    
    unmount();
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should display correct progress bar color for each type', () => {
    const mockOnClose = vi.fn();
    
    // Success
    const { container: successContainer } = render(
      <Toast message="Success" type="success" onClose={mockOnClose} duration={0} />
    );
    expect(successContainer.querySelector('.bg-green-500')).toBeInTheDocument();
    
    // Error
    const { container: errorContainer } = render(
      <Toast message="Error" type="error" onClose={mockOnClose} duration={0} />
    );
    expect(errorContainer.querySelector('.bg-red-500')).toBeInTheDocument();
    
    // Warning
    const { container: warningContainer } = render(
      <Toast message="Warning" type="warning" onClose={mockOnClose} duration={0} />
    );
    expect(warningContainer.querySelector('.bg-yellow-500')).toBeInTheDocument();
    
    // Info
    const { container: infoContainer } = render(
      <Toast message="Info" type="info" onClose={mockOnClose} duration={0} />
    );
    expect(infoContainer.querySelector('.bg-blue-500')).toBeInTheDocument();
  });
});