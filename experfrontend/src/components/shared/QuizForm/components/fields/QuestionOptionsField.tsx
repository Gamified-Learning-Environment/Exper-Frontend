// Manages options input fields for the question form, allowing users to input options for a question.

interface QuestionOptionsFieldProps {
  options: string[];
  qIndex: number;
  handleOptionChange: (questionIndex: number, optionIndex: number, value: string) => void;
}

export const QuestionOptionsField = ({ options, qIndex, handleOptionChange }: QuestionOptionsFieldProps) => {
  return (
    <div className="grid gap-3">
      {options.map((option, oIndex) => (
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
  );
};