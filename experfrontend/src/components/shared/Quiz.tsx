'use client';

import { useState, useEffect, useRef } from 'react'; // React hooks
import { Button } from '../ui/button'; // Button component
import { Card } from '../ui/card'; // Card component
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'; // Radio Form components from shadcn-ui
import { Progress } from '../ui/progress'; // Progress Bar component from shadcn-ui
import { useAuth } from '@/contexts/auth.context';
import * as d3 from 'd3'; // D3 library for data visualization

interface QuizQuestion { // QuizQuestion interface
    id: string;
    question: string;
    options: string[];
    correctAnswer: string | string[]; // Can be a single string or an array of strings
    imageUrl?: string;
    isMultiAnswer?: boolean; // Multiple answer question flag
    explanation?: string;
}

interface Quiz { // Quiz interface
    id: string;
    title: string;
    description: string;
    questions: QuizQuestion[];
    difficulty: 'beginner' | 'intermediate' | 'expert';
    userId? : string;
}

interface QuestionAttempt {
    questionIndex: number;
    timeSpent: number;
    isCorrect: boolean;
}

interface ProgressData {
    attempts: QuestionAttempt[];
    correctCount: number;
    incorrectCount: number;
}

// QuizProgressLine component for showing time spent and correct/incorrect answers
const QuizProgressLine = ({ attempts }: { attempts: QuestionAttempt[] }) => {
    const chartRef = useRef<SVGSVGElement>(null); // Ref to SVG element for D3 chart rendering

    useEffect(() => {
        if (!chartRef.current || attempts.length === 0) return; // Skip if chartRef is not set or no attempts

        // clear previous chart
        d3.select(chartRef.current).selectAll('*').remove();

        // set dimensions
        const margin = { top: 20, right: 50, bottom: 40, left: 50 };
        const width = 600 - margin.left - margin.right;
        const height = 200 - margin.top - margin.bottom;

        // create SVG container
        const svg = d3.select(chartRef.current)
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g') // Append group element
            .attr('transform', `translate(${margin.left},${margin.top})`); // Translate group to margin

        // Create scales
        const xScale = d3.scaleLinear()
            .domain([0, attempts.length - 1]) // Domain from 0 to number of attempts
            .range([0, width]); // Range from 0 to width

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(attempts, d => d.timeSpent) || 0]) // Domain from 0 to max timeSpent
            .range([height, 0]); // Range from height to 0

        // Create line for time spent
        const line = d3.line<QuestionAttempt>()
            .x(d => xScale(d.questionIndex)) // set x position based on questionIndex scaled by xScale
            .y(d => yScale(d.timeSpent)) // set y position based on timeSpent scaled by yScale
            .curve(d3.curveMonotoneX); // smooth line curve for better visuals

        // Add axes
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).ticks(attempts.length))
            .append('text')
            .attr('x', width / 2)
            .attr('y', 35)
            .attr('fill', 'currentColor')
            .attr('text-anchor', 'middle')
            .text('Question Number');

        svg.append('g')
            .call(d3.axisLeft(yScale))
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -40)
            .attr('x', -height / 2)
            .attr('fill', 'currentColor')
            .attr('text-anchor', 'middle')
            .text('Time Spent (seconds)');

        // add path with gradient
        const gradient = svg.append('linearGradient')
            .attr('id', 'line-gradient')
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('x1', 0)
            .attr('y1', yScale(d3.min(attempts, d => d.timeSpent) || 0))
            .attr('x2', 0)
            .attr('y2', yScale(d3.max(attempts, d => d.timeSpent) || 0));

        // Add gradient stops
        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', 'rgb(147, 51, 234)');

        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', 'rgb(79, 70, 229)');

        // Add path for line
        svg.append('path')
            .datum(attempts)
            .attr('fill', 'none')
            .attr('stroke', 'url(#line-gradient)')
            .attr('stroke-width', 2)
            .attr('d', line);

        // Add points and performance indicators
        const points = svg.selectAll('g.point')
            .data(attempts)
            .enter()
            .append('g')
            .attr('class', 'point')
            .attr('transform', d => `translate(${xScale(d.questionIndex)},${yScale(d.timeSpent)})`);

        // Add circles for each point
        points.append('circle')
            .attr('r', 6)
            .attr('fill', d => d.isCorrect ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)')
            .attr('stroke', 'white')
            .attr('stroke-width', 2);

        // Add performance trend arrows
        attempts.forEach((attempt, i) => {
            if (i > 0) {
                const prev = attempts[i - 1];
                const x1 = xScale(prev.questionIndex);
                const y1 = yScale(prev.timeSpent);
                const x2 = xScale(attempt.questionIndex);
                const y2 = yScale(attempt.timeSpent);

                // Draw trend arrow
                svg.append('path')
                    .attr('d', `M${x2},${y2 - 15}v-10`)
                    .attr('stroke', y2 < y1 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)')
                    .attr('stroke-width', 2)
                    .attr('marker-end', 'url(#arrow)');
            }
        });

        // Add arrow marker definition
        svg.append('defs').append('marker')
            .attr('id', 'arrow')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 5)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', 'rgb(107, 114, 128)');

        // Add tooltip for points
        points.append('title')
            .text(d => `Question ${d.questionIndex + 1} Time: ${d.timeSpent.toFixed(1)}s ${d.isCorrect ? '✓ Correct' : '✗ Incorrect'}`);
    }, [attempts]);

    return <svg ref={chartRef} className="w-full h-[200px] bg-white rounded-lg shadow-md" />;
};

