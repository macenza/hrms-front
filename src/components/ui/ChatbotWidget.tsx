"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Trash2,
  Sparkles,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

// Contextual chip questions helper
const getSuggestionsForPage = (path: string) => {
  if (path.includes('/payroll')) {
    return [
      "Where are my salary slips?",
      "How is my salary calculated?",
      "Download my monthly slip PDF",
      "Do I have active loan EMIs?"
    ];
  }
  if (path.includes('/leaves') || path.includes('/leave')) {
    return [
      "How to apply leave?",
      "What is my casual leave balance?",
      "How can manager approve leaves?",
      "Can I take sick leave?"
    ];
  }
  if (path.includes('/attendance')) {
    return [
      "How to clock in daily?",
      "Where can I see clock out time?",
      "What are the attendance timings?",
      "Submit missing clock-in correction"
    ];
  }
  if (path.includes('/settings')) {
    return [
      "How to change my password?",
      "Where is profile setting?",
      "Manage account notification alerts",
      "Configure global settings"
    ];
  }
  if (path.includes('/loans')) {
    return [
      "How to request a salary loan?",
      "Calculate my EMI schedule",
      "Check pending loan status",
      "Active loans repayment policy"
    ];
  }
  return [
    "How to apply leave?",
    "Where is payroll section?",
    "How to check attendance?",
    "Can I request a salary loan?",
    "Where are IT asset details?"
  ];
};

