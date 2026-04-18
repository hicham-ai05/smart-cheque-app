import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Network, Loader2, Sparkles } from 'lucide-react';

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

const SYSTEM_PROMPT = `You are an AI assistant for a Moroccan financial management application called Smart Chèques.

Your role: Understand user queries in Arabic, Darija, French, or English and provide helpful, conversational responses about treasury management.

You can help with:
- Explaining check (chèque) management concepts
- Answering questions about Moroccan banking law (loi 69-21)
- Invoice and payment tracking guidance
- Cash flow advice and summaries
- Explaining LCN (Lettre de Change Normalisée) processes
- Bank remittance (bordereaux) explanations

Respond in the SAME language the user writes in.
Keep responses concise and practical.
If asked to search actual data, explain that live data requires the backend server to be running locally.`;

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Salam! 👋 Je suis votre AI Treasury Analyst. Posez-moi des questions sur la gestion des chèques, LCN, ou la loi 69-21.' }
  ]);
  const [inputData, setInputData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const suggestions = [
    "شنو هي اللوائح ديال الشيك؟",
    "Expliquer LCN vs chèque",
    "What is loi 69-21?"
  ];

  const handleSend = async (textQ) => {
    const q = typeof textQ === 'string' ? textQ : inputData;
    if (!q.trim()) return;

    const newMessages = [...messages, { role: 'user', content: q }];
    setMessages(newMessages);
    setInputData('');
    setIsLoading(true);

    try {
      // Build conversation history for Claude
      const history = newMessages
        .filter(m => m.role !== 'assistant' || typeof m.content === 'string')
        .map(m => ({
          role: m.role,
          content: typeof m.content === 'string' ? m.content : '[data response]'
        }));

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: history
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const answer = data.content[0]?.text || 'Désolé, je n\'ai pas pu générer une réponse.';
      setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
    } catch (err) {
      console.error('AI error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ Erreur: ${err.message || 'Connexion échouée.'}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-br from-indigo-500 to-brand-600 rounded-full text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:scale-110 hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all origin-center"
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[360px] h-[550px] z-50 bg-surface-dark border border-surface-border rounded-2xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/10" style={{animation: 'fadeIn 0.2s ease'}}>
          {/* Header */}
          <div className="p-4 bg-surface-darker/80 border-b border-surface-border flex items-center gap-3 backdrop-blur-md relative overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-500 flex items-center justify-center relative z-10">
              <Network size={14} className="text-white" />
            </div>
            <div className="relative z-10">
              <h3 className="text-white font-bold text-sm tracking-tight flex items-center gap-2">
                Claude Treasury AI <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ring-1 ring-emerald-500/30">Online</span>
              </h3>
              <p className="text-[10px] text-slate-400">Supports Darija · Français · English · العربية</p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-400/10 rounded-full blur-2xl"></div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-surface-dark/95">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-brand-600 text-white rounded-br-none'
                    : 'bg-surface-card border border-surface-border text-slate-300 rounded-bl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-surface-card border border-surface-border rounded-2xl px-4 py-3 rounded-bl-none flex items-center gap-2 text-brand-400 text-xs font-semibold">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Claude is thinking...</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-surface-darker/80 border-t border-surface-border backdrop-blur-md">
            {messages.length < 3 && (
              <div className="flex gap-2 overflow-x-auto pb-3 mb-1" style={{scrollbarWidth:'none'}}>
                {suggestions.map(sg => (
                  <button
                    key={sg} onClick={() => handleSend(sg)}
                    className="whitespace-nowrap px-3 py-1.5 bg-surface-card border border-surface-border hover:bg-brand-500/10 hover:border-brand-500/50 hover:text-brand-300 transition-colors rounded-full text-xs text-slate-400 font-medium"
                  >
                    {sg}
                  </button>
                ))}
              </div>
            )}
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputData}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                onChange={(e) => setInputData(e.target.value)}
                placeholder="Posez votre question..."
                className="w-full bg-surface-dark border border-surface-border pl-4 pr-12 py-3 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 shadow-inner"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !inputData.trim()}
                className="absolute right-2 p-2 bg-brand-500 hover:bg-brand-400 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChat;
