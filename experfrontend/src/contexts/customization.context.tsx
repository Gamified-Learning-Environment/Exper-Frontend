'use client';

import React, { createContext, useContext, useState } from 'react';

interface CustomizationContextType {
  lastUpdated: number;
  triggerRefresh: () => void;
}

const CustomizationContext = createContext<CustomizationContextType>({
  lastUpdated: Date.now(),
  triggerRefresh: () => {},
});

export const CustomizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  const triggerRefresh = () => {
    setLastUpdated(Date.now());
  };

  return (
    <CustomizationContext.Provider value={{ lastUpdated, triggerRefresh }}>
      {children}
    </CustomizationContext.Provider>
  );
};

export const useCustomization = () => useContext(CustomizationContext);