// GamificationNotification component is used to show notifications for achievements, levels, streaks, and badges. It uses the GamificationContext to show notifications. The notifications are shown at the bottom right of the screen and are removed after 5 seconds.
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createContext, useContext, ReactNode } from 'react';

interface NotificationProps {
  message: string;
  icon: string;
  type: 'achievement' | 'level' | 'streak' | 'badge';
}

export const GamificationContext = createContext({
  showNotification: (notification: NotificationProps) => {},
});

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);
  
  const showNotification = (notification: NotificationProps) => {
    setNotifications(prev => [...prev, notification]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n !== notification));
    }, 5000);
  };
  
  return (
    <GamificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {notifications.map((notification, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, y: 20 }}
              className={`
                p-4 rounded-lg shadow-lg flex items-center gap-3 
                ${notification.type === 'achievement' ? 'bg-yellow-50 border-2 border-yellow-500' : ''} 
                ${notification.type === 'level' ? 'bg-purple-50 border-2 border-purple-500' : ''} 
                ${notification.type === 'streak' ? 'bg-orange-50 border-2 border-orange-500' : ''} 
                ${notification.type === 'badge' ? 'bg-blue-50 border-2 border-blue-500' : ''} 
              `}
            >
              <div className="text-2xl">{notification.icon}</div>
              <div className="flex-1">{notification.message}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </GamificationContext.Provider>
  );
}

export const useGamification = () => useContext(GamificationContext);