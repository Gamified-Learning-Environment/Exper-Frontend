import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, Lock, Sparkles, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface CampaignMapProps {
  campaign: {
    quests: {
      id: string;
      title: string;
      description?: string;
      completed: boolean;
    }[];
    currentQuestIndex: number;
    theme: {
      primaryColor: string;
      secondaryColor: string;
    };
  };
}

export function CampaignMap({ campaign }: CampaignMapProps) {
  const [hoveredQuest, setHoveredQuest] = useState<number | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 200 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Set container dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Error handling for missing campaign data
  if (!campaign || !campaign.quests || !Array.isArray(campaign.quests) || campaign.quests.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No quest data available for this campaign</p>
      </div>
    );
  }
  
  // Create path points
  const pathPoints = campaign.quests.map((_, index) => {
    const progress = index / Math.max(1, campaign.quests.length - 1);
    const yOffset = index % 2 === 0 ? -15 : 15;
    return {
      x: Math.floor(progress * containerSize.width),
      y: Math.floor(containerSize.height / 2 + yOffset),
      completed: index < campaign.currentQuestIndex
    };
  });

  // Default theme colors if not provided
  const primaryColor = campaign.theme?.primaryColor || '#6366f1';
  const secondaryColor = campaign.theme?.secondaryColor || '#8b5cf6';
  
  return (
    <div className="relative py-20 px-4" ref={containerRef}>
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-purple-200"
            style={{
              width: Math.random() * 50 + 10,
              height: Math.random() * 50 + 10,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.1,
            }}
          />
        ))}
      </div>
      
      {/* Path SVG */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
        {/* Main path background */}
        <path 
          d={`${pathPoints.map((p, i) => 
            `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
          ).join(' ')}`}
          stroke={`${campaign.theme.secondaryColor}40`}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="1 0"
        />
        
        {/* Completed path */}
        <path 
          d={`${pathPoints
            .filter((_, i) => i <= campaign.currentQuestIndex)
            .map((p, i) => 
              `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
            ).join(' ')}`}
          stroke={campaign.theme.primaryColor}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          className="drop-shadow-md"
        />
        
        {/* Animated dash effect for the active section */}
        <path 
          d={`${pathPoints[Math.max(0, campaign.currentQuestIndex - 1)].x} ${pathPoints[Math.max(0, campaign.currentQuestIndex - 1)].y} 
              L ${pathPoints[Math.min(campaign.currentQuestIndex + 1, pathPoints.length - 1)].x} ${pathPoints[Math.min(campaign.currentQuestIndex + 1, pathPoints.length - 1)].y}`}
          stroke="white"
          strokeWidth="4"
          fill="none"
          strokeDasharray="3 3"
          strokeLinecap="round"
          className="animate-pulse"
        />
      </svg>
      
      {/* Quest nodes */}
      <div className="relative z-10">
        {campaign.quests.map((quest, index) => {
          const isCompleted = index < campaign.currentQuestIndex;
          const isCurrent = index === campaign.currentQuestIndex;
          const isLocked = index > campaign.currentQuestIndex;
          
          return (
            <div 
              key={quest.id}
              className="absolute"
              style={{ 
                left: `${pathPoints[index].x}px`, 
                top: `${pathPoints[index].y}px`,
                transform: 'translate(-50%, -50%)'
              }}
              onMouseEnter={() => setHoveredQuest(index)}
              onMouseLeave={() => setHoveredQuest(null)}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ 
                  scale: hoveredQuest === index ? 1.1 : 1,
                  boxShadow: hoveredQuest === index ? '0 0 15px rgba(124, 58, 237, 0.5)' : '0 0 0px rgba(124, 58, 237, 0)'
                }}
                className={`w-14 h-14 rounded-full flex items-center justify-center relative ${
                  isCompleted 
                    ? 'bg-gradient-to-br from-green-400 to-green-600 text-white' 
                    : isCurrent 
                      ? `bg-gradient-to-br from-${campaign.theme.primaryColor}-400 to-${campaign.theme.primaryColor}-600 text-white animate-pulse` 
                      : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-7 h-7" />
                ) : isLocked ? (
                  <Lock className="w-6 h-6" />
                ) : (
                  <div className="relative">
                    <span className="font-bold text-xl">{index + 1}</span>
                    <Sparkles className="w-4 h-4 absolute -top-2 -right-2 text-yellow-300" />
                  </div>
                )}
                
                {/* Current indicator ring */}
                {isCurrent && (
                  <motion.div 
                    className="absolute -inset-2 rounded-full border-4 border-yellow-300"
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2
                    }}
                  />
                )}
                
                {/* Quest tooltip */}
                {hoveredQuest === index && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full mt-3 bg-white rounded-lg shadow-xl p-4 w-48 z-20"
                    style={{ 
                      borderTop: `3px solid ${
                        isCompleted ? 'rgb(34 197 94)' : 
                        isCurrent ? campaign.theme.primaryColor : 'rgb(156 163 175)'
                      }`
                    }}
                  >
                    <div className="font-bold mb-1">{quest.title}</div>
                    {quest.description && (
                      <p className="text-xs text-gray-600 mb-2">{quest.description}</p>
                    )}
                    <div className={`text-xs font-medium ${
                      isCompleted ? 'text-green-600' :
                      isCurrent ? 'text-purple-600' :
                      'text-gray-400'
                    }`}>
                      {isCompleted ? '✓ Completed' : 
                       isCurrent ? '🔥 In Progress' : 
                       '🔒 Locked'}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}