import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { tokenManager } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { SocketContext } from './SocketContext';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Clean up existing socket first
    if (socketRef.current) {
      console.log('Cleaning up existing socket connection');
      socketRef.current.close();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }

    // Only connect if user is authenticated
    if (!isAuthenticated || !user) {
      console.log('User not authenticated, skipping socket connection');
      return;
    }

    try {
      const token = tokenManager.getAccessToken();
      
      if (!token) {
        console.log('No access token found, skipping socket connection');
        return;
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      const socketUrl = API_URL.replace('/api/v1', '');
      
      console.log('Initializing socket connection for user:', user._id);
      
      // All users connect to dashboard namespace for notifications
      const newSocket = io(`${socketUrl}/dashboard`, {
        auth: {
          token
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

      newSocket.on('connect', () => {
        console.log('Socket.io connected:', newSocket.id);
        setIsConnected(true);
        
        // Join dashboard room with user ID
        newSocket.emit('join-dashboard', { userId: user._id });
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket.io disconnected:', reason);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket.io connection error:', error.message);
        setIsConnected(false);
      });

      newSocket.on('reconnect_attempt', (attemptNumber) => {
        console.log(`Socket.io reconnection attempt ${attemptNumber}`);
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log(`Socket.io reconnected after ${attemptNumber} attempts`);
        // Re-join dashboard room after reconnection
        newSocket.emit('join-dashboard', { userId: user._id });
      });

      socketRef.current = newSocket;
      setSocket(newSocket);
    } catch (error) {
      console.error('Error initializing socket:', error);
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (socketRef.current) {
        console.log('Cleaning up socket connection on unmount');
        socketRef.current.close();
      }
    };
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};