export default function ChatbotWidget() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize session ID, load messages, and trigger first-time tooltip delay
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let storedSessionId = sessionStorage.getItem('macenza_chat_session_id');
      if (!storedSessionId) {
        storedSessionId = 'sess_' + Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('macenza_chat_session_id', storedSessionId);
      }
      setSessionId(storedSessionId);

      // Load cached messages from sessionStorage if available
      const cached = sessionStorage.getItem(`macenza_chat_history_${storedSessionId}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached).map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(parsed);
        } catch (e) {
          initializeWelcomeMessage();
        }
      } else {
        initializeWelcomeMessage();
      }

      // Check if welcoming tooltip has been dismissed in this session
      const dismissed = sessionStorage.getItem('macenza_chat_tooltip_dismissed');
      if (!dismissed) {
        const timer = setTimeout(() => {
          setShowTooltip(true);
        }, 1500); // 1.5s delay after page load for elegant entrance
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const toggleChat = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      setShowTooltip(false);
      sessionStorage.setItem('macenza_chat_tooltip_dismissed', 'true');
    }
  };

  const initializeWelcomeMessage = () => {
    const welcome: Message = {
      id: 'welcome',
      sender: 'bot',
      text: "👋 Hi there!\n\nNeed help navigating the platform?\nAsk me anything about HRMS features and workflows.",
      timestamp: new Date()
    };
    setMessages([welcome]);
  };

  // Cache messages to sessionStorage when updated
  useEffect(() => {
    if (sessionId && messages.length > 0) {
      sessionStorage.setItem(`macenza_chat_history_${sessionId}`, JSON.stringify(messages));
    }
  }, [messages, sessionId]);

  // Autoscroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    setErrorMsg(null);
    const userMessage: Message = {
      id: `msg_${Date.now()}_u`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const payload = {
        message: userMessage.text,
        sessionId: sessionId || undefined,
        currentPage: pathname || '/',
        role: user?.role || 'Employee',
        stream: true
      };

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiBaseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Initialize a new empty message for bot streaming chunks
      const botMessageId = `msg_${Date.now()}_b`;
      const initialBotMessage: Message = {
        id: botMessageId,
        sender: 'bot',
        text: "",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, initialBotMessage]);

      const contentType = response.headers.get('Content-Type') || '';
      
      if (contentType.includes('application/json')) {
        const data = await response.json();
        setMessages(prev => 
          prev.map(msg => 
            msg.id === botMessageId ? { ...msg, text: data.text } : msg
          )
        );

        // Silent dynamic redirection ONLY on targetPage="/contact"
        if (data.redirectPath === '/contact') {
          const customMessage = data.redirectMessage || "🚀 **Redirecting to Contact page...**";
          setTimeout(() => {
            const statusMessage: Message = {
              id: `msg_${Date.now()}_status`,
              sender: 'bot',
              text: customMessage,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, statusMessage]);
          }, 800);

          setTimeout(() => {
            router.push(data.redirectPath);
          }, 2000);
        }

        if (data.sessionId && data.sessionId !== sessionId) {
          setSessionId(data.sessionId);
          sessionStorage.setItem('macenza_chat_session_id', data.sessionId);
        }
      } else {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let completeText = "";

        if (reader) {
          let isDone = false;
          while (!isDone) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6).trim();
                if (dataStr === '[DONE]') {
                  isDone = true;
                  break;
                }
                try {
                  const parsed = JSON.parse(dataStr);
                  
                  if (parsed.text) {
                    completeText += parsed.text;
                    setMessages(prev => 
                      prev.map(msg => 
                        msg.id === botMessageId ? { ...msg, text: completeText } : msg
                      )
                    );
                  }

                  // If done metadata packet is received
                  if (parsed.done) {
                    isDone = true;
                    
                    // Silent dynamic redirection ONLY on targetPage="/contact"
                    if (parsed.redirectPath === '/contact') {
                      const customMessage = parsed.redirectMessage || "🚀 **Redirecting to Contact page...**";
                      setTimeout(() => {
                        const statusMessage: Message = {
                          id: `msg_${Date.now()}_status`,
                          sender: 'bot',
                          text: customMessage,
                          timestamp: new Date()
                        };
                        setMessages(prev => [...prev, statusMessage]);
                      }, 800);

                      setTimeout(() => {
                        router.push(parsed.redirectPath);
                      }, 2000);
                    }

                    if (parsed.sessionId && parsed.sessionId !== sessionId) {
                      setSessionId(parsed.sessionId);
                      sessionStorage.setItem('macenza_chat_session_id', parsed.sessionId);
                    }
                  }
                } catch (err) {
                  // Skip incomplete streaming JSON parses
                }
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.error('❌ Chatbot Client Error:', err);
      setErrorMsg("Failed to connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!sessionId) return;

    const confirmClear = window.confirm("Are you sure you want to clear your conversation history?");
    if (!confirmClear) return;

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      await fetch(`${apiBaseUrl}/chat/clear/${sessionId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn("Could not delete history on server, clearing locally.", e);
    }

    setMessages([]);
    sessionStorage.removeItem(`macenza_chat_history_${sessionId}`);
    initializeWelcomeMessage();
    setErrorMsg(null);
  };

  const parseMarkdown = (text: string) => {
    // Basic bold parser
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Basic list bullet parser
    formatted = formatted.replace(/^\*\s(.*)/gm, '<li>$1</li>');
    // Convert newlines to breaks
    formatted = formatted.replace(/\n/g, '<br />');

    // Replace markdown links e.g. [Contact page](/contact)
    formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="underline text-[#6D5DFD] hover:text-[#8B7BFF] font-bold">$1</a>');

    return <div className="chat-message-content" dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  const dynamicSuggestions = getSuggestionsForPage(pathname || '/');

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end font-sans">
      {/* Global Widget Styles (List spacing, margin, & animations) */}
      <style>{`
        @keyframes gentleBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .gentle-bounce {
          animation: gentleBounce 2.5s infinite ease-in-out;
        }
        .chat-message-content li {
          list-style-type: disc !important;
          list-style-position: outside !important;
          margin-left: 1.25rem !important;
          padding-left: 0.15rem !important;
          margin-top: 0.35rem;
          margin-bottom: 0.35rem;
        }
        .chat-message-content strong {
          font-weight: 700;
        }
      `}</style>

      {/* Dynamic Pop-up Card with Smooth Scale Transitions */}
      <div
        className={`
          mb-4 
          w-[calc(100vw-2rem)] 
          sm:w-[400px] 
          h-[580px] 
          max-h-[72vh] 
          sm:max-h-[80vh] 
          bg-white/95 
          dark:bg-[#0B1437]/95 
          backdrop-blur-md
          rounded-3xl 
          shadow-[0_16px_48px_rgba(15,23,42,0.15)] 
          dark:shadow-[0_24px_60px_rgba(0,0,0,0.6)]
          border 
          border-[#6D5DFD]/20 
          dark:border-gray-800/80
          flex 
          flex-col 
          overflow-hidden 
          transition-all 
          duration-300 
          transform 
          origin-bottom-right
          ${isOpen ? 'scale-100 opacity-100 visible pointer-events-auto' : 'scale-0 opacity-0 invisible pointer-events-none'}
        `}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#6D5DFD] to-[#8B7BFF] p-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                <Sparkles size={20} className="text-white" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#6D5DFD] rounded-full animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-wide">MACENZA AI</h3>
              <span className="text-xs text-white/85 flex items-center gap-1 font-semibold">
                Platform Assistant
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearHistory}
              title="Clear Chat History"
              className="p-2 hover:bg-white/15 rounded-xl transition duration-200"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/15 rounded-xl transition duration-200"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 dark:bg-[#080F30] space-y-4 scrollbar-thin">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[85%] 
                  rounded-2xl 
                  p-3.5 
                  text-sm 
                  leading-relaxed
                  shadow-sm
                  ${msg.sender === 'user'
                    ? 'bg-gradient-to-r from-[#6D5DFD] to-[#8B7BFF] text-white rounded-tr-none'
                    : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none'
                  }
                `}
              >
                {parseMarkdown(msg.text)}
                <span
                  className={`
                    block 
                    text-[10px] 
                    mt-1.5 
                    text-right
                    ${msg.sender === 'user' ? 'text-white/60' : 'text-gray-400'}
                  `}
                >
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {/* Dynamic Typing Indicator */}
          {isLoading && messages.length > 0 && messages[messages.length - 1].sender === 'user' && (
            <div className="flex justify-start items-center gap-2.5">
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl rounded-tl-none p-3.5 shadow-sm flex items-center gap-1.5">
                <span className="text-xs text-gray-400 font-semibold mr-1">MACENZA AI is thinking</span>
                <div className="w-1.5 h-1.5 bg-[#6D5DFD] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-[#6D5DFD] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-[#6D5DFD] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {/* Connection Error Notice */}
          {errorMsg && (
            <div className="flex justify-center p-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-xl gap-2 items-center text-xs text-rose-600 dark:text-rose-400 font-semibold">
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Dynamic Context-Driven Suggestion Chips */}
        <div className="px-4 py-3 bg-white dark:bg-[#0B1437] border-t border-gray-100 dark:border-gray-850">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 flex items-center gap-1">
            <HelpCircle size={10} /> Suggested Questions
          </p>
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 whitespace-nowrap scrollbar-none">
            {dynamicSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(suggestion)}
                disabled={isLoading}
                className="
                  px-3 
                  py-1.5 
                  bg-gray-50 
                  dark:bg-gray-900 
                  border 
                  border-gray-100 
                  dark:border-gray-850 
                  rounded-full 
                  text-xs 
                  font-bold
                  text-gray-600 
                  dark:text-gray-300 
                  hover:border-[#6D5DFD]/30 
                  hover:text-[#6D5DFD] 
                  transition 
                  duration-200 
                  cursor-pointer
                  disabled:opacity-50
                  disabled:pointer-events-none
                "
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Input Panel */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="p-3 bg-gray-50 dark:bg-gray-900/60 border-t border-gray-150 dark:border-gray-850 flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me how to apply leave, download slips..."
            disabled={isLoading}
            className="
              flex-1 
              bg-white 
              dark:bg-[#0B1437] 
              border 
              border-gray-200 
              dark:border-gray-800 
              rounded-2xl 
              px-4 
              py-2.5 
              text-sm 
              outline-none 
              text-gray-800 
              dark:text-white
              focus:border-[#6D5DFD] 
              dark:focus:border-[#6D5DFD] 
              focus:ring-1 
              focus:ring-[#6D5DFD]
              transition-all
              disabled:opacity-60
            "
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="
              w-10 
              h-10 
              bg-[#6D5DFD] 
              hover:bg-[#5B4DF0] 
              text-white 
              rounded-2xl 
              flex 
              items-center 
              justify-center 
              transition-all 
              duration-200 
              hover:scale-95
              active:scale-90
              disabled:bg-gray-300 
              dark:disabled:bg-gray-800 
              disabled:text-gray-400 
              disabled:scale-100 
              disabled:pointer-events-none
              shadow-md
              shadow-[#6D5DFD]/20
            "
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      {/* Floating Welcoming Tooltip (Bounces gently above launcher) */}
      {!isOpen && showTooltip && (
        <div
          className="
            absolute 
            bottom-18 
            right-0 
            mb-2 
            w-52 
            bg-white/95 
            dark:bg-[#0B1437]/95 
            backdrop-blur-md 
            border 
            border-[#6D5DFD]/30 
            rounded-2xl 
            p-3 
            shadow-[0_8px_30px_rgba(109,93,253,0.12)] 
            dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)]
            text-gray-800 
            dark:text-white 
            gentle-bounce
            z-40
            cursor-pointer
          "
          onClick={toggleChat}
        >
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
                sessionStorage.setItem('macenza_chat_tooltip_dismissed', 'true');
              }}
              className="absolute -top-1.5 -right-1.5 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-full transition duration-150"
            >
              <X size={12} />
            </button>

            <div className="flex items-start gap-2 pr-2">
              <div className="w-5 h-5 rounded-lg bg-[#6D5DFD]/10 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles size={12} className="text-[#6D5DFD] animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">Ask your queries here!</p>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-tight font-medium">Click to chat with MACENZA AI</p>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white dark:bg-[#0B1437] border-r border-b border-[#6D5DFD]/30 rotate-45" />
        </div>
      )}

      {/* Floating Circle Launcher */}
      <button
        onClick={toggleChat}
        className="
          group
          w-14 
          h-14 
          bg-gradient-to-r 
          from-[#6D5DFD] 
          to-[#8B7BFF] 
          text-white 
          rounded-2xl 
          flex 
          items-center 
          justify-center 
          shadow-[0_8px_25px_rgba(109,93,253,0.4)]
          hover:scale-105 
          hover:rotate-3
          active:scale-95 
          transition-all 
          duration-300 
          cursor-pointer
          relative
          overflow-hidden
        "
        aria-label="Toggle MACENZA AI Assistant"
      >
        <div className="absolute inset-0 border border-white/20 rounded-2xl group-hover:scale-110 transition duration-300 animate-pulse" />

        {isOpen ? (
          <X size={24} className="transform rotate-0 scale-100 transition-all duration-300" />
        ) : (
          <MessageSquare size={24} className="transform scale-100 transition-all duration-300" />
        )}
      </button>
    </div>
  );
}
