// Quest card component for displaying quest details and progress

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Lock, Gift, ArrowRight, Target } from 'lucide-react';

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
                icon: string;
            }[];
        };
    };
    index: number;
    themeColor: string;
    isCompleted?: boolean;
    isLocked?: boolean;
    onClick?: () => void;
}

export function QuestCard({ 
    quest, 
    index, 
    themeColor = '#9333ea', 
    isCompleted = false, 
    isLocked = false,
    onClick
}: QuestCardProps) {
    // Calculate progress across all objectives
    const progress = quest.objectives?.reduce(
        (acc, obj) => acc + (Math.min(obj.current, obj.required) / obj.required), 
        0
    ) ?? 0;
    
    const totalObjectives = quest.objectives?.length ?? 1;
    const progressPercentage = Math.round((progress / totalObjectives) * 100);

    return (
        <Card 
            className={`p-5 transition-all hover:shadow-md relative overflow-hidden 
                ${isCompleted ? 'border-green-200 bg-green-50' : 
                 isLocked ? 'border-gray-200 bg-gray-50 opacity-75' : 
                 'border-2 border-purple-200 bg-white'}`}
            onClick={!isLocked && onClick ? onClick : undefined}
        >
            {/* Status indicator */}
            <div className="absolute top-4 right-4">
                {isCompleted && <CheckCircle2 className="h-6 w-6 text-green-500" />}
                {isLocked && <Lock className="h-6 w-6 text-gray-400" />}
            </div>
            
            {/* Quest number */}
            <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mb-3"
                style={{ backgroundColor: isCompleted ? '#22c55e' : isLocked ? '#9ca3af' : themeColor }}
            >
                {index + 1}
            </div>
            
            <h3 className={`text-lg font-bold ${isLocked ? 'text-gray-500' : 'text-purple-800'}`}>
                {quest.title}
            </h3>
            <p className={`mt-2 ${isLocked ? 'text-gray-400' : 'text-gray-600'}`}>
                {quest.description}
            </p>
            
            {/* Objectives */}
            {!isLocked && quest.objectives && (
                <div className="mt-4 space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Objectives:</h4>
                    <div className="space-y-2">
                        {quest.objectives.map((obj, idx) => (
                            <div key={idx}>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-1">
                                        <Target className="h-3.5 w-3.5 text-purple-600" />
                                        {obj.description}
                                    </span>
                                    <span className="font-medium">
                                        {Math.min(obj.current, obj.required)}/{obj.required}
                                    </span>
                                </div>
                                <Progress 
                                    value={(Math.min(obj.current, obj.required) / obj.required) * 100} 
                                    className="h-1.5 mt-1" 
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Rewards */}
            {!isLocked && quest.rewards && (
                <div className="mt-4">
                    <div className="flex items-center gap-1 text-sm text-purple-700 font-medium">
                        <Gift className="h-4 w-4" />
                        Rewards: {quest.rewards.xp} XP
                        {quest.rewards.customization && quest.rewards.customization.length > 0 && 
                            ` + ${quest.rewards.customization.length} item${quest.rewards.customization.length > 1 ? 's' : ''}`}
                    </div>
                </div>
            )}
            
            {/* Progress bar */}
            {!isLocked && (
                <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{progressPercentage}%</span>
                    </div>
                    <Progress 
                        value={progressPercentage}
                        className="h-2"  
                    />
                </div>
            )}
        </Card>
    );
}