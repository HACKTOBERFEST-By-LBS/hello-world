import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  KeyRound,
  ShieldCheck,
  BadgeAlert,
  PhoneCall,
  Calendar,
  Tag,
  ArrowRight
} from 'lucide-react';
import { VerdictType } from '../../types';

export interface AnalysisDetails {
  verdict: VerdictType;
  operator?: string;
  amount?: string;
  currency?: string;
  sender?: string;
  reference?: string;
  operationType?: string;
  dateTime?: string;
  explanation?: string;
  indicators?: string[];
  recommendations?: string[];
}

interface AnalysisCardBlockProps {
  details: AnalysisDetails;
}

export const AnalysisCardBlock: React.FC<AnalysisCardBlockProps> = ({ details }) => {
  const getVerdictData = (verdict: VerdictType) => {
    switch (verdict) {
      case 'AUTHENTIQUE':
        return {
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-700 dark:text-emerald-400 shrink-0" aria-hidden="true" />,
          badgeClass: 'bg-emerald-700 dark:bg-emerald-600 text-white',
          statusLabel: 'AUTHENTIQUE (Sous réserve de vérification)',
          containerClass: 'bg-emerald-50/70 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-800/80',
          title: 'Syntaxe conforme au modèle officiel',
          shortExplanation:
            'Ce message reprend la structure textuelle officielle connue de l’opérateur.',
          colorText: 'text-emerald-950 dark:text-emerald-200',
        };
      case 'SUSPECT':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-700 dark:text-amber-400 shrink-0" aria-hidden="true" />,
          badgeClass: 'bg-amber-600 text-white dark:bg-amber-500 dark:text-slate-950 font-bold',
          statusLabel: 'SUSPECT — ATTENTION REQUISE',
          containerClass: 'bg-amber-50/70 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800/80',
          title: 'Signaux anormaux détectés',
          shortExplanation:
            'Des anomalies de formulation ou un numéro individuel inhabituel ont été constatés.',
          colorText: 'text-amber-950 dark:text-amber-200',
        };
      case 'FRAUDULEUX':
        return {
          icon: <ShieldAlert className="w-6 h-6 text-rose-700 dark:text-rose-400 shrink-0" aria-hidden="true" />,
          badgeClass: 'bg-rose-700 dark:bg-rose-600 text-white',
          statusLabel: 'FRAUDULEUX — DANGER IMMÉDIAT',
          containerClass: 'bg-rose-50/70 dark:bg-rose-950/30 border-b border-rose-200 dark:border-rose-800/80',
          title: 'Tentative d’arnaque confirmée',
          shortExplanation:
            'Ce message présente les caractéristiques typiques d’une escroquerie financière Mobile Money.',
          colorText: 'text-rose-950 dark:text-rose-200',
        };
      case 'NON_VERIFIABLE':
      default:
        return {
          icon: <HelpCircle className="w-6 h-6 text-slate-700 dark:text-slate-300 shrink-0" aria-hidden="true" />,
          badgeClass: 'bg-slate-700 dark:bg-slate-600 text-white',
          statusLabel: 'NON VÉRIFIABLE',
          containerClass: 'bg-slate-100/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700',
          title: 'Informations insuffisantes',
          shortExplanation:
            'Le contenu est trop court, incomplet ou tronqué pour statuer avec certitude.',
          colorText: 'text-slate-950 dark:text-slate-200',
        };
    }
  };

  const vInfo = getVerdictData(details.verdict);

  const hasExtractedInfo = Boolean(
    details.amount ||
    details.sender ||
    details.reference ||
    details.operationType ||
    details.dateTime
  );

  return (
    <div className="my-4 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 shadow-xs transition-colors">
      {/* 1. Résultat de l'analyse */}
      <div className={`p-4 sm:p-5 ${vInfo.containerClass}`}>
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-2xs border border-slate-200/80 dark:border-slate-700 shrink-0">
            {vInfo.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-md tracking-wider ${vInfo.badgeClass}`}>
                {vInfo.statusLabel}
              </span>
              {details.operator && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/90 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                  Opérateur : {details.operator}
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white leading-tight">
              {vInfo.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
              {details.explanation || vInfo.shortExplanation}
            </p>
          </div>
        </div>
      </div>

      {/* Safety Notice (Crucial requirement: formatting alone never proves authenticity) */}
      <div className="bg-amber-50/80 dark:bg-slate-900 border-b border-amber-200/80 dark:border-amber-900/60 p-3 sm:p-4 px-4 sm:px-5 flex items-start gap-3 text-xs sm:text-[13px] text-amber-950 dark:text-amber-100">
        <KeyRound className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <span className="font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 block">
            Règle de sécurité absolue :
          </span>
          <p className="leading-relaxed">
            Une simple correspondance avec un format officiel ne prouve jamais qu'un message est authentique. N'agissez jamais sans vérifier votre solde réel vous-même en composant{' '}
            <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono font-bold text-slate-950 dark:text-white border border-amber-300 dark:border-amber-700">
              *145#
            </code>{' '}
            (T-Money) ou{' '}
            <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono font-bold text-slate-950 dark:text-white border border-amber-300 dark:border-amber-700">
              *155#
            </code>{' '}
            (Moov Money).
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        {/* 2. Informations extraites */}
        {hasExtractedInfo && (
          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              <span>Informations extraites du SMS</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              {details.operationType && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] uppercase font-bold block mb-0.5">
                    Opération
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white capitalize truncate block text-[13px]">
                    {details.operationType}
                  </span>
                </div>
              )}

              {details.amount && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] uppercase font-bold block mb-0.5">
                    Montant détecté
                  </span>
                  <span className="font-extrabold text-slate-950 dark:text-white font-mono tabular-nums truncate block text-[13px]">
                    {details.amount} {details.currency || 'FCFA'}
                  </span>
                </div>
              )}

              {details.sender && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] uppercase font-bold block mb-0.5">
                    Expéditeur
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white truncate block text-[13px]" title={details.sender}>
                    {details.sender}
                  </span>
                </div>
              )}

              {details.reference && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] uppercase font-bold block mb-0.5">
                    Réf. Transaction
                  </span>
                  <span className="font-mono text-slate-900 dark:text-white truncate block text-[13px]" title={details.reference}>
                    {details.reference}
                  </span>
                </div>
              )}

              {details.dateTime && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] uppercase font-bold block mb-0.5">
                    Date & Heure
                  </span>
                  <span className="font-mono text-slate-900 dark:text-white truncate block text-[13px]">
                    {details.dateTime}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. Indicateurs suspects */}
        {details.indicators && details.indicators.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-400 flex items-center gap-1.5">
              <BadgeAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" aria-hidden="true" />
              <span>Indicateurs suspects relevés ({details.indicators.length})</span>
            </h4>
            <div className="space-y-2">
              {details.indicators.map((ind, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-rose-50/80 dark:bg-slate-900 border border-rose-200 dark:border-rose-900/80 text-xs sm:text-sm text-rose-950 dark:text-rose-100 flex items-start gap-2.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0 mt-2" aria-hidden="true" />
                  <span className="leading-relaxed font-medium">{ind}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Recommandations claires et numérotées */}
        {details.recommendations && details.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              <span>Actions immédiates recommandées</span>
            </h4>
            <div className="space-y-2">
              {details.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 flex items-start gap-3"
                >
                  <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed font-medium">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
