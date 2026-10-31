import React, { useState } from 'react';
import {
  User,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Copy,
  Check,
  RotateCcw,
  FileText
} from 'lucide-react';
import { ChatMessage, AppLanguage } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { StructuredResponseRenderer } from './chat/StructuredResponseRenderer';
import { AnalysisCardBlock } from './chat/AnalysisCardBlock';

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
  onRetry?: () => void;
  onSelectQuizOption?: (letter: string, text: string) => void;
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
  onRetry,
  onSelectQuizOption,
}) => {
  const [copied, setCopied] = useState(false);
  const t = TRANSLATIONS[language];
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`py-3 sm:py-4 px-2 sm:px-4 transition-colors ${
        isUser ? 'flex justify-end' : 'flex justify-start'
      }`}
    >
      <div
        className={`max-w-3xl w-full flex gap-3 sm:gap-4.5 ${
          isUser ? 'justify-end' : 'justify-start'
        }`}
      >
        {/* Assistant Avatar */}
        {!isUser && (
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-br from-emerald-600 via-amber-500 to-red-600 p-0.5 shrink-0 shadow-xs mt-1">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400 font-extrabold text-xs select-none">
              W
            </div>
          </div>
        )}

        {/* Message Container */}
        <div
          className={`overflow-hidden transition-all ${
            isUser
              ? 'max-w-[88%] sm:max-w-[80%] bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 dark:border dark:border-slate-700/80 rounded-2xl sm:rounded-3xl rounded-tr-xs sm:rounded-tr-xs p-4 sm:p-5 shadow-xs'
              : 'flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs min-w-0'
          }`}
        >
          {/* Attached image if any */}
          {message.imageUrl && (
            <div className="mb-3.5 max-w-sm rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
              <img
                src={message.imageUrl}
                alt="Capture d’écran importée"
                className="w-full h-auto object-cover max-h-64 rounded-lg"
              />
            </div>
          )}

          {/* Attached course document if any */}
          {message.courseDocName && (
            <div className="mb-3.5 p-2.5 px-3.5 rounded-xl bg-emerald-50 dark:bg-slate-800/80 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 text-xs sm:text-sm font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
              <span className="truncate">Document : {message.courseDocName}</span>
            </div>
          )}

          {/* Message Body */}
          {isUser ? (
            <p className="whitespace-pre-wrap text-[15px] sm:text-[16px] leading-[1.65] font-normal selection:bg-amber-400/40">
              {message.content}
            </p>
          ) : (
            <div className="space-y-2">
              {/* Structured Mobile Money Analysis Card if explicitly attached to message in scanner mode */}
              {message.analysis && message.mode !== 'learning' && message.mode !== 'educational' && (
                <AnalysisCardBlock
                  details={{
                    verdict: message.analysis.verdict,
                    operator: message.analysis.operator,
                    amount: message.analysis.transaction?.amount || undefined,
                    currency: message.analysis.transaction?.currency,
                    sender: message.analysis.transaction?.sender || undefined,
                    reference: message.analysis.transaction?.reference || undefined,
                    operationType: message.analysis.transaction?.type,
                    explanation: message.analysis.explanation,
                    indicators: message.analysis.fraud_indicators?.map((i) => `${i.indicator} (${i.explanation})`),
                    recommendations: message.analysis.recommendations,
                  }}
                />
              )}

              {/* Main Response Content with Markdown & Callout Parsing */}
              <StructuredResponseRenderer
                content={message.content}
                isStreaming={message.isStreaming}
                mode={message.mode}
                onSelectQuizOption={onSelectQuizOption}
              />
            </div>
          )}

          {/* Assistant Action Bar (Voice, Copy, Retry, Timestamp) */}
          {!isUser && message.content && (
            <div className="pt-3.5 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Voice synthesis button */}
                {!isSpeaking ? (
                  <button
                    onClick={() => onPlaySpeech(message.content)}
                    type="button"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition text-xs font-semibold cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    title={t.chat.listen}
                    aria-label={t.chat.listen}
                  >
                    <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    <span>{t.chat.listen}</span>
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 px-2.5 py-1 rounded-lg">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" aria-hidden="true" />
                    <button
                      onClick={isPaused ? onResumeSpeech : onPauseSpeech}
                      type="button"
                      className="p-1 text-slate-800 dark:text-slate-200 hover:text-black dark:hover:text-white transition cursor-pointer"
                      title={isPaused ? t.chat.resume : t.chat.pause}
                      aria-label={isPaused ? t.chat.resume : t.chat.pause}
                    >
                      {isPaused ? (
                        <Play className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Pause className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      )}
                    </button>
                    <button
                      onClick={onStopSpeech}
                      type="button"
                      className="p-1 text-rose-600 dark:text-rose-400 hover:text-rose-700 transition cursor-pointer"
                      title={t.chat.stop}
                      aria-label={t.chat.stop}
                    >
                      <VolumeX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Copy Button */}
                <button
                  onClick={handleCopy}
                  type="button"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition text-xs font-semibold cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                  title="Copier la réponse"
                  aria-label="Copier la réponse"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" aria-hidden="true" />
                      <span>Copier</span>
                    </>
                  )}
                </button>

                {/* Retry / Regenerate Button */}
                {onRetry && (
                  <button
                    onClick={onRetry}
                    type="button"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition text-xs font-semibold cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    title="Regénérer la réponse"
                    aria-label="Regénérer la réponse"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                    <span>Regénérer</span>
                  </button>
                )}
              </div>

              {/* Latency & Timestamp */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                {message.latencyMs && (
                  <span className="text-amber-700 dark:text-amber-400 font-semibold">
                    ⚡ {message.latencyMs}ms
                  </span>
                )}
                <span>{message.timestamp}</span>
              </div>
            </div>
          )}

          {/* User timestamp */}
          {isUser && (
            <div className="text-[11px] text-slate-300 dark:text-slate-400 font-mono text-right mt-1.5 opacity-90 tabular-nums">
              {message.timestamp}
            </div>
          )}
        </div>

        {/* User Avatar */}
        {isUser && (
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-slate-900 dark:bg-slate-800 border border-transparent dark:border-slate-700 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-slate-200" aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  );
};
