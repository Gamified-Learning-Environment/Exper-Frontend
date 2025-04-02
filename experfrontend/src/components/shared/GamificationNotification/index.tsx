// GamificationNotification component is used to show notifications for achievements, levels, streaks, and badges. It uses the GamificationContext to show notifications. The notifications are shown at the bottom right of the screen and are removed after 5 seconds.
'use client'; 

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createContext, useContext, ReactNode } from 'react';
import AchievementPopup from '../AchievementPopup';
import BadgePopup from '../Badges/BadgePopup';

// Notification props for different types of notifications
interface NotificationProps {
  message: string;
  icon: string;
  type: 'achievement' | 'level' | 'streak' | 'badge';
}

// Achievement popup props for displaying achievements
interface AchievementPopupProps {
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
}

interface BadgePopupProps {
  name: string;
  description: string;
  icon: string;
  rarity: string;
}

// Context for showing notifications and achievements
interface GamificationContextProps {
  showNotification: (notification: NotificationProps) => void;
  showAchievement: (achievement: AchievementPopupProps) => void;
  showBadge: (badge: BadgePopupProps) => void;
}

// Gamification context
export const GamificationContext = createContext<GamificationContextProps>({
  showNotification: () => {},
  showAchievement: () => {},
  showBadge: () => {},
});

// Gamification provider for showing notifications and achievements
export function GamificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);
  const [achievements, setAchievements] = useState<AchievementPopupProps[]>([]);
  const [badges, setBadges] = useState<BadgePopupProps[]>([]);
  
  // Handle normal notifications
  const showNotification = (notification: NotificationProps) => {
    setNotifications(prev => [...prev, notification]);
  };
  
  // Handle PlayStation-style achievement popups
  const showAchievement = (achievement: AchievementPopupProps) => {
    console.log('GamificationProvider: Showing achievement popup:', achievement);
    setAchievements(prev => [...prev, achievement]);
  };

  const showBadge = (badge: BadgePopupProps) => {
    console.log('GamificationProvider: Showing badge popup:', badge);
    setBadges(prev => [...prev, badge]);

    // Create alternative simple toast notification
    //showNotification({
      //message: `${badge.name} Badge Unlocked!`,
      //icon: badge.icon,
      //type: 'badge',
    //});
  }
  
  // Remove notifications after 5 seconds
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.slice(1));
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notifications]);
  
  return (
    <GamificationContext.Provider value={{ showNotification, showAchievement, showBadge }}>
      {children} 

      {/* Regular notifications */}
      <div className="fixed bottom-4 right-4 z-40 space-y-2">
        <AnimatePresence>
          {notifications.map((notification, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
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

      {/* Achievement popups */}
      <AnimatePresence>
        {achievements.map((achievement, index) => (
          <AchievementPopup
            key={index}
            achievement={achievement}
            onClose={() => setAchievements(prev => prev.filter((_, i) => i !== index))}
          />
        ))}
      </AnimatePresence>

      {/* Badge popups */}
      <AnimatePresence>
        {badges.map((badge, index) => (
          <BadgePopup
            key={`badge-${index}`}
            badge={{
              name: badge.name,
              description: badge.description,
              icon: badge.icon,
              rarity: badge.rarity
            }}
            onClose={() => setBadges(prev => prev.filter((_, i) => i !== index))}
          />
        ))}
      </AnimatePresence>
    </GamificationContext.Provider>
  );
}

export const useGamification = () => useContext(GamificationContext);