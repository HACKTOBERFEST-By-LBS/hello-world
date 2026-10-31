import React from 'react';
import {
  X,
  Globe,
  Moon,
  Sun,
  Volume2,
  Trash2,
  PhoneCall,
  ShieldCheck,
  Hash,
  AlertTriangle,
  Info
} from 'lucide-react';
import { AppLanguage } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  onSelectLanguage: (lang: AppLanguage) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  speechSpeed: number;
  onSetSpeechSpeed: (speed: number) => void;
  onClearHistory: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  onSelectLanguage,
  theme,
  onToggleTheme,
  speechSpeed,
  onSetSpeechSpeed,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[language];

  const handleClearHistory = () => {
    if (window.confirm(t.settings.clearHistoryConfirm)) {
      onClearHistory();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              ⚙️
            </div>
            <h2 className="text-lg font-bold">{t.settings.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 text-sm">
          {/* Language Selection */}
          <div className="space-y-2.5">
            <label className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Globe className="w-4 h-4 text-amber-500" />
              {t.settings.language}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'fr', label: 'Français', desc: 'Langue par défaut' },
                { id: 'en', label: 'English', desc: 'International' },
                { id: 'ee', label: 'Eʋegbe (Éwé)', desc: 'Gbe vevitɔ le Togo' },
                { id: 'kbp', label: 'Kabɩyɛ', desc: 'Kʊnʊŋ vevi Togo taa' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => onSelectLanguage(lang.id as AppLanguage)}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                    language === lang.id
                      ? 'bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold">{lang.label}</div>
                  <div className="text-[11px] text-slate-400 font-normal">{lang.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Theme & Display */}
          <div className="space-y-2.5">
            <label className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              {t.settings.theme}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => theme !== 'light' && onToggleTheme()}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  theme === 'light'
                    ? 'bg-amber-500 text-slate-950 border-amber-500 font-extrabold shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>{t.settings.themeLight}</span>
              </button>
              <button
                onClick={() => theme !== 'dark' && onToggleTheme()}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-indigo-600 text-white border-indigo-600 font-extrabold shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>{t.settings.themeDark}</span>
              </button>
            </div>
          </div>

          {/* Voice Reading Speed */}
          <div className="space-y-2.5">
            <label className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Volume2 className="w-4 h-4 text-emerald-500" />
              {t.settings.speechSpeed} ({speechSpeed}x)
            </label>
            <div className="flex items-center gap-2">
              {[0.8, 1.0, 1.2].map((spd) => (
                <button
                  key={spd}
                  onClick={() => onSetSpeechSpeed(spd)}
                  className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    speechSpeed === spd
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {spd}x {spd === 1.0 ? '(Normal)' : spd < 1.0 ? '(Lent)' : '(Rapide)'}
                </button>
              ))}
            </div>
          </div>

          {/* Emergency Helplines Quick reminder */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-red-500" />
              <span>{t.settings.emergencyContacts}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-slate-600 dark:text-slate-300">
                Togocom : <strong className="text-slate-900 dark:text-white">888</strong> (gratuit)
              </div>
              <div className="text-slate-600 dark:text-slate-300">
                Moov Africa : <strong className="text-slate-900 dark:text-white">100 / 155</strong>
              </div>
              <div className="text-slate-600 dark:text-slate-300">
                Solde T-Money : <code className="font-bold text-emerald-600 dark:text-emerald-400">*145#</code>
              </div>
              <div className="text-slate-600 dark:text-slate-300">
                Solde Moov : <code className="font-bold text-blue-600 dark:text-blue-400">*155#</code>
              </div>
            </div>
          </div>

          {/* Clear History */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleClearHistory}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/60 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t.settings.clearHistory}</span>
            </button>
          </div>

          {/* About */}
          <div className="text-[11px] text-slate-400 dark:text-slate-500 text-center space-y-1">
            <p>{t.settings.aboutText}</p>
            <p className="font-mono">WoèséAI v2.0 • Moteur IA Gemma / Flash-Lite • Togo</p>
          </div>
        </div>
      </div>
    </div>
  );
};
