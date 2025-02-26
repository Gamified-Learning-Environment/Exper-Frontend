// Definition of the interfaces used in the Quiz component

export interface QuizQuestion { // QuizQuestion interface
    id: string;
    question: string;
    options: string[];
    correctAnswer: string | string[]; // Can be a single string or an array of strings
    imageUrl?: string;
    isMultiAnswer?: boolean; // Multiple answer question flag
    explanation?: string;
}

export interface Quiz { // Quiz interface
    id: string;
    title: string;
    description: string;
    questions: QuizQuestion[];
    difficulty: 'beginner' | 'intermediate' | 'expert';
    userId? : string;
    category?: string;
    aiModel?: AIModel;
}

export interface QuestionAttempt {
    questionIndex: number;
    timeSpent: number;
    isCorrect: boolean;
}

export interface ProgressData {
    attempts: QuestionAttempt[];
    correctCount: number;
    incorrectCount: number;
}

// Props
export interface QuizProgressLineProps {
    attempts: QuestionAttempt[];
}

export interface ResultsBarChartProps {
    correct: number;
    incorrect: number;
}

export interface QuestionTypeBreakdownProps {
    questions: QuizQuestion[];
    selectedAnswers: (string | string[])[];
}

export interface QuizProps {
    quiz: Quiz;
}

export type AIModel = 'gpt' | 'claude';