import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useSocket } from '../../hooks/useSocket';
import { SocketContext } from '../../contexts/SocketContext';

describe('useSocket Hook', () => {
  it('should return context value when used within SocketProvider', () => {
    const mockSocket = {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      connected: true,
    };

    const mockContextValue = {
      socket: mockSocket,
      isConnected: true,
    };

    const wrapper = ({ children }) => (
      <SocketContext.Provider value={mockContextValue}>
        {children}
      </SocketContext.Provider>
    );

    const { result } = renderHook(() => useSocket(), { wrapper });

    expect(result.current).toEqual(mockContextValue);
  });

  it('should throw error when used outside SocketProvider', () => {
    // Suppress console.error for this test
    const consoleError = console.error;
    console.error = vi.fn();

    expect(() => {
      renderHook(() => useSocket());
    }).toThrow('useSocket must be used within a SocketProvider');

    console.error = consoleError;
  });

  it('should have access to socket instance', () => {
    const mockSocket = {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      connected: true,
    };

    const mockContextValue = {
      socket: mockSocket,
      isConnected: true,
    };

    const wrapper = ({ children }) => (
      <SocketContext.Provider value={mockContextValue}>
        {children}
      </SocketContext.Provider>
    );

    const { result } = renderHook(() => useSocket(), { wrapper });

    expect(result.current.socket).toEqual(mockSocket);
    expect(result.current.socket.connected).toBe(true);
  });

  it('should have access to connection status', () => {
    const mockContextValue = {
      socket: null,
      isConnected: false,
    };

    const wrapper = ({ children }) => (
      <SocketContext.Provider value={mockContextValue}>
        {children}
      </SocketContext.Provider>
    );

    const { result } = renderHook(() => useSocket(), { wrapper });

    expect(result.current.isConnected).toBe(false);
  });
});