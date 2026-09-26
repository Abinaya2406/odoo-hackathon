import React from 'react';
import { Sparkles, ArrowUpRight } from 'lucide-react';

export const SuggestedQuestions = React.memo(({
  questions = [],
  onSelectQuestion,
  className = ''
}) => {
  if (!questions || questions.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
        Suggested Inventory Queries
      </span>
      <div className="flex flex-wrap gap-2">
        {questions.map((q, idx) => (
          <button
            key={`prompt-${idx}`}
            type="button"
            onClick={() => onSelectQuestion(q)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-700 bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-200 transition-all shadow-2xs group text-left"
          >
            <span>{q}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
});

SuggestedQuestions.displayName = 'SuggestedQuestions';
