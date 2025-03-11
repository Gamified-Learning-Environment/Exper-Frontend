import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Gift, Award, Badge, Crown, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface RewardDisplayProps {
    rewards: {
        xp: number;
        customization?: {
            type: string;
            id: string;
            name: string;
            icon: string;
        }[];
    };
    themeColor?: string;
    onClaim?: () => void;
    claimed?: boolean;
}

export function RewardDisplay({
    rewards,
    themeColor = '#9333ea',
    onClaim,
    claimed = false
}: RewardDisplayProps) {
    const [isOpen, setIsOpen] = useState(false);
    
    // Helper function to get icon based on type
    const getIconForType = (type: string) => {
        switch (type.toLowerCase()) {
            case 'avatar':
                return <Award className="h-5 w-5" />;
            case 'badge':
                return <Badge className="h-5 w-5" />;
            case 'title':
                return <Crown className="h-5 w-5" />;
            case 'effect':
                return <Sparkles className="h-5 w-5" />;
            default:
                return <Gift className="h-5 w-5" />;
        }
    };
    
    return (
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 overflow-hidden">
            <div 
                className="p-4 cursor-pointer" 
                onClick={() => setIsOpen(!isOpen)}
                style={{ borderBottom: isOpen ? `1px solid ${themeColor}30` : 'none' }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                            style={{ backgroundColor: themeColor }}
                        >
                            <Gift className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold">Quest Rewards</h3>
                            <p className="text-sm text-gray-600">
                                {rewards.xp} XP
                                {rewards.customization && rewards.customization.length > 0 && 
                                    ` + ${rewards.customization.length} item${rewards.customization.length > 1 ? 's' : ''}`}
                            </p>
                        </div>
                    </div>
                    
                    <div className="text-purple-700 text-sm">
                        {isOpen ? 'Hide' : 'Show'} rewards
                    </div>
                </div>
            </div>
            
            {isOpen && rewards.customization && rewards.customization.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="p-4"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {rewards.customization.map((item, index) => (
                            <div 
                                key={index}
                                className="bg-white p-3 rounded-lg border border-purple-100 flex items-center gap-3"
                            >
                                <div 
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                                    style={{ backgroundColor: themeColor }}
                                >
                                    {getIconForType(item.type)}
                                </div>
                                <div>
                                    <div className="font-medium text-sm">{item.name}</div>
                                    <div className="text-xs text-gray-500 capitalize">{item.type}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {onClaim && !claimed && (
                        <button
                            className="w-full mt-4 py-2 rounded-md font-medium text-white transition-all"
                            style={{ backgroundColor: themeColor }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onClaim();
                            }}
                        >
                            Claim Rewards
                        </button>
                    )}
                    
                    {claimed && (
                        <div className="w-full mt-4 py-2 rounded-md font-medium text-center bg-green-100 text-green-700">
                            Rewards Claimed
                        </div>
                    )}
                </motion.div>
            )}
        </Card>
    );
}