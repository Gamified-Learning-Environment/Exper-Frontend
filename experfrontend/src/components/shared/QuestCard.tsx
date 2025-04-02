// Quest card component for displaying quest details and progress

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Lock, Star, Gift, Target, ArrowRight, ListChecks } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

interface QuestCardProps {
    quest: {
        id: string;
        title: string;
        description: string;
        objectives?: {
            type: string;
            description: string;
            current: number;
            required: number;
        }[];
        rewards?: {
            xp: number;
            customization?: {
                type: string;
                id: string;
                name: string;
            }[];
        };
        completed: boolean;
        locked: boolean;
        progress?: number;
    };
    index: number;
    themeColor: string;
    isCompleted?: boolean;
    isLocked?: boolean;
    onStartQuest?: (questId: string) => void;
}

export function QuestCard({ 
    quest, 
    index, 
    themeColor = '#8b5cf6', 
    isCompleted = false, 
    isLocked = false,
    onStartQuest
}: QuestCardProps) {
    // Calculate progress across all objectives
    const progress = quest.progress || (isCompleted ? 100 : 0);
    const actuallyLocked = isLocked || quest.locked;
    const actuallyCompleted = isCompleted || quest.completed;

    useEffect(() => { 
        // Track if objectives changed to completed state
        const completedObjectives = quest.objectives?.filter(obj => 
          obj.current >= obj.required
        ).length || 0;
        
        if (completedObjectives > 0 && !quest.completed) {
          // Show completion animation
        }
    }, [quest.objectives]);
    
    return (
        <Card className={`overflow-hidden border ${
            actuallyCompleted ? 'border-green-200 bg-green-50' : 
            actuallyLocked ? 'border-gray-200 bg-gray-50/50' : 
            'border-purple-200 bg-purple-50'
        }`}>
            {/* Card Header */}
            <div className={`px-4 py-3 flex justify-between items-center ${
                actuallyCompleted ? 'bg-green-100' : 
                actuallyLocked ? 'bg-gray-100' : 
                'bg-purple-100'
            }`}>
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        actuallyCompleted ? 'bg-green-600 text-white' : 
                        actuallyLocked ? 'bg-gray-400 text-white' : 
                        `bg-${themeColor.replace('#', '')} text-white`
                    }`} style={!actuallyCompleted && !actuallyLocked ? { backgroundColor: themeColor } : {}}>
                        {actuallyCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                        ) : actuallyLocked ? (
                        <Lock className="w-4 h-4" />
                        ) : (
                        <span className="font-bold">{index + 1}</span>
                        )}
                    </div>
                    <span className={`font-medium ${
                        actuallyCompleted ? 'text-green-800' : 
                        actuallyLocked ? 'text-gray-500' : 
                        'text-purple-800'
                    }`}>
                        Quest {index + 1}
                    </span>
                </div>
                
                {!actuallyLocked && quest.rewards?.xp && (
                <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">
                    <Star className="w-3 h-3" fill="currentColor" />
                    {quest.rewards.xp} XP
                </div>
                )}
            </div>
            
            {/* Card Body */}
            <div className="p-4">
                <h3 className={`text-lg font-bold mb-2 ${
                actuallyCompleted ? 'text-green-700' : 
                actuallyLocked ? 'text-gray-400' : 
                'text-purple-700'
                }`}>
                {quest.title}
                </h3>
                
                <p className={`text-sm mb-4 ${
                actuallyCompleted ? 'text-green-600' : 
                actuallyLocked ? 'text-gray-400' : 
                'text-gray-600'
                }`}>
                {actuallyLocked ? "Complete previous quests to unlock" : quest.description}
                </p>
                
                {/* Objectives when not locked */}
                {!actuallyLocked && quest.objectives && quest.objectives.length > 0 && (
                <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <ListChecks className="w-4 h-4" />
                    Objectives
                    </div>
                    {quest.objectives.map((objective, i) => (
                    <div key={i} className="bg-white rounded-lg p-3 text-sm border border-gray-100">
                        <div className="flex justify-between mb-1">
                        <span className={actuallyCompleted ? 'text-green-600' : 'text-gray-700'}>
                            {objective.description}
                        </span>
                        <span className="font-medium">
                            {actuallyCompleted ? objective.required : objective.current}/{objective.required}
                        </span>
                        </div>
                        <Progress 
                        value={actuallyCompleted ? 100 : (objective.current / objective.required) * 100} 
                        className={`h-1.5 ${actuallyCompleted ? 'bg-green-100' : 'bg-gray-100'}`} 
                        />
                    </div>
                    ))}
                </div>
                )}
                
                {/* Progress bar */}
                <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                    <span className={actuallyCompleted ? 'text-green-600' : 'text-gray-500'}>Quest progress</span>
                    <span className="font-medium">{progress}%</span>
                </div>
                <Progress 
                    value={progress} 
                    className={`h-2 ${
                    actuallyCompleted ? 'bg-green-100' : 
                    actuallyLocked ? 'bg-gray-100' : 
                    'bg-purple-100'
                    }`} 
                />
                </div>
                
                {/* Action button */}
                {!actuallyLocked && !actuallyCompleted && onStartQuest && (
                    <Button 
                        className={`w-full mt-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white`}
                        onClick={() => onStartQuest(quest.id)}
                    >
                        <Target className="mr-2 h-4 w-4" /> Begin Quest
                    </Button>
                )}
            </div>
        </Card>
    );
}