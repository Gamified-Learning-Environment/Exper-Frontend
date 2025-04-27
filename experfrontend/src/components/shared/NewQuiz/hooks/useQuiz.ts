'use client';

import { useState, useEffect, useRef } from 'react'; // React hooks
import { Quiz, QuizQuestion, QuestionAttempt, ProgressData } from '../types'; // Importing the Quiz and ProgressData interfaces from the types file
import { useAuth } from '@/contexts/auth.context';
import { triggerConfetti, triggerAchievementConfetti, triggerBadgeConfetti, triggerPerfectScoreConfetti, triggerLevelUpConfetti, triggerStreakConfetti } from '@/components/shared/effects/Confetti';
import { GamificationService } from '@/services/gamification.service';
import { useGamification } from '@/components/shared/GamificationNotification'; 
import { QuestProgressManager } from '@/services/QuestProgressManager'; 

export const useQuiz = (quiz: Quiz ) => {

    console.log('Quiz received:', {
        id: quiz._id,
        useQuestionPool: quiz.useQuestionPool, 
        questionsPerAttempt: quiz.questionsPerAttempt,
        totalQuestions: quiz.questions.length
    });

    // State variables to keep track of current question, selected answers, show results and score

    // Create a reference to the original quiz to keep track of the original order
    const [quizData, setQuizData] = useState<Quiz>(quiz);

    // Initialized with default values
    const { user } = useAuth();

    const [currentQuestion, setCurrentQuestion] = useState<number>(0); 
    const [selectedAnswers, setSelectedAnswers] = useState<(string | string[])[]>(new Array(quizData.questions.length).fill(''));
    const [showResults, setShowResults] = useState<boolean>(false);
    const [score, setScore] = useState<number>(0);
    const [questionAttempts, setQuestionAttempts] = useState<QuestionAttempt[]>([]);
    const [startTime, setStartTime] = useState<number>(Date.now());
    const [questionTracker, setQuestionTracker] = useState<Set<number>>(new Set());
    const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());

    // Placeholder gamification
    const [experienceGained, setExperienceGained] = useState(0);
    const [levelProgress, setLevelProgress] = useState({ current: 1, next: 2, xp: 0, required: 500 });
    const [achievements, setAchievements] = useState<{ title: string; description: string; icon: string }[]>([]);
    const [streakDays, setStreakDays] = useState(7);
    const [currentAchievement, setCurrentAchievement] = useState<{ title: string; description: string; icon: string; xp_reward?: number } | null>(null);
    const { showAchievement, showBadge } = useGamification();

    // Load from localStorage after mount if available
    useEffect(() => {
        const storedQuestion = getStorageValue(`quiz_${quizData.id}_current`, 0);
        const storedAnswers = getStorageValue(`quiz_${quizData.id}_answers`, []);
        const storedResults = getStorageValue(`quiz_${quizData.id}_results`, false);
        const storedScore = getStorageValue(`quiz_${quizData.id}_score`, 0);

        // Set state with stored values
        setCurrentQuestion(storedQuestion);
        setSelectedAnswers(storedAnswers);
        setShowResults(storedResults);
        setScore(storedScore);
    }, [quizData.id]);

    // Save state to localStorage whenever it changes
    useEffect(() => {
    if (typeof window !== 'undefined') { // Check if window is defined
        localStorage.setItem(`quiz_${quizData.id}_current`, JSON.stringify(currentQuestion));
        localStorage.setItem(`quiz_${quizData.id}_answers`, JSON.stringify(selectedAnswers));
        localStorage.setItem(`quiz_${quizData.id}_results`, JSON.stringify(showResults));
        localStorage.setItem(`quiz_${quizData.id}_score`, JSON.stringify(score));
    }
    }, [quizData.id, currentQuestion, selectedAnswers, showResults, score]);

    useEffect(() => {
        // This will run only on the client after hydration is complete
        const processedQuiz = processQuiz(quiz);
        setQuizData(processedQuiz);
      }, [quiz]);

    function processQuiz(quiz: Quiz): Quiz {
        // Check if useQuestionPool exists, default to false if missing
        const hasQuestionPool = Boolean(quiz.useQuestionPool);
        // Use the questionsPerAttempt or default to half the questions (minimum 1)
        const numPerAttempt = quiz.questionsPerAttempt || Math.max(1, Math.floor(quiz.questions.length / 2));
        const hasQuestionPoolSize = Boolean(quiz.questionsPerAttempt && quiz.questionsPerAttempt > 0);
        const hasEnoughQuestions = quiz.questions.length > (quiz.questionsPerAttempt || 0);
        
        // First check if we should select from question pool
        if (hasQuestionPool && hasQuestionPoolSize && hasEnoughQuestions) {
            console.log('Using question pool - selecting', numPerAttempt, 'from', quiz.questions.length);

            // Create a copy of the quiz
            const pooledQuiz = { ...quiz };
            
            // Select random questions from the pool
            const allQuestions = [...quiz.questions];
            const selectedQuestions: QuizQuestion[] = [];
            
            // Determine how many questions to select
            const numToSelect = Math.min(numPerAttempt, allQuestions.length);         

            // Randomly select questions
            for (let i = 0; i < numToSelect; i++) {
                const randomIndex = Math.floor(Math.random() * allQuestions.length);
                selectedQuestions.push(allQuestions[randomIndex]);
                allQuestions.splice(randomIndex, 1); // Remove selected question
            }
            
            // Update the quiz with selected questions
            pooledQuiz.questions = selectedQuestions;
            
            // Apply randomization if needed (after selecting from pool)
            if (pooledQuiz.randomizeQuestions) {
                // Shuffle the selected questions
                const shuffledQuestions = [...pooledQuiz.questions];
                for (let i = shuffledQuestions.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
                }
                pooledQuiz.questions = shuffledQuestions;
            }
            
            return pooledQuiz;
        } else {
            console.log('Not using question pool, reason:', {
                useQuestionPool: quiz.useQuestionPool,
                questionsPerAttempt: quiz.questionsPerAttempt,
                totalQuestions: quiz.questions.length,
                condition: quiz.questions.length > (quiz.questionsPerAttempt || 0)
            });
        }

        // If no question pool or not enough questions, just use randomization if enabled
        if (quiz.randomizeQuestions) {
            const shuffledQuiz = { ...quiz };
            const shuffledQuestions = [...shuffledQuiz.questions];
            for (let i = shuffledQuestions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
            }
            shuffledQuiz.questions = shuffledQuestions;
            return shuffledQuiz;
        }
        
        return quiz;
    }

    

    // Handlers for navigation, answer selecting and quiz completion

    // Reset quiz state
    const resetQuiz = () => {
        setCurrentQuestion(0);
        setSelectedAnswers([]);
        setShowResults(false);
        setScore(0);
        setQuestionAttempts([]);
        setQuestionTracker(new Set());
        // Clear localStorage for this quiz
        localStorage.removeItem(`quiz_${quizData.id}_current`);
        localStorage.removeItem(`quiz_${quizData.id}_answers`);
        localStorage.removeItem(`quiz_${quizData.id}_results`);
        localStorage.removeItem(`quiz_${quizData.id}_score`);
    };

    // handle answer selection, update selectedAnswers state
    const handleAnswer = (questionIndex: number, answer: string) => {
        const newAnswers = [...selectedAnswers];
        const question = quizData.questions[questionIndex];
        
        if (question.isMultiAnswer) {
            // Handle multiple answer questions
            const currentAnswers = Array.isArray(newAnswers[questionIndex]) 
                ? newAnswers[questionIndex] as string[] 
                : [];
                
            if (currentAnswers.includes(answer)) {
                // Remove answer if already selected
                newAnswers[questionIndex] = currentAnswers.filter(a => a !== answer);
            } else {
                // Add new answer
                newAnswers[questionIndex] = [...currentAnswers, answer];
            }
        } else {
            // Handle single answer questions
            newAnswers[questionIndex] = answer;
        }
        setSelectedAnswers(newAnswers);
    };

    // handle next question, update currentQuestion state
    const handleNext = async () => {
        const timeSpent = (Date.now() - startTime) / 1000;

        // Only record the attempt if we haven't seen this question before
        if (!questionTracker.has(currentQuestion)) {
            const currentAttempt: QuestionAttempt = {
                questionIndex: currentQuestion,
                timeSpent,
                isCorrect: isAnswerCorrect(currentQuestion)
            };

            setQuestionAttempts(prev => [...prev, currentAttempt]);
            setQuestionTracker(prev => new Set(prev).add(currentQuestion));
        }

        setStartTime(Date.now()); // Reset timer for next question

        if (currentQuestion < quizData.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            await calculateResults();
        }
    };

    // handle previous question, update currentQuestion state
    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const isAnswerCorrect = (questionIndex: number) => {
        const question = quizData.questions[questionIndex];
        const selectedAnswer = selectedAnswers[questionIndex];
      
        if (question.isMultiAnswer) {
          const correctAnswers = Array.isArray(question.correctAnswer) 
            ? question.correctAnswer 
            : [question.correctAnswer];
            
          return Array.isArray(selectedAnswer) &&
            correctAnswers.length === selectedAnswer.length &&
            correctAnswers.every(ans => selectedAnswer.includes(ans));
        }
        
        return selectedAnswer === question.correctAnswer;
    };

    const toggleFlagQuestion = (questionIndex: number) => {
        setFlaggedQuestions(prev => {
            const newFlagged = new Set(prev);
            if (newFlagged.has(questionIndex)) {
                newFlagged.delete(questionIndex);
            } else {
                newFlagged.add(questionIndex);
            }
            return newFlagged;
        });
    };

    // calculate score and show results
    const calculateResults = async () => {
        console.log(quizData._id);
        let newScore = 0; // initialize score
        // loop through questions and compare selected answers with correct answers
        quizData.questions.forEach((question, index) => {
            const selectedAnswer = selectedAnswers[index];

            if (question.isMultiAnswer) {
                // For multiple answers, compare arrays
                const correctAnswers = Array.isArray(question.correctAnswer) 
                    ? question.correctAnswer 
                    : [question.correctAnswer];
                    
                const isCorrect = Array.isArray(selectedAnswer) &&
                    correctAnswers.length === selectedAnswer.length &&
                    correctAnswers.every(ans => selectedAnswer.includes(ans));
                    
                if (isCorrect) newScore++;
            } else {
                // For single answer
                if (selectedAnswer === question.correctAnswer) newScore++;
            }
        });

        // Calculate experience gained based on score and difficulty
        const baseXP = 100;
        const difficultyMultiplier = quizData.difficulty === 'expert' ? 2.5 : 
                                    quizData.difficulty === 'intermediate' ? 1.5 : 1;
        const accuracyBonus = (newScore / quizData.questions.length) * 50;
        const xpGained = Math.round((baseXP + accuracyBonus) * difficultyMultiplier);
        
        // Check for achievements
        const newAchievements = [];
        if (newScore === quizData.questions.length) {
            newAchievements.push({
                title: "Perfect Score!",
                description: "Answer all questions correctly",
                icon: "🏆"
            });
        }
        if (newScore >= quizData.questions.length * 0.8) {
            newAchievements.push({
                title: "Quiz Master",
                description: "Score 80% or higher",
                icon: "🎯"
            });
        }

        // Score-based confetti
        if (newScore === quizData.questions.length) {
            // Perfect score
            triggerPerfectScoreConfetti();
        } else if (newScore >= quizData.questions.length * 0.75) {
            // Good score
            triggerConfetti();
        }

        setScore(newScore);
        setExperienceGained(xpGained);
        setAchievements(newAchievements);
        setShowResults(true);

        // Submit result to API
        try{
            // Build result data object
            const resultData = {
                userId: user?._id,
                quizId: quizData._id, 
                score: newScore,
                totalQuestions: quizData.questions.length,
                questionAttempts: questionAttempts, 
                category: quizData.category 
            };

            // Add debug logging
            console.log('Submitting result with userId:', user?._id);

            // Validate required fields
            if (!user?._id) {
                console.error('Missing userId:', user + " no user ID found");
                throw new Error('No userId provided');
            }

            // Debug for checking result data
            console.log('Submitting result:', resultData);

            // If category is not provided, set it to 'General'
            if (!resultData.category) {
                resultData.category = 'General';
            }

            const baseUrl = process.env.NEXT_PUBLIC_RESULTS_SERVICE_URL || 'http://localhost:8070'; // Use environment variable or default to localhost
            const response = await fetch(`${baseUrl}/api/results`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(resultData),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save result');
            }

            const data = await response.json();
            console.log('Result saved successfully:', data);
        
        } catch (error) {
            console.error('Error saving result:', error);
        }

        // Update gamification data
        try {
            const userId = user?._id;
            if (!userId) {
                console.error('Missing userId:', userId + " no user ID found");
                throw new Error('No userId provided');
            }

            console.log('Updating gamification data for user:', userId);
            
            // Declare these variables in the outer scope
            let gamificationResponse: any = null;
            let streakResponse: any = null;

            try {
                // Add experience based on score and difficulty (global XP)
                console.log('Adding experience:', xpGained, 'for category:', quizData.category);
                gamificationResponse = await GamificationService.addExperience(
                    userId, 
                    xpGained, 
                    quizData.category
                );
                console.log('Experience added successfully:', gamificationResponse);

                // Add category-specific XP if category exists
                if (quizData.category) {
                    // Calculate category XP (can be different from global XP)
                    const categoryXP = Math.round(xpGained * 1.2); // 20% bonus for specific categories
                    
                    try {
                    const categoryResponse = await GamificationService.addCategoryExperience(
                        userId,
                        categoryXP,
                        quizData.category
                    );
                    
                    console.log('Category XP added successfully:', categoryResponse);
                    
                    // Show category level-up notification if applicable
                    if (categoryResponse.level_up) {
                        // Show category level up notification
                        showAchievement({
                        title: `${quizData.category} Level Up!`,
                        description: `You reached level ${categoryResponse.new_level} in ${quizData.category}`,
                        icon: "📚",
                        xp_reward: categoryResponse.new_xp
                        });
                        
                        triggerConfetti();

                        // Display badge popups for any awarded badges
                        if (categoryResponse.awarded_badges && categoryResponse.awarded_badges.length > 0) {
                            categoryResponse.awarded_badges.forEach((badge: { 
                                name: string; 
                                description: string; 
                                icon: string; 
                                rarity: string 
                            }, index: number) => {
                                setTimeout(() => {
                                    showBadge({
                                        name: badge.name,
                                        description: badge.description,
                                        icon: badge.icon,
                                        rarity: badge.rarity
                                    });
                                    triggerBadgeConfetti();
                                }, 1500 + (index * 1500)); // Stagger notifications
                            });
                        }
                    }
                    } catch (categoryError) {
                    console.error('Error adding category XP:', categoryError);
                    // Non-critical, continue execution
                    }
                }

                
                // Update levelProgress based on response
                if (gamificationResponse) {
                    setLevelProgress({
                        current: gamificationResponse.new_level || 1,
                        next: (gamificationResponse.new_level || 1) + 1,
                        xp: gamificationResponse.new_xp || 0,
                        required: ((gamificationResponse.new_level || 1) + 1) * 500
                    });
                    
                    if (gamificationResponse.level_up) {
                        triggerLevelUpConfetti();
                    }
                }
            } catch (expError) {
                console.error('Error adding experience:', expError);
                // Continue with other requests even if this one fails
            }
            
            try {
                // Update streak (category specific or generalised streak)
                console.log('Updating streak for category:', quizData.category);
                streakResponse = await GamificationService.updateStreak(
                    userId, 
                    quizData.category
                );
                console.log('Streak updated successfully:', streakResponse);
                
                if (streakResponse && streakResponse.current_streak % 7 === 0) {
                    triggerStreakConfetti();
                    setStreakDays(streakResponse.current_streak);
                }
            } catch (streakError) {
                console.error('Error updating streak:', streakError);
                // Continue with other requests even if this one fails
            }
        
            // Check for achievements based on this quiz result
            const achievementCheckData = {
                quiz_completed: true,
                perfect_score: newScore === quizData.questions.length,
                score_percentage: (newScore / quizData.questions.length) * 100,
                completion_time: questionAttempts.reduce((total, attempt) => total + attempt.timeSpent, 0),
                category: quizData.category,
                difficulty: quizData.difficulty
            };
            
            console.log('Checking for achievements with data:', achievementCheckData);
            const achievementResponse = await GamificationService.checkAchievements(userId, achievementCheckData);
            console.log('Achievement check response:', achievementResponse);
                        
            // Show achievement notifications with proper timing and effects
            if (achievementResponse?.awarded_achievements?.length > 0) {
                
                // Store achievements in state for displaying in the UI
                const newAchievements = achievementResponse.awarded_achievements.map((item: any) => ({
                    title: item.achievement.title,
                    description: item.achievement.description,
                    icon: item.achievement.icon,
                    xp_reward: item.achievement.xp_reward
                }));

                console.log('Awarded achievements to user: ' + userId, achievementResponse.awarded_achievements);
                
                setAchievements(prevAchievements => [...prevAchievements, ...newAchievements]);
                
                // Show trophy notification for each achievement (slight delay between each)
                newAchievements.forEach((achievement: { title: string; description: string; icon: string; xp_reward: number }, index: number) => {
                    setTimeout(() => {
                        showAchievement(achievement);
                        triggerAchievementConfetti();
                    }, 1000 + (index * 2000)); // Initial 1 s delay followed by 2 second delays between each
                });
            }
            
            // Handle level-up
            if (gamificationResponse?.level_up) {
                triggerLevelUpConfetti();
                setLevelProgress({
                    current: gamificationResponse.new_level,
                    next: gamificationResponse.new_level + 1,
                    xp: gamificationResponse.new_xp,
                    required: (gamificationResponse.new_level + 1) * 500
                });
            }

            // Handle awarded badges
            if (achievementResponse?.awarded_badges?.length > 0) {
                // Show badge notifications with proper timing
                achievementResponse.awarded_badges.forEach((badge: any, index: number) => {
                    setTimeout(() => {
                        showBadge(badge);
                        triggerBadgeConfetti();
                    }, 500 + (index * 2500)); // Delay showing badges to avoid overwhelming the user
                });

                console.log('Awarded badges to user: ' + userId, achievementResponse.awarded_badges);
            }
            
            // Handle streak milestones
            if (streakResponse?.current_streak && streakResponse.current_streak % 7 === 0) {
                triggerStreakConfetti();
                setStreakDays(streakResponse.current_streak);
            }

            try {
                // Update quest progress if there's an active campaign
                const progressResult = await QuestProgressManager.trackQuizCompletion(
                    userId,
                    newScore,
                    quizData.questions.length,
                    quizData.category
                  );
                  
                  if (progressResult.questCompleted) {
                    triggerConfetti();
                    // Show quest completion notification
                  }
            } catch (questError) {
                console.error('Error updating quest progress:', questError);
            }
        } catch (error) {
            console.error('Error updating gamification data:', error);
            // Don't let gamification errors prevent the quiz from completing
            // We'll still show the results even if gamification fails
        }

    }

    const getStorageValue = (key: string, defaultValue: any) => {
        if (typeof window === 'undefined') { // Check if window is defined, return default value if not
            return defaultValue;
        }
        try { // Try to read from localStorage
            const saved = localStorage.getItem(key); 
            return saved ? JSON.parse(saved) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    };
    
    return { // Return the state and handlers to be used in the quiz
        quizState: { // Form state object containing all the state variables
            currentQuestion,
            selectedAnswers,
            showResults,
            score,
            experienceGained,
            levelProgress,
            achievements,
            streakDays,
            questionAttempts,
            quiz: quizData,
            startTime,
            questionTracker,
            flaggedQuestions
        },
        handlers: { // Quiz handlers object containing all the handler functions
            setCurrentQuestion,
            setSelectedAnswers,
            setShowResults,
            setScore,
            setExperienceGained,
            setLevelProgress,
            setAchievements,
            setStreakDays,
            setQuestionAttempts,
            setStartTime,
            setQuestionTracker,
            handleAnswer,
            handleNext,
            handlePrevious,
            resetQuiz,
            calculateResults,
            isAnswerCorrect,
            getStorageValue,
            toggleFlagQuestion
        }
    };
};
