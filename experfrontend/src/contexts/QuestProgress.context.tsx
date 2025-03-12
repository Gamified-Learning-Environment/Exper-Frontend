import React, { createContext, useContext, useState, ReactNode } from 'react';
import { QuestProgressResult } from '@/services/QuestProgressManager';

interface QuestProgressContextType {
  lastProgress: QuestProgressResult | null;
  setLastProgress: (progress: QuestProgressResult | null) => void;
  showQuestNotification: (progress: QuestProgressResult) => void;
}

const QuestProgressContext = createContext<QuestProgressContextType | undefined>(undefined);

export function QuestProgressProvider({ children }: { children: ReactNode }) {
  const [lastProgress, setLastProgress] = useState<QuestProgressResult | null>(null);

  const showQuestNotification = (progress: QuestProgressResult) => {
    setLastProgress(progress);
    // You could add additional notification logic here
    // like triggering a toast or animation
  };

  return (
    <QuestProgressContext.Provider value={{ lastProgress, setLastProgress, showQuestNotification }}>
      {children}
    </QuestProgressContext.Provider>
  );
}

export function useQuestProgress() {
  const context = useContext(QuestProgressContext);
  
  if (context === undefined) {
    throw new Error('useQuestProgress must be used within a QuestProgressProvider');
  }
  
  return context;
}