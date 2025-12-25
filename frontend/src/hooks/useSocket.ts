import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { initializeSocket, disconnectSocket, getSocket } from '@/lib/socket';

export const useSocket = () => {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef<ReturnType<typeof getSocket>>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('token');
      if (token) {
        socketRef.current = initializeSocket(token, user.id);
      }
    }

    return () => {
      if (socketRef.current) {
        disconnectSocket();
      }
    };
  }, [isAuthenticated, user]);

  return socketRef.current;
};

