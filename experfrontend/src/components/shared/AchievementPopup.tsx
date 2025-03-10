import { motion } from 'framer-motion';

interface AchievementPopupProps {
    achievement: {
      title: string;
      description: string;
      icon: string;
      xp_reward: number;
    };
    onClose: () => void;
  }

export default function AchievementPopup({ achievement, onClose }: AchievementPopupProps) {
    return (
        <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="fixed bottom-8 right-8 z-50 w-80 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-lg shadow-lg overflow-hidden"
            onClick={onClose}
            >
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative px-4 py-3 flex items-center space-x-4">
                <div className="flex-shrink-0 bg-white/90 h-12 w-12 rounded-full flex items-center justify-center">
                <span className="text-2xl">{achievement.icon}</span>
                </div>
                <div className="flex-1">
                <div className="flex items-center">
                    <svg className="w-4 h-4 text-white mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 15.2l-5.6 3.6 2.1-6.5L3 8.3l6.9-.1L12 2l2.1 6.2 6.9.1-5.5 4.1 2.1 6.5z" />
                    </svg>
                    <h3 className="text-white font-bold">Trophy Unlocked</h3>
                </div>
                <p className="text-white font-semibold">{achievement.title}</p>
                <p className="text-white/80 text-xs">{achievement.description}</p>
                <p className="text-white/80 text-xs mt-1">+{achievement.xp_reward} XP</p>
                </div>
            </div>
            <div className="h-1 w-full bg-white/30">
                <motion.div 
                className="h-full bg-white"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5 }}
                onAnimationComplete={onClose}
                />
            </div>
        </motion.div>
    );
}