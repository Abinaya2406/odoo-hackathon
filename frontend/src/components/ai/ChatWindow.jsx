import React, { useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { SuggestedQuestions } from './SuggestedQuestions';
import { Bot, Sparkles, Loader2 } from 'lucide-react';

export const ChatWindow = React.memo(({
  messages = [],
  loading = false,
  suggestedQuestions = [],
  onSelectSuggested
}) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar rounded-2xl bg-slate-50/70 border border-slate-200 min-h-[420px] max-h-[580px]"
    >
      {/* If empty state */}
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">StockSense AI Inventory Copilot</h3>
            <p className="text-xs text-slate-500 max-w-md mt-1">
              Ask questions in plain English to investigate inventory stockout hazards, anomalies, burn rates, and warehouse capacities.
            </p>
          </div>

          <div className="max-w-xl w-full pt-2">
            <SuggestedQuestions
              questions={suggestedQuestions}
              onSelectQuestion={onSelectSuggested}
            />
          </div>
        </div>
      ) : (
        <>
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {/* AI Thinking/Typing indicator */}
          {loading && (
            <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl w-fit shadow-xs animate-in fade-in">
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                <span>StockSense AI is analyzing models</span>
                <span className="flex gap-1 ml-1">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
});

ChatWindow.displayName = 'ChatWindow';
