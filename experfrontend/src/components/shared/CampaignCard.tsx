// Reuseable campaign card component for displaying campaign details

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Play, CheckCircle2 } from 'lucide-react';

// CampaignCard props interface

interface CampaignCardProps {
    campaign: {
      id: string;
      title: string;
      description: string;
      theme: {
        primaryColor: string;
        secondaryColor: string;
        icon: string;
        backgroundImage: string;
      };
      progress: number;
      quests: any[];
    };
    isActive?: boolean;
    isCompleted?: boolean;
    onActivate?: (campaignId: string) => void;
  }

  export function CampaignCard({ campaign, isActive, isCompleted, onActivate }: CampaignCardProps) {
    return (
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div 
          className="h-40 bg-cover bg-center relative" 
          style={{ 
            backgroundImage: `url(${campaign.theme.backgroundImage})`,
            backgroundColor: campaign.theme.primaryColor 
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          {isActive && (
            <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
              <Play className="w-3 h-3 mr-1" /> Active
            </div>
          )}
          {isCompleted && (
            <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
              <Trophy className="w-3 h-3 mr-1" /> Completed
            </div>
          )}
        </div>
        
        <div className="p-5">
          <h3 className="text-xl font-bold text-purple-900 mb-2">{campaign.title}</h3>
          <p className="text-gray-600 text-sm mb-4">{campaign.description}</p>
          
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>{campaign.quests.length} quests</span>
            <span>{campaign.progress}% complete</span>
          </div>
          <Progress 
            value={campaign.progress} 
            className="h-2 mb-4" 
            style={{ 
              backgroundColor: `${campaign.theme.secondaryColor}30`,
              color: campaign.theme.primaryColor
            }} 
          />
          
          {!isActive && !isCompleted && onActivate && (
            <Button 
              onClick={() => onActivate(campaign.id)}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
            >
              Start Campaign
            </Button>
          )}
          
          {isActive && (
            <Button 
              variant="outline" 
              className="w-full border-2 border-purple-200 text-purple-700"
            >
              Continue
            </Button>
          )}
          
          {isCompleted && (
            <Button 
              variant="outline" 
              className="w-full border-2 border-yellow-200 text-yellow-700"
              disabled
            >
              <CheckCircle2 className="w-4 h-4 mr-2" /> Completed
            </Button>
          )}
        </div>
      </Card>
    );
  }