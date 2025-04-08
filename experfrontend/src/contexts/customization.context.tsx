'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CustomizationContextType {
  lastUpdated: number | null;
  triggerRefresh: () => void;
}

// Initialize with null values for server-side safety
const CustomizationContext = createContext<CustomizationContextType>({
  lastUpdated: null,
  triggerRefresh: () => {},
});

export const CustomizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Safe initialization after component mounts (client-side only)
  useEffect(() => {
    setIsMounted(true);
    setLastUpdated(Date.now());
    return () => setIsMounted(false);
  }, []);

  const triggerRefresh = () => {
    if (isMounted) {
      setLastUpdated(Date.now());
    }
  };

  // Create a safe value object that doesn't change between server/client
  const contextValue = {
    lastUpdated,
    triggerRefresh
  };

  return (
    <CustomizationContext.Provider value={contextValue}>
      {children}
    </CustomizationContext.Provider>
  );
};

export const useCustomization = () => useContext(CustomizationContext);