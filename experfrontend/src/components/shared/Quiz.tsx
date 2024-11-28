'use client';

import { useState } from 'react'; // React hooks
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

export default function Quiz({ quiz }: { quiz: Quiz}) { // Quiz type defined in types/quiz.ts
    // State variables to keep track of current question, selected answers and show results
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);

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
                <div className='space-y-6'>
                    <h2 className='text-xl font-bold mb-4'>
                        Question {currentQuestion + 1} of {quiz.questions.length}
                    </h2>
                    <Progress value={(currentQuestion + 1) / quiz.questions.length * 100} className='mb-4' />
                    
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
                <div className='space-y-4'>
                    <h2 className='text-xl font-bold mb-4'> Quiz Results</h2>
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
