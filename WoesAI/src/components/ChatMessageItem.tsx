import React, { useState } from 'react';
import {
  User,
  Bot,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Copy,
  Check,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Info,
  HelpCircle,
  Clock,
  Sparkles,
  FileText
} from 'lucide-react';
import { ChatMessage, AppLanguage } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface ChatMessageItemProps {
  message: ChatMessage;
  language: AppLanguage;
  speechSpeed: number;
  isSpeaking: boolean;
  isPaused: boolean;
  onPlaySpeech: (text: string) => void;
  onPauseSpeech: () => void;
  onResumeSpeech: () => void;
  onStopSpeech: () => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  language,
  speechSpeed,
  isSpeaking,
  isPaused,
  onPlaySpeech,
  onPauseSpeech,
  onResumeSpeech,
  onStopSpeech,
}) => {
  const [copied, setCopied] = useState(false);
  const t = TRANSLATIONS[language];
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Structured parser for colors and markdown
  const renderFormattedContent = (content: string) => {
    if (!content) return null;

    // Split into paragraphs/lines
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Detection of color callout badges
      if (trimmed.includes('[ROUGE]') || trimmed.includes('[FRAUDULEUX]')) {
        elements.push(
          <div
            key={index}
            className="my-2.5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border-2 border-red-500 text-red-900 dark:text-red-200 font-bold flex items-center gap-2.5 shadow-xs"
          >
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
            <div className="text-sm sm:text-base tracking-wide uppercase">
              {line.replace(/\[ROUGE\]/g, '').replace(/\[FRAUDULEUX\]/g, 'DANGER : FRAUDULEUX').trim() || 'ARNAQUE DÉTECTÉE — DANGER IMMÉDIAT'}
            </div>
          </div>
        );
        return;
      }

      if (trimmed.includes('[ORANGE]') || trimmed.includes('[SUSPECT]')) {
        elements.push(
          <div
            key={index}
            className="my-2.5 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-500 text-amber-900 dark:text-amber-200 font-bold flex items-center gap-2.5 shadow-xs"
          >
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-sm tracking-wide uppercase">
              {line.replace(/\[ORANGE\]/g, '').replace(/\[SUSPECT\]/g, 'ATTENTION : MESSAGE SUSPECT').trim() || 'MESSAGE SUSPECT — VÉRIFICATION REQUISE'}
            </div>
          </div>
        );
        return;
      }

      if (trimmed.includes('[VERT]') || trimmed.includes('[AUTHENTIQUE]')) {
        elements.push(
          <div
            key={index}
            className="my-2.5 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold flex items-center gap-2.5 shadow-xs"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-sm tracking-wide">
              {line.replace(/\[VERT\]/g, '').replace(/\[AUTHENTIQUE\]/g, 'FORMAT CONFORME AU MODÈLE OFFICIEL').trim() || 'FORMAT OFFICIEL (Vérifier solde via *145# ou *155#)'}
            </div>
          </div>
        );
        return;
      }

      if (trimmed.includes('[BLEU]')) {
        elements.push(
          <div
            key={index}
            className="my-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs sm:text-sm font-medium flex items-center gap-2"
          >
            <Info className="w-4 h-4 text-blue-500 shrink-0" />
            <div>{line.replace(/\[BLEU\]/g, '').trim()}</div>
          </div>
        );
        return;
      }

      if (trimmed.includes('[GRIS]') || trimmed.includes('[NON_VERIFIABLE]')) {
        elements.push(
          <div
            key={index}
            className="my-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
            <div>{line.replace(/\[GRIS\]/g, '').replace(/\[NON_VERIFIABLE\]/g, 'INFORMATION NON VÉRIFIABLE').trim()}</div>
          </div>
        );
        return;
      }

      // Headers
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h4 key={index} className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-3 mb-1">
            {trimmed.slice(4)}
          </h4>
        );
        return;
      }

      if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
        elements.push(
          <h3 key={index} className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-4 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            {trimmed.replace(/^#+\s*/, '')}
          </h3>
        );
        return;
      }

      // Bullet item
      if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
        const itemText = trimmed.replace(/^[-•*]\s*/, '');
        elements.push(
          <li key={index} className="ml-4 list-disc text-slate-800 dark:text-slate-200 my-1 leading-relaxed text-xs sm:text-sm">
            {formatBoldText(itemText)}
          </li>
        );
        return;
      }

      // Numbered item
      if (/^\d+\.\s/.test(trimmed)) {
        const itemText = trimmed.replace(/^\d+\.\s*/, '');
        const number = trimmed.match(/^\d+/)?.[0];
        elements.push(
          <div key={index} className="flex items-start gap-2.5 my-1.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
            <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
              {number}
            </span>
            <span className="flex-1 leading-relaxed">{formatBoldText(itemText)}</span>
          </div>
        );
        return;
      }

      // Regular text / Paragraph
      if (trimmed) {
        elements.push(
          <p key={index} className="text-xs sm:text-sm leading-relaxed my-1.5 text-slate-800 dark:text-slate-200">
            {formatBoldText(trimmed)}
          </p>
        );
      } else {
        elements.push(<div key={index} className="h-1.5" />);
      }
    });

    return elements;
  };

  // Helper to format **bold** text
  const formatBoldText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-extrabold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div
      className={`py-4 px-3 sm:px-4 rounded-3xl transition-colors ${
        isUser
          ? 'bg-transparent flex justify-end'
          : 'bg-white dark:bg-slate-850/80 border border-slate-200/80 dark:border-slate-800 shadow-xs'
      }`}
    >
      <div className={`max-w-3xl w-full flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
        {/* Assistant Avatar */}
        {!isUser && (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 via-amber-500 to-red-500 p-0.5 shrink-0 shadow-sm mt-0.5">
            <div className="w-full h-full bg-slate-950 rounded-[9px] flex items-center justify-center text-amber-400 font-bold text-xs">
              W
            </div>
          </div>
        )}

        {/* Message Content Container */}
        <div
          className={`flex-1 overflow-hidden ${
            isUser
              ? 'max-w-[85%] sm:max-w-[75%] bg-slate-900 dark:bg-amber-600 text-white rounded-3xl rounded-tr-sm p-4 px-5 shadow-sm ml-auto'
              : 'space-y-2'
          }`}
        >
          {/* Attached image if any */}
          {message.imageUrl && (
            <div className="mb-3 max-w-sm rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-black/10">
              <img
                src={message.imageUrl}
                alt="Capture d’écran importée"
                className="w-full h-auto object-cover max-h-64 rounded-lg"
              />
            </div>
          )}

          {/* Attached course document if any */}
          {message.courseDocName && (
            <div className="mb-2 p-2 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Document de cours : {message.courseDocName}</span>
            </div>
          )}

          {/* Body content */}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {isUser ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{message.content}</p>
            ) : (
              <div>
                {message.content ? (
                  renderFormattedContent(message.content)
                ) : message.isStreaming ? (
                  <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 italic text-xs py-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    <span>{t.chat.generating}</span>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Assistant Action Bar (Voice Read-out + Copy + Timestamp) */}
          {!isUser && message.content && (
            <div className="pt-2 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                {/* Voice Read-out Button */}
                {!isSpeaking ? (
                  <button
                    onClick={() => onPlaySpeech(message.content)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition text-[11px] font-semibold cursor-pointer"
                    title={t.chat.listen}
                  >
                    <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{t.chat.listen}</span>
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-lg">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <button
                      onClick={isPaused ? onResumeSpeech : onPauseSpeech}
                      className="p-1 text-slate-700 dark:text-slate-200 hover:text-black transition cursor-pointer"
                      title={isPaused ? t.chat.resume : t.chat.pause}
                    >
                      {isPaused ? <Play className="w-3 h-3 text-emerald-600" /> : <Pause className="w-3 h-3 text-amber-600" />}
                    </button>
                    <button
                      onClick={onStopSpeech}
                      className="p-1 text-red-600 hover:text-red-700 transition cursor-pointer"
                      title={t.chat.stop}
                    >
                      <VolumeX className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Copy Button */}
                <button
                  onClick={handleCopy}
                  className="p-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                  title="Copier le texte"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copié' : 'Copier'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                {message.latencyMs && (
                  <span className="font-mono text-amber-600 dark:text-amber-400">
                    ⚡ {message.latencyMs}ms
                  </span>
                )}
                <span>{message.timestamp}</span>
              </div>
            </div>
          )}

          {/* User timestamp */}
          {isUser && (
            <div className="text-[10px] text-slate-300 dark:text-slate-200 text-right mt-1.5 opacity-80">
              {message.timestamp}
            </div>
          )}
        </div>

        {/* User Avatar */}
        {isUser && (
          <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
            <User className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>
  );
};
