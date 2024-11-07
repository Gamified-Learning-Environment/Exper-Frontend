'use client';

import { useState } from 'react'; // React hooks
import { Button } from '../ui/button'; // Button component
import { Card } from '../ui/card'; // Card component
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'; // Radio Form components from shadcn-ui


export default function Quiz({ quiz }: { quiz: Quiz}) { // Quiz type defined in types/quiz.ts
    // State variables to keep track of current question, selected answers and show results
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
    const [showResults, setShowResults] = useState(false);

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
            setShowResults(true);
        }
    };

    return (
        <Card className="p-6 max-w-2x1 mx-auto">
            {!showResults ? (
                <div>
                    <h2 className='text-xl font-bold mb-4'>
                        Question {currentQuestion + 1} of {quiz.questions.length}
                    </h2>
                    <p className='mb-4'>{quiz.questions[currentQuestion].question}</p>

                    <RadioGroup
                        onValueChange={handleAnswer}
                        value={selectedAnswers[currentQuestion]}
                    >
                        {quiz.questions[currentQuestion].options.map((option, index) => (
                            <div key={index} className='flex items-center space-x-2'>
                                <RadioGroupItem value={option} id={`option-${index}`} />
                                <label htmlFor={`option-${index}`}>{option}</label>
                            </div>
                        ))}
                    </RadioGroup>

                    <Button onClick={handleNext} className='mt-4'>
                        {currentQuestion < quiz.questions.length - 1 ? 'Next' : 'Finish'}
                    </Button>
                </div>
            ) : (
                <div>
                    <h2 className='text-xl font-bold mb-4'> Quiz Results</h2>
                    <ul>
                        {quiz.questions.map((question, index) => (
                            <li key={index} className='mb-4'>
                                <p className='font-bold'>{question.question}</p>
                                <p>Your answer: {selectedAnswers[index]}</p>
                                <p>Correct answer: {question.answer}</p>
                            </li>
                        ))}
                    </ul>
                </div>
                )}
        </Card>
    );
} 
