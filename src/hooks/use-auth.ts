'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { User, AuthState, AuthCredentials, RegisterData, ForgotPasswordData, ResetPasswordData, LoginResponse } from '@/types';

// Authentication context
interface AuthContextType extends AuthState {
  login: (credentials: AuthCredentials) => Promise<LoginResponse>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string; errors?: Record<string, string> }>;
  logout: () => Promise<void>;
  forgotPassword: (data: ForgotPasswordData) => Promise<{ success: boolean; message?: string; resetToken?: string }>;
  resetPassword: (data: ResetPasswordData) => Promise<{ success: boolean; message?: string }>;
  verifyAuth: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use authentication
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Authentication provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Set loading state
  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  // Set error state
  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error, isLoading: false }));
  }, []);

  // API call helper
  const apiCall = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Network error occurred');
    }
    
    return data;
  };

  // Login function
  const login = useCallback(async (credentials: AuthCredentials): Promise<LoginResponse> => {
    try {
      setLoading(true);
      clearError();
      
      const data = await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });

      if (data.success && data.user) {
        setState(prev => ({
          ...prev,
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        }));
        
        // Store token in localStorage for persistence
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }
      }
      
      return data;
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [setLoading, clearError, setError]);

  // Register function
  const register = useCallback(async (registerData: RegisterData) => {
    try {
      setLoading(true);
      clearError();
      
      const data = await apiCall('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(registerData)
      });
      
      setLoading(false);
      return data;
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [setLoading, clearError, setError]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await apiCall('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state and storage
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
      localStorage.removeItem('auth_token');
    }
  }, []);

  // Forgot password function
  const forgotPassword = useCallback(async (forgotData: ForgotPasswordData) => {
    try {
      setLoading(true);
      clearError();
      
      const data = await apiCall('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(forgotData)
      });
      
      setLoading(false);
      return data;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send reset email';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [setLoading, clearError, setError]);

  // Reset password function
  const resetPassword = useCallback(async (resetData: ResetPasswordData) => {
    try {
      setLoading(true);
      clearError();
      
      const data = await apiCall('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(resetData)
      });
      
      setLoading(false);
      return data;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to reset password';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [setLoading, clearError, setError]);

  // Verify authentication status
  const verifyAuth = useCallback(async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      const data = await apiCall('/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (data.success && data.user) {
        setState(prev => ({
          ...prev,
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        }));
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('auth_token');
        setLoading(false);
      }
    } catch (error) {
      // Token verification failed, clear it
      localStorage.removeItem('auth_token');
      setLoading(false);
    }
  }, [setLoading]);

  // Verify auth on mount and token changes
  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyAuth,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for form state management
export const useAuthForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const setErrorMessage = (message: string) => {
    setError(message);
    setSuccess(null);
    setIsLoading(false);
  };

  const setSuccessMessage = (message: string) => {
    setSuccess(message);
    setError(null);
    setIsLoading(false);
  };

  return {
    isLoading,
    error,
    success,
    setIsLoading,
    setErrorMessage,
    setSuccessMessage,
    clearMessages
  };
};