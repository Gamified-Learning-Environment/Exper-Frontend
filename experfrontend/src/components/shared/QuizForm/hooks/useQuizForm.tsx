// Handles Form logic and state management for the QuizForm component. 

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth.context';
import { useRouter } from 'next/navigation';
import type { QuizQuestion, Quiz, Difficulty, ValidationFeedback } from '../types';

export const useQuizForm = (quiz?: Quiz) => {
    const router = useRouter();
    const { user } = useAuth();

    // Basic Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [questions, setQuestions] = useState<QuizQuestion[]>([{
        id: '1',
        question: '',
        options: ['', '', '', ''],
        correctAnswer: [],
        isMultiAnswer: false
    }]);
    const [questionImages, setQuestionImages] = useState<{ [key: string]: File }>({});

    // AI state
    const [useAI, setUseAI] = useState(false);
    const [notes, setNotes] = useState('');
    const [questionCount, setQuestionCount] = useState(5);
    const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
    const [pdfUrl, setPdfUrl] = useState('');
    const [isPdfProcessing, setIsPdfProcessing] = useState(false); // pdf processing state
    const [showPreview, setShowPreview] = useState(false);
    const [validationFeedback, setValidationFeedback] = useState<ValidationFeedback | null>(null);


    // Loading states
    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    // Handler function for adding new question
    const handleAddQuestion = () => {
        setQuestions([...questions, {
            id: (questions.length + 1).toString(),
            question: '',
            options: ['', '', '', ''],
            correctAnswer: [], // Initialize to empty array
            isMultiAnswer: false // Default to single answer
        }]);
    };

    // Handler function for removing question
    const handleRemoveQuestion = (index: number) => {
        const updatedQuestions = questions.filter((_, i) => i !== index);
        setQuestions(updatedQuestions);
    }

    // Handler function for question type changing
    const handleQuestionChange = (index: number, field: keyof QuizQuestion, value: any) => {
        const updatedQuestions = [...questions];
        if (field === 'correctAnswer') {
            // If it's a multiple answer question, keep array format
            // If it's a single answer question, use string format
            updatedQuestions[index] = {
              ...updatedQuestions[index],
              correctAnswer: updatedQuestions[index].isMultiAnswer ? value : value[0] || ''
            };
        } else {
            updatedQuestions[index] = {
                ...updatedQuestions[index],
                [field]: value
            };
        }
        setQuestions(updatedQuestions);
    };

    // Handler function to handle option changes
    const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
        const updatedQuestions = [...questions];
        const question = updatedQuestions[questionIndex];
  
        // If we're changing the option that was the correct answer, reset it
        if (question.correctAnswer.includes(question.options[optionIndex])) {
          question.correctAnswer = [];
        }
        
        // Update the option
        question.options[optionIndex] = value;
        setQuestions(updatedQuestions);
    };

    // Handler function for adding new category
    const handleAddCategory = async () => {
        if (!newCategory) return;
        try {
          const response = await fetch('http://localhost:9090/api/categories', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: newCategory }),
          });
          if (!response.ok) {
            throw new Error('Failed to add category');
          }
          setCategories([...categories, newCategory]);
          setSelectedCategory(newCategory);
          setNewCategory('');
        } catch (error) {
          console.error('Error adding category:', error);
        }
    };

    // Handler function for category change
    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
    };

    // Handler function for image uploads per question
    const handleImageUpload = async (questionIndex: number, file: File) => {
        try {
          const formData = new FormData();
          formData.append('image', file);
          
          const response = await fetch('http://localhost:9090/api/upload', {
            method: 'POST',
            body: formData,
          });
      
          if (!response.ok) {
            throw new Error('Failed to upload image');
          }
      
          const { imageUrl } = await response.json();
          
          // Update the question with the image URL
          const updatedQuestions = [...questions];
          updatedQuestions[questionIndex] = {
            ...updatedQuestions[questionIndex],
            imageUrl
          };
          setQuestions(updatedQuestions);
  
        } catch (error) {
          console.error('Error uploading image:', error);
          setError('Failed to upload image');
        } finally {
          setImageLoading(prev => ({ ...prev, [questionIndex]: false }));
        }
    };

    // Function to generate quiz with AI
    const generateQuizWithAI = async () => {
      try {
        setIsGenerating(true); // Set generating state to true
        setIsPdfProcessing(true); // Set PDF processing state to true
        const response = await fetch('http://localhost:9090/api/generate-quiz', { // Fetch quiz from API
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ // Send question count, difficulty, and notes along with response format
             notes, 
             pdfUrl,
             parameters: {
                questionCount,
                difficulty,
                includeExplanations: true, // Include explanations for answers
             },
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

        if (!response.ok) { // If response is not ok, throw an error
          throw new Error('Failed to generate quiz with AI');
        }

        // Parse response data, set questions, and show preview
        const data = await response.json();

        // Check if we have quiz data
        if (!data.questions) {
          throw new Error('Invalid quiz data received');
        }

        setQuestions(data.questions);

        // Handle validation feedback
        if (data.validation) {
          setValidationFeedback(data.validation);
          
          // If validation score is too low, show error
          if (data.validation.score < 70) {
            setError(`Quiz quality score (${data.validation.score}/100) is too low. ${data.validation.overall_feedback}`);
            return;
          }
        }

        setShowPreview(true);
      } catch (error) { // Catch and handle error
        setError(error instanceof Error ? error.message : 'Failed to generate quiz with AI');
      } finally {
        setIsPdfProcessing(false); // Set PDF processing state to false
        setIsGenerating(false); // Set generating state to false
      }
    }

    // Function to handle form submission
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault(); // Prevent default form submission
      setLoading(true); // Set loading state to true
      setError(''); // Reset error state
  
      try { // Try to create quiz
        const processedQuestions = questions.map(q => ({
            ...q,
            correctAnswer: q.isMultiAnswer 
                ? (Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer])
                : (Array.isArray(q.correctAnswer) ? q.correctAnswer[0] : q.correctAnswer)
        }));

        const quizData = {
          title,
          description,
          questions: processedQuestions,
          category: selectedCategory,
          userId: user?._id // user ID to connect quiz to its creator
        };
  
        const response = await fetch('http://localhost:9090/api/quiz', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(quizData) // Send quiz data to API
        });
  
        if (!response.ok) {
          throw new Error('Failed to create quiz');
        }

        const data = await response.json();
        
        // Debugging server response and quiz ID
        console.log('Server response:', data); 
        console.log('Quiz ID:', data.quizid); 

        if (!data.quizid) { // Throw an error if no quiz ID is returned
          throw new Error('No quiz ID returned from server');
        }

        // Redirect to the quiz page with the new ID
        router.push(`/quiz/${data.quizid}`);

      } catch (error) { // Catch and handle error
        setError(error instanceof Error ? error.message : 'Failed to create quiz');
      } finally {
        setLoading(false);
      }
    };


    return { // Return the state and handlers to be used in the form
        formState: { // Form state object containing all the state variables
          title,
          description,
          categories,
          selectedCategory,
          questions,
          useAI,
          notes,
          questionCount,
          difficulty,
          pdfUrl,
          showPreview,
          validationFeedback,
          loading,
          isGenerating,
          error,
          imageLoading,
          isPdfProcessing
        },
        handlers: { // Form handlers object containing all the handler functions
            setTitle,
            setDescription,
            setSelectedCategory,
            setQuestions,
            setUseAI,
            setNotes,
            setQuestionCount,
            setDifficulty,
            setPdfUrl,
            handleAddQuestion,
            handleQuestionChange,
            handleOptionChange,
            handleAddCategory,
            handleCategoryChange,
            handleImageUpload,
            generateQuizWithAI,
            handleSubmit,
            handleRemoveQuestion,
            // Add more handlers here as I need
        }
    };
};