// ResultsBarChart component for showing correct vs incorrect answers
const ResultsBarChart = ({ correct, incorrect}: { correct: number; incorrect: number }) => {
    const chartRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!chartRef.current) return;

        // Clear previous chart
        d3.select(chartRef.current).selectAll('*').remove();

        // Set dimensions
        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const width = 300 - margin.left - margin.right;
        const height = 200 - margin.top - margin.bottom;

        // Create SVG container
        const svg = d3.select(chartRef.current)
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const data = [
            { label: 'Correct', value: correct },
            { label: 'Incorrect', value: incorrect }
        ];

        // Create scales
        const xScale = d3.scaleBand()
            .range([0, width])
            .padding(0.3)
            .domain(data.map(d => d.label));

        const yScale = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(data, d => d.value) || 0]);

        // Add bars
        svg.selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('x', d => xScale(d.label) || 0)
            .attr('y', d => yScale(d.value))
            .attr('width', xScale.bandwidth())
            .attr('height', d => height - yScale(d.value))
            .attr('fill', d => d.label === 'Correct' ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)');

        // Add axes
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale));

        svg.append('g')
            .call(d3.axisLeft(yScale));
    }, [correct, incorrect]);

    return <svg ref={chartRef} className="w-full h-[200px] bg-white rounded-lg shadow-md" />;
};

// utility function for safe localstorage access in SSR
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

