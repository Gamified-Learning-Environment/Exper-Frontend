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

    // AI state
    const [useAI, setUseAI] = useState(false);
    const [notes, setNotes] = useState('');
    const [questionCount, setQuestionCount] = useState(5);
    const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
    const [pdfUrl, setPdfUrl] = useState('');
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
          error
        },
        handlers: { // Form handlers object containing all the handler functions
            setTitle,
            setDescription,
            setSelectedCategory,
            setQuestions,
            setUseAI,
            setNotes,
            handleAddQuestion,
            handleQuestionChange,
            handleOptionChange,
            handleAddCategory,
            handleCategoryChange,
            handleImageUpload
            // Add more handlers here as I need
        }
    };
};