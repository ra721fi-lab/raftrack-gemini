import React, { useState, useContext, useRef, useEffect } from 'react';
import { TransactionContext } from '../context/TransactionContext';
import { MessageSquare, X, Send, Cpu, Sparkles } from 'lucide-react';

const AIChatbot = () => {
  const { sendChatToAI } = useContext(TransactionContext);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Halo! Saya adalah **Asisten AI RafTrack Gemini** 🌌. Saya memantau catatan keuangan Anda dan siap menganalisis pengeluaran, memprediksi anggaran, serta memberikan saran penghematan cerdas secara instan!\n\nCobalah tanyakan seperti: *"Apakah pengeluaran saya boros?"* atau *"Berapa saldo saya saat ini?"*',
      time: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const chatEndRef = useRef(null);

  // Scroll otomatis ke pesan terbaru
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputValue,
      time: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Kirim pesan ke API backend chatbot
      const replyText = await sendChatToAI(userMessage.text);
      
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: replyText,
          time: new Date()
        }
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  // Render teks dengan format bold markdown sederhana (**)
  const renderText = (text) => {
    return text.split('\n').map((paragraph, index) => {
      const parts = paragraph.split('**');
      return (
        <p key={index} className={index > 0 ? 'mt-2' : ''}>
          {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-neonBlue font-bold">{part}</strong> : part)}
        </p>
      );
    });
  };

  return (
    <div className="font-sans">
      
      {/* FLOATING ACTION TRIGGER BUTTON */}
      {!isOpen && (
        <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50">
          <button
            onClick={() => setIsOpen(true)}
            className="relative flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-tr from-neonPurple to-neonBlue shadow-neon-purple text-white hover:scale-105 transition-transform duration-300 group"
          >
            <div className="absolute inset-0.5 rounded-full bg-darkSpace-900 flex items-center justify-center">
              <Cpu className="w-5 h-5 lg:w-6 lg:h-6 text-neonBlue group-hover:rotate-12 transition-transform duration-500 neon-text-blue" />
            </div>
            {/* Sparkles glow */}
            <Sparkles className="absolute top-0 right-0 w-3.5 h-3.5 lg:w-4 lg:h-4 text-cyanGlow animate-pulse" />
            {/* Ambient border glow pulse */}
            <span className="absolute -inset-1 rounded-full bg-gradient-to-tr from-neonPurple to-neonBlue opacity-30 blur animate-pulse-slow"></span>
          </button>
        </div>
      )}

      {/* CHAT WINDOW INTERFACE */}
      {isOpen && (
        <div 
          className="fixed bottom-[80px] right-4 left-4 sm:left-auto sm:right-6 sm:bottom-24 sm:w-[380px] h-[460px] sm:h-[500px] z-50 glass-panel flex flex-col border-neonPurple/30 shadow-neon-purple"
          style={{ boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)' }}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between p-4 border-b border-white/5 bg-gradient-to-r from-neonPurple/10 to-neonBlue/10 rounded-t-2xl">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-lg bg-neonBlue/10 border border-neonBlue/30 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-neonBlue neon-text-blue animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 tracking-wide font-mono">GEMINI INSIGHT AGENT</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyanGlow animate-ping"></span>
                  <span className="text-[10px] font-mono text-cyanGlow font-semibold uppercase">READY_TO_ADVISE</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* MESSAGES LOG */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin">
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div 
                  key={msg.id}
                  className={`flex ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                      isAi 
                        ? 'bg-darkSpace-800/80 border border-white/5 text-slate-200 rounded-tl-sm'
                        : 'bg-gradient-to-r from-neonPurple/30 to-neonBlue/30 border border-neonBlue/20 text-white rounded-tr-sm'
                    }`}
                  >
                    {renderText(msg.text)}
                    
                    {/* Timestamp */}
                    <p className="text-[9px] text-slate-500 font-mono mt-1 text-right">
                      {new Date(msg.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* TYPING LOADER DOTS */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-darkSpace-800/80 border border-white/5 rounded-2xl px-4 py-3 rounded-tl-sm flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-neonBlue animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-neonPurple animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyanGlow animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* INPUT MESSAGE PANEL */}
          <form 
            onSubmit={handleSendMessage}
            className="p-3 border-t border-white/5 bg-darkSpace-900/60 flex items-center gap-2 rounded-b-2xl"
          >
            <input
              type="text"
              placeholder="Tanyakan analisis keuangan..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-grow py-2 px-3 text-xs glass-input focus:border-neonPurple focus:shadow-neon-purple"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="w-8 h-8 rounded-lg bg-gradient-to-tr from-neonPurple to-neonBlue flex items-center justify-center text-white shadow-neon-blue hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-40 transition-all duration-300"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default AIChatbot;
