import { GamificationService } from '@/services/gamification.service';

// Action types that can trigger quest progress
export enum QuestActionType {
  COMPLETE_QUIZ = 'complete_quiz',
  COMPLETE_QUIZ_PERFECT = 'complete_quiz_perfect',
  COMPLETE_CATEGORY_QUIZ = 'complete_category_quiz',
  COMPLETE_CATEGORY_QUIZ_PERFECT = 'complete_category_quiz_perfect',
  CREATE_QUIZ = 'create_quiz',
  CREATE_AI_QUIZ = 'create_ai_quiz',
  START_STREAK = 'start_streak',
  MAINTAIN_STREAK = 'maintain_streak',
}

// Interface for action data
export interface QuestActionData {
  userId: string;
  actionType: QuestActionType;
  category?: string;
  score?: number;
  totalQuestions?: number;
  isPerfect?: boolean;
  progress?: number;
  metadata?: Record<string, any>;
}

// Interface for progress result
export interface QuestProgressResult {
  success: boolean;
  questCompleted?: boolean;
  objectivesCompleted?: boolean;
  questTitle?: string;
  message?: string;
  error?: string;
  rewards?: {
    xp?: number;
    customization?: any[];
  };
}

export class QuestProgressManager {
  // Track an action that might progress quest objectives
  static async trackAction(data: QuestActionData): Promise<QuestProgressResult> {
    try {
      const { userId, actionType, category, progress = 1 } = data;
      
      if (!userId) {
        console.error("Cannot track quest progress: User ID is undefined");
        return { success: false, error: "Missing user ID" };
      }
      
      console.log(`Tracking action ${actionType} for user ${userId}`, data);
      
      // Get active campaign and current quest
      const activeCampaign = await GamificationService.getUserActiveCampaign(userId);
      
      if (!activeCampaign || !activeCampaign.quests || activeCampaign.quests.length === 0) {
        // No active campaign or no quests, nothing to track
        return { success: false, message: "No active campaign or quests" };
      }
      
      // Find current quest
      const currentQuest = activeCampaign.quests.find(
          ( q: { completed: any; id: any; }) => !q.completed && q.id === activeCampaign.currentQuestId
      );
      
      if (!currentQuest) {
        return { success: false, message: "No active quest found" };
      }
      
      // Determine the appropriate objective type based on the action
      let objectiveType = actionType;
      
      // Handle perfect score variations
      if (data.isPerfect && actionType === QuestActionType.COMPLETE_QUIZ) {
        objectiveType = QuestActionType.COMPLETE_QUIZ_PERFECT;
      }
      
      // Handle category-specific actions
      if (category && 
         (actionType === QuestActionType.COMPLETE_QUIZ || 
          actionType === QuestActionType.COMPLETE_QUIZ_PERFECT)) {
        objectiveType = data.isPerfect ? 
          QuestActionType.COMPLETE_CATEGORY_QUIZ_PERFECT : 
          QuestActionType.COMPLETE_CATEGORY_QUIZ;
          
        // Update progress through the service
        const result = await GamificationService.updateQuestProgress(
          userId,
          currentQuest.id,
          `${objectiveType}_${category}`,
          progress
        );
        
        return {
          success: true,
          questCompleted: result?.quest_completed,
          objectivesCompleted: result?.objectives_completed,
          questTitle: currentQuest.title,
          rewards: result?.rewards
        };
      }
      
      // Regular action update
      const result = await GamificationService.updateQuestProgress(
        userId,
        currentQuest.id,
        objectiveType,
        progress
      );
      
      return {
        success: true,
        questCompleted: result?.quest_completed,
        objectivesCompleted: result?.objectives_completed,
        questTitle: currentQuest.title,
        rewards: result?.rewards
      };
      
    } catch (error) {
      console.error("Error tracking quest progress:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error tracking progress" 
      };
    }
  }

  // Helper method specifically for tracking quiz completion
  static async trackQuizCompletion(
    userId: string, 
    score: number, 
    totalQuestions: number, 
    category?: string
  ): Promise<QuestProgressResult> {
    const isPerfect = score === totalQuestions;
    
    return this.trackAction({
      userId,
      actionType: QuestActionType.COMPLETE_QUIZ,
      category,
      score,
      totalQuestions,
      isPerfect,
      metadata: { quizCompleted: true }
    });
  }

  // Helper method specifically for tracking quiz creation
  static async trackQuizCreation(
    userId: string,
    isAIGenerated: boolean
  ): Promise<QuestProgressResult> {
    return this.trackAction({
      userId,
      actionType: isAIGenerated ? QuestActionType.CREATE_AI_QUIZ : QuestActionType.CREATE_QUIZ
    });
  }
}