'use client';

// imports
import { createContext, useContext, useState, useEffect } from 'react';
import { createUser, loginUser, logoutUser } from '@/lib/actions/user.actions';

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
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>; 
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

  useEffect(() => {
    // Check for existing user data in local storage / session storage
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // Login function to authenticate user
  const login = async (email: string, password: string, rememberMe: boolean) => {
    try {
      const user = await loginUser(email, password, rememberMe);
      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  // Register function to create new user
  const register = async (userData: Omit<User, 'id'> & { password: string }) => {
    try {
      const data = await createUser(userData);
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      throw error;
    }
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