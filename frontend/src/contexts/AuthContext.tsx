import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, authApi } from '@/lib/api/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authApi.getMe();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            // Token is invalid or user not found
            authApi.logout();
            setUser(null);
          }
        } catch (error: any) {
          console.error('Failed to fetch user:', error);
          // Clear invalid token
          authApi.logout();
          setUser(null);
        }
      } else {
        // No token, ensure user is null
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    if (response.success && response.data) {
      setUser(response.data.user);
    } else {
      throw new Error('Login failed');
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    const response = await authApi.signup({ email, password, name });
    if (response.success && response.data) {
      setUser(response.data.user);
    } else {
      throw new Error('Signup failed');
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await authApi.getMe();
      if (response.success) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

