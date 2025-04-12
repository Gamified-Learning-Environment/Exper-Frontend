
'use client'; // use client to import modules from the client folder, helps to avoid SSR issues

import type { QuizFormProps, Difficulty } from '@/components/shared/NewQuizForm/types'; // Import types
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UseQuizForm } from '@/components/shared/NewQuizForm/hooks/UseQuizForm'; // Import useQuizForm hook
import { ImageIcon, Upload, X } from 'lucide-react'; // Import icons
import { Slider } from '@/components/ui/slider'; // Import slider component
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import AIToggleAnim from "@/components/animations/AIToggleAnim";

export default function QuizForm({ onClose, quiz }: QuizFormProps) { // QuizForm component, takes onClose and quiz as props
    const {
          formState,
          handlers
        } = UseQuizForm(quiz);

    return ( // Return quiz form
        <Card className="w-full max-w-4xl mx-auto p-6 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-xl">
          <form onSubmit={handlers.handleSubmit}>
            <CardHeader className="space-y-4 text-center">
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                Create Your Quiz Adventure ✨
              </h2>
              {formState.error && (
                <div className="bg-red-100/90 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg animate-pulse">
                  {formState.error}
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
                value={formState.title}
                onChange={(e) => handlers.setTitle(e.target.value)}
                className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                placeholder="Enter an exciting quiz title..."
                required
              />
              </div>

              <div className="flex items-center gap-2 bg-blue-100 p-3 rounded-lg border border-blue-200">
                <input
                  type="checkbox"
                  id="randomizeQuestions"
                  checked={formState.randomizeQuestions}
                  onChange={(e) => handlers.setRandomizeQuestions(e.target.checked)}
                  className="w-5 h-5 text-blue-600"
                  title="Randomize question order"
                />
                <label htmlFor="randomizeQuestions" className="text-sm font-medium text-blue-700 flex items-center gap-2">
                  <span>🎲</span> Randomize question order for each player
                </label>
              </div>

              <div className="flex items-center gap-2 bg-blue-100 p-3 rounded-lg border border-blue-200 mt-4">
                <input
                  type="checkbox"
                  id="useQuestionPool"
                  checked={formState.useQuestionPool}
                  onChange={(e) => handlers.setUseQuestionPool(e.target.checked)}
                  className="w-5 h-5 text-blue-600"
                  title="Use question pool"
                />
                <label htmlFor="useQuestionPool" className="text-sm font-medium text-blue-700 flex items-center gap-2">
                  <span>🎯</span> Use question pool (show subset of questions per attempt)
                </label>
              </div>

              {formState.useQuestionPool && (
                <div className="pl-7 mt-3 space-y-2">
                  <label className="text-sm font-medium text-blue-600">Questions per attempt</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={1}
                      max={Math.max(formState.questions.length, 20)}
                      value={formState.questionsPerAttempt}
                      onChange={(e) => handlers.setQuestionsPerAttempt(parseInt(e.target.value))}
                      className="flex-1"
                      title="Range of Questions per attempt"
                    />
                    <input
                      type="number"
                      value={formState.questionsPerAttempt}
                      onChange={(e) => handlers.setQuestionsPerAttempt(parseInt(e.target.value))}
                      className="w-16 p-2 border-2 rounded-lg text-center"
                      min={1}
                      max={formState.questions.length}
                      title="Number Questions per attempt"
                    />
                  </div>
                  <p className="text-xs text-blue-500">
                    {formState.questionsPerAttempt} of {formState.questions.length} questions will be randomly selected each time
                  </p>
                </div>
              )}
  
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-blue-500 flex items-center gap-2">
                  Quiz Description
                </label>
                <textarea
                  id="description"
                  value={formState.description}
                  onChange={(e) => handlers.setDescription(e.target.value)}
                  className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                  placeholder="Describe your quiz adventure..."
                  required
                />
              </div>
  
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select
                  title="Category"
                  value={formState.selectedCategory}
                  onChange={(e) => handlers.handleCategoryChange(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select a category</option>
                  {formState.categories.map((category) => (
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
                    value={formState.newCategory}
                    onChange={(e) => handlers.setNewCategory(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Enter new category"
                  />
                  <Button type="button" onClick={handlers.handleAddCategory} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700">
                    Add
                  </Button>
                </div>
              </div>
            </div>
  
            {/* AI integration */}
            <div className='bg-purple-50 p-6 rounded-xl border-2 border-purple-200 space-y-4 transition-all hover:shadow-md'>
              <h3 className="text-xl font-bold text-purple-700 flex items-center gap-2">
                <span className="bg-purple-200 p-2 rounded-lg flex items-center justify-center">
                  <AIToggleAnim />
                </span>
                AI Magic
              </h3>
              <div className='space-y-4'>
                <div className='flex items-center gap-2 bg-white p-3 rounded-lg border-2 border-purple-200'>
                  <input
                    type="checkbox"
                    checked={formState.useAI}
                    onChange={() => handlers.setUseAI(!formState.useAI)} // Toggle AI use on/off
                    disabled={formState.showPreview && formState.questions.length > 0}
                    className="w-5 h-5 text-purple-600"
                    title="Use AI to Generate Quiz"
                    placeholder="Use AI to Generate Quiz"
                  />
                  <label className='text-lg font-medium text-purple-700'>Use AI to Generate Quiz</label>
                </div>
              </div>
            </div>

            {formState.showPreview && (
              <div className="absolute right-3 top-3">
                <span className="text-xs font-medium bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  AI mode locked
                </span>
              </div>
            )}
  
            {/* AI form fields */}
            {formState.useAI && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium">AI Model:</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handlers.setAIModel('gpt')}
                        className={`px-3 py-1 rounded-full text-sm ${
                          formState.aiModel === 'gpt' 
                            ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        GPT-3.5
                      </button>
                      <button
                        type="button" 
                        onClick={() => handlers.setAIModel('claude')}
                        className={`px-3 py-1 rounded-full text-sm ${
                          formState.aiModel === 'claude'
                            ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        Claude
                      </button>
                    </div>
                </div>
                  <label className="text-sm font-medium text-purple-500 flex items-center gap-2">Number of Questions</label>
                  <Slider
                    value={[formState.questionCount]}
                    onValueChange={(value) => handlers.setQuestionCount(value[0])}
                    min={1}
                    max={20}
                    step={1}
                    className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
                  />
                  <span className="text-sm text-gray-500">
                    {formState.questionCount} questions 
                  </span>
                </div>
  
                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty Level</label>
                  <Select 
                    value={formState.difficulty} 
                    onValueChange={(value: Difficulty) => handlers.setDifficulty(value)}
                  >
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
                    value={formState.notes}
                    onChange={(e) => handlers.setNotes(e.target.value)} // Set notes for AI to generate questions from
                    className="w-full p-2 border rounded"
                    placeholder="Add any notes, topics, or keywords for the AI to generate questions from"
                  />
                </div>
  
                <div className="space-y-2">
                  <label className="text-sm font-medium">PDF Document (Optional)</label>
                  <div className="flex flex-col gap-2">
                    {formState.pdfUrl ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 p-2 bg-purple-50 border border-purple-200 rounded-lg text-purple-800 flex items-center">
                          <span className="text-xl mr-2">📄</span>
                          <span className="flex-1 truncate">
                            {typeof formState.pdfUrl === 'string' 
                              ? formState.pdfUrl.split('/').pop() 
                              : formState.pdfUrl.name}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handlers.setPdfUrl('')}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          title="Upload a PDF file"
                          type="file"
                          accept=".pdf"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              await handlers.handlePdfUpload(file);
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="border-2 border-dashed border-purple-200 rounded-lg p-4 flex flex-col items-center justify-center gap-3 hover:border-purple-400 transition-all">
                          <div className="p-3 rounded-full bg-purple-100">
                            <Upload className="w-6 h-6 text-purple-600" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-purple-600">
                              {formState.isPdfProcessing ? 'Uploading...' : 'Click or drag PDF here'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">PDF files up to 10MB</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
  
                <Button type="button" onClick={handlers.generateQuizWithAI} disabled={formState.isGenerating} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700">
                  {formState.isGenerating ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                      Generating Quiz...
                      <handlers.QuizGenerationLoader />
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
              {!formState.useAI && formState.questions.map((question, qIndex) => (
              <div key={question.id} className="bg-white p-4 rounded-lg border-2 border-green-200 space-y-4 transition-all hover:shadow-md">
                <h4 className="font-bold text-green-700 flex items-center gap-2">Question {qIndex + 1}</h4>
  
                {/* Question fields */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Question Text</label>
                  <input
                      type="text"
                      value={question.question}
                      onChange={(e) => handlers.handleQuestionChange(qIndex, 'question', e.target.value)} // Set question
                      className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400"
                      required
                      title="Question Text"
                      placeholder="Enter your question..."
                  />
                </div>
  
                {/* Multiple answer toggle */}
                <div className="flex items-center gap-2 mb-4">
                    <input
                        type="checkbox"
                        title="Allow multiple correct answers"
                        checked={question.isMultiAnswer}
                        onChange={(e) => {
                            const updatedQuestions = [...formState.questions];
                            updatedQuestions[qIndex].isMultiAnswer = e.target.checked;
                            // Reset answers when toggling between single/multiple
                            updatedQuestions[qIndex].correctAnswer = e.target.checked ? [] : '';
                            handlers.setQuestions(updatedQuestions);
                        }}
                        className="rounded border-gray-300"
                    />
                    <label className="text-sm font-medium">Allow multiple correct answers</label>
                </div>
  
                {/* Render correct answer field */}
                {handlers.renderCorrectAnswerField(question, qIndex)}
  
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
                          onChange={(e) => handlers.handleOptionChange(qIndex, oIndex, e.target.value)}
                          className="flex-1 p-2 border-2 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400"
                          placeholder={`Option ${oIndex + 1}`}
                          required
                        />
                      </div>
                    ))}
                  </div>
  
                  {/* Explanation field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Answer Explanation (Optional)
                    </label>
                    <textarea
                      value={question.explanation || ''}
                      onChange={(e) => handlers.handleQuestionChange(qIndex, 'explanation', e.target.value)}
                      className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400"
                      placeholder="Explain why this answer is correct..."
                      rows={3}
                    />
                  </div>

                  {/* Validation feedback - Only render when feedback exists */}
                  {formState.validationFeedback?.feedback && 
                    formState.validationFeedback.feedback.find(f => f.question_id === question.id) && (
                    <div className="mt-4 border-t pt-4 border-green-100">
                      <h5 className="text-sm font-medium text-green-700 flex items-center gap-2">
                        <span>🔍</span> Validation Feedback
                      </h5>
                      <handlers.QuestionValidation 
                        feedback={formState.validationFeedback.feedback.find(
                          f => f.question_id === question.id
                        )} 
                      />
                    </div>
                  )}
  
  
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
                            handlers.handleImageUpload(qIndex, file);
                          }
                        }}
                        title="Upload an image for this question"
                        placeholder="Choose an image file"
                        className="w-full p-2 border rounded"
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
                                const updatedQuestions = [...formState.questions];
                                updatedQuestions[qIndex] = {
                                  ...updatedQuestions[qIndex],
                                  imageUrl: undefined
                                };
                                handlers.setQuestions(updatedQuestions);
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
                                handlers.setImageLoading(prev => ({ ...prev, [qIndex]: true }));
                                handlers.handleImageUpload(qIndex, file);
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
                          ${formState.imageLoading[qIndex] ? 'bg-green-50' : 'bg-white'}
                        `}>
                          <div className={`
                            p-3 rounded-full bg-green-100
                            ${formState.imageLoading[qIndex] ? 'animate-pulse' : ''}
                          `}>
                            <Upload className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-green-600">
                              {formState.imageLoading[qIndex] ? 'Uploading...' : 'Click or drag image here'}
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
                </div>
              ))}
            </div>
            
            {/* Preview generated questions */}
            {formState.showPreview && formState.questions && formState.questions.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="bg-purple-200 p-2 rounded-lg text-2xl">✨</span>
                  <h3 className="text-2xl font-bold text-purple-800">Generated Questions</h3>
                </div>
  
                {formState.validationFeedback && (
                  <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">📊</span>
                        <h3 className="text-xl font-bold">
                          Overall Quality: {formState.validationFeedback.score}/100
                        </h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        formState.validationFeedback.score >= 80 ? 'bg-green-100 text-green-700' :
                        formState.validationFeedback.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {formState.validationFeedback.score >= 80 ? 'Good' :
                        formState.validationFeedback.score >= 60 ? 'Needs Improvement' :
                        'Poor'}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-purple-800">
                          Difficulty Alignment
                        </h4>
                        <span className="text-sm font-medium">
                          {formState.validationFeedback.difficulty_alignment}/100
                        </span>
                      </div>
                      <p className="text-gray-700">{formState.validationFeedback.overall_feedback}</p>
                    </div>
                  </div>
                )}

                {formState.questions.map((question, qIndex) => (
                  <div 
                    key={question.id} 
                    className="bg-white p-4 rounded-lg border-2 border-green-200 space-y-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-green-700 flex items-center gap-2">
                        Question {qIndex + 1}
                        {question.isGenerated && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                            AI Generated
                          </span>
                        )}
                      </h4>
                    </div>

                    {/* Question Text */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Question Text</label>
                      <input
                        type="text"
                        value={question.question}
                        onChange={(e) => handlers.handleQuestionChange(qIndex, 'question', e.target.value)}
                        className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400"
                        required
                        placeholder="Enter your question..."
                      />
                    </div>

                    {/* Options */}
                    <div className="space-y-4 mt-4">
                      <div className="flex items-center justify-between">
                        <h5 className="font-semibold text-green-700 flex items-center gap-2">
                          <span className="bg-green-100 p-1 rounded-full">🎮</span> Answer Options
                        </h5>
                        <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">
                          {question.options.length} options
                        </span>
                      </div>
                      
                      {question.options.map((option, oIndex) => {
                        const isCorrect = question.isMultiAnswer 
                          ? Array.isArray(question.correctAnswer) && question.correctAnswer.includes(option)
                          : question.correctAnswer === option;
                          
                        const colors = [
                          { bg: "from-red-400 to-red-500", border: "border-red-300", hover: "hover:from-red-500 hover:to-red-600", light: "bg-red-50" },
                          { bg: "from-blue-400 to-blue-500", border: "border-blue-300", hover: "hover:from-blue-500 hover:to-blue-600", light: "bg-blue-50" },
                          { bg: "from-yellow-400 to-yellow-500", border: "border-yellow-300", hover: "hover:from-yellow-500 hover:to-yellow-600", light: "bg-yellow-50" },
                          { bg: "from-green-400 to-green-500", border: "border-green-300", hover: "hover:from-green-500 hover:to-green-600", light: "bg-green-50" },
                          { bg: "from-purple-400 to-purple-500", border: "border-purple-300", hover: "hover:from-purple-500 hover:to-purple-600", light: "bg-purple-50" },
                          { bg: "from-orange-400 to-orange-500", border: "border-orange-300", hover: "hover:from-orange-500 hover:to-orange-600", light: "bg-orange-50" },
                        ];
                        
                        const color = colors[oIndex % colors.length];
                        
                        return (
                          <div 
                            key={oIndex} 
                            className={`
                              relative group transition-all duration-300 transform hover:-translate-y-1
                              ${isCorrect ? 'ring-2 ring-green-400 ring-offset-2' : ''}
                            `}
                          >
                            {/* Letter badge */}
                            <div className={`
                              absolute -left-3 top-1/2 -translate-y-1/2 w-10 h-10
                              flex items-center justify-center rounded-full shadow-md
                              bg-gradient-to-br ${color.bg} ${color.hover}
                              border-2 ${color.border} text-white font-bold text-lg
                              transition-transform group-hover:scale-110 z-10
                            `}>
                              {String.fromCharCode(65 + oIndex)}
                            </div>
                            
                            {/* Input container */}
                            <div className={`
                              pl-10 rounded-xl overflow-hidden
                              border-2 ${color.border} ${color.light}
                              shadow-sm group-hover:shadow-md transition-all
                              ${isCorrect ? 'bg-green-50/70 border-green-300' : ''}
                            `}>
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => handlers.handleOptionChange(qIndex, oIndex, e.target.value)}
                                className="w-full p-3 pl-4 bg-transparent border-none focus:ring-2 focus:ring-offset-1 focus:outline-none"
                                placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                required
                              />
                              
                              {/* Correct answer indicator */}
                              {isCorrect && (
                                <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-1 text-green-600 bg-white/70 px-2 py-1 rounded-full text-sm font-medium">
                                  <span className="animate-pulse">✓</span> Correct
                                </div>
                              )}
                            </div>
                            
                            {/* Checkbox for multiple answers */}
                            {question.isMultiAnswer && (
                              <div 
                                onClick={() => {
                                  const updatedQuestions = [...formState.questions];
                                  const currentAnswers = Array.isArray(updatedQuestions[qIndex].correctAnswer) 
                                    ? [...updatedQuestions[qIndex].correctAnswer] 
                                    : [];
                                  
                                  if (currentAnswers.includes(option)) {
                                    updatedQuestions[qIndex].correctAnswer = currentAnswers.filter(ans => ans !== option);
                                  } else {
                                    updatedQuestions[qIndex].correctAnswer = [...currentAnswers, option];
                                  }
                                  
                                  handlers.setQuestions(updatedQuestions);
                                }}
                                className={`
                                  absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer
                                  w-6 h-6 rounded border-2 flex items-center justify-center
                                  transition-all duration-200
                                  ${isCorrect 
                                    ? 'bg-green-500 border-green-400 text-white' 
                                    : 'bg-white border-gray-300 hover:border-green-400'}
                                `}
                              >
                                {isCorrect && <span className="text-sm">✓</span>}
                              </div>
                            )}
                            
                            {/* Single answer radio button */}
                            {!question.isMultiAnswer && (
                              <div 
                                onClick={() => {
                                  const updatedQuestions = [...formState.questions];
                                  updatedQuestions[qIndex].correctAnswer = option;
                                  handlers.setQuestions(updatedQuestions);
                                }}
                                className={`
                                  absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer
                                  w-6 h-6 rounded-full border-2 flex items-center justify-center
                                  ${isCorrect 
                                    ? 'border-green-400' 
                                    : 'border-gray-300 hover:border-green-400'}
                                `}
                              >
                                {isCorrect && (
                                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="pl-11">
                      <div className="flex items-center gap-2 text-green-600">
                        <span className="text-xl">✅</span>
                        <p className="font-medium">
                          Correct Answer: <span className="text-green-700">{question.correctAnswer}</span>
                        </p>
                      </div>
                    </div>

                    <div key={question.id} className="bg-white p-6 rounded-xl border-2 border-purple-200 shadow-md hover:shadow-lg transition-all">
                      
                      {/* Only render validation when feedback exists */}
                      {formState.validationFeedback?.feedback && 
                      formState.validationFeedback.feedback.find(f => f.question_id === question.id) && (
                        <handlers.QuestionValidation 
                          feedback={formState.validationFeedback.feedback.find(
                            f => f.question_id === question.id
                          )} 
                        />
                      )}
                    </div>
                  </div>
                ))}
              
                <Button 
                  type="button" 
                  onClick={handlers.generateQuizWithAI}
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
              onClick={handlers.handleAddQuestion} 
              variant="outline"
              className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 border-2 border-indigo-300"
            >
              Add Question ✨
            </Button>
            <Button
              type="button"
              onClick={() => handlers.setQuestions(formState.questions.slice(0, -1))}
              variant="outline"
              className="bg-red-100 hover:bg-red-200 text-red-700 border-2 border-red-300"
              disabled={formState.questions.length <= 1}
            >
              Remove Question 🗑️
            </Button>
          </div>
          <Button
            type="button"
            onClick={async () => {
              try {
                const validation = await handlers.validateQuizQuestions(
                  formState.questions, 
                  formState.difficulty
                );
                handlers.setValidationFeedback(validation);
              } catch (error) {
                handlers.setError('Failed to validate questions');
              }
            }}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
          >
            Validate Questions
          </Button>
          <Button 
            type="submit" 
            disabled={formState.loading}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
          >
            Submit Quiz
          </Button>
          </CardFooter>
          </form>
        </Card>
      );
    }