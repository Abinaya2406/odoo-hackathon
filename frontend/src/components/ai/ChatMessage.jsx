import React from 'react';
import { Sparkles, User, Bot } from 'lucide-react';
import { AIResponseCard } from './AIResponseCard';

export const ChatMessage = React.memo(({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div
      className={`flex items-start gap-3 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      } animate-in fade-in duration-150`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-blue-500/20'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Bubble Container */}
      <div className={`max-w-[85%] sm:max-w-[75%] space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2 px-1">
          <span className="text-[11px] font-bold text-slate-700">
            {isUser ? 'You' : 'StockSense AI'}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {message.timestamp || 'Just now'}
          </span>
        </div>

        <div
          className={`p-4 rounded-2xl text-xs leading-relaxed shadow-xs ${
            isUser
              ? 'bg-blue-600 text-white rounded-tr-xs'
              : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
          }`}
        >
          {/* Main message text */}
          <div className="whitespace-pre-wrap">{message.text}</div>

          {/* Embedded rich response container */}
          {!isUser && message.type && message.type !== 'text' && (
            <AIResponseCard response={message} />
          )}
        </div>
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';
