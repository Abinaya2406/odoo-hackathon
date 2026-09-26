import React, { useState, useEffect } from 'react';
import { assistantService } from '../../services/assistantService';
import { useToast } from '../../context/ToastContext';
import { ChatWindow } from '../../components/ai/ChatWindow';
import { ChatInput } from '../../components/ai/ChatInput';
import { SuggestedQuestions } from '../../components/ai/SuggestedQuestions';
import { Sparkles, Bot, ShieldCheck, RefreshCw } from 'lucide-react';

export const AIAssistant = () => {
  const { showSuccess, showError } = useToast();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function initChat() {
      try {
        const history = await assistantService.getChatHistory();
        if (mounted) {
          setMessages(Array.isArray(history) ? history : []);
          setSuggestedQuestions(assistantService.getSuggestedQuestions());
        }
      } catch (err) {
        console.error('Error initializing assistant:', err);
      }
    }
    initChat();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSendMessage = async (queryText) => {
    if (!queryText.trim() || loading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText.trim(),
      type: 'text',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newThread = [...messages, userMessage];
    setMessages(newThread);
    setLoading(true);

    try {
      const aiReply = await assistantService.sendMessage(queryText.trim());
      const updatedThread = [...newThread, aiReply];
      setMessages(updatedThread);
      await assistantService.saveChatHistory(updatedThread);
    } catch (err) {
      showError('AI inference service error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    await assistantService.clearChatHistory();
    setMessages([]);
    showSuccess('Conversation cleared.');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">StockSense AI Assistant</h2>
            <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              NLP Inventory Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Query stock burn rates, detect anomalies, compare warehouse holdings, and inspect SKUs with natural language
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
          <Bot className="w-4 h-4 text-blue-600" />
          <span className="font-semibold">Contextual Model:</span>
          <span className="text-slate-400">StockSense-v1.4</span>
        </div>
      </div>

      {/* Suggested Quick Questions Bar (always accessible above input or inside empty window) */}
      {messages.length > 0 && (
        <SuggestedQuestions
          questions={suggestedQuestions}
          onSelectQuestion={handleSendMessage}
          className="pb-1"
        />
      )}

      {/* Main Chat Thread Window */}
      <ChatWindow
        messages={messages}
        loading={loading}
        suggestedQuestions={suggestedQuestions}
        onSelectSuggested={handleSendMessage}
      />

      {/* Input Area */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onClearHistory={handleClearHistory}
        loading={loading}
      />
    </div>
  );
};
