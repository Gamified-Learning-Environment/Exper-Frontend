'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/card';
import { useAuth } from '@/contexts/auth.context';
import { useRouter } from 'next/navigation';
import Quiz from './Quiz';

interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
  }
  
  interface QuizFormProps {
    onClose?: () => void;
  }

  export default function QuizForm({ onClose }: QuizFormProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState<QuizQuestion[]>([{id: '1', question: '', options: ['', '', '', ''], correctAnswer: ''}]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // ai integration
    const [useAI, setUseAI] = useState(false); // toggle AI use on/off
    const [notes, setNotes] = useState('');  // notes for AI
    const [parameters, setParameters] = useState(''); // parameters for AI
  
    const handleAddQuestion = () => {
      setQuestions([...questions, {
        id: (questions.length + 1).toString(),
        question: '',
        options: ['', '', '', ''],
        correctAnswer: ''
      }]);
    };

    const handleQuestionChange = (index: number, field: keyof QuizQuestion, value: string) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index] = {
          ...updatedQuestions[index],
          [field]: value
        };
        setQuestions(updatedQuestions);
      };
    
      const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].options[optionIndex] = value;
        setQuestions(updatedQuestions);
      };

      const generateQuizWithAI = async () => {
        try {
          const response = await fetch('http://localhost:9090/api/generate-quiz', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               notes, 
               parameters,
               format: `
               {
                    "_id": "672cb629113b70876395c8f2",
                    "title": "Database Management Quiz",
                    "questions": [
                        {
                            "id": "1",
                            "question": "What does the acronym CRUD stand for?",
                            "options": [
                                "Create, Read, Update, Delete",
                                "Create, Restore, Undo, Delete",
                                "Create, Read, Upload, Drop",
                                "Compute, Replace, Undo, Delete"
                            ],
                            "correctAnswer": "Create, Read, Update, Delete"
                        },
                        {
                            "id": "2",
                            "question": "What percentage of the module grade is based on a project?",
                            "options": [
                                "30%",
                                "10%",
                                "50%",
                                "60%"
                            ],
                            "correctAnswer": "30%"
                        },
                        {
                            "id": "3",
                            "question": "Which storage engine is typically used for memory-based temporary data?",
                            "options": [
                                "InnoDB",
                                "MyISAM",
                                "Memory",
                                "BlackHole"
                            ],
                            "correctAnswer": "Memory"
                        },
                        {
                            "id": "4",
                            "question": "What does ACID in transaction management stand for?",
                            "options": [
                                "Access, Concurrency, Independence, Durability",
                                "Atomicity, Consistency, Isolation, Durability",
                                "Authentication, Confidentiality, Integrity, Distribution",
                                "Accuracy, Currency, Isolation, Durability"
                            ],
                            "correctAnswer": "Atomicity, Consistency, Isolation, Durability"
                        },
                        {
                            "id": "5",
                            "question": "Which of the following is NOT a MySQL storage engine?",
                            "options": [
                                "InnoDB",
                                "ISAM",
                                "BLOB",
                                "Memory"
                            ],
                            "correctAnswer": "BLOB"
                        }
                    ],
                    "created_at": "2024-11-07T12:44:25.887+00:00"
                }
                `
              }),
          });

          if (!response.ok) {
            throw new Error('Failed to generate quiz with AI');
          }

          const data = await response.json();
          setQuestions(data.questions);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to generate quiz with AI');
        }
      }
    
      const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevent default form submission
        setLoading(true); // Set loading state to true
        setError(''); // Reset error state
    
        try {
          const quizData = {
            title,
            description,
            questions,
            userId: user?.id // user ID to connect quiz to its creator
          };
    
          const response = await fetch('http://localhost:9090/api/quiz', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(quizData)
          });
    
          if (!response.ok) {
            throw new Error('Failed to create quiz');
          }

          const data = await response.json();
          console.log('Server response:', data); // Add this debug log

          console.log('Quiz ID:', data.quizid); // Add this debug log

          if (!data.quizid) {
            throw new Error('No quiz ID returned from server');
          }

          // Redirect to the quiz page with the new ID
          router.push(`/quiz/${data.quizid}`);

        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to create quiz');
        } finally {
          setLoading(false);
        }
      };
    
    return (
      <Card className="w-full max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit}>
        <CardHeader>
            <h2 className="text-2xl font-bold">Create New Quiz</h2>
            {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
            </div>
            )}
        </CardHeader>

        <CardContent className="space-y-6">
            <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
                Quiz Title
            </label>
            <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded"
                required
            />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Quiz Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
          </div>

          <div className='space-y-2'>
            <input
              type="checkbox"
              checked={useAI}
              onChange={() => setUseAI(!useAI)}
              className="mr-2"
              title="Use AI to Generate Quiz"
              placeholder="Use AI to Generate Quiz"
            />
            <label className='text-md font-medium'>Use AI to Generate Quiz </label>
          </div>

          {useAI && (
            <>
              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="parameters" className="text-sm font-medium">
                  Parameters
                </label>
                <input
                  id="parameters"
                  type="text"
                  value={parameters}
                  onChange={(e) => setParameters(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              <Button type="button" onClick={generateQuizWithAI}>
                Generate Quiz with AI
              </Button>
            </>
          )}

          {!useAI && questions.map((question, qIndex) => (
            <div key={question.id} className="border p-4 rounded space-y-4">
              <h3 className="font-medium">Question {qIndex + 1}</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Question Text</label>
                <input
                    type="text"
                    value={question.question}
                    onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                    title="Question Text"
                    placeholder="Enter the question text"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Options</label>
                {question.options.map((option, oIndex) => (
                    <input
                    key={oIndex}
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                    className="w-full p-2 border rounded mt-2"
                    placeholder={`Option ${oIndex + 1}`}
                    required
                    />
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Correct Answer</label>
                <select
                    title="Correct Answer"
                    value={question.correctAnswer}
                    onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                >
                    <option value="">Select correct answer</option>
                    {question.options.map((option, index) => (
                    <option key={index} value={option}>
                        {option || `Option ${index + 1}`}
                    </option>
                    ))}
                </select>
              </div>
            </div>
          ))}
        </CardContent>
    
        <CardFooter className="flex justify-between">
            <Button type="button" onClick={handleAddQuestion} variant="outline">
              Add Question
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating Quiz...' : 'Create Quiz'}
            </Button>
        </CardFooter>
        </form>
      </Card>
    );
  }
