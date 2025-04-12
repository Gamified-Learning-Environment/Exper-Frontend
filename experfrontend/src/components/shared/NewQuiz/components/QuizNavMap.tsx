import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface QuizNavMapProps {
    totalQuestions: number;
    currentQuestion: number;
    answeredQuestions: Set<number>;
    flaggedQuestions: Set<number>;
    onQuestionSelect: (index: number) => void;
    onToggleFlag: (index: number) => void;
}

export function QuizNavMap({
    totalQuestions,
    currentQuestion,
    answeredQuestions,
    flaggedQuestions,
    onQuestionSelect,
    onToggleFlag
}: QuizNavMapProps) {

    // Calculate progress percentage
    const progressPercentage = (answeredQuestions.size / totalQuestions) * 100;
    
    // Choose guide character emotion based on progress
    const getGuideEmote = () => {
        if (progressPercentage === 0) return "👋";
        if (progressPercentage < 25) return "🤔";
        if (progressPercentage < 50) return "😊";
        if (progressPercentage < 75) return "🌟";
        if (progressPercentage < 100) return "🚀";
        return "🎉";
    };
    
    // Get motivational message based on progress
    const getMotivationalMessage = () => {
        if (progressPercentage === 0) return "Ready to begin your quest?";
        if (progressPercentage < 25) return "You're making progress!";
        if (progressPercentage < 50) return "Keep going, you're doing great!";
        if (progressPercentage < 75) return "Fantastic work so far!";
        if (progressPercentage < 100) return "Almost there, final push!";
        return "Quest complete! Amazing job!";
    };

    return (
        <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border-2 border-indigo-100 min-w-[300px]">
            {/* Quest Guide Character */}
            <div className="flex items-center gap-3 mb-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                <Avatar className="h-12 w-12 border-2 border-purple-300 shadow-md">
                    <AvatarImage src="/images/quest-guide.png" alt="Quest Guide" />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-xl">
                        {getGuideEmote()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="text-md font-bold text-purple-800 flex items-center gap-2">
                        Quest Guide
                    </h3>
                    <p className="text-xs text-purple-600">{getMotivationalMessage()}</p>
                </div>
            </div>
            
            <div className="relative max-h-[450px]">
                {/* Container with scroll */}
                <div className="overflow-y-auto pr-4 max-h-[450px] scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent">
                    {/* Path connecting nodes - inside the scrollable area but fixed position */}
                    <div className="absolute left-6 top-0 w-[2px] h-full bg-purple-200 z-0 rounded-full" />
                    
                    {/* Question nodes */}
                    <div className="space-y-4 relative z-10 pb-2">
                        {Array.from({ length: totalQuestions }).map((_, index) => {
                            const isAnswered = answeredQuestions.has(index);
                            const isCurrent = currentQuestion === index;
                            const isFlagged = flaggedQuestions.has(index);
                            
                            // Determine node emote based on status
                            const getNodeEmote = () => {
                                if (isFlagged) return "🚩";
                                if (isAnswered && isCurrent) return "✨";
                                if (isAnswered) return "✅";
                                if (isCurrent) return "👉";
                                return "";
                            };
                            
                            return (
                                <div key={index} className="flex items-center gap-3 group">
                                    <button
                                        onClick={() => onQuestionSelect(index)}
                                        className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all relative",
                                            isAnswered ? "bg-purple-500 text-white" : "bg-white border-2 border-purple-300 text-purple-800",
                                            isCurrent && "ring-4 ring-purple-300 scale-110 shadow-md animate-pulse",
                                            isCurrent && isAnswered && "bg-purple-600"
                                        )}
                                    >
                                        {index + 1}
                                        {getNodeEmote() && (
                                            <span className="absolute -top-1 -right-1 text-lg animate-bounce">{getNodeEmote()}</span>
                                        )}
                                    </button>
                                    
                                    <div className="flex-1 flex justify-between items-center group-hover:bg-indigo-50 p-1 rounded-md transition-colors">
                                        <div className={cn(
                                            "text-sm",
                                            isAnswered ? "text-purple-800" : "text-gray-500",
                                            isCurrent && "font-bold"
                                        )}>
                                            {isAnswered ? "Completed" : "Not completed"}
                                        </div>
                                        
                                        <button
                                            onClick={() => onToggleFlag(index)}
                                            className={cn(
                                                "text-xs px-2 py-1 rounded-md transition-colors",
                                                isFlagged 
                                                    ? "bg-red-100 text-red-700 hover:bg-red-200" 
                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            )}
                                        >
                                            {isFlagged ? "Unflag" : "Flag"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}