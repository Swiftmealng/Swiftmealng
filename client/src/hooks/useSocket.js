import { useContext } from 'react';
import { SocketContext } from '../contexts/SocketContext';

/**
 * Custom hook to access Socket.io connection
 * Must be used within SocketProvider
 */
export const useSocket = () => {
  const context = useContext(SocketContext);
  
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  
  return context;
};