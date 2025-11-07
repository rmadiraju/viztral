import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiService } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (feature: string) => boolean;
  getUserPersona: () => string | null;
  checkAuthStatus: () => Promise<void>;
}

interface User {
  username: string;
  persona: 'Developer' | 'Admin' | 'QA' | 'CTO' | 'Product Owner' | 'Architect';
  name: string;
  email?: string;
  avatar?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async (): Promise<void> => {
    try {
      const response = await apiService.getAuthStatus();
      if (response.authenticated && response.username && response.persona) {
        const persona = response.persona as User['persona'];
        setUser({
          username: response.username,
          persona: persona,
          name: response.username.charAt(0).toUpperCase() + response.username.slice(1).replace(/_/g, ' '),
        });
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.login(username, password);
      
      if (response.success && response.persona) {
        const persona = response.persona as User['persona'];
        setUser({
          username: response.username,
          persona: persona,
          name: response.username.charAt(0).toUpperCase() + response.username.slice(1).replace(/_/g, ' '),
        });
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const hasPermission = (feature: string): boolean => {
    if (!user) return false;
    
    // Map personas to features they can access
    const personaPermissions: Record<string, string[]> = {
      'Developer': ['development', 'deployment'],
      'Admin': ['product_idea', 'architecture_design', 'development', 'deployment', 'testing', 'production'],
      'QA': ['testing', 'deployment', 'production'],
      'CTO': ['product_idea', 'architecture_design', 'development', 'deployment', 'testing', 'production'],
      'Product Owner': ['product_idea', 'testing', 'production'],
      'Architect': ['architecture_design', 'development']
    };
    
    return personaPermissions[user.persona]?.includes(feature) || false;
  };

  const getUserPersona = (): string | null => {
    return user?.persona || null;
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    hasPermission,
    getUserPersona,
    checkAuthStatus
  };

  // Show loading state while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
