// Quest Card component for displaying quest details

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Lock, Gift, Star, Book, Target, Zap, ArrowRight } from 'lucide-react';

interface QuestCardProps {
  quest: {
    id: string;
    title: string;
    description: string;
    objectives: {
      type: string;
      target: number;
      current?: number;
      category?: string;
      description: string;
    };
    rewards: {
      xp: number;
      customization?: {
        type: string;
        itemId: string;
        name: string;
        icon: string;
      }[];
    };
    completed: boolean;
    progress: number;
  };
  index: number;
  themeColor: string;
  isCompleted?: boolean;
  isLocked?: boolean;
}

export function QuestCard({ quest, index, themeColor, isCompleted, isLocked }: QuestCardProps) {
  // Helper to get appropriate quest icon based on objective type
  const getQuestIcon = () => {
    switch (quest.objective.type) {
      case 'CREATE_QUIZ': return Book;
      case 'COMPLETE_QUIZ': return Target;
      case 'PERFECT_SCORE': return Star;
      case 'USE_CATEGORY': return Zap;
      default: return Target;
    }
  };
  
  const QuestIcon = getQuestIcon();
  
  return (
    <Card className={`
      overflow-hidden transition-all duration-300 hover:shadow-md
      ${isCompleted ? 'bg-green-50 border-green-200' : 
        isLocked ? 'bg-gray-50 border-gray-200' : 
        'bg-white border-purple-200 hover:border-purple-400'}
    `}>
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div 
            className={`p-3 rounded-lg flex-shrink-0 ${
              isCompleted ? 'bg-green-100' : 
              isLocked ? 'bg-gray-100' : 
              'bg-purple-100'
            }`}
            style={{ backgroundColor: isCompleted ? undefined : isLocked ? undefined : `${themeColor}20` }}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            ) : isLocked ? (
              <Lock className="w-6 h-6 text-gray-400" />
            ) : (
              <QuestIcon className="w-6 h-6" style={{ color: themeColor }} />
            )}
          </div>
          
          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <div>
                <h4 className={`text-lg font-bold ${
                  isCompleted ? 'text-green-700' : 
                  isLocked ? 'text-gray-400' : 
                  'text-purple-900'
                }`}>
                  {isLocked ? "???" : quest.title}
                </h4>
                <p className={`text-sm ${
                  isCompleted ? 'text-green-600' : 
                  isLocked ? 'text-gray-400' : 
                  'text-gray-600'
                }`}>
                  {isLocked ? "Complete previous quests to unlock" : quest.description}
                </p>
              </div>
              
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                isCompleted ? 'bg-green-100 text-green-700' : 
                isLocked ? 'bg-gray-100 text-gray-400' : 
                'bg-purple-100 text-purple-700'
              }`}>
                Quest {index + 1}
              </span>
            </div>
            
            {!isLocked && (
              <>
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className={isCompleted ? 'text-green-600' : 'text-gray-500'}>
                      {isCompleted ? 'Completed!' : `Progress: ${quest.progress}%`}
                    </span>
                    <span className={isCompleted ? 'text-green-600' : 'text-gray-500'}>
                      {quest.progress}/100
                    </span>
                  </div>
                  <Progress 
                    value={isCompleted ? 100 : quest.progress} 
                    className={`h-1.5 ${
                      isCompleted ? 'bg-green-100' : 'bg-purple-100'
                    }`}
                    style={{
                      color: isCompleted ? 'rgb(34 197 94)' : themeColor
                    }}
                  />
                </div>
                
                <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                  <h5 className="text-sm font-semibold text-gray-700 flex items-center">
                    <Gift className="w-4 h-4 mr-1 text-purple-500" /> Rewards
                  </h5>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-medium">
                      +{quest.rewards.xp} XP
                    </span>
                    {quest.rewards.customization?.map(item => (
                      <span 
                        key={item.itemId}
                        className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium flex items-center"
                      >
                        {item.name}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}