'use client';

import { useState, useEffect } from 'react'; // React hooks
import { Button } from '../ui/button'; // Button component
import { Card } from '../ui/card'; // Card component
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'; // Radio Form components from shadcn-ui
import { Progress } from '../ui/progress'; // Progress Bar component from shadcn-ui

interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
}

interface Quiz {
    id: string;
    title: string;
    description: string;
    questions: QuizQuestion[];
}

interface QuizState { // for quiz session storage
    currentQuestion: number;
    selectedAnswers: string[];
    showResults: boolean;
    score: number;
}

export default function Quiz({ quiz }: { quiz: Quiz}) { // Quiz type defined in types/quiz.ts
    // State variables to keep track of current question, selected answers and show results, 
    // usestate initialises state from localStorage / defaults
    const [currentQuestion, setCurrentQuestion] = useState(() => {
        const saved = localStorage.getItem(`quiz_${quiz.id}_current`);
        return saved ? parseInt(saved) : 0;
    });

    const [selectedAnswers, setSelectedAnswers] = useState<string[]>(() => {
        const saved = localStorage.getItem(`quiz_${quiz.id}_answers`);
        return saved ? JSON.parse(saved) : [];
    });

    const [showResults, setShowResults] = useState(() => {
        const saved = localStorage.getItem(`quiz_${quiz.id}_results`);
        return saved ? JSON.parse(saved) : false;
    });

    const [score, setScore] = useState(() => {
        const saved = localStorage.getItem(`quiz_${quiz.id}_score`);
        return saved ? parseInt(saved) : 0;
    });

    // Save state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(`quiz_${quiz.id}_current`, currentQuestion.toString());
        localStorage.setItem(`quiz_${quiz.id}_answers`, JSON.stringify(selectedAnswers));
        localStorage.setItem(`quiz_${quiz.id}_results`, JSON.stringify(showResults));
        localStorage.setItem(`quiz_${quiz.id}_score`, score.toString());
    }, [quiz.id, currentQuestion, selectedAnswers, showResults, score]);

    // Reset quiz state
    const resetQuiz = () => {
        setCurrentQuestion(0);
        setSelectedAnswers([]);
        setShowResults(false);
        setScore(0);
        // Clear localStorage for this quiz
        localStorage.removeItem(`quiz_${quiz.id}_current`);
        localStorage.removeItem(`quiz_${quiz.id}_answers`);
        localStorage.removeItem(`quiz_${quiz.id}_results`);
        localStorage.removeItem(`quiz_${quiz.id}_score`);
    };

    // handle answer selection, update selectedAnswers state
    const handleAnswer = (answer: string) => {
        const newAnswers = [...selectedAnswers];
        newAnswers[currentQuestion] = answer;
        setSelectedAnswers(newAnswers);
    };

    // handle next question, update currentQuestion state
    const handleNext = () => {
        if (currentQuestion < quiz.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            calculateResults();
        }
    };

    // calculate score
    const calculateResults = () => {
        let newScore = 0; // initialize score
        // loop through questions and compare selected answers with correct answers
        quiz.questions.forEach((question, index) => { 
            if (selectedAnswers[index] === question.correctAnswer) { // if selected answer is correct
                newScore++;
            }
        });
        setScore(newScore);
        setShowResults(true);
    };

    return (
        <Card className="p-6 max-w-2x1 mx-auto">
            {!showResults ? (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold mb-4">
                            Question {currentQuestion + 1} of {quiz.questions.length}
                        </h2>
                        <Button onClick={resetQuiz} variant="outline" size="sm">
                            Reset Quiz
                        </Button>
                    </div>
                    <Progress 
                        value={(currentQuestion + 1) / quiz.questions.length * 100} 
                        className="mb-4" 
                    />
                    
                    <p className='mb-4'>{quiz.questions[currentQuestion].question}</p>

                    <RadioGroup
                        onValueChange={handleAnswer}
                        value={selectedAnswers[currentQuestion]}
                        className='space-y-2'
                    >
                        {quiz.questions[currentQuestion].options.map((option, index) => (
                            <div key={index} className='flex items-center space-x-2'>
                                <RadioGroupItem value={option} id={`option-${index}`} />
                                <label htmlFor={`option-${index}`} className='cursor-pointer'>{option}</label>
                            </div>
                        ))}
                    </RadioGroup>

                    <Button onClick={handleNext} className='mt-4'>
                        {currentQuestion < quiz.questions.length - 1 ? 'Next' : 'Finish'}
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold mb-4">Quiz Results</h2>
                        <Button onClick={resetQuiz} variant="outline" size="sm">
                            Retake Quiz
                        </Button>
                    </div>
                    <p>Your score: {score} / {quiz.questions.length}</p>
                    
                    {quiz.questions.map((question, index) => (
                        <div key={index} className={`border p-4 rounded${selectedAnswers[index] === question.correctAnswer ? 'bg-green-300' : 'bg-red-300'}`}>
                            <p className="font-semibold">{question.question}</p>
                            <p className="text-green-600">Correct answer: {question.correctAnswer}</p>
                            <p className={`${
                                selectedAnswers[index] === question.correctAnswer 
                                    ? 'text-green-600' 
                                    : 'text-red-600'
                            }`}>
                                Your answer: {selectedAnswers[index]}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}
