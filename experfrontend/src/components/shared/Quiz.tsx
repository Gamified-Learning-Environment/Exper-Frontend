'use client';

import { useState, useEffect } from 'react'; // React hooks
import { Button } from '../ui/button'; // Button component
import { Card } from '../ui/card'; // Card component
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'; // Radio Form components from shadcn-ui
import { Progress } from '../ui/progress'; // Progress Bar component from shadcn-ui

interface QuizQuestion { // QuizQuestion interface
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
}

interface Quiz { // Quiz interface
    id: string;
    title: string;
    description: string;
    questions: QuizQuestion[];
}

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

export default function Quiz({ quiz }: { quiz: Quiz}) { // Quiz type defined in types/quiz.ts
    // State variables to keep track of current question, selected answers, show results and score
    // Initialized with default values
    const [currentQuestion, setCurrentQuestion] = useState<number>(0); 
    const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
    const [showResults, setShowResults] = useState<boolean>(false);
    const [score, setScore] = useState<number>(0);

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

    // handle previous question, update currentQuestion state
    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };


    // calculate score and show results
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

    return ( // Quiz component UI
        <Card className="p-6 max-w-2x1 mx-auto">
            {!showResults ? ( // Show quiz questions if results are not shown
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold mb-4">
                            Question {currentQuestion + 1} of {quiz.questions.length}
                        </h2>
                        {/* Reset quiz button */}
                        <Button onClick={resetQuiz} variant="outline" size="sm">
                            Reset Quiz
                        </Button>
                    </div>
                    {/* Progress bar */}
                    <Progress 
                        value={(currentQuestion) / (quiz.questions.length - 1) * 100} 
                        className="mb-4" 
                    />
                    
                    <p className='mb-4'>{quiz.questions[currentQuestion].question}</p>

                    {/* Radio group for options */}
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

                    {/* Question navigation button */}
                    <div className="flex justify-between mt-4">
                        <Button 
                            onClick={handlePrevious}
                            disabled={currentQuestion === 0}
                            variant="outline"
                        >
                            Previous
                        </Button>
                        <Button onClick={handleNext}>
                            {currentQuestion < quiz.questions.length - 1 ? 'Next' : 'Finish'}
                        </Button>
                    </div>
                </div>
            ) : ( // Show quiz results if results are shown
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold mb-4">Quiz Results</h2>
                        {/* Retake quiz button */}
                        <Button onClick={resetQuiz} variant="outline" size="sm">
                            Retake Quiz
                        </Button>
                    </div>
                    {/* Score display */}
                    <p>Your score: {score} / {quiz.questions.length}</p>
                    
                    {/* Questions and answers */}
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