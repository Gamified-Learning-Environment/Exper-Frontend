import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ProfileBadgeProps {
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  rarity: string;
}

export function ProfileBadge({ name, description, icon, earned = true, rarity = 'common' }: ProfileBadgeProps) {
  // Map rarity to visual styles
  const rarityStyles = {
    common: "bg-gradient-to-br from-slate-400 to-slate-600 border-slate-300",
    uncommon: "bg-gradient-to-br from-green-500 to-green-700 border-green-300",
    rare: "bg-gradient-to-br from-blue-500 to-blue-700 border-blue-300",
    epic: "bg-gradient-to-br from-purple-500 to-purple-700 border-purple-300",
    legendary: "bg-gradient-to-br from-yellow-400 to-amber-600 border-yellow-300"
  };

  // Rarity-based glow effect
  const glowStyles = {
    common: "shadow-sm",
    uncommon: "shadow-sm shadow-green-400/20",
    rare: "shadow-sm shadow-blue-400/30",
    epic: "shadow-sm shadow-purple-400/30",
    legendary: "shadow-md shadow-amber-400/40"
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-all border",
              earned 
                ? rarityStyles[rarity as keyof typeof rarityStyles] || rarityStyles.common
                : "bg-gradient-to-br from-gray-300 to-gray-400 border-gray-200 opacity-40",
              earned ? glowStyles[rarity as keyof typeof glowStyles] : "",
              earned && "cursor-pointer transform hover:scale-110 hover:shadow-lg"
            )}
          >
            {/* Inner shine effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/10 to-white/30 opacity-50"></div>
            
            <span className="text-white text-sm relative z-10 drop-shadow-sm">{icon}</span>
            
            {/* Subtle ring around legendary badges */}
            {earned && rarity === 'legendary' && (
              <div className="absolute -inset-0.5 rounded-full bg-amber-300/30 animate-pulse"></div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-black/95 text-white border-none p-2 max-w-[200px] shadow-xl">
          <div className="text-center">
            <p className={cn(
              "font-bold mb-1",
              rarity === "legendary" && "text-amber-400",
              rarity === "epic" && "text-purple-300",
              rarity === "rare" && "text-blue-300",
              rarity === "uncommon" && "text-green-300",
            )}>{name}</p>
            <p className="text-xs opacity-80">{description}</p>
            {!earned && <p className="text-xs mt-1 opacity-60 italic">Not yet earned</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}