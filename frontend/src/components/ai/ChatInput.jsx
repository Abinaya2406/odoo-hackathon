import React, { useState } from 'react';
import { Send, Trash2, Loader2, Sparkles } from 'lucide-react';
import { Button } from '../Button';

export const ChatInput = React.memo(({
  onSendMessage,
  onClearHistory,
  loading = false,
  placeholder = 'Ask anything about inventory, predictions, anomalies, SKUs...'
}) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder={placeholder}
            className="w-full px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-60"
          />
        </div>

        {onClearHistory && (
          <button
            type="button"
            onClick={onClearHistory}
            className="p-2.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors shrink-0"
            title="Clear Chat Conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!input.trim() || loading}
          loading={loading}
          icon={Send}
          className="shrink-0"
        >
          Send
        </Button>
      </div>

      <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-blue-500" />
          Natural Language Engine • Press Enter to send
        </span>
        <span>Supports natural inventory queries</span>
      </div>
    </form>
  );
});

ChatInput.displayName = 'ChatInput';
