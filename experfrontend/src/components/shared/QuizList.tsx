'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import Image from 'next/image';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Badge } from '../ui/badge';

// Quiz interface
interface Quiz {
  _id: any;
  id: string;
  title: string;
  description: string;
  category?: string;
}

// QuizList component
export default function QuizList() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('http://localhost:9090/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }
    fetchCategories();
  }, []);

  // Fetch quizzes with optional category filter
  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const url = selectedCategory 
          ? `http://localhost:9090/api/quizzes/category/${selectedCategory}`
          : 'http://localhost:9090/api/quizzes';
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch quizzes');
        }
        const data = await response.json();
        setQuizzes(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch quizzes');
      } finally {
        setLoading(false);
      }
    }
    fetchQuizzes();
  }, [selectedCategory]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <Card key={quiz._id} className="p-4">
            <CardHeader>
              <CardTitle>{quiz.title}</CardTitle>
              {quiz.category && (
                <Badge variant="outline" className="w-fit">
                  {quiz.category}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <CardDescription>{quiz.description}</CardDescription>
            </CardContent>
            <CardFooter>
              <Button onClick={() => router.push(`/quiz/${quiz._id}`)}>
                View Quiz
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}