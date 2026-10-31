import React from 'react';
import {
  Shield,
  GraduationCap,
  Settings,
  PhoneCall,
  Globe,
  PlusCircle,
  Zap,
  Menu,
  ArrowLeft,
  X
} from 'lucide-react';
import { AppLanguage, AppMode, MODES } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface NavbarProps {
  mode: AppMode;
  onSwitchMode: (mode: AppMode) => void;
  language: AppLanguage;
  onSelectLanguage: (lang: AppLanguage) => void;
  onOpenSettings: () => void;
  onOpenEmergency: () => void;
  onNewChat: () => void;
  onOpenDrawer: () => void;
  lastLatencyMs?: number | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  mode,
  onSwitchMode,
  language,
  onSelectLanguage,
  onOpenSettings,
  onOpenEmergency,
  onNewChat,
  onOpenDrawer,
  lastLatencyMs,
}) => {
  const t = TRANSLATIONS[language];
  const isLearning = mode === MODES.LEARNING || mode === 'educational';

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Menu button, Brand & New Chat */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenDrawer}
            className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Historique des discussions"
            aria-label="Historique des discussions"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl p-0.5 shadow-xs ${
                isLearning
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                  : 'bg-gradient-to-br from-amber-500 via-rose-500 to-amber-600'
              }`}
            >
              <div className="w-full h-full bg-slate-950 rounded-[9px] flex items-center justify-center">
                {isLearning ? (
                  <GraduationCap className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Shield className="w-5 h-5 text-amber-400" />
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-950 dark:text-white">
                  WoèséAI <span className={isLearning ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}>
                    {isLearning ? 'Apprentissage' : 'Scanner'}
                  </span>
                </span>
                {!isLearning && (
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 dark:bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                    Togo
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block leading-none mt-0.5">
                {isLearning
                  ? "Accompagnement pédagogique & révisions"
                  : "Détecteur d'escroqueries Mobile Money"}
              </div>
            </div>
          </div>

          <button
            onClick={onNewChat}
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title={isLearning ? "Nouvelle session d'apprentissage" : "Nouvelle analyse SMS"}
          >
            <PlusCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Nouveau</span>
          </button>
        </div>

        {/* Center: Mode Switching Control */}
        <div className="flex items-center justify-center">
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <button
              onClick={() => isLearning && onSwitchMode(MODES.SCANNER)}
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                !isLearning
                  ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Passer au mode Scanner d'arnaques Mobile Money"
            >
              <Shield className={`w-3.5 h-3.5 ${!isLearning ? 'text-amber-500' : 'text-slate-400'}`} />
              <span className="hidden xs:inline">Scanner</span>
            </button>

            <button
              onClick={() => !isLearning && onSwitchMode(MODES.LEARNING)}
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                isLearning
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Passer au mode Apprentissage pédagogique (/apprendre)"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Apprentissage</span>
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Latency telemetry pill */}
          {lastLatencyMs && (
            <span className="hidden xl:inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-mono tabular-nums px-2 py-1 rounded-lg">
              <Zap className="w-3 h-3 text-amber-500" />
              {lastLatencyMs}ms
            </span>
          )}

          {/* Quick Language Dropdown */}
          <div className="relative inline-block">
            <select
              value={language}
              onChange={(e) => onSelectLanguage(e.target.value as AppLanguage)}
              aria-label={t.navbar.selectLanguage}
              className="text-xs font-bold py-1.5 pl-2.5 pr-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer appearance-none"
            >
              <option value="fr">FR</option>
              <option value="en">EN</option>
              <option value="ee">Éwé</option>
              <option value="kbp">Kabɩyɛ</option>
            </select>
            <Globe className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>

          {/* Mode-specific Primary Action Button */}
          {isLearning ? (
            /* In Learning mode: Fast exit button to return to Scanner (/stop) */
            <button
              onClick={() => onSwitchMode(MODES.SCANNER)}
              type="button"
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title="Quitter l'apprentissage et revenir au Scanner (/stop)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quitter (/stop)</span>
            </button>
          ) : (
            /* In Scanner mode: Emergency official numbers helper */
            <button
              onClick={onOpenEmergency}
              type="button"
              className="px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title={t.navbar.emergency}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">888 / *145#</span>
            </button>
          )}

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            type="button"
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
