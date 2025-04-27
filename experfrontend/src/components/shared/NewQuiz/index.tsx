'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'; // Radio Form components from shadcn-ui
import { Progress } from '@/components/ui/progress'; // Progress Bar component from shadcn-ui
import { PerformanceTimeline } from './components/PerformanceTimeline';
import { QuizProgressLine } from './components/QuizProgressLine';
import { ResultsBarChart } from './components/ResultsBarChart';
import { QuestionTypeBreakdown } from './components/QuestionTypeBreakdown';
import { WinLossRatioChart } from './components/WinLossRatioChart';
import { useQuiz } from './hooks/useQuiz';
import { QuizProps, QuizProgressLineProps, ResultsBarChartProps, QuestionTypeBreakdownProps } from './types';
import { useGamification } from '@/components/shared/GamificationNotification'; // Import the Gamification context
import { useEffect } from 'react';
import { QuizNavMap } from './components/QuizNavMap';
import QuestionAnim from '@/components/animations/QuestionAnim';
import { TimeAccuracyChart } from './components/TimeAccuracyChart';

export default function Quiz({ quiz }: QuizProps) {
    const {
        quizState,
        handlers
    } = useQuiz(quiz);

    // Store shuffled quiz in a variable for ease of use
    const shuffledQuiz = quizState.quiz;

    // Keep track of answered questions
    const answeredQuestions = new Set<number>();
    quizState.selectedAnswers.forEach((answer, index) => {
        if (answer) answeredQuestions.add(index);
    });

    return (
        <Card className="mx-auto bg-gradient-to-br from-indigo-50 to-purple-50 shadow-xl border-2 border-indigo-100">
            {!quizState.showResults ? ( // Show quiz questions if results are not shown
            <div className="flex flex-col lg:flex-row gap-4 p-6">
                {/* Main Quiz Content */}
                <div className="flex-1 space-y-6">
                    {/* Collapsible Nav Map for mobile - visible only on small screens */}
                    <div className="lg:hidden">
                        <details className="bg-white/80 p-4 rounded-xl shadow-md border-2 border-indigo-100">
                            <summary className="font-bold text-purple-800 cursor-pointer flex items-center gap-2">
                                <span>🗺️</span> Quest Map
                            </summary>
                            <div className="pt-4">
                                <QuizNavMap
                                    totalQuestions={shuffledQuiz.questions.length}
                                    currentQuestion={quizState.currentQuestion}
                                    answeredQuestions={answeredQuestions}
                                    flaggedQuestions={quizState.flaggedQuestions}
                                    onQuestionSelect={(index) => {
                                        handlers.setCurrentQuestion(index);
                                    }}
                                    onToggleFlag={(index) => {
                                        handlers.toggleFlagQuestion(index);
                                    }}
                                />
                            </div>
                        </details>
                    </div>




                    <div className="space-y-6 p-6">
                        {/* Question Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-3">
                            <div className="logo-container h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 flex items-center justify-center">
                                <QuestionAnim />
                            </div>
                                <h2 className="text-xl font-bold text-purple-800">
                                    Question {quizState.currentQuestion + 1} of {shuffledQuiz.questions.length}
                                </h2>
                                {shuffledQuiz.randomizeQuestions && (
                                    <span 
                                        className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 border border-blue-300"
                                        title="Questions are in random order"
                                    >
                                        🎲 Randomized
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                            {shuffledQuiz.useQuestionPool && (
                                <span 
                                    className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 border border-blue-300"
                                    title={`${shuffledQuiz.questions.length} questions selected from a pool of ${quiz.questions.length}`}
                                >
                                    🎯 Pool: {shuffledQuiz.questions.length} of {quiz.questions.length}
                                </span>
                            )}
                                {shuffledQuiz.aiModel && (
                                    <div className="flex justify-center">
                                        <span 
                                        className={`px-3 py-1 text-xs font-medium rounded-full 
                                            ${shuffledQuiz.aiModel === 'gpt' 
                                            ? 'bg-green-100 text-green-700 border border-green-300' 
                                            : shuffledQuiz.aiModel === 'claude'
                                                ? 'bg-purple-100 text-purple-700 border border-purple-300'
                                                : 'bg-blue-100 text-blue-700 border border-blue-300'}`}
                                        >
                                        Generated by {
                                            shuffledQuiz.aiModel === 'gpt' 
                                            ? '🤖 GPT-3.5' 
                                            : shuffledQuiz.aiModel === 'claude' 
                                                ? '🧠 Claude AI' 
                                                : '🌟 Gemini AI'
                                        }
                                        </span>
                                    </div>
                                )}
                                <Button 
                                    onClick={handlers.resetQuiz} 
                                    variant="outline" 
                                    size="sm"
                                    className="border-2 border-purple-200 hover:bg-purple-100"
                                >
                                    Reset Quiz 🔄
                                </Button>
                            </div>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="space-y-2">    
                            <Progress 
                                value={(quizState.currentQuestion) / (shuffledQuiz.questions.length - 1) * 100} 
                                className="h-3 bg-purple-100" 
                            />
                        </div>

                        {/* Question Content */}
                        <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
                            <p className='text-lg font-medium text-purple-900'>
                                {shuffledQuiz.questions[quizState.currentQuestion].question}
                            </p>

                            {/* Question image */}
                            {shuffledQuiz.questions[quizState.currentQuestion].imageUrl && (
                                <div className="relative group my-6 max-w-[50%] mx-auto"> 
                                    <div className="overflow-hidden rounded-xl border-2 border-purple-200 shadow-md transition-all duration-300 hover:shadow-lg">
                                        <div className="relative aspect-video bg-purple-50">
                                            <img
                                                src={shuffledQuiz.questions[quizState.currentQuestion].imageUrl}
                                                alt="Question image"
                                                className="absolute inset-0 w-full h-full object-contain p-2"
                                            />
                                            {/* Gradient overlay on hover */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </div>
                                        
                                        {/* Image caption/zoom hint */}
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
                            {shuffledQuiz.questions[quizState.currentQuestion].isMultiAnswer ? (
                                <div className="space-y-3">
                                    {shuffledQuiz.questions[quizState.currentQuestion].options.map((option, index) => {
                                        const currentAnswers = Array.isArray(quizState.selectedAnswers[quizState.currentQuestion])
                                            ? quizState.selectedAnswers[quizState.currentQuestion] as string[]
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
                                                        onChange={() => handlers.handleAnswer(quizState.currentQuestion, option)}
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
                                    onValueChange={(value) => handlers.handleAnswer(quizState.currentQuestion, value)}
                                    value={quizState.selectedAnswers[quizState.currentQuestion] as string}>

                                    {shuffledQuiz.questions[quizState.currentQuestion].options.map((option, index) => (
                                        <div 
                                            key={index} 
                                            className={`
                                                relative overflow-hidden rounded-lg border-2 transition-all
                                                ${quizState.selectedAnswers[quizState.currentQuestion] === option 
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
                                onClick={handlers.handlePrevious}
                                disabled={quizState.currentQuestion === 0}
                                variant="outline"
                                className="w-1/2 border-2 border-indigo-200 hover:bg-indigo-100"
                            >
                                ← Previous
                            </Button>
                            <Button 
                                onClick={handlers.handleNext}
                                className="w-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
                            >
                                {quizState.currentQuestion < shuffledQuiz.questions.length - 1 ? 'Next →' : 'Finish! 🎉'}
                            </Button>
                        </div>
                    </div>
                </div>
                {/* Quiz Nav Map - shown on large screens as sidebar */}
                <div className="hidden lg:block w-72 sticky top-20 self-start">
                    <QuizNavMap
                        totalQuestions={shuffledQuiz.questions.length}
                        currentQuestion={quizState.currentQuestion}
                        answeredQuestions={answeredQuestions}
                        flaggedQuestions={quizState.flaggedQuestions}
                        onQuestionSelect={(index) => {
                            // Navigate to the question
                            handlers.setCurrentQuestion(index);
                        }}
                        onToggleFlag={(index) => {
                            handlers.toggleFlagQuestion(index);
                        }}
                    />
                </div>
            </div>
            ) : ( // Show quiz results if results are shown
                <div className="p-6 space-y-6">
                    {/* Results Header */}
                    <div className="text-center space-y-4">
                        <h2 className="text-2xl font-bold text-purple-800">Quiz Complete! 🎉</h2>
                        {shuffledQuiz.aiModel && (
                            <div className="flex justify-center">
                            <span 
                                className={`px-3 py-1 text-xs font-medium rounded-full 
                                ${shuffledQuiz.aiModel === 'gpt' 
                                    ? 'bg-green-100 text-green-700 border border-green-300' 
                                    : 'bg-purple-100 text-purple-700 border border-purple-300'}`}
                            >
                                Generated by {shuffledQuiz.aiModel === 'gpt' ? '🤖 GPT-3.5' : '🧠 Claude AI'}
                            </span>
                            </div>
                        )}
                        
                        <div className="flex justify-center items-center gap-2">
                            <span className="text-4xl">
                            {quizState.score === shuffledQuiz.questions.length ? '🏆' : quizState.score >= shuffledQuiz.questions.length / 2 ? '🌟' : '💫'}
                            </span>
                            <p className="text-xl font-semibold">
                            Your Score: {quizState.score} / {shuffledQuiz.questions.length}
                            <span className="text-sm text-purple-600 block">
                                ({Math.round((quizState.score / shuffledQuiz.questions.length) * 100)}%)
                            </span>
                            </p>
                        </div>
                        <Button 
                            onClick={handlers.resetQuiz} 
                            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-800 hover:to-emerald-800"
                        >
                            Try Again 🔄
                        </Button>
                    </div>
                    

                    {/* Gamification elements */}
                    {quizState.showResults && (
                        <div className="mt-6 space-y-6">
                        {/* XP Gained */}
                        <div className="p-4 bg-purple-100 rounded-lg">
                            <h4 className="font-bold">Experience Gained</h4>
                            <div className="text-3xl font-bold text-purple-700">+{quizState.experienceGained} XP</div>
                        </div>
                        
                        {/* Level Progress */}
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                            <span>Level {quizState.levelProgress.current}</span>
                            <span>Level {quizState.levelProgress.next}</span>
                            </div>
                            <Progress 
                            value={(quizState.levelProgress.xp / quizState.levelProgress.required) * 100} 
                            className="h-3 bg-purple-100" 
                            />
                        </div>
                        
                        {/* Achievements */}
                        {quizState.achievements.length > 0 && (
                            <div className="space-y-2">
                            <h4 className="font-bold">Achievements Unlocked</h4>
                            <div className="grid grid-cols-1 gap-2">
                                {quizState.achievements.map((achievement, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                                    <div className="text-2xl">{achievement.icon}</div>
                                    <div>
                                    <div className="font-bold">{achievement.title}</div>
                                    <div className="text-sm">{achievement.description}</div>
                                    </div>
                                </div>
                                ))}
                            </div>
                            </div>
                        )}
                        </div>
                    )}

                    {/* Progress Analytics - Row 1*/}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Question Progress */}
                        <div className="bg-white p-4 rounded-xl shadow-md">
                            <h3 className="text-lg font-bold text-purple-800 mb-4">Time-Accuracy Analysis</h3>
                            <TimeAccuracyChart attempts={quizState.questionAttempts} />
                            <p className="text-sm text-gray-600 mt-2 text-center">
                                See how your timing affects answer accuracy
                            </p>
                        </div>

                        {/* Answer Distribution */}
                        <div className="bg-white p-4 rounded-xl shadow-md">
                            <h3 className="text-lg font-bold text-purple-800 mb-4">Answer Distribution</h3>
                            <ResultsBarChart 
                            correct={quizState.score} 
                            incorrect={shuffledQuiz.questions.length - quizState.score} 
                            />
                            <p className="text-sm text-gray-600 mt-2 text-center">
                            Correct vs Incorrect Answers
                            </p>
                        </div>
                    </div>

                    {/* Progress Analytics - Row 2*/}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Question Types */}

                        {/* Win/loss Ratio */}
                        <div className="bg-white p-4 rounded-xl shadow-md">
                            <h3 className="text-lg font-bold text-purple-800 mb-4">
                                Win/Loss Ratio
                            </h3>
                            <WinLossRatioChart 
                                score={quizState.score}
                                totalQuestions={shuffledQuiz.questions.length}
                                winThreshold={75}
                                lossThreshold={40}
                            />
                            <p className="text-sm text-gray-600 mt-2 text-center">
                                75%+ is a win, below 40% is a loss
                            </p>
                        </div>

                        {/* Performance Timeline */}
                        <div className="bg-white p-4 rounded-xl shadow-md">
                            <h3 className="text-lg font-bold text-purple-800 mb-4">
                                Performance Timeline
                            </h3>
                            <PerformanceTimeline attempts={quizState.questionAttempts} />
                            <p className="text-sm text-gray-600 mt-2 text-center">
                                Watch your progress unfold through each question
                            </p>
                        </div>
                    </div>

                    {/* Results List */}
                    <div className="space-y-4">
                        {shuffledQuiz.questions.map((question, index) => (
                            <div key={index} 
                                className={`p-4 rounded-lg border-2 ${
                                    question.isMultiAnswer 
                                        ? (Array.isArray(quizState.selectedAnswers[index]) && 
                                        Array.isArray(question.correctAnswer) &&
                                        question.correctAnswer.length === quizState.selectedAnswers[index].length &&
                                        question.correctAnswer.every(ans => quizState.selectedAnswers[index].includes(ans)))
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-red-50 border-red-200'
                                        : quizState.selectedAnswers[index] === question.correctAnswer
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-red-50 border-red-200'
                                }`}>

                                {/* Question Display */}
                                <div className="mb-2 flex items-center gap-2">
                                    <span>{question.isMultiAnswer 
                                        ? (Array.isArray(quizState.selectedAnswers[index]) &&
                                            Array.isArray(question.correctAnswer) &&
                                            question.correctAnswer.length === quizState.selectedAnswers[index].length &&
                                            question.correctAnswer.every(ans => quizState.selectedAnswers[index].includes(ans)))
                                            ? '✅' 
                                            : '❌'
                                        : quizState.selectedAnswers[index] === question.correctAnswer
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
                                        ? (Array.isArray(quizState.selectedAnswers[index]) &&
                                        Array.isArray(question.correctAnswer) &&
                                        question.correctAnswer.length === quizState.selectedAnswers[index].length &&
                                        question.correctAnswer.every(ans => quizState.selectedAnswers[index].includes(ans)))
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                        : quizState.selectedAnswers[index] === question.correctAnswer
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                    }>
                                        <span className="font-medium">Your answer(s):</span>{' '}
                                        {Array.isArray(quizState.selectedAnswers[index])
                                            ? quizState.selectedAnswers[index].join(', ')
                                            : quizState.selectedAnswers[index]}
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

