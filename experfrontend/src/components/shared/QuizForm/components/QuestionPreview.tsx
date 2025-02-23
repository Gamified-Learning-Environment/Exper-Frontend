// Handles previewing of AI generated questions for the quiz form.

import type { QuizQuestion, ValidationFeedback } from "../types";
import { Button } from "@/components/ui/button";

interface QuestionPreviewProps {
    questions: QuizQuestion[];
    validationFeedback: ValidationFeedback | null;
    onRegenerate: () => Promise<void>;
}

export const QuestionPreview = ({
    questions,
    validationFeedback,
    onRegenerate
}: QuestionPreviewProps) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <span className="bg-purple-200 p-2 rounded-lg text-2xl">✨</span>
                <h3 className="text-2xl font-bold text-purple-800">Generated Questions</h3>
            </div>

            {validationFeedback && (
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">📊</span>
                    <h3 className="text-xl font-bold">
                        Quality Score: {validationFeedback.score}/100
                    </h3>
                    </div>
                    <div className="mb-4">
                    <h4 className="font-semibold text-purple-800">
                        Difficulty Alignment: {validationFeedback.difficulty_alignment}/100
                    </h4>
                    <p className="text-gray-700">{validationFeedback.overall_feedback}</p>
                    </div>
                </div>
            )}

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
                          ${question.correctAnswer.includes(option)
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
                onClick={onRegenerate}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 font-medium py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-center gap-2">
                  <span>🎲</span>
                  Regenerate Questions
                </div>
              </Button>

        </div>
    );
};