'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/card';
import { useAuth } from '@/contexts/auth.context';

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

interface EditQuizFormProps {
  quiz: Quiz;
}

export default function EditQuizForm({ quiz }: EditQuizFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState(quiz.title);
  const [description, setDescription] = useState(quiz.description);
  const [questions, setQuestions] = useState<QuizQuestion[]>(quiz.questions);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuestionChange = (index: number, field: keyof QuizQuestion, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const quizData = {
        title,
        description,
        questions,
        userId: user?.id,
      };

      const response = await fetch(`http://localhost:9090/api/quiz/${quiz._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizData),
      });

      if (!response.ok) {
        throw new Error('Failed to update quiz');
      }

      router.push(`/quiz/${quiz._id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <h2 className="text-2xl font-bold">Edit Quiz</h2>
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

          {questions.map((question, qIndex) => (
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
          <Button type="submit" disabled={loading}>
            {loading ? 'Updating Quiz...' : 'Update Quiz'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}