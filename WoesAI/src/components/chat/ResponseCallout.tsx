import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Info,
  HelpCircle,
  Lightbulb,
  KeyRound,
  BookOpen,
  FileCheck
} from 'lucide-react';

export type CalloutType =
  | 'danger'
  | 'warning'
  | 'authentic'
  | 'info'
  | 'tip'
  | 'unverifiable'
  | 'security-rule'
  | 'definition'
  | 'example';

interface ResponseCalloutProps {
  type: CalloutType;
  title?: string;
  children: React.ReactNode;
}

export const ResponseCallout: React.FC<ResponseCalloutProps> = ({
  type,
  title,
  children,
}) => {
  const getStyles = () => {
    switch (type) {
      case 'danger':
        return {
          container:
            'bg-rose-50/90 dark:bg-slate-900 border border-rose-300 dark:border-rose-800/90',
          titleColor: 'text-rose-950 dark:text-rose-300',
          bodyColor: 'text-rose-900 dark:text-rose-100',
          icon: <ShieldAlert className="w-5 h-5 text-rose-700 dark:text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />,
          defaultTitle: 'Alerte fraude : danger avéré',
        };
      case 'warning':
        return {
          container:
            'bg-amber-50/90 dark:bg-slate-900 border border-amber-300 dark:border-amber-800/90',
          titleColor: 'text-amber-950 dark:text-amber-300',
          bodyColor: 'text-amber-900 dark:text-amber-100',
          icon: <AlertTriangle className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />,
          defaultTitle: 'Prudence : éléments suspects détectés',
        };
      case 'authentic':
        return {
          container:
            'bg-emerald-50/90 dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800/90',
          titleColor: 'text-emerald-950 dark:text-emerald-300',
          bodyColor: 'text-emerald-900 dark:text-emerald-100',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />,
          defaultTitle: 'Format conforme au modèle officiel',
        };
      case 'tip':
        return {
          container:
            'bg-sky-50/90 dark:bg-slate-900 border border-sky-300 dark:border-sky-800/90',
          titleColor: 'text-sky-950 dark:text-sky-300',
          bodyColor: 'text-sky-900 dark:text-sky-100',
          icon: <Lightbulb className="w-5 h-5 text-sky-700 dark:text-sky-400 shrink-0 mt-0.5" aria-hidden="true" />,
          defaultTitle: 'Conseil pratique de protection',
        };
      case 'security-rule':
        return {
          container:
            'bg-amber-50 dark:bg-slate-900 border-2 border-amber-400 dark:border-amber-500/90',
          titleColor: 'text-amber-950 dark:text-amber-300',
          bodyColor: 'text-slate-900 dark:text-slate-100',
          icon: <KeyRound className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />,
          defaultTitle: 'Règle d’or absolue — Mobile Money Togo',
        };
      case 'definition':
        return {
          container:
            'bg-indigo-50/80 dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/90',
          titleColor: 'text-indigo-950 dark:text-indigo-300',
          bodyColor: 'text-indigo-950 dark:text-slate-100',
          icon: <BookOpen className="w-5 h-5 text-indigo-700 dark:text-indigo-400 shrink-0 mt-0.5" aria-hidden="true" />,
          defaultTitle: 'Définition & concept clé',
        };
      case 'example':
        return {
          container:
            'bg-slate-100/90 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700',
          titleColor: 'text-slate-950 dark:text-white',
          bodyColor: 'text-slate-800 dark:text-slate-200',
          icon: <FileCheck className="w-5 h-5 text-slate-700 dark:text-slate-300 shrink-0 mt-0.5" aria-hidden="true" />,
          defaultTitle: 'Exemple concret',
        };
      case 'unverifiable':
        return {
          container:
            'bg-slate-100/90 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700',
          titleColor: 'text-slate-950 dark:text-white',
          bodyColor: 'text-slate-800 dark:text-slate-200',
          icon: <HelpCircle className="w-5 h-5 text-slate-700 dark:text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />,
          defaultTitle: 'Information non vérifiable ou incomplète',
        };
      case 'info':
      default:
        return {
          container:
            'bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700',
          titleColor: 'text-slate-950 dark:text-slate-100',
          bodyColor: 'text-slate-800 dark:text-slate-200',
          icon: <Info className="w-5 h-5 text-slate-700 dark:text-slate-300 shrink-0 mt-0.5" aria-hidden="true" />,
          defaultTitle: 'Information importante',
        };
    }
  };

  const style = getStyles();

  return (
    <div
      className={`my-3.5 p-4 sm:p-4.5 rounded-2xl ${style.container} shadow-2xs transition-colors`}
      role="region"
      aria-label={title || style.defaultTitle}
    >
      <div className="flex items-start gap-3">
        {style.icon}
        <div className="flex-1 min-w-0">
          <div className={`text-xs sm:text-[13px] font-bold tracking-tight uppercase mb-1.5 ${style.titleColor}`}>
            {title || style.defaultTitle}
          </div>
          <div className={`text-sm sm:text-[15px] leading-relaxed font-normal ${style.bodyColor}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
