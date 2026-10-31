import React from 'react';
import {
  Shield,
  GraduationCap,
  Settings,
  PhoneCall,
  Globe,
  PlusCircle,
  Zap,
  Moon,
  Sun,
  BookOpen
} from 'lucide-react';
import { AppLanguage, AppMode } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface NavbarProps {
  mode: AppMode;
  onToggleMode: () => void;
  language: AppLanguage;
  onSelectLanguage: (lang: AppLanguage) => void;
  onOpenSettings: () => void;
  onOpenEmergency: () => void;
  onNewChat: () => void;
  lastLatencyMs?: number | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  mode,
  onToggleMode,
  language,
  onSelectLanguage,
  onOpenSettings,
  onOpenEmergency,
  onNewChat,
  lastLatencyMs,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand & New Chat */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-amber-500 to-red-500 p-0.5 shadow-sm">
              <div className="w-full h-full bg-slate-950 rounded-[9px] flex items-center justify-center text-amber-400">
                {mode === 'scanner' ? (
                  <Shield className="w-5 h-5 text-amber-400" />
                ) : (
                  <GraduationCap className="w-5 h-5 text-emerald-400" />
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                  Woèsé<span className="text-amber-500">AI</span>
                </span>
                <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.2 rounded-full bg-amber-500/10 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  Togo
                </span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 hidden md:block leading-none">
                {mode === 'scanner' ? t.modes.scanner : t.modes.educational}
              </div>
            </div>
          </div>

          <button
            onClick={onNewChat}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title={t.chat.clearChat}
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{t.chat.clearChat}</span>
          </button>
        </div>

        {/* Center: Mode Toggle Switch */}
        <div className="flex items-center justify-center">
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner">
            <button
              onClick={() => mode !== 'scanner' && onToggleMode()}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                mode === 'scanner'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden xs:inline sm:inline">Scanner</span>
            </button>

            <button
              onClick={() => mode !== 'educational' && onToggleMode()}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                mode === 'educational'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span className="hidden xs:inline sm:inline">Éducatif</span>
            </button>
          </div>
        </div>

        {/* Right: Language Selector, Emergency & Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Latency telemetry pill */}
          {lastLatencyMs && (
            <span className="hidden lg:inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-mono px-2 py-1 rounded-lg">
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
              {lastLatencyMs}ms
            </span>
          )}

          {/* Quick Language Dropdown */}
          <div className="relative inline-block">
            <select
              value={language}
              onChange={(e) => onSelectLanguage(e.target.value as AppLanguage)}
              aria-label={t.navbar.selectLanguage}
              className="text-xs font-bold py-1.5 pl-2 pr-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer appearance-none"
            >
              <option value="fr">FR</option>
              <option value="en">EN</option>
              <option value="ee">Éwé (EE)</option>
              <option value="kbp">Kabɩyɛ (KBP)</option>
            </select>
            <Globe className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>

          {/* Emergency helper */}
          <button
            onClick={onOpenEmergency}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 hover:bg-red-100 transition text-xs font-bold flex items-center gap-1 cursor-pointer"
            title={t.navbar.emergency}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="hidden md:inline">888 / *145#</span>
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title={t.navbar.settings}
            aria-label={t.navbar.settings}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
