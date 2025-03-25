import { motion } from 'framer-motion';

interface BadgePopupProps {
    badge?: {
      name?: string;
      description?: string;
      icon?: string;
      rarity?: string;
    };
    onClose: () => void;
  }

  export default function BadgePopup({ badge = {}, onClose }: BadgePopupProps) {

    // Safely access badge properties with defaults
    const name = badge?.name || "Badge";
    const description = badge?.description || "You earned a new badge!";
    const icon = badge?.icon || "🏅";
    const rarity = badge?.rarity || "common";

    // Get colour based on badge rarity
    const getBadgeColour = (rarity: string) => {
        switch ((rarity || "").toLowerCase()) {
            case 'common': return 'from-slate-400 to-slate-500';
            case 'uncommon': return 'from-green-400 to-green-600';
            case 'rare': return 'from-blue-400 to-blue-600';
            case 'epic': return 'from-purple-400 to-purple-600';
            case 'legendary': return 'from-yellow-400 to-amber-500';
            default: return 'from-blue-400 to-blue-600';
          }
    };

    return (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          className={`fixed bottom-24 right-8 z-50 w-80 bg-gradient-to-r ${getBadgeColour(rarity)} rounded-lg shadow-lg overflow-hidden`}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative px-4 py-3 flex items-center space-x-4">
            <div className="flex-shrink-0 bg-white/90 h-12 w-12 rounded-full flex items-center justify-center">
              <span className="text-2xl">{icon}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-white mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" />
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3.586l2.707 2.707a1 1 0 01-1.414 1.414l-3-3A1 1 0 019 10V6a1 1 0 011-1z" />
                </svg>
                <h3 className="text-white font-bold">Badge Unlocked</h3>
              </div>
              <p className="text-white font-semibold">{name}</p>
              <p className="text-white/80 text-xs">{description}</p>
              <p className="text-white/80 text-xs mt-1 italic">{rarity.charAt(0).toUpperCase() + rarity.slice(1)} Badge</p>
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