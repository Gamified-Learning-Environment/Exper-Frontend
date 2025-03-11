// Campaign Map component for displaying campaign progress

import { useState } from 'react';

// Campaign map props
interface CampaignMapProps {
  campaign: {
    quests: {
      id: string;
      title: string;
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
  
  return (
    <div className="relative py-8">
      {/* Path line */}
      <div 
        className="absolute top-1/2 left-0 right-0 h-2 transform -translate-y-1/2 rounded-full"
        style={{ backgroundColor: `${campaign.theme.secondaryColor}30` }}
      />
      
      {/* Path progress */}
      <div 
        className="absolute top-1/2 left-0 h-2 transform -translate-y-1/2 rounded-full transition-all duration-500"
        style={{ 
          backgroundColor: campaign.theme.primaryColor,
          width: `${(campaign.currentQuestIndex / (campaign.quests.length - 1)) * 100}%`
        }}
      />
      
      {/* Quest checkpoints */}
      <div className="flex justify-between relative z-10">
        {campaign.quests.map((quest, index) => {
          const isCompleted = index < campaign.currentQuestIndex;
          const isCurrent = index === campaign.currentQuestIndex;
          const isLocked = index > campaign.currentQuestIndex;
          
          return (
            <div 
              key={quest.id} 
              className="flex flex-col items-center"
              onMouseEnter={() => setHoveredQuest(index)}
              onMouseLeave={() => setHoveredQuest(null)}
            >
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-green-500 text-white' :
                  isCurrent ? 'bg-white border-4' :
                  'bg-gray-200'
                }`}
                style={{
                  borderColor: isCurrent ? campaign.theme.primaryColor : undefined
                }}
              >
                {isCompleted ? '✓' : isLocked ? <span className="text-gray-400">🔒</span> : index + 1}
              </div>
              
              {/* Quest tooltip on hover */}
              {hoveredQuest === index && (
                <div className="absolute top-full mt-2 bg-white rounded-lg shadow-lg p-3 w-48 z-20 text-center">
                  <p className="font-medium">{quest.title}</p>
                  <div className={`h-1 mt-1 rounded-full ${isCompleted ? 'bg-green-500' : isCurrent ? `bg-${campaign.theme.primaryColor}` : 'bg-gray-200'}`}/>
                  <p className="text-xs mt-1 text-gray-500">
                    {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Locked'}
                  </p>
                </div>
              )}
              
              {/* Quest label (optional - only shown when hovered on mobile) */}
              <span className={`mt-2 text-xs font-medium hidden md:block ${
                isCompleted ? 'text-green-600' :
                isCurrent ? 'text-purple-700' :
                'text-gray-400'
              }`}>
                {index + 1}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}