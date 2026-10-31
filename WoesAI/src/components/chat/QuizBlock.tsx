import React, { useState } from 'react';
import { HelpCircle, Check, Sparkles } from 'lucide-react';

export interface QuizOption {
  letter: string;
  text: string;
}

interface QuizBlockProps {
  question: string;
  options: QuizOption[];
  onSelectOption?: (optionLetter: string, optionText: string) => void;
}

export const QuizBlock: React.FC<QuizBlockProps> = ({
  question,
  options,
  onSelectOption,
}) => {
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const handleChoose = (opt: QuizOption) => {
    setSelectedLetter(opt.letter);
    if (onSelectOption) {
      onSelectOption(opt.letter, opt.text);
    }
  };

  return (
    <div className="my-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-xs">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
        <Sparkles className="w-4 h-4 text-amber-500 shrink-0" aria-hidden="true" />
        <span>Question d'évaluation interactive</span>
      </div>

      {/* Question Text */}
      <h4 className="text-[15px] sm:text-base font-bold text-slate-950 dark:text-white leading-snug mb-3.5">
        {question}
      </h4>

      {/* Options List */}
      <div className="space-y-2">
        {options.map((opt) => {
          const isSelected = selectedLetter === opt.letter;
          return (
            <button
              key={opt.letter}
              type="button"
              onClick={() => handleChoose(opt)}
              aria-pressed={isSelected}
              className={`w-full text-left p-3 sm:p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 border-amber-600 font-semibold shadow-xs ring-2 ring-amber-400/40'
                  : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  isSelected
                    ? 'bg-slate-950 text-amber-400'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
                }`}
              >
                {isSelected ? <Check className="w-3.5 h-3.5 text-amber-400" /> : opt.letter}
              </span>
              <span className="flex-1 leading-relaxed">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {/* Helper text */}
      <div className="mt-3 text-[12px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
        <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
        <span>Cliquez sur une option pour envoyer votre réponse et obtenir l'explication.</span>
      </div>
    </div>
  );
};
