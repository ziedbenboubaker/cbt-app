import React from 'react';
import type { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isModel = message.role === 'model';
  // Trim whitespace to make the check more robust against model output variations
  const isSummaryMessage = isModel && message.content.trim().startsWith('ملخص الجلسة العلاجية:');

  const handleDownload = () => {
    const blob = new Blob([message.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cbt_session_summary.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex items-end gap-3 ${isModel ? 'justify-start' : 'justify-end'}`}>
      {isModel && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center shadow-md">
          <i className="fa-solid fa-robot text-white"></i>
        </div>
      )}
      <div
        className={`max-w-md lg:max-w-2xl rounded-2xl p-4 shadow-md ${
          isModel
            ? 'bg-white text-slate-700 rounded-es-none'
            : 'bg-teal-200 text-teal-900 rounded-ee-none'
        }`}
      >
        <p className="text-start whitespace-pre-wrap">{message.content}</p>
      </div>
      {isSummaryMessage && (
        <button
          onClick={handleDownload}
          title="Download Summary"
          aria-label="Download session summary"
          className="w-10 h-10 flex-shrink-0 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center hover:bg-teal-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          <i className="fas fa-download"></i>
        </button>
      )}
    </div>
  );
};

export default ChatMessage;