'use client'; // use client to import modules from the client folder, helps to avoid SSR issues

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/card';
import { useAuth } from '@/contexts/auth.context';
import { useRouter } from 'next/navigation';
import { Slider } from '../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

// QuizQuestion interface
interface QuizQuestion {
    id: string;
    question: string;
    options: string[]; // Array of options
    correctAnswer: string;
    imageUrl?: string; // Optional image URL
  }
  
  interface QuizFormProps { // QuizFormProps interface, defines props
    onClose?: () => void;
  }

  // Difficulty type parameter
  type Difficulty = 'beginner' | 'intermediate' | 'expert';

  export default function QuizForm({ onClose }: QuizFormProps) { // QuizForm component, takes onClose as prop
    // State variables to keep track of title, description, questions, error, loading
    const router = useRouter();
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [questions, setQuestions] = useState<QuizQuestion[]>([{id: '1', question: '', options: ['', '', '', ''], correctAnswer: ''}]); // Initialize with one empty question
    const [questionImages, setQuestionImages] = useState<{ [key: string]: File }>({});
    const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // paramaters for AI
    const [questionCount, setQuestionCount] = useState(5);
    const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');

    // ai integration
    const [useAI, setUseAI] = useState(false); // toggle AI use on/off
    const [notes, setNotes] = useState('');  // notes for AI

    // pdf paramater states
    const [pdfUrl, setPdfUrl] = useState(''); // pdf URL
    const [isPdfProcessing, setIsPdfProcessing] = useState(false); // pdf processing state

    // preview generated questions
    const [showPreview, setShowPreview] = useState(false);

    // Function to add a new question
    const handleAddQuestion = () => {
      setQuestions([...questions, {
        id: (questions.length + 1).toString(),
        question: '',
        options: ['', '', '', ''],
        correctAnswer: ''
      }]);
    };

    // Fetch categories on component mount
    useEffect(() => {
      const fetchCategories = async () => {
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
      };
      fetchCategories();
    }, []);

    // Add new category
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

    // Function to handle question change
    const handleQuestionChange = (index: number, field: keyof QuizQuestion, value: string) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index] = {
          ...updatedQuestions[index],
          [field]: value
        };
        setQuestions(updatedQuestions);
      };
    
      // Function to handle option change
      const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
        const updatedQuestions = [...questions];
        const question = updatedQuestions[questionIndex];
  
        // If we're changing the option that was the correct answer, reset it
        if (question.options[optionIndex] === question.correctAnswer) {
          question.correctAnswer = '';
        }
        
        // Update the option
        question.options[optionIndex] = value;
        setQuestions(updatedQuestions);
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
          setQuestions(data.questions);
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
          const quizData = {
            title,
            description,
            questions,
            category: selectedCategory,
            userId: user?.id // user ID to connect quiz to its creator
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
    
    return ( // Return quiz form
      <Card className="w-full max-w-4xl mx-auto p-6 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-xl">
        <form onSubmit={handleSubmit}>
          <CardHeader className="space-y-4 text-center">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              Create Your Quiz Adventure ✨
            </h2>
            {error && (
              <div className="bg-red-100/90 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg animate-pulse">
                {error}
              </div>
            )}
          </CardHeader>

        {/* Quiz form fields */}
        <CardContent className="space-y-8">
        <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200 space-y-4 transition-all hover:shadow-md">
          <h3 className="text-xl font-bold text-blue-700 flex items-center gap-2">
            <span className="bg-blue-200 p-2 rounded-lg">📝</span>
            Quiz Title
          </h3>
          <div className="space-y-4">
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
              placeholder="Enter an exciting quiz title..."
              required
            />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-blue-500 flex items-center gap-2">
                Quiz Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                placeholder="Describe your quiz adventure..."
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select
                title="Category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Add New Category</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter new category"
                />
                <Button type="button" onClick={handleAddCategory} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700">
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* AI integration */}
          <div className='bg-purple-50 p-6 rounded-xl border-2 border-purple-200 space-y-4 transition-all hover:shadow-md'>
            <h3 className="text-xl font-bold text-purple-700 flex items-center gap-2">
              <span className="bg-purple-200 p-2 rounded-lg">🤖</span>
              AI Magic
            </h3>
            <div className='space-y-4'>
              <div className='flex items-center gap-2 bg-white p-3 rounded-lg border-2 border-purple-200'>
                <input
                  type="checkbox"
                  checked={useAI}
                  onChange={() => setUseAI(!useAI)} // Toggle AI use on/off
                  className="w-5 h-5 text-purple-600"
                  title="Use AI to Generate Quiz"
                  placeholder="Use AI to Generate Quiz"
                />
                <label className='text-lg font-medium text-purple-700'>Use AI to Generate Quiz</label>
              </div>
            </div>
          </div>

          {/* AI form fields */}
          {useAI && (
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-sm font-medium text-purple-500 flex items-center gap-2">Number of Questions</label>
                <Slider
                  value={[questionCount]}
                  onValueChange={(value) => setQuestionCount(value[0])}
                  min={1}
                  max={20}
                  step={1}
                  className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
                />
                <span className="text-sm text-gray-500">{questionCount} questions</span>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty Level</label>
                <Select value={difficulty} onValueChange={(value: Difficulty) => setDifficulty(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select difficulty" /> 
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)} // Set notes for AI to generate questions from
                  className="w-full p-2 border rounded"
                  placeholder="Add any notes, topics, or keywords for the AI to generate questions from"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">PDF URL (Optional)</label>
                <input
                  type="url"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter URL to a PDF document"
                />
              </div>

              <Button type="button" onClick={generateQuizWithAI} disabled={isGenerating} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700">
                {isGenerating ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                    Generating Quiz...
                  </div>
                ) : (
                  'Generate Quiz with AI'
                )}
              </Button>
            </div>
          )}

          {/* Quiz questions fill in */}
          <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200 space-y-6 transition-all hover:shadow-md">
            <h3 className="text-xl font-bold text-green-700 flex items-center gap-2">
              <span className="bg-green-200 p-2 rounded-lg">❓</span>
              Questions
            </h3>
            {!useAI && questions.map((question, qIndex) => (
            <div key={question.id} className="bg-white p-4 rounded-lg border-2 border-green-200 space-y-4 transition-all hover:shadow-md">
              <h4 className="font-bold text-green-700 flex items-center gap-2">Question {qIndex + 1}</h4>

              {/* Question fields */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Question Text</label>
                <input
                    type="text"
                    value={question.question}
                    onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)} // Set question
                    className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400"
                    required
                    title="Question Text"
                    placeholder="Enter your question..."
                />
              </div>

              {/* Image upload section */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  <ImageIcon className="w-4 h-4" />
                  Question Image (Optional)
                </label>

                <div className="text-sm font-medium text-green-700 flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(qIndex, file);
                      }
                    }}
                    className="w-full p-2 border rounded"
                    title="Upload an image for the question"
                    placeholder="Choose an image file"
                  />
                  {question.imageUrl ? (
                    <div className="relative group">
                      <img
                        src={question.imageUrl}
                        alt="Question image"
                        className="w-full h-48 object-cover rounded-lg shadow-md transition-all duration-300 group-hover:brightness-75"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="rounded-full bg-red-500/90 hover:bg-red-600"
                          onClick={() => {
                            const updatedQuestions = [...questions];
                            updatedQuestions[qIndex] = {
                              ...updatedQuestions[qIndex],
                              imageUrl: undefined
                            };
                            setQuestions(updatedQuestions);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Upload button and drag-drop zone
                    <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setImageLoading(prev => ({ ...prev, [qIndex]: true }));
                          handleImageUpload(qIndex, file);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      title="Upload an image for the question"
                      placeholder="Choose an image file"
                    />
                    <div className={`
                      border-2 border-dashed border-green-200 rounded-lg p-8
                      flex flex-col items-center justify-center gap-3
                      transition-all duration-300 hover:border-green-400
                      ${imageLoading[qIndex] ? 'bg-green-50' : 'bg-white'}
                    `}>
                      <div className={`
                        p-3 rounded-full bg-green-100
                        ${imageLoading[qIndex] ? 'animate-pulse' : ''}
                      `}>
                        <Upload className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-green-600">
                          {imageLoading[qIndex] ? 'Uploading...' : 'Click or drag image here'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Supports JPG, PNG, GIF up to 5MB
                        </p>
                      </div>
                    </div>
                  </div>
                  )}
                </div>
                </div>

                {/* Options fields */}
                <div className="grid gap-3">
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm
                        ${oIndex === 0 ? 'bg-red-400' : 
                          oIndex === 1 ? 'bg-blue-400' : 
                          oIndex === 2 ? 'bg-yellow-400' : 'bg-green-400'}`}>
                        {oIndex + 1}
                      </span>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                        className="flex-1 p-2 border-2 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400"
                        placeholder={`Option ${oIndex + 1}`}
                        required
                      />
                    </div>
                  ))}
                </div>

                {/* Correct Answer field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Correct Answer</label>
                  <select
                    title="Correct Answer"
                    value={question.correctAnswer}
                    onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="" disabled>Select correct answer</option>
                    {question.options.map((option, index) => (
                      // Only show options that have content
                      option && (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      )
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
          
          {/* Preview generated questions */}
          {showPreview && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-purple-200 p-2 rounded-lg text-2xl">✨</span>
                <h3 className="text-2xl font-bold text-purple-800">Generated Questions</h3>
              </div>
            
              {questions.map((question, qIndex) => (
                <div 
                  key={question.id} 
                  className="bg-white p-6 rounded-xl border-2 border-purple-200 shadow-md hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                      {qIndex + 1}
                    </span>
                    <h4 className="text-lg font-semibold text-purple-900">{question.question}</h4>
                  </div>
            
                  <div className="grid gap-3 mb-4 pl-11">
                    {question.options.map((option, oIndex) => (
                      <div 
                        key={oIndex}
                        className={`p-3 rounded-lg border-2 transition-all
                          ${option === question.correctAnswer 
                            ? 'border-green-200 bg-green-50 text-green-700'
                            : 'border-gray-200 bg-gray-50 text-gray-600'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm
                            ${oIndex === 0 ? 'bg-red-400' : 
                              oIndex === 1 ? 'bg-blue-400' : 
                              oIndex === 2 ? 'bg-yellow-400' : 'bg-green-400'
                            }`}
                          >
                            {String.fromCharCode(65 + oIndex)}
                          </span>
                          <span>{option}</span>
                        </div>
                      </div>
                    ))}
                  </div>
            
                  <div className="pl-11">
                    <div className="flex items-center gap-2 text-green-600">
                      <span className="text-xl">✅</span>
                      <p className="font-medium">
                        Correct Answer: <span className="text-green-700">{question.correctAnswer}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            
              <Button 
                type="button" 
                onClick={generateQuizWithAI}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 font-medium py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-center gap-2">
                  <span>🎲</span>
                  Regenerate Questions
                </div>
              </Button>
            </div>
          )}
        </CardContent>

        {/* Quiz form footer */}
        <CardFooter className="flex justify-between pt-6">
        <div className="flex gap-2">
          <Button 
            type="button" 
            onClick={handleAddQuestion} 
            variant="outline"
            className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 border-2 border-indigo-300"
          >
            Add Question ✨
          </Button>
          <Button
            type="button"
            onClick={() => setQuestions(questions.slice(0, -1))}
            variant="outline"
            className="bg-red-100 hover:bg-red-200 text-red-700 border-2 border-red-300"
            disabled={questions.length <= 1}
          >
            Remove Question 🗑️
          </Button>
        </div>
        <Button 
          type="submit" 
          disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
        >
          Submit Quiz
        </Button>
        </CardFooter>
        </form>
      </Card>
    );
  }