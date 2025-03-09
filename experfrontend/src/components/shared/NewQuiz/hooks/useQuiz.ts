
'use client';

import { useState, useEffect, useRef } from 'react'; // React hooks
import { Quiz, QuestionAttempt, ProgressData } from '../types'; // Importing the Quiz and ProgressData interfaces from the types file
import { useAuth } from '@/contexts/auth.context';

import { triggerConfetti, triggerAchievementConfetti, 
    triggerPerfectScoreConfetti, triggerLevelUpConfetti, 
    triggerStreakConfetti } from '@/components/shared/effects/Confetti';

import { GamificationService } from '@/services/gamification.service';

export const useQuiz = (quiz: Quiz ) => {
    // State variables to keep track of current question, selected answers, show results and score

    // Initialized with default values
    const { user } = useAuth();

    const [currentQuestion, setCurrentQuestion] = useState<number>(0); 
    const [selectedAnswers, setSelectedAnswers] = useState<(string | string[])[]>(
        new Array(quiz.questions.length).fill('')
    );
    const [showResults, setShowResults] = useState<boolean>(false);
    const [score, setScore] = useState<number>(0);
    const [questionAttempts, setQuestionAttempts] = useState<QuestionAttempt[]>([]);
    const [startTime, setStartTime] = useState<number>(Date.now());
    const [questionTracker, setQuestionTracker] = useState<Set<number>>(new Set());

    // Placeholder gamification
    const [experienceGained, setExperienceGained] = useState(0);
    const [levelProgress, setLevelProgress] = useState({ current: 15, next: 16, xp: 2750, required: 3000 });
    const [achievements, setAchievements] = useState<{ title: string; description: string; icon: string }[]>([]);
    const [streakDays, setStreakDays] = useState(7);

    // Load from localStorage after mount if available
    useEffect(() => {
        const storedQuestion = getStorageValue(`quiz_${quiz.id}_current`, 0);
        const storedAnswers = getStorageValue(`quiz_${quiz.id}_answers`, []);
        const storedResults = getStorageValue(`quiz_${quiz.id}_results`, false);
        const storedScore = getStorageValue(`quiz_${quiz.id}_score`, 0);

        // Set state with stored values
        setCurrentQuestion(storedQuestion);
        setSelectedAnswers(storedAnswers);
        setShowResults(storedResults);
        setScore(storedScore);
    }, [quiz.id]);

    // Save state to localStorage whenever it changes
    useEffect(() => {
    if (typeof window !== 'undefined') { // Check if window is defined
        localStorage.setItem(`quiz_${quiz.id}_current`, JSON.stringify(currentQuestion));
        localStorage.setItem(`quiz_${quiz.id}_answers`, JSON.stringify(selectedAnswers));
        localStorage.setItem(`quiz_${quiz.id}_results`, JSON.stringify(showResults));
        localStorage.setItem(`quiz_${quiz.id}_score`, JSON.stringify(score));
    }
    }, [quiz.id, currentQuestion, selectedAnswers, showResults, score]);

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
        localStorage.removeItem(`quiz_${quiz.id}_current`);
        localStorage.removeItem(`quiz_${quiz.id}_answers`);
        localStorage.removeItem(`quiz_${quiz.id}_results`);
        localStorage.removeItem(`quiz_${quiz.id}_score`);
    };

    // handle answer selection, update selectedAnswers state
    const handleAnswer = (questionIndex: number, answer: string) => {
        const newAnswers = [...selectedAnswers];
        const question = quiz.questions[questionIndex];
        
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

        if (currentQuestion < quiz.questions.length - 1) {
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
        const question = quiz.questions[questionIndex];
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

    // calculate score and show results
    const calculateResults = async () => {
        console.log(quiz._id);
        let newScore = 0; // initialize score
        // loop through questions and compare selected answers with correct answers
        quiz.questions.forEach((question, index) => {
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
        const difficultyMultiplier = quiz.difficulty === 'expert' ? 2.5 : 
                                    quiz.difficulty === 'intermediate' ? 1.5 : 1;
        const accuracyBonus = (newScore / quiz.questions.length) * 50;
        const xpGained = Math.round((baseXP + accuracyBonus) * difficultyMultiplier);
        
        // Check for achievements
        const newAchievements = [];
        if (newScore === quiz.questions.length) {
            newAchievements.push({
                title: "Perfect Score!",
                description: "Answer all questions correctly",
                icon: "🏆"
            });
        }
        if (newScore >= quiz.questions.length * 0.8) {
            newAchievements.push({
                title: "Quiz Master",
                description: "Score 80% or higher",
                icon: "🎯"
            });
        }

        // Score-based confetti
        if (newScore === quiz.questions.length) {
            // Perfect score
            triggerPerfectScoreConfetti();
        } else if (newScore >= quiz.questions.length * 0.75) {
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
                quizId: quiz._id, 
                score: newScore,
                totalQuestions: quiz.questions.length,
                questionAttempts: questionAttempts, 
                category: quiz.category 
            };

            // Add debug logging
            console.log('Submitting result with userId:', user?._id);

            // Validate required fields
            if (!user?._id) {
                console.error('Missing userId:', userId + " no user ID found");
                throw new Error('No userId provided');
            }

            // Debug for checking result data
            console.log('Submitting result:', resultData);

            const response = await fetch('http://localhost:8070/api/results', {
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

            // Add experience based on score and difficulty
            const gamificationResponse = await GamificationService.addExperience(
                userId, 
                xpGained, 
                quiz.category
            );
            
            // Update streak (category specific or generalised streak)
            const streakResponse = await GamificationService.updateStreak(
                userId, 
                quiz.category
            );

            // Check achievements
            if (newScore === quiz.questions.length) {
                try {
                    const achievementResponse = await GamificationService.awardAchievement(
                        userId, 
                        'perfect_score_achievement'
                    );
                    
                    if (achievementResponse.level_up) {
                        triggerLevelUpConfetti();
                        // Display level up message
                        setLevelProgress({
                            current: achievementResponse.new_level,
                            next: achievementResponse.new_level + 1,
                            xp: gamificationResponse.new_xp,
                            required: (achievementResponse.new_level + 1) * 500
                        });
                    }
                } catch (error) {
                    console.error('Error awarding achievement:', error);
                }
            }

            // Update state gamification results
            setLevelProgress({
                current: gamificationResponse.level,
                next: gamificationResponse.level + 1,
                xp: gamificationResponse.xp,
                required: (gamificationResponse.level + 1) * 500
            });

            if (gamificationResponse.level_up) {
                triggerLevelUpConfetti();
            }

            if(streakResponse.current_streak % 7 === 0){
                triggerStreakConfetti();
                setStreakDays(streakResponse.current_streak);
            }
        } catch (error) {
            console.error('Error updating gamification data:', error);
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
            quiz,
            startTime,
            questionTracker,
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
            

            // Add more handlers here as I need
        }
    };
};
