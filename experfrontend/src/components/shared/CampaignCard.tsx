// Reuseable campaign card component for displaying campaign details

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Star, Trophy, ArrowRight } from 'lucide-react';

interface CampaignCardProps {
    campaign: {
        id: string;
        title: string;
        description: string;
        theme: {
            primaryColor: string;
            secondaryColor: string;
            icon?: string;
            backgroundImage?: string;
        };
        progress: number;
        completed: boolean;
        category?: string;
        requiredLevel?: number;
    };
    isActive?: boolean;
    isCompleted?: boolean;
    onActivate?: (campaignId: string) => void;
}

export function CampaignCard({
    campaign,
    isActive = false,
    isCompleted = false,
    onActivate
}: CampaignCardProps) {
    // Default background if none provided
    const backgroundImage = campaign.theme.backgroundImage || 
        `linear-gradient(45deg, ${campaign.theme.primaryColor}88, ${campaign.theme.secondaryColor}88)`;

    return (
        <Card className="overflow-hidden transition-all hover:shadow-lg">
            <div 
                className="h-32 bg-cover bg-center relative"
                style={{ 
                    backgroundImage: `url(${campaign.theme.backgroundImage})`,
                    backgroundColor: campaign.theme.primaryColor
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                
                {/* Status badge */}
                {(isActive || isCompleted) && (
                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium
                        ${isActive ? 'bg-yellow-400 text-yellow-900' : 'bg-green-500 text-white'}`}>
                        <div className="flex items-center gap-1">
                            {isActive ? (
                                <>
                                    <Star className="h-3 w-3" />
                                    <span>Active</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-3 w-3" />
                                    <span>Completed</span>
                                </>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Category & Level tag */}
                <div className="absolute bottom-3 left-4 flex gap-2">
                    {campaign.category && (
                        <div className="bg-black/40 backdrop-blur-sm text-xs px-2 py-1 rounded-full text-white">
                            {campaign.category}
                        </div>
                    )}
                    
                    {campaign.requiredLevel && (
                        <div className="bg-black/40 backdrop-blur-sm text-xs px-2 py-1 rounded-full text-white flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            Level {campaign.requiredLevel}+
                        </div>
                    )}
                </div>
            </div>
            
            <div className="p-4">
                <h3 className="text-xl font-bold text-purple-900">{campaign.title}</h3>
                <p className="mt-1 text-gray-600 line-clamp-2">{campaign.description}</p>
                
                {/* Progress bar (if not completed) */}
                {!isCompleted && (
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{campaign.progress}%</span>
                        </div>
                        <Progress 
                            value={campaign.progress} 
                            className="h-2" 
                        />
                    </div>
                )}
                
                {/* Action button */}
                <div className="mt-4">
                    {isActive ? (
                        <Button 
                            className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-900"
                        >
                            Continue Campaign <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    ) : isCompleted ? (
                        <Button 
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-500"
                        >
                            View Achievements <Trophy className="h-4 w-4 ml-2" />
                        </Button>
                    ) : onActivate ? (
                        <Button 
                            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500"
                            onClick={() => onActivate(campaign.id)}
                        >
                            Start Campaign <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    ) : null}
                </div>
            </div>
        </Card>
    );
}