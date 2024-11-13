'use client';

// imports
import { createContext, useContext, useState, useEffect } from 'react';
import { createUser, loginUser } from '@/lib/actions/user.actions';

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  imageUrl?: string;
}

// Auth context type handles user login, registration, and logout
interface AuthContextType { 
  user: User | null; 
  login: (email: string, password: string) => Promise<void>; 
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<void>; // Omit id from User type
  logout: () => void; 
  // isAuthenticated boolean to check user is authenticated
  isAuthenticated: boolean;
}

// Create AuthContext to manage user authentication
const AuthContext = createContext<AuthContextType | null>(null);

// AuthProvider component to wrap application with AuthContext
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (email: string, password: string) => {
    try {
      const data = await loginUser(email, password);
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: Omit<User, 'id'> & { password: string }) => {
    try {
      const data = await createUser(userData);
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};