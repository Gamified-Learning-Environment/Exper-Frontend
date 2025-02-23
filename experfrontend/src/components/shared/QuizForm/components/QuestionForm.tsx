// Indivisual Question Form Component, for handling individual question input fields and options.

import { Button } from "@/components/ui/button";
import { ImageIcon, Upload, X } from "lucide-react";
import { QuizQuestion } from "../types";
import { ImageUploadField } from "./fields/ImageUploadField";
import { QuestionOptionsField } from "./fields/QuestionOptionsField";

interface QuestionFormProps {
    question: QuizQuestion;
    index: number;
    handleQuestionChange: (index: number, field: keyof QuizQuestion, value: any) => void;
    handleOptionChange: (questionIndex: number, optionIndex: number, value: string) => void;
    handleImageUpload: (questionIndex: number, file: File) => void;
    imageLoading: { [key: string]: boolean };
  }

  export const QuestionForm = ({
    question,
    index: qIndex,
    handleQuestionChange,
    handleOptionChange,
    handleImageUpload,
    imageLoading
}: QuestionFormProps) => {
    return (
        <div className="bg-white p-4 rounded-lg border-2 border-green-200 space-y-4 transition-all hover:shadow-md">
      <h4 className="font-bold text-green-700 flex items-center gap-2">Question {qIndex + 1}</h4>

      {/* Question Text fields */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Question Text</label>
        <input
          type="text"
          value={question.question}
          onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
          className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400"
          required
          title="Question Text"
          placeholder="Enter your question..."
        />
      </div>

      {/* Multiple Answer Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          title="Allow multiple correct answers"
          checked={question.isMultiAnswer}
          onChange={(e) => {
            handleQuestionChange(qIndex, 'isMultiAnswer', e.target.checked);
            handleQuestionChange(qIndex, 'correctAnswer', e.target.checked ? [] : '');
          }}
          className="rounded border-gray-300"
        />
        <label className="text-sm font-medium">Allow multiple correct answers</label>
      </div>

      {/* Options Field */}
      <QuestionOptionsField 
        options={question.options}
        qIndex={qIndex}
        handleOptionChange={handleOptionChange}
      />

      {/* Explanation field */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Answer Explanation (Optional)
        </label>
        <textarea
          value={question.explanation || ''}
          onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
          className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400"
          placeholder="Explain why this answer is correct..."
          rows={3}
        />
      </div>

      {/* Image Upload Field */}
      <ImageUploadField
        question={question}
        qIndex={qIndex}
        handleQuestionChange={handleQuestionChange}
        handleImageUpload={handleImageUpload}
        imageLoading={imageLoading}
      />
    </div>
  );
};
