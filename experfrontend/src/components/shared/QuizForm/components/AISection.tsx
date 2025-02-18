import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AISectionProps {
    useAI: boolean;
    setUseAI: (value: boolean) => void;
    questionCount: number;
    setQuestionCount: (value: number) => void;
    difficulty: 'beginner' | 'intermediate' | 'expert';
    setDifficulty: (value: 'beginner' | 'intermediate' | 'expert') => void;
    notes: string;
    setNotes: (value: string) => void;
    pdfUrl: string;
    setPdfUrl: (value: string) => void;
    isGenerating: boolean;
    defaultPreferences: {
      defaultQuestionCount: number;
      categories: {
        [key: string]: {
          difficulty: 'beginner' | 'intermediate' | 'expert';
          questionCount: number;
        };
      };
    };
    selectedCategory: string;
    generateQuizWithAI: () => Promise<void>;
}

export const AISection = ({
    useAI,
    setUseAI,
    questionCount,
    setQuestionCount,
    difficulty,
    setDifficulty,
    notes,
    setNotes,
    pdfUrl,
    setPdfUrl,
    isGenerating,
    defaultPreferences,
    selectedCategory,
    generateQuizWithAI
  }: AISectionProps) => {
    return (
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
              onChange={() => setUseAI(!useAI)}
              className="w-5 h-5 text-purple-600"
              title="Use AI to Generate Quiz"
            />
            <label className='text-lg font-medium text-purple-700'>Use AI to Generate Quiz</label>
          </div>
        </div>
  
        {useAI && (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="text-sm font-medium text-purple-500 flex items-center gap-2">
                Number of Questions
              </label>
              <Slider
                value={[questionCount]}
                onValueChange={(value) => setQuestionCount(value[0])}
                min={1}
                max={20}
                step={1}
                className="w-full"
              />
              <span className="text-sm text-gray-500">
                {questionCount} questions (Default: {defaultPreferences.defaultQuestionCount})
              </span>
            </div>
  
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty Level</label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
              {selectedCategory && defaultPreferences.categories[selectedCategory] && (
                <p className="text-sm text-gray-500">
                  Preferred difficulty: {defaultPreferences.categories[selectedCategory].difficulty}
                </p>
              )}
            </div>
  
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">Notes</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
  
            <Button 
              type="button"
              onClick={generateQuizWithAI}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
            >
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
      </div>
    );
  };