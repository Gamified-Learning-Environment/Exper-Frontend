// Handles Form logic and state management for the QuizForm component. 

'use client'; // use client to import modules from the client folder, helps to avoid SSR issues

const API_URL = process.env.NEXT_PUBLIC_QUIZ_SERVICE_URL || 'http://localhost:9090';


import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth.context';
import { useRouter } from 'next/navigation';
import type { QuizQuestion, Quiz, Difficulty, ValidationFeedback } from '../types';
import { GamificationService } from '@/services/gamification.service';
import { QuestProgressManager } from '@/services/QuestProgressManager';

export const UseQuizForm = (quiz?: Quiz) => {
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
    const [randomizeQuestions, setRandomizeQuestions] = useState(false);
    const [useQuestionPool, setUseQuestionPool] = useState(false);
    const [questionsPerAttempt, setQuestionsPerAttempt] = useState(5);

    // AI state
    const [useAI, setUseAI] = useState(false);
    const [aiModel, setAIModel] = useState<'gpt' | 'claude' | 'gemini'>('gpt');
    const [notes, setNotes] = useState('');
    const [questionCount, setQuestionCount] = useState(5);
    const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
    const [pdfUrl, setPdfUrl] = useState<string | File>('');
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
        const question = updatedQuestions[index];

        // Update the field while preserving isGenerated flag
        updatedQuestions[index] = {
            ...question,
            [field]: value,
            // Keep track that this was originally generated but has been modified
            isGenerated: question.isGenerated,
            //correctAnswer: question.correctAnswer 
        };

        setQuestions(updatedQuestions);
    };

    // Handler function to handle option changes
    const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
        const updatedQuestions = [...questions];
        const question = updatedQuestions[questionIndex];

        // Only reset correctAnswer if we're changing the option that was the correct answer
        const currentCorrectAnswer = Array.isArray(question.correctAnswer) 
          ? question.correctAnswer 
          : [question.correctAnswer];

        if (currentCorrectAnswer.includes(question.options[optionIndex])) {
          // Update the correct answer to use the new option value
          if (question.isMultiAnswer) {
              question.correctAnswer = currentCorrectAnswer.map(ans => 
                  ans === question.options[optionIndex] ? value : ans
              );
          } else {
              question.correctAnswer = value;
          }
        }
        
        // Update the option while preserving isGenerated flag
        question.options[optionIndex] = value;
        question.isGenerated = question.isGenerated; // Preserve isGenerated flag

        setQuestions(updatedQuestions);
    };

    const renderCorrectAnswerField = (question: QuizQuestion, qIndex: number) => {
      if (question.isMultiAnswer) {
          return (
              <div className="space-y-2">
                  <label className="text-sm font-medium">Correct Answers: </label>
                  <div className="space-y-2">
                      {question.options.map((option, oIndex) => (
                          option && (
                              <div key={oIndex} className="flex items-center gap-2">
                                  <input
                                      type="checkbox"
                                      title={`Select ${option} as correct answer`}
                                      placeholder={`Select ${option} as correct answer`}
                                      checked={Array.isArray(question.correctAnswer) && 
                                            question.correctAnswer.includes(option)}
                                      onChange={(e) => {
                                        const updatedQuestions = [...questions];
                                        const currentAnswers = Array.isArray(question.correctAnswer) 
                                          ? question.correctAnswer 
                                          : [];
                                        
                                        updatedQuestions[qIndex].correctAnswer = e.target.checked
                                          ? [...currentAnswers, option]
                                          : currentAnswers.filter(ans => ans !== option);
                                        
                                        setQuestions(updatedQuestions);
                                      }}
                                      className="rounded border-gray-300"
                                  />
                                  <span>{option}</span>
                              </div>
                          )
                      ))}
                  </div>
              </div>
          );
        }
  
        return (
            <div className="space-y-2">
                <label className="text-sm font-medium">Correct Answer</label>
                <select
                    title="Select the correct answer for this question"
                    value={Array.isArray(question.correctAnswer) ? question.correctAnswer[0] || '' : question.correctAnswer}
                    onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', [e.target.value])}
                    className="w-full p-2 border rounded"
                    required
                >
                  <option value="">Select correct answer</option>
                  {question.options.map((option, index) => (
                    option && (
                      <option key={index} value={option}>
                          {option}
                      </option>
                    )
                  ))}
                </select>
            </div>
        );
  };

    // Handler function for adding new category
    const handleAddCategory = async () => {
        if (!newCategory) return;
        try {
          const response = await fetch(`${API_URL}/api/categories`, {
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
          
          const response = await fetch(`${API_URL}/api/upload`, {
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

    // Handler function for PDF uploading
    const handlePdfUpload = async (file: File) => { 
      try {
        setIsPdfProcessing(true); // Set PDF processing state to true
        
        const formData = new FormData(); // Create a new FormData object
        formData.append('pdf', file); // Append the PDF file to the FormData object
        
        const response = await fetch(`${API_URL}/api/upload-pdf`, { // Send the PDF to the server
          method: 'POST',
          body: formData,
        });
    
        if (!response.ok) {
          throw new Error('Failed to upload PDF');
        }
    
        const { pdfUrl } = await response.json(); // Parse the response to get the PDF URL
        setPdfUrl(pdfUrl); // Set the PDF URL in the state
        
        return pdfUrl; // Return the PDF URL for further processing
      } catch (error) {
        console.error('Error uploading PDF:', error);
        setError('Failed to upload PDF');
        return null;
      } finally {
        setIsPdfProcessing(false);
      }
    };

    // Function to generate quiz with AI
    const generateQuizWithAI = async () => {
      try {
        setIsGenerating(true); // Set generating state to true
        setError('');

        // Handle file upload if it's a File object (from local input) not a URL
        if (pdfUrl && pdfUrl instanceof File) {
          const uploadedUrl = await handlePdfUpload(pdfUrl);
          if (!uploadedUrl) {
            throw new Error('Failed to upload PDF');
          }
          setPdfUrl(uploadedUrl);
        }

        // Select endpoint based on chosen model
        const endpoint = aiModel === 'claude' // Use Claude model if selected
        ? `${API_URL}/api/generate-quiz-claude` // Endpoint for Claude model
        : aiModel === 'gemini' // Use Gemini model if selected
          ? `${API_URL}/api/generate-quiz-gemini` // Endpoint for Gemini model
          : `${API_URL}/api/generate-quiz`; // Default endpoint for GPT

        const response = await fetch(endpoint, { // Fetch quiz from API
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ // Send question count, difficulty, and notes along with response format
             notes: notes, 
             pdfUrl: pdfUrl,
             parameters: {
                questionCount: questionCount, // Number of questions to generate
                difficulty: difficulty, // Difficulty level of questions
                includeExplanations: true, // Include explanations for answers
             }
            })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Quiz generation error:', errorData);
          throw new Error(errorData.message || 'Failed to generate quiz with AI');
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
        console.error('Quiz generation error:', error);
      } finally {
        setIsPdfProcessing(false); // Set PDF processing state to false
        setIsGenerating(false); // Set generating state to false
      }
    }

    // Loader component for quiz generation process
    const QuizGenerationLoader = () => {
      return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full mx-4 space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Main animated icon */}
              <div className="relative">
                <span className="text-6xl animate-float">🎮</span>
                <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-expand-circle" />
              </div>
              
              {/* Loading text */}
              <h3 className="text-2xl font-bold text-purple-800 animate-pulse">
                Generating Quiz...
              </h3>
              
              {/* Fun loading indicators */}
              <div className="flex gap-2 items-center">
                <span className="text-2xl animate-wiggle delay-100">🎲</span>
                <span className="text-2xl animate-wiggle delay-200">📝</span>
                <span className="text-2xl animate-wiggle delay-300">✨</span>
              </div>
              
              {/* Loading message */}
              <p className="text-purple-600">
                Summoning knowledge powers...
              </p>
            </div>
          </div>
        </div>
      );
    };

    // Function to handle form submission
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault(); // Prevent default form submission
      setLoading(true); // Set loading state to true
      setError(''); // Reset error state

      // Validate questions before submission
      const validationResult = await validateQuizQuestions(questions, difficulty);
      setValidationFeedback(validationResult);

      // If validation score is too low, show error but allow user to proceed
      if (validationResult.score < 70) {
        const proceed = window.confirm(
          `Quiz quality score (${validationResult.score}/100) is low. ${validationResult.overall_feedback}\n\nDo you want to proceed anyway?`
        );
        if (!proceed) {
          setLoading(false);
          return;
        }
      }
  
      try { // Try to create quiz
        const processedQuestions = questions.map(q => ({
            ...q,
            correctAnswer: q.isMultiAnswer 
                ? (Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer])
                : (Array.isArray(q.correctAnswer) ? q.correctAnswer[0] : q.correctAnswer)
        }));

        console.log('Submitting quiz with pool data:', {
          useQuestionPool,
          questionsPerAttempt: useQuestionPool ? questionsPerAttempt : undefined
        });

        const quizData = {
          title,
          description,
          questions: processedQuestions,
          category: selectedCategory,
          userId: user?._id, // user ID to connect quiz to its creator
          randomizeQuestions,
          aiModel: useAI ? aiModel : undefined,
          useQuestionPool,
          questionsPerAttempt: useQuestionPool ? questionsPerAttempt : undefined
        };
  
        const response = await fetch(`${API_URL}/api/quiz`, {
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
        console.log('Quiz ID:', data._id); 

        if (!data._id) { // Throw an error if no quiz ID is returned
          throw new Error('No quiz ID returned from server');
        }

        // If user has an active campaign, check for create_quiz objectives
        if (user?._id) {
          try {
            const progressResult = await QuestProgressManager.trackQuizCreation(
              user._id,
              useAI // boolean indicating if AI was used for generation
            );
            
            if (progressResult.questCompleted) {
              // Handle quest completion UI feedback
              console.log('Quest completed:', progressResult.questCompleted);
            }
          } catch (error) {
              console.error('Error updating quest progress:', error);
          }
        }

        // Redirect to the quiz page with the new ID
        router.push(`/quiz/${data._id}`);

      } catch (error) { // Catch and handle error
        setError(error instanceof Error ? error.message : 'Failed to create quiz');
      } finally {
        setLoading(false);
      }
    };

    // Function to fetch categories
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/api/categories`);
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const validateQuizQuestions = async (questions: QuizQuestion[], difficulty: Difficulty) => {
      try {
        // Do some basic validation checks locally first
        const basicValidation = questions.map(q => {
          const issues: string[] = [];
          const suggestions: string[] = [];
          
          // Check question length
          if (q.question.length < 10) {
            issues.push("Question is too short");
            suggestions.push("Make question more detailed (at least 10 characters)");
          }
          
          // Check options
          if (q.options.some(opt => opt.length === 0)) {
            issues.push("Empty options detected");
            suggestions.push("Fill in all options");
          }
          
          // Check correct answer is set
          if (q.isMultiAnswer) {
            if (!Array.isArray(q.correctAnswer) || q.correctAnswer.length === 0) {
              issues.push("No correct answers selected");
              suggestions.push("Select at least one correct answer");
            }
          } else if (!q.correctAnswer) {
            issues.push("No correct answer selected");
            suggestions.push("Select a correct answer");
          }

          return {
            question_id: q.id,
            score: issues.length === 0 ? 100 : 50,
            difficulty_rating: 'appropriate',
            issues,
            suggestions
          };
        });

    // If there are basic validation issues, return early
    if (basicValidation.some(v => v.issues.length > 0)) {
      return {
        score: 0,
        feedback: basicValidation,
        overall_feedback: "Please fix basic validation issues",
        difficulty_alignment: 0
      };
    }

        // API validation request to validate quiz questions
        const response = await fetch(`${API_URL}/api/validate-quiz`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            questions,
            parameters: {
              difficulty,
              includeExplanations: true
            }
          })
        });

        if (!response.ok) {
          throw new Error('Failed to validate quiz');
        }
    
        const data = await response.json();
        return data.validation;
      } catch (error) {
        console.error('Error validating quiz:', error);
        throw error;
      }
    };

    const QuestionValidation = ({ feedback }: { feedback: any }) => {
      if (!feedback) return null;
      
      return (
        <div className="mt-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
          <div className="flex items-center gap-2">
            <span className={`text-lg ${
              feedback.score >= 80 ? 'text-green-500' : 
              feedback.score >= 60 ? 'text-yellow-500' : 
              'text-red-500'
            }`}>
              {feedback.score >= 80 ? '✓' : feedback.score >= 60 ? '⚠️' : '✗'}
            </span>
            <h5 className="font-semibold">Question Score: {feedback.score}/100</h5>
          </div>

          {/* Difficulty Rating */}
          <div className="mt-2">
            <span className={`inline-block px-2 py-1 rounded text-sm ${
              feedback.difficulty_rating === 'appropriate' ? 'bg-green-100 text-green-700' :
              feedback.difficulty_rating === 'too_easy' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {feedback.difficulty_rating.replace('_', ' ')}
            </span>
          </div>

          {/* Issues and Suggestions */}
          {feedback.issues.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-red-600">Issues:</p>
              <ul className="list-disc list-inside text-sm text-red-600">
                {feedback.issues.map((issue: string, i: number) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {feedback.suggestions.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-blue-600">Suggestions:</p>
              <ul className="list-disc list-inside text-sm text-blue-600">
                {feedback.suggestions.map((suggestion: string, i: number) => (
                  <li key={i}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    };

    // Fetch categories on component mount
    useEffect(() => {
      fetchCategories();
    }, []);

    return { // Return the state and handlers to be used in the form
        formState: { // Form state object containing all the state variables
          title,
          description,
          categories,
          selectedCategory,
          newCategory,
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
          isPdfProcessing,
          aiModel,
          randomizeQuestions,
          useQuestionPool,
          questionsPerAttempt,
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
            renderCorrectAnswerField,
            QuizGenerationLoader,
            setShowPreview,
            setValidationFeedback,
            setIsPdfProcessing,
            setError,
            setImageLoading,
            setCategories,
            setNewCategory,
            setIsGenerating,
            fetchCategories,
            validateQuizQuestions,
            QuestionValidation,
            setAIModel,
            handlePdfUpload,
            setRandomizeQuestions,
            setUseQuestionPool,
            setQuestionsPerAttempt,
            // Add more handlers here as I need
        }
    };
};