'use client';

import { createContext, useContext, useState, useEffect } from 'react';

// Define the shape of your context
interface CustomizationContextType {
  theme: string;
  setTheme: (theme: string) => void;
  // Add other customization settings here
}

const CustomizationContext = createContext<CustomizationContextType | null>(null);

export function CustomizationProvider({ children }: { children: React.ReactNode }) {
  // Set default theme
  const [theme, setTheme] = useState('light');

  // Load saved theme from localStorage on client-side only
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      // Apply theme to document body or html element
      if (document.documentElement) {
        document.documentElement.setAttribute('data-theme', savedTheme);
      }
    }
  }, []);

  // Save theme changes to localStorage
  const updateTheme = (newTheme: string) => {
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
      if (document.documentElement) {
        document.documentElement.setAttribute('data-theme', newTheme);
      }
    }
  };

  return (
    <CustomizationContext.Provider value={{ theme, setTheme: updateTheme }}>
      {children}
    </CustomizationContext.Provider>
  );
}

export const useCustomization = () => {
  const context = useContext(CustomizationContext);
  if (!context) throw new Error('useCustomization must be used within CustomizationProvider');
  return context;
};