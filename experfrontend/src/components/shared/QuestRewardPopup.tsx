import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { X, Award, Gift, Trophy, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuestRewardPopupProps {
  isOpen: boolean;
  onClose: () => void;
  quest: {
    title: string;
    rewards?: {
      xp: number;
      customization?: Array<{
        type: string;
        id: string;
        name: string;
        icon?: string;
      }>;
    }
  };
}

export function QuestRewardPopup({ isOpen, onClose, quest }: QuestRewardPopupProps) {
  const [showXP, setShowXP] = useState(false);
  const [showItems, setShowItems] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      // Trigger confetti when the popup opens
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Staggered animation of rewards
      const xpTimer = setTimeout(() => setShowXP(true), 600);
      const itemsTimer = setTimeout(() => setShowItems(true), 1200);
      
      return () => {
        clearTimeout(xpTimer);
        clearTimeout(itemsTimer);
      };
    } else {
      setShowXP(false);
      setShowItems(false);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
         <>
         <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           onClick={onClose}
           className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
         />
         
         <motion.div
           initial={{ opacity: 0, scale: 0.9, y: 20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.9, y: 20 }}
           className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                      bg-gradient-to-b from-purple-600 to-indigo-700 
                      rounded-xl p-8 shadow-2xl max-w-md w-full z-50 text-white"
         >
           <button 
             onClick={onClose}
             className="absolute top-4 right-4 text-white/80 hover:text-white"
             title="Close"
           >
             <X className="w-6 h-6" />
           </button>
           
           <div className="flex flex-col items-center text-center">
             <motion.div
               initial={{ rotate: 0, scale: 0.5 }}
               animate={{ rotate: 360, scale: 1 }}
               transition={{ duration: 0.7 }}
               className="bg-yellow-400 text-yellow-800 rounded-full p-6 mb-4 shadow-lg"
             >
               <Trophy className="w-12 h-12" />
             </motion.div>
             
             <h2 className="text-3xl font-bold mb-2">Quest Complete!</h2>
             <p className="text-white/80 mb-6">{quest.title}</p>
             
             <div className="w-full space-y-4">
               {quest.rewards?.xp && (
                 <motion.div 
                   initial={{ x: -20, opacity: 0 }}
                   animate={{ x: 0, opacity: 1 }}
                   transition={{ delay: 0.3 }}
                   className="bg-white/10 rounded-lg p-4 flex justify-between items-center backdrop-blur-sm"
                 >
                   <div className="flex items-center gap-3">
                     <div className="bg-yellow-500 text-white rounded-full p-2">
                       <Star className="w-6 h-6" fill="white" />
                     </div>
                     <div className="text-left">
                       <div className="text-sm text-white/70">Experience Points</div>
                       <div className="font-bold">{quest.rewards.xp} XP</div>
                     </div>
                   </div>
                   <div className="text-2xl">✨</div>
                 </motion.div>
               )}
               
               {quest.rewards?.customization && quest.rewards.customization.length > 0 && (
                 <div className="space-y-3">
                   <div className="text-sm text-white/70 text-left">Unlocked Items</div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {quest.rewards.customization.map((item, idx) => (
                       <motion.div
                         key={item.id}
                         initial={{ y: 20, opacity: 0 }}
                         animate={{ y: 0, opacity: 1 }}
                         transition={{ delay: 0.5 + idx * 0.1 }}
                         className="bg-white/10 rounded-lg p-3 flex items-center gap-3 backdrop-blur-sm"
                       >
                         <div className="bg-indigo-500 text-white rounded-full p-2">
                           <Gift className="w-5 h-5" />
                         </div>
                         <div className="text-left">
                           <div className="font-medium">{item.name}</div>
                           <div className="text-xs text-white/70">{item.type}</div>
                         </div>
                       </motion.div>
                     ))}
                   </div>
                 </div>
               )}
             </div>
             
             <motion.div 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.8 }}
               className="mt-8 w-full"
             >
               <Button 
                 onClick={onClose}
                 className="w-full bg-white text-indigo-700 hover:bg-yellow-100 py-6 text-lg font-bold"
                 title="Continue Adventure"
               >
                 Continue Adventure
               </Button>
             </motion.div>
           </div>
         </motion.div>
       </>
      )}
    </AnimatePresence>
  );
}