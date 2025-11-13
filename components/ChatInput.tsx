import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isThinking: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isThinking }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isThinking) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-4 p-6 bg-white/70 border-t border-slate-200/80">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="صف شعورك هنا..."
        disabled={isThinking}
        rows={1}
        className="flex-1 p-3 bg-slate-100 text-slate-900 rounded-2xl resize-none border border-transparent focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none disabled:opacity-50 transition placeholder:text-slate-400"
      />
      <button
        type="submit"
        disabled={isThinking || !input.trim()}
        className="w-12 h-12 flex-shrink-0 bg-teal-600 text-white rounded-full flex items-center justify-center disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
      >
        {isThinking ? (
            <i className="fas fa-spinner fa-spin"></i>
        ) : (
            <i className="fas fa-paper-plane"></i>
        )}
      </button>
    </form>
  );
};

export default ChatInput;