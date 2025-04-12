import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Target, Trophy, Star, Flame, Medal, Award, BookCheck, Zap } from "lucide-react";
import { GamificationService } from "@/services/gamification.service";
import { useAuth } from "@/contexts/auth.context";

function RotatingChallenges({ userId, username }: { userId?: string, username?: string }) {
    const [challenges, setChallenges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
      const fetchChallenges = async () => {
        if (!userId) return;
        
        try {
          setLoading(true);
          
          // Fetch data in parallel
          const [quizzes, achievements, categoryData] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_QUIZ_SERVICE_URL}/api/quizzes`).then(res => res.json()),
            GamificationService.getAchievements(),
            fetch(`${process.env.NEXT_PUBLIC_QUIZ_SERVICE_URL}/api/categories`).then(res => res.json())
          ]);
          
          // Format quiz challenges
          const quizChallenges = quizzes.slice(0, 4).map((quiz: any) => ({
            id: `quiz-${quiz._id}`,
            type: 'DAILY QUIZ',
            title: quiz.title,
            description: quiz.description || `Test your knowledge with this ${quiz.category || 'featured'} quiz!`,
            xpReward: 75,
            color: 'bg-blue-500',
            labelColor: 'bg-blue-100 text-blue-800',
            icon: BookOpen,
            buttonText: 'Start Quiz',
            action: `/quiz/${quiz._id}`,
            category: 'quiz'
          }));
          
          // Format achievement challenges
          const achievementChallenges = achievements
            .filter((a: any) => !a.earned)
            .slice(0, 4)
            .map((achievement: any) => ({
              id: `achievement-${achievement._id}`,
              type: 'ACHIEVEMENT HUNT',
              title: achievement.title,
              description: achievement.description,
              xpReward: achievement.xp_reward || 100,
              color: 'bg-yellow-500',
              labelColor: 'bg-yellow-100 text-yellow-800',
              icon: getIconForAchievement(achievement.icon),
              buttonText: 'View Details',
              action: `/user/${user?._id}`,
              category: 'achievement'
            }));
          
          // Format category challenges
          const categoryColors = ['bg-green-500', 'bg-purple-500', 'bg-indigo-500'];
          const categoryChallenges = categoryData.slice(0, 4).map((category: string, i: number) => ({
            id: `category-${category}`,
            type: 'CATEGORY CHALLENGE',
            title: `${category} Mastery`,
            description: `Complete any quiz in the ${category} category for bonus XP!`,
            xpReward: 50,
            color: categoryColors[i % categoryColors.length],
            labelColor: `bg-${categoryColors[i % categoryColors.length].split('-')[1]}-100 text-${categoryColors[i % categoryColors.length].split('-')[1]}-800`,
            icon: Target,
            buttonText: 'Find Quizzes',
            action: `/quiz/quizzes?category=${category}`,
            category: 'category'
          }));
          
          // Combine all challenges
          const allChallenges = [...quizChallenges, ...achievementChallenges, ...categoryChallenges];
          setChallenges(shuffleArray(allChallenges));
          
        } catch (error) {
          console.error('Error fetching challenge data:', error);
          // Fallback challenges if fetch fails
          setChallenges([
            {
              id: 'daily-quiz',
              type: 'DAILY QUIZ',
              title: 'Featured Quiz',
              description: 'Test your knowledge with today\'s featured quiz!',
              xpReward: 75,
              color: 'bg-blue-500',
              labelColor: 'bg-blue-100 text-blue-800',
              icon: BookOpen,
              buttonText: 'Browse Quizzes',
              action: '/quiz/quizzes',
              category: 'quiz'
            },
            {
              id: 'achievement-hunt',
              type: 'ACHIEVEMENT HUNT',
              title: 'Perfect Streak',
              description: 'Complete 3 quizzes with a perfect score to unlock this achievement!',
              xpReward: 100,
              color: 'bg-yellow-500',
              labelColor: 'bg-yellow-100 text-yellow-800',
              icon: Trophy,
              buttonText: 'View Achievements',
              action: '/achievements',
              category: 'achievement'
            },
            {
              id: 'category-challenge',
              type: 'CATEGORY CHALLENGE',
              title: 'Explore Categories',
              description: 'Complete any quiz in a new category for bonus XP!',
              xpReward: 50,
              color: 'bg-green-500',
              labelColor: 'bg-green-100 text-green-800',
              icon: Target,
              buttonText: 'Browse Categories',
              action: '/quiz/quizzes',
              category: 'category'
            },
          ]);
        } finally {
          setLoading(false);
        }
      };
      
      fetchChallenges();
    }, [userId, user?._id]);
  
    // Helper functions
    function getIconForAchievement(iconName: string) {
      switch (iconName) {
        case 'trophy': return Trophy;
        case 'star': return Star;
        case 'target': return Target;
        case 'flame': return Flame;
        case 'medal': return Medal;
        case 'book': return BookCheck;
        default: return Award;
      }
    }
    
    function shuffleArray(array: any[]) {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    }

    // Split challenges into 3 groups for the columns
    // We'll ensure at least 1 challenge per column by creating 3 slices
    const splitChallenges = () => {
      if (challenges.length < 3) return [challenges, challenges, challenges];
      
      const third = Math.ceil(challenges.length / 3);
      return [
        challenges.slice(0, third),
        challenges.slice(third, 2 * third),
        challenges.slice(2 * third)
      ];
    };
    
    const [col1, col2, col3] = splitChallenges();
  
    if (loading) {
      return (
        <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-4">
          {[1, 2, 3].map(i => (
            <LoadingCard key={i} />
          ))}
        </div>
      );
    }
  
    if (!challenges.length) {
      return null;
    }

    return (
      <>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-indigo-800 flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-500" />
            Daily Challenges
            <span className="px-2 py-0.5 text-xs font-bold bg-yellow-300 text-yellow-800 rounded-full animate-pulse">
              BONUS XP
            </span>
          </h2>
        </div>

        {/* Grid: 1 column on mobile, 3 columns on md+ screens */}
        <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-4">
          {/* Column 1 - always visible */}
          <ChallengeColumn challenges={col1} />
          
          {/* Column 2 & 3 - only visible on md+ screens */}
          <div className="hidden md:block">
            <ChallengeColumn challenges={col2} />
          </div>
          
          <div className="hidden md:block">
            <ChallengeColumn challenges={col3} />
          </div>
        </div>
      </>
    );
}

// Loading card component
function LoadingCard() {
  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-violet-50 border-2 border-indigo-200 overflow-hidden">
      <CardContent className="p-8 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-indigo-600 font-medium">Loading challenges...</p>
      </CardContent>
    </Card>
  );
}

// Challenge column component - handles its own rotation
function ChallengeColumn({ challenges }: { challenges: any[] }) {
  const router = useRouter();
  const [activeChallenge, setActiveChallenge] = useState(0);
  
  useEffect(() => {
    // Auto-rotate challenges every 7 seconds
    const interval = setInterval(() => {
      setActiveChallenge((current) => (current + 1) % challenges.length);
    }, 7000);
    
    return () => clearInterval(interval);
  }, [challenges.length]);

  if (!challenges.length) return null;
  
  const challenge = challenges[activeChallenge];

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-violet-50 border-2 border-indigo-200 overflow-hidden transition-all hover:shadow-lg h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-indigo-800">
            {challenge.type}
          </h3>
          <div className="flex gap-1">
            {challenges.map((_, index) => (
              <button 
                key={index} 
                onClick={() => setActiveChallenge(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  activeChallenge === index ? "bg-indigo-600 w-4" : "bg-indigo-300"
                }`}
                aria-label={`Challenge ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="relative overflow-hidden">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 relative overflow-hidden">
            {/* Diagonal highlight */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-indigo-100 -z-10" />
            
            <div className="flex items-start gap-3">
              <div className={`p-3 rounded-xl ${challenge.color} flex-shrink-0`}>
                <challenge.icon className="h-6 w-6 text-white" />
              </div>
              
              <div className="space-y-2 flex-1">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                      <Zap className="h-3 w-3" /> +{challenge.xpReward} XP
                    </span>
                  </div>
                  <h4 className="text-md font-bold text-indigo-900 mt-1">
                    {challenge.title}
                  </h4>
                </div>
                <p className="text-xs text-indigo-700 min-h-[40px]">
                  {challenge.description}
                </p>
                <div className="flex gap-2 pt-2">
                    <Button 
                        onClick={() => router.push(challenge.action)}
                        className="flex-1 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium text-xs hover:from-indigo-700 hover:to-purple-700 transform transition hover:scale-105 shadow-md"
                    >
                        {challenge.buttonText}
                    </Button>
                    <Button 
                        className="px-2 py-1 rounded-full bg-white text-indigo-600 border border-indigo-200 text-xs hover:bg-indigo-50 transition"
                        onClick={() => setActiveChallenge((activeChallenge + 1) % challenges.length)}
                    >
                        Skip
                    </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Challenge counter */}
        <div className="flex justify-center mt-4">
          <div className="bg-white px-3 py-1 rounded-full text-xs font-medium text-indigo-800">
            {activeChallenge + 1} of {challenges.length}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default RotatingChallenges;