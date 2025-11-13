
import React, { useState, useEffect, useRef } from 'react';
import type { Message } from './types';
import { createCbtChat } from './services/geminiService';
import type { Chat } from '@google/genai';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom whenever messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  useEffect(() => {
    // Initialize the chat session on component mount
    const session = createCbtChat();
    setChatSession(session);
    // Add the initial model message to the UI
    setMessages([
        { 
            id: 'initial-model-message', 
            role: 'model', 
            content: "نعم، فهمت. أنا 'مساعدك العلاجي الشخصي'. سأتبع الخطة العلاجية بدقة. أنا جاهز للبدء. من فضلك، صف لي شعورك الآن (الخطوة 0)."
        }
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = async (userInput: string) => {
    if (!chatSession) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
    };

    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setIsThinking(true);

    try {
      const result = await chatSession.sendMessage({ message: userInput });
      const modelResponse = result.text;
      
      const newModelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: modelResponse,
      };
      setMessages((prevMessages) => [...prevMessages, newModelMessage]);

    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      const errorMessage: Message = {
        id: 'error-' + Date.now(),
        role: 'model',
        content: "عذراً، حدث خطأ ما. يرجى المحاولة مرة أخرى.",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleExportConversation = () => {
    const formattedConversation = messages.map(msg => {
      const prefix = msg.role === 'user' ? 'أنت' : 'المساعد العلاجي';
      return `${prefix}:\n${msg.content}`;
    }).join('\n\n---------------------------------\n\n');

    const blob = new Blob([formattedConversation], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cbt_conversation_history.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex items-center justify-center p-4">
        <div className="flex flex-col h-full max-h-[90vh] w-full max-w-4xl bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl overflow-hidden ring-1 ring-black ring-opacity-5">
            <header className="relative p-6 bg-teal-700/90 text-white flex items-center justify-between shadow-md">
                <div className="text-start">
                    <h1 className="text-2xl font-bold">مساعدي العلاجي الشخصي</h1>
                    <p className="text-sm text-teal-100">تطبيق مبادئ العلاج المعرفي السلوكي (CBT)</p>
                </div>
                <button
                    onClick={handleExportConversation}
                    title="تنزيل المحادثة"
                    aria-label="تنزيل سجل المحادثة بالكامل"
                    className="w-12 h-12 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-teal-700 focus:ring-white"
                >
                    <i className="fas fa-file-export"></i>
                </button>
            </header>
            <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-8 space-y-8">
                {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
                ))}
                {isThinking && (
                    <div className="flex items-end gap-3 justify-start">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center shadow-md">
                            <i className="fa-solid fa-robot text-white"></i>
                        </div>
                        <div className="max-w-md lg:max-w-2xl rounded-2xl p-4 bg-white rounded-es-none shadow-md">
                            <div className="flex items-center justify-center space-x-2 space-x-reverse">
                                <div className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                <div className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                <div className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <footer className="sticky bottom-0">
                <ChatInput onSendMessage={handleSendMessage} isThinking={isThinking} />
            </footer>
        </div>
    </div>
  );
};

export default App;
