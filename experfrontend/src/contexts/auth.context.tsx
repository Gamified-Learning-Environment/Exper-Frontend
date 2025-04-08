'use client'; // use client to import modules from the client folder, helps to avoid SSR issues

import { createContext, useContext, useState, useEffect } from 'react'; 
import { createUser, loginUser, logoutUser } from '@/lib/actions/user.actions'; // Import user actions

// User interface to define user data
interface User {
  _id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  imageUrl?: string; // Optional profile image URL
}

// Auth context type handles user login, registration, and logout
interface AuthContextType { 
  user: User | null; 
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>; 
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<void>; // Omit id from User type
  logout: () => void; 
  // isAuthenticated boolean to check user is authenticated
  isAuthenticated: boolean;
  //isLoading: boolean; // isLoading boolean to check if user data is being loaded
}

// Create AuthContext to manage user authentication
const AuthContext = createContext<AuthContextType | null>(null);

// AuthProvider component to wrap application with AuthContext
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verify session on mount and after login
  useEffect(() => {
    const verifySession = async () => {
      try {
        // Use environment variable or fallback to localhost
        const apiBaseUrl = process.env.NEXT_PUBLIC_USER_API_URL || 'http://localhost:8080/api';
        const response = await fetch(`${apiBaseUrl}/auth/verify`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
  
        if (!response.ok) {
          // Clear invalid session
          throw new Error('Session verification failed');
        }
  
        const { user } = await response.json();
        setUser(user);
        setIsAuthenticated(true);

        // log verified user data to console
        console.log('Verified user:', user);
      } catch (error) {
        console.error('Session verification failed:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false); // Set loading state to false after session verification
      }
    };

    // Only run on client side
    if (typeof window !== 'undefined') {
      verifySession();
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

export const useAuth = () => { // Custom hook to use AuthContext 
  const context = useContext(AuthContext); // Get context value
  // Check if context is null and throw error if used outside of AuthProvider
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};