export default function Quiz({ quiz }: { quiz: Quiz }) { // Quiz type defined in types/quiz.ts
    // State variables to keep track of current question, selected answers, show results and score
    // Initialized with default values
    const { user } = useAuth();
    const [currentQuestion, setCurrentQuestion] = useState<number>(0); 
    const [selectedAnswers, setSelectedAnswers] = useState<(string | string[])[]>(
        new Array(quiz.questions.length).fill(undefined)
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
                questionAttempts: questionAttempts 
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
    };          

    return ( // Quiz component UI
        <Card className="mx-auto bg-gradient-to-br from-indigo-50 to-purple-50 shadow-xl border-2 border-indigo-100">
            {!showResults ? ( // Show quiz questions if results are not shown
                <div className="space-y-6 p-6">
                    {/* Question Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">❓</span>
                        <h2 className="text-xl font-bold text-purple-800">
                        Question {currentQuestion + 1} of {quiz.questions.length}
                        </h2>
                    </div>
                    <Button 
                        onClick={resetQuiz} 
                        variant="outline" 
                        size="sm"
                        className="border-2 border-purple-200 hover:bg-purple-100"
                    >
                        Reset Quiz 🔄
                    </Button>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="space-y-2">    
                        <Progress 
                            value={(currentQuestion) / (quiz.questions.length - 1) * 100} 
                            className="h-3 bg-purple-100" 
                        />
                    </div>

                    {/* Question Content */}
                    <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
                        <p className='text-lg font-medium text-purple-900'>
                            {quiz.questions[currentQuestion].question}
                        </p>

                        {/* Question image */}
                        {quiz.questions[currentQuestion].imageUrl && (
                            <div className="relative group my-6 max-w-[50%] mx-auto"> {/* Added max-w-[50%] and mx-auto */}
                                <div className="overflow-hidden rounded-xl border-2 border-purple-200 shadow-md transition-all duration-300 hover:shadow-lg">
                                    <div className="relative aspect-video bg-purple-50">
                                        <img
                                            src={quiz.questions[currentQuestion].imageUrl}
                                            alt="Question image"
                                            className="absolute inset-0 w-full h-full object-contain p-2"
                                        />
                                        {/* Gradient overlay on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                    
                                    {/* Optional image caption/zoom hint */}
                                    <div className="absolute bottom-2 left-2 right-2 text-center text-sm text-purple-600 bg-white/90 px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            Hover to examine
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Options */}
                        {/* Render either radio group or checkbox group based on question type */}
                        {quiz.questions[currentQuestion].isMultiAnswer ? (
                            <div className="space-y-3">
                                {quiz.questions[currentQuestion].options.map((option, index) => {
                                    const currentAnswers = Array.isArray(selectedAnswers[currentQuestion])
                                        ? selectedAnswers[currentQuestion] as string[]
                                        : [];
                                    
                                    return (
                                        <div key={index} 
                                            className={`relative rounded-lg border-2 transition-all
                                                ${currentAnswers.includes(option)
                                                    ? 'border-purple-500 bg-purple-50'
                                                    : 'border-gray-200 hover:border-purple-200 bg-white'}`}>
                                            <label className="flex items-center p-4 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={currentAnswers.includes(option)}
                                                    onChange={() => handleAnswer(currentQuestion, option)}
                                                    className="w-4 h-4 rounded border-gray-300 text-purple-600 
                                                            focus:ring-purple-500"
                                                />
                                                <div className="flex items-center gap-3 ml-3">
                                                    <span className={`w-6 h-6 rounded-full flex items-center 
                                                                justify-center text-white text-sm
                                                        ${index === 0 ? 'bg-red-400' : 
                                                        index === 1 ? 'bg-blue-400' : 
                                                        index === 2 ? 'bg-yellow-400' : 'bg-green-400'}`}>
                                                        {String.fromCharCode(65 + index)}
                                                    </span>
                                                    <span className="text-gray-700">{option}</span>
                                                </div>
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <RadioGroup
                                onValueChange={(value) => handleAnswer(currentQuestion, value)}
                                value={selectedAnswers[currentQuestion] as string}>

                                {quiz.questions[currentQuestion].options.map((option, index) => (
                                    <div 
                                        key={index} 
                                        className={`
                                            relative overflow-hidden rounded-lg border-2 transition-all
                                            ${selectedAnswers[currentQuestion] === option 
                                            ? 'border-purple-500 bg-purple-50' 
                                            : 'border-gray-200 hover:border-purple-200 bg-white'}
                                        `}>
                                        <label className="flex items-center p-4 cursor-pointer group">
                                            <RadioGroupItem 
                                                value={option} 
                                                id={`option-${index}`}
                                                className="text-purple-600"
                                            />
                                            <div className="flex items-center gap-3 ml-3">
                                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm
                                                    ${index === 0 ? 'bg-red-400' : 
                                                    index === 1 ? 'bg-blue-400' : 
                                                    index === 2 ? 'bg-yellow-400' : 'bg-green-400'
                                                    }`}
                                                >
                                                    {String.fromCharCode(65 + index)} {/* Converts 0,1,2,3 to A,B,C,D */}
                                                </span>
                                                <span className="text-gray-700 group-hover:text-gray-900">{option}</span>
                                            </div>
                                        </label>
                                    </div>
                                ))}
                            </RadioGroup>
                        )}
                    </div>

                    {/* Question navigation button */}
                    <div className="flex justify-between gap-4 pt-4">
                        <Button 
                            onClick={handlePrevious}
                            disabled={currentQuestion === 0}
                            variant="outline"
                            className="w-1/2 border-2 border-indigo-200 hover:bg-indigo-100"
                        >
                           ← Previous
                        </Button>
                        <Button 
                            onClick={handleNext}
                            className="w-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
                        >
                            {currentQuestion < quiz.questions.length - 1 ? 'Next →' : 'Finish! 🎉'}
                        </Button>
                    </div>
                </div>
            ) : ( // Show quiz results if results are shown
                <div className="p-6 space-y-6">
                    {/* Results Header */}
                    <div className="text-center space-y-4">
                        <h2 className="text-2xl font-bold text-purple-800">Quiz Complete! 🎉</h2>
                        <div className="flex justify-center items-center gap-2">
                            <span className="text-4xl">
                            {score === quiz.questions.length ? '🏆' : score >= quiz.questions.length / 2 ? '🌟' : '💫'}
                            </span>
                            <p className="text-xl font-semibold">
                            Your Score: {score} / {quiz.questions.length}
                            <span className="text-sm text-purple-600 block">
                                ({Math.round((score / quiz.questions.length) * 100)}%)
                            </span>
                            </p>
                        </div>
                        <Button 
                            onClick={resetQuiz} 
                            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-800 hover:to-emerald-800"
                        >
                            Try Again 🔄
                        </Button>
                    </div>
                    {/* XP Gained Animation */}
                    <div className="text-center animate-bounce">
                        <span className="text-2xl font-bold text-yellow-500">+{experienceGained} XP</span>
                    </div>

                    {/* Level Progress */}
                    <div className="bg-white p-4 rounded-xl shadow-md space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-purple-700 font-semibold">Level {levelProgress.current}</span>
                            <span className="text-purple-700 font-semibold">Level {levelProgress.next}</span>
                        </div>
                        <Progress 
                            value={(levelProgress.xp + experienceGained) / levelProgress.required * 100}
                            className="h-3"
                        />
                        <p className="text-sm text-center text-gray-600">
                            {levelProgress.xp + experienceGained} / {levelProgress.required} XP
                        </p>
                    </div>

                    {/* Achievements Unlocked */}
                    {achievements.length > 0 && (
                        <div className="bg-white p-4 rounded-xl shadow-md space-y-3">
                            <h3 className="text-lg font-bold text-purple-800 flex items-center gap-2">
                                <span>🎉</span> Achievements Unlocked!
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {achievements.map((achievement, index) => (
                                    <div key={index} 
                                        className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg border-2 border-purple-200">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">{achievement.icon}</span>
                                            <div>
                                                <p className="font-semibold text-purple-900">{achievement.title}</p>
                                                <p className="text-sm text-purple-600">{achievement.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Streak Progress */}
                    <div className="bg-white p-4 rounded-xl shadow-md">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">🔥</span>
                                <div>
                                    <p className="font-semibold text-purple-900">{streakDays} Day Streak</p>
                                    <p className="text-sm text-purple-600">Keep it up!</p>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                {[...Array(7)].map((_, i) => (
                                    <div 
                                        key={i}
                                        className={`w-3 h-8 rounded-full ${
                                            i < streakDays ? 'bg-gradient-to-t from-orange-500 to-yellow-500' 
                                            : 'bg-gray-200'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-xl shadow-md">
                        <h3 className="text-lg font-bold text-purple-800 mb-4">Question Progress</h3>
                        <QuizProgressLine attempts={questionAttempts} />
                        <p className="text-sm text-gray-600 mt-2 text-center">
                        Time spent on each question (dots color indicates correct/incorrect)
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-md">
                        <h3 className="text-lg font-bold text-purple-800 mb-4">Answer Distribution</h3>
                        <ResultsBarChart 
                        correct={score} 
                        incorrect={quiz.questions.length - score} 
                        />
                        <p className="text-sm text-gray-600 mt-2 text-center">
                        Correct vs Incorrect Answers
                        </p>
                    </div>
                    </div>

                    {/* Results List */}
                    <div className="space-y-4">
                        {quiz.questions.map((question, index) => (
                            <div key={index} 
                                className={`p-4 rounded-lg border-2 ${
                                    question.isMultiAnswer 
                                        ? (Array.isArray(selectedAnswers[index]) && 
                                        Array.isArray(question.correctAnswer) &&
                                        question.correctAnswer.length === selectedAnswers[index].length &&
                                        question.correctAnswer.every(ans => selectedAnswers[index].includes(ans)))
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-red-50 border-red-200'
                                        : selectedAnswers[index] === question.correctAnswer
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-red-50 border-red-200'
                                }`}>

                                {/* Question Display */}
                                <div className="mb-2 flex items-center gap-2">
                                    <span>{question.isMultiAnswer 
                                        ? (Array.isArray(selectedAnswers[index]) &&
                                            Array.isArray(question.correctAnswer) &&
                                            question.correctAnswer.length === selectedAnswers[index].length &&
                                            question.correctAnswer.every(ans => selectedAnswers[index].includes(ans)))
                                            ? '✅' 
                                            : '❌'
                                        : selectedAnswers[index] === question.correctAnswer
                                            ? '✅'
                                            : '❌'
                                    }</span>
                                    <p className="font-medium">{question.question}</p>
                                </div>

                                {/* Question Image */}
                                {question.imageUrl && (
                                    <div className="relative group my-2 max-w-[50%] mx-auto"> {/* Added max-w-[50%] and mx-auto */}
                                        <div className="overflow-hidden rounded-xl border-2 border-purple-200 shadow-md transition-transform duration-300 group-hover:scale-[1.02]">
                                            <div className="relative aspect-video bg-purple-50">
                                                <img
                                                    src={question.imageUrl}
                                                    alt={`Question ${index + 1} image`}
                                                    className="absolute inset-0 w-full h-full object-contain p-2"
                                                />
                                                {/* Gradient overlay on hover */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            </div>
                                        </div>
                                        {/* Optional image caption */}
                                        <div className="absolute bottom-2 left-2 right-2 text-center text-sm text-purple-600 bg-white/90 px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            Question {index + 1} Visual Reference
                                        </div>
                                    </div>
                                )}

                                {/* Answer Display */}
                                <div className="mt-2 space-y-1 text-sm">
                                    <p className="text-green-600">
                                        <span className="font-medium">Correct answer(s):</span>{' '}
                                        {Array.isArray(question.correctAnswer) 
                                            ? question.correctAnswer.join(', ')
                                            : question.correctAnswer}
                                    </p>
                                    <p className={question.isMultiAnswer
                                        ? (Array.isArray(selectedAnswers[index]) &&
                                        Array.isArray(question.correctAnswer) &&
                                        question.correctAnswer.length === selectedAnswers[index].length &&
                                        question.correctAnswer.every(ans => selectedAnswers[index].includes(ans)))
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                        : selectedAnswers[index] === question.correctAnswer
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                    }>
                                        <span className="font-medium">Your answer(s):</span>{' '}
                                        {Array.isArray(selectedAnswers[index])
                                            ? selectedAnswers[index].join(', ')
                                            : selectedAnswers[index]}
                                    </p>
                                </div>

                                {/* Explanation Display */}
                                {question.explanation && (
                                    <div className="mt-3 bg-blue-50 p-3 rounded-lg border border-blue-200">
                                        <p className="text-sm font-medium text-blue-800">
                                            <span className="mr-2">💡</span>
                                            Explanation:
                                        </p>
                                        <p className="text-sm text-blue-700 mt-1">
                                            {question.explanation}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Card>
    );
}