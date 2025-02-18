// QuizQuestion interface
export interface QuizQuestion {
    id: string; // Unique question ID
    question: string; // Question text
    options: string[]; // Options Array
    correctAnswer: string | string[]; // String array to handle multiple correct answers
    imageUrl?: string; // Optional image URL
    isMultiAnswer?: boolean; // Optional multi-answer question flag
    explanation?: string; // Optional explanation for a question's answer
}

export interface Quiz { // Quiz interface
    id: string;
    title: string;
    description: string;
    questions: QuizQuestion[];
    difficulty: 'beginner' | 'intermediate' | 'expert';
}

export interface QuizFormProps { // QuizFormProps interface, defines props for QuizForm component
    onClose?: () => void;
    quiz?: Quiz;
}

export type Difficulty = 'beginner' | 'intermediate' | 'expert';

export interface ValidationFeedback {
    score: number;
    feedback: Array<{
      question_id: string;
      score: number;
      issues: string[];
      suggestions: string[];
    }>;
    overall_feedback: string;
    difficulty_alignment: number;
}

