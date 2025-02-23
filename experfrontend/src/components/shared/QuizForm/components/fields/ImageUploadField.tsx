// Manages image uploading functionality for the question form, allowing users to upload images for questions.

import { Button } from "@/components/ui/button";
import { ImageIcon, Upload, X } from "lucide-react";
import { QuizQuestion } from "../../types";

interface ImageUploadFieldProps {
  question: QuizQuestion;
  qIndex: number;
  handleQuestionChange: (index: number, field: keyof QuizQuestion, value: any) => void;
  handleImageUpload: (questionIndex: number, file: File) => void;
  imageLoading: { [key: string]: boolean };
}

export const ImageUploadField = ({ 
  question, 
  qIndex, 
  handleQuestionChange, 
  handleImageUpload, 
  imageLoading 
}: ImageUploadFieldProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        <ImageIcon className="w-4 h-4 inline mr-2" />
        Question Image (Optional)
      </label>

      <div className="relative">
        {question.imageUrl ? (
          <div className="relative group">
            <img
              src={question.imageUrl}
              alt="Question image"
              className="w-full h-48 object-cover rounded-lg shadow-md transition-all duration-300 group-hover:brightness-75"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 rounded-full bg-red-500/90 hover:bg-red-600"
              onClick={() => handleQuestionChange(qIndex, 'imageUrl', undefined)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(qIndex, file);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              title="Upload an image for the question"
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
  );
};