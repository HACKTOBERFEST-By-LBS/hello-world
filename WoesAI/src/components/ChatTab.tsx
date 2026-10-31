import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Zap,
  Trash2,
  BookOpen,
  ShieldAlert,
  HelpCircle,
  PhoneCall
} from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatTabProps {
  onTriggerLearnMode: (topicId?: number) => void;
  onOpenEmergency: () => void;
  onLatencyUpdate: (ms: number) => void;
}

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content: `Bonjour ! Je suis **WoèséAI**, votre assistant de confiance pour la sécurité de vos comptes Mobile Money au Togo (T-Money et Moov Money).

Vous pouvez me poser toutes vos questions en français simple :
• *« Quelqu'un m'a appelé en pleurant pour un faux transfert, que faire ? »*
• *« Comment savoir si un message T-Money est vrai ou faux ? »*
• *« Pourquoi ne faut-il jamais donner son code PIN ? »*

💡 Astuce : Tapez **/apprendre** pour lancer l'espace de formation interactif et tester vos réflexes !`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

const SUGGESTED_QUESTIONS = [
  "Quelqu'un m'appelle en disant s'être trompé de numéro, je fais quoi ?",
  "Comment reconnaître un faux agent Togocom ou Moov ?",
  "Pourquoi ne faut-il JAMAIS donner son code PIN ?",
  "Un SMS dit que j'ai gagné une tombola, est-ce vrai ?",
  "/apprendre",
];

export const ChatTab: React.FC<ChatTabProps> = ({
  onTriggerLearnMode,
  onOpenEmergency,
  onLatencyUpdate,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('woeseai_chat_history');
    return saved ? JSON.parse(saved) : DEFAULT_MESSAGES;
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastLatency, setLastLatency] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('woeseai_chat_history', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    // Check if user entered / or /apprendre
    if (query === '/' || query.toLowerCase() === '/apprendre') {
      onTriggerLearnMode();
      return;
    }

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    const botMsgId = `b-${Date.now()}`;
    const initialBotMsg: ChatMessage = {
      id: botMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
    };

    setMessages([...updatedMessages, initialBotMsg]);

    const startTime = Date.now();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la communication.');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let firstTokenTime = 0;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (dataStr === '[DONE]') continue;

              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.text) {
                  accumulated += parsed.text;
                  if (!firstTokenTime) {
                    firstTokenTime = Date.now() - startTime;
                    setLastLatency(firstTokenTime);
                    onLatencyUpdate(firstTokenTime);
                  }

                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === botMsgId
                        ? { ...msg, content: accumulated, isStreaming: true }
                        : msg
                    )
                  );
                }
              } catch (e) {
                // Ignore parse errors on partial stream lines
              }
            }
          }
        }
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMsgId
            ? { ...msg, content: accumulated || "Désolé, je n'ai pas pu générer de réponse.", isStreaming: false }
            : msg
        )
      );

      const totalTime = Date.now() - startTime;
      if (!firstTokenTime) {
        setLastLatency(totalTime);
        onLatencyUpdate(totalTime);
      }
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMsgId
            ? {
                ...msg,
                content:
                  "Une erreur s'est produite lors de la connexion. Veuillez vérifier votre réseau ou réessayer.",
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages(DEFAULT_MESSAGES);
    localStorage.removeItem('woeseai_chat_history');
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[750px] bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 px-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">Assistant Sécurité WoèséAI</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-xs text-slate-400">
              Conseils préventifs, explications & questions Mobile Money au Togo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lastLatency && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded">
              <Zap className="w-3 h-3 text-amber-400" />
              {lastLatency} ms
            </span>
          )}

          <button
            onClick={() => onTriggerLearnMode()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-bold transition border border-amber-500/40 cursor-pointer"
            title="Espace Apprendre"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mode Apprendre</span>
          </button>

          <button
            onClick={clearChat}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="Effacer la conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                msg.role === 'user'
                  ? 'bg-slate-800 text-white'
                  : 'bg-gradient-to-br from-emerald-600 to-amber-600 text-white shadow-sm'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-none'
                  : 'bg-white text-slate-800 border border-slate-200/90 shadow-sm rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">
                {msg.content || (msg.isStreaming ? (
                  <span className="inline-flex items-center gap-1.5 text-slate-400 italic">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                    WoèséAI formule sa réponse...
                  </span>
                ) : '')}
              </div>
              <div
                className={`text-[10px] mt-1.5 text-right ${
                  msg.role === 'user' ? 'text-slate-400' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-2.5 px-4 bg-slate-100/80 border-t border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-2">
        <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 shrink-0">
          <Sparkles className="w-3 h-3 text-amber-600" />
          Questions fréquentes :
        </span>
        {SUGGESTED_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={loading}
            className="text-xs bg-white hover:bg-amber-50 hover:text-amber-900 hover:border-amber-300 text-slate-700 px-3 py-1 rounded-full border border-slate-200 transition shrink-0 cursor-pointer disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3.5 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Posez votre question (ou tapez /apprendre)..."
          disabled={loading}
          className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 text-slate-900 disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-40 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Envoyer</span>
        </button>
      </form>
    </div>
  );
};
