
import React, { useState } from 'react';
import { DailyGoal } from '../types';

interface DailyGoalSectionProps {
  goals: DailyGoal[];
  onSetGoal: (text: string, totalSteps: number) => void;
  onUpdateProgress: (goalId: string, currentSteps: number) => void;
  onClearGoal: (goalId: string) => void;
}

const DailyGoalSection: React.FC<DailyGoalSectionProps> = ({ goals, onSetGoal, onUpdateProgress, onClearGoal }) => {
  const [inputText, setInputText] = useState('');
  const [steps, setSteps] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSetGoal(inputText.trim(), steps);
      setInputText('');
      setSteps(1);
      setIsAdding(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center space-y-8">
      {/* Header for the section */}
      <div className="text-[10px] uppercase tracking-widest text-[#9a8c98] opacity-70 flex items-center space-x-2">
        <span>Daily Foci</span>
        {goals.length > 0 && <span className="w-1 h-1 bg-[#9a8c98]/40 rounded-full"></span>}
        {goals.length > 0 && <span>{goals.length} active</span>}
      </div>

      {/* List of goals */}
      <div className="w-full space-y-10">
        {goals.map((goal) => {
          const progressPercentage = (goal.currentSteps / goal.totalSteps) * 100;
          return (
            <div key={goal.id} className="flex flex-col items-center w-full space-y-4 animate-fade-in-up">
              <div className="flex flex-col items-center space-y-4 w-full max-w-xs relative group">
                <button 
                  onClick={() => onClearGoal(goal.id)}
                  className="absolute -right-8 top-1 opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity p-1 text-[#9a8c98]"
                  title="Remove focus"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <span className={`text-lg serif italic text-center transition-all duration-500 ${goal.isCompleted ? 'line-through text-[#9a8c98] opacity-60' : 'text-[#4a4e69]'}`}>
                  {goal.text}
                </span>
                
                {/* Progress Dots */}
                <div className="flex flex-col items-center space-y-3">
                  <div className="flex space-x-2">
                    {Array.from({ length: goal.totalSteps }).map((_, i) => {
                      const isActive = i < goal.currentSteps;
                      return (
                        <button
                          key={i}
                          disabled={goal.isCompleted}
                          onClick={() => onUpdateProgress(goal.id, i + 1)}
                          className={`
                            w-5 h-5 rounded-full border border-[#4a4e69]/20 transition-all duration-500 flex items-center justify-center
                            ${isActive ? 'bg-[#4a4e69] border-[#4a4e69]' : 'hover:bg-[#4a4e69]/10'}
                            ${goal.isCompleted ? 'cursor-default' : 'cursor-pointer'}
                          `}
                        >
                          {isActive && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="white" viewBox="0 0 16 16">
                              <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l2.578 2.576 5.894-5.93z"/>
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Undo Button */}
                  {goal.currentSteps > 0 && !goal.isCompleted && (
                    <button 
                      onClick={() => onUpdateProgress(goal.id, goal.currentSteps - 1)}
                      className="text-[9px] uppercase tracking-widest text-[#4a4e69] opacity-30 hover:opacity-100 transition-opacity flex items-center space-x-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" fill="currentColor" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
                        <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966a.25.25 0 0 0 .41-.192z"/>
                      </svg>
                      <span>Undo step</span>
                    </button>
                  )}
                </div>

                {/* Subtle Progress Bar */}
                <div className="w-full h-[2px] bg-[#4a4e69]/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#4a4e69]/20 transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Goal Form or Toggle */}
      {!isAdding ? (
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] text-[#4a4e69] opacity-40 hover:opacity-100 transition-all py-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Add a new focus</span>
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col items-center space-y-6 animate-fade-in-up py-4 border-t border-[#f2e9e4]">
          <div className="relative w-full">
            <input
              autoFocus
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="A small step to take..."
              className="w-full bg-transparent border-b border-[#4a4e69]/20 py-2 px-1 text-center text-[#4a4e69] focus:outline-none focus:border-[#4a4e69] transition-colors placeholder:text-[#9a8c98]/40 placeholder:italic"
            />
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-[10px] uppercase tracking-widest text-[#9a8c98] opacity-60">How many times?</span>
            <div className="flex bg-[#f2e9e4]/40 rounded-full p-1">
              {[1, 2, 3, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setSteps(num)}
                  className={`w-8 h-8 rounded-full text-xs transition-all duration-300 ${steps === num ? 'bg-[#4a4e69] text-white shadow-sm' : 'text-[#4a4e69] hover:bg-[#4a4e69]/10'}`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="flex space-x-4">
            <button 
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-[9px] uppercase tracking-[0.2em] text-[#9a8c98] hover:text-[#4a4e69] transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className="text-[10px] uppercase tracking-[0.2em] text-[#4a4e69] font-medium disabled:opacity-20 transition-all"
            >
              Begin path
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default DailyGoalSection;
