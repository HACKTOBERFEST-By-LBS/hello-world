import React from 'react';
import { Shield, Zap, PhoneCall, AlertTriangle, BookOpen, MessageSquare, Scale, Radio } from 'lucide-react';

interface HeaderProps {
  activeTab: 'detector' | 'chat' | 'learn' | 'comparator' | 'reports';
  setActiveTab: (tab: 'detector' | 'chat' | 'learn' | 'comparator' | 'reports') => void;
  onOpenEmergency: () => void;
  lastLatencyMs?: number | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenEmergency,
  lastLatencyMs,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 shadow-lg">
      {/* Top Banner: Emergency & USSD Awareness */}
      <div className="bg-gradient-to-r from-amber-600 via-emerald-600 to-amber-700 text-white text-xs py-1.5 px-4 font-medium flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-black/30 text-[11px] font-bold tracking-wide">
            TOGO SÉCURITÉ
          </span>
          <span>
            Ne partagez <strong>JAMAIS</strong> votre code PIN. Vérifiez votre solde :{' '}
            <strong className="underline decoration-white/70">*145#</strong> (T-Money) |{' '}
            <strong className="underline decoration-white/70">*155#</strong> (Moov Money)
          </span>
        </div>
        <button
          onClick={onOpenEmergency}
          className="ml-3 shrink-0 inline-flex items-center gap-1.5 bg-white text-slate-900 px-2.5 py-0.5 rounded-full font-bold text-[11px] hover:bg-amber-100 transition shadow-sm cursor-pointer"
        >
          <PhoneCall className="w-3 h-3 text-red-600" />
          <span>Numéros d'urgence</span>
        </button>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 via-amber-500 to-red-500 p-0.5 shadow-md shadow-emerald-950/40">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                  Woèsé<span className="text-amber-400">AI</span>
                </h1>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Togo
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Détection & Protection contre les Arnaques T-Money & Moov Money
              </p>
            </div>
          </div>

          {/* Model low-latency indicator pill */}
          <div className="flex items-center gap-2 md:hidden">
            <span className="inline-flex items-center gap-1 bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold px-2 py-1 rounded-lg">
              <Zap className="w-3 h-3 text-amber-400 animate-bounce" />
              {lastLatencyMs ? `${lastLatencyMs}ms` : 'Flash-Lite'}
            </span>
          </div>
        </div>

        {/* Center / Right: Low latency badge + Navigation */}
        <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap">
          <div className="hidden lg:flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-semibold text-slate-200">Moteur basse latence :</span>
              <code className="text-[11px] bg-slate-950 text-emerald-400 px-1.5 py-0.5 rounded font-mono border border-emerald-500/20">
                gemini-3.1-flash-lite
              </code>
            </div>
            {lastLatencyMs && (
              <span className="ml-1 text-[11px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                ⚡ {lastLatencyMs} ms
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="border-t border-slate-800/80 bg-slate-950/60 px-4 sm:px-6 overflow-x-auto scrollbar-none">
        <nav className="max-w-7xl mx-auto flex items-center space-x-1 sm:space-x-2 py-2">
          <button
            onClick={() => setActiveTab('detector')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'detector'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Détecteur Express</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Assistant Sécurité</span>
          </button>

          <button
            onClick={() => setActiveTab('learn')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'learn'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Apprendre & Quiz (/apprendre)</span>
          </button>

          <button
            onClick={() => setActiveTab('comparator')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'comparator'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Comparateur Officiel</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Alertes & Signalement</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
