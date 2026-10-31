import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Copy,
  Check,
  Share2,
  FileText,
  BadgeAlert,
  KeyRound,
  Tag
} from 'lucide-react';
import { AnalysisResult } from '../types';

interface VerdictCardProps {
  result: AnalysisResult;
  latencyMs?: number;
  modelUsed?: string;
  onOpenReport?: () => void;
}

export const VerdictCard: React.FC<VerdictCardProps> = ({
  result,
  latencyMs,
  modelUsed = 'Gemma / Gemini Hybrid',
  onOpenReport,
}) => {
  const [copied, setCopied] = useState(false);

  const getVerdictConfig = (verdict: AnalysisResult['verdict']) => {
    switch (verdict) {
      case 'AUTHENTIQUE':
        return {
          title: 'Syntaxe conforme au modèle officiel',
          subtitle: 'Le SMS respecte la formulation officielle connue de l’opérateur',
          bg: 'bg-emerald-50/70 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-800/80',
          badgeBg: 'bg-emerald-700 dark:bg-emerald-600 text-white',
          icon: <ShieldCheck className="w-7 h-7 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />,
          statusText: 'AUTHENTIQUE (Sous réserve de vérification)',
        };
      case 'SUSPECT':
        return {
          title: 'Message suspect — Prudence maximale',
          subtitle: 'Des anomalies ou signaux inhabituels ont été relevés',
          bg: 'bg-amber-50/70 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800/80',
          badgeBg: 'bg-amber-600 text-white dark:bg-amber-500 dark:text-slate-950 font-bold',
          icon: <AlertTriangle className="w-7 h-7 text-amber-700 dark:text-amber-400" aria-hidden="true" />,
          statusText: 'SUSPECT',
        };
      case 'FRAUDULEUX':
        return {
          title: 'Arnaque confirmée — Danger immédiat',
          subtitle: 'Indices caractéristiques de tentative d’escroquerie financière',
          bg: 'bg-rose-50/70 dark:bg-rose-950/30 border-b border-rose-200 dark:border-rose-800/80',
          badgeBg: 'bg-rose-700 dark:bg-rose-600 text-white',
          icon: <XCircle className="w-7 h-7 text-rose-700 dark:text-rose-400" aria-hidden="true" />,
          statusText: 'FRAUDULEUX',
        };
      case 'NON_VERIFIABLE':
      default:
        return {
          title: 'Informations insuffisantes',
          subtitle: 'Impossible de vérifier la provenance avec certitude',
          bg: 'bg-slate-100/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700',
          badgeBg: 'bg-slate-700 dark:bg-slate-600 text-white',
          icon: <HelpCircle className="w-7 h-7 text-slate-700 dark:text-slate-300" aria-hidden="true" />,
          statusText: 'NON VÉRIFIABLE',
        };
    }
  };

  const config = getVerdictConfig(result.verdict);

  const copyReport = () => {
    const reportText = `[RAPPORT DE SÉCURITÉ WOÈSÉAI - TOGO]
Verdict : ${result.verdict}
Opérateur : ${result.operator}
Montant : ${result.transaction?.amount || 'Non spécifié'} ${result.transaction?.currency || ''}
Expéditeur : ${result.transaction?.sender || 'Inconnu'}
Explication : ${result.explanation}
Recommandations :
${result.recommendations.map((r) => `- ${r}`).join('\n')}

Règle d'or : Ne renvoyez jamais d'argent sans vérifier votre solde officiel (*145# ou *155#).`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareWhatsApp = () => {
    const message = `⚠️ ALERTE ARNAQUE MOBILE MONEY TOGO (WoèséAI) ⚠️
Verdict : ${result.verdict} (${result.operator})
Explication : ${result.explanation}
Conseil : Ne renvoyez JAMAIS d'argent sans vérifier votre solde sur *145# (T-Money) ou *155# (Moov Money).`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-200">
      {/* Top Bar with Verdict & Low Latency Telemetry */}
      <div className={`p-5 sm:p-6 ${config.bg}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-2xs border border-slate-200/80 dark:border-slate-700 shrink-0">
              {config.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-md tracking-wider ${config.badgeBg}`}>
                  {config.statusText}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white/90 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                  Opérateur : <strong className="text-slate-950 dark:text-white">{result.operator}</strong>
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white/90 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                  Confiance : <strong className="text-slate-950 dark:text-white">{result.confidence}</strong>
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-950 dark:text-white leading-tight">
                {config.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-0.5">
                {config.subtitle}
              </p>
            </div>
          </div>

          {/* Latency badge */}
          {latencyMs && (
            <div className="sm:self-center shrink-0 flex items-center gap-1.5 bg-white/90 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl shadow-2xs text-xs font-mono tabular-nums">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              <span className="text-slate-500 dark:text-slate-400 font-medium">Temps :</span>
              <strong className="text-amber-700 dark:text-amber-400 font-bold">{latencyMs} ms</strong>
            </div>
          )}
        </div>
      </div>

      {/* Critical Safety Notice (Absolute Rule) */}
      <div className="bg-amber-50/80 dark:bg-slate-900 border-b border-amber-200/80 dark:border-amber-900/60 p-4 px-6 flex items-start gap-3">
        <KeyRound className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-xs sm:text-sm text-amber-950 dark:text-amber-100 space-y-1">
          <p className="font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
            Règle de sécurité absolue :
          </p>
          <p className="leading-relaxed">
            Même si un SMS semble conforme ou authentique,{' '}
            <strong className="font-bold text-slate-950 dark:text-white">cela ne prouve jamais qu'un transfert a réellement eu lieu</strong>. Un escroc peut copier le texte exact d'un message officiel et vous l'envoyer depuis son numéro personnel.
          </p>
          <p className="font-semibold text-emerald-800 dark:text-emerald-300">
            👉 Avant toute action, vérifiez TOUJOURS votre solde réel : composez{' '}
            <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-700 font-mono font-bold text-slate-950 dark:text-white">
              *145#
            </code>{' '}
            (T-Money) ou{' '}
            <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-700 font-mono font-bold text-slate-950 dark:text-white">
              *155#
            </code>{' '}
            (Moov Money).
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Simple Explanation */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-slate-700 dark:text-slate-300" aria-hidden="true" />
            Explication claire
          </h3>
          <p className="text-sm sm:text-base text-slate-900 dark:text-slate-100 font-medium leading-relaxed">
            {result.explanation}
          </p>
        </div>

        {/* Extracted Details Grid */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3 flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-slate-500" aria-hidden="true" />
            Informations extraites du message
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 block font-bold text-[11px] uppercase mb-0.5">
                Opération
              </span>
              <strong className="text-slate-900 dark:text-white text-sm capitalize truncate block">
                {result.transaction?.type || 'Inconnu'}
              </strong>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 block font-bold text-[11px] uppercase mb-0.5">
                Montant détecté
              </span>
              <strong className="text-slate-950 dark:text-white text-sm font-mono tabular-nums truncate block">
                {result.transaction?.amount ? `${result.transaction.amount} ${result.transaction.currency || 'FCFA'}` : 'Aucun montant'}
              </strong>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 block font-bold text-[11px] uppercase mb-0.5">
                Expéditeur
              </span>
              <strong className="text-slate-900 dark:text-white text-sm truncate block" title={result.transaction?.sender || ''}>
                {result.transaction?.sender || 'Non identifié'}
              </strong>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 block font-bold text-[11px] uppercase mb-0.5">
                Réf. TXN
              </span>
              <strong className="text-slate-900 dark:text-white text-sm font-mono truncate block" title={result.transaction?.reference || ''}>
                {result.transaction?.reference || 'Aucune référence'}
              </strong>
            </div>
          </div>
        </div>

        {/* Fraud Indicators (If any) */}
        {result.fraud_indicators && result.fraud_indicators.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-400 flex items-center gap-1.5">
              <BadgeAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" aria-hidden="true" />
              Indices de fraude détectés ({result.fraud_indicators.length})
            </h3>
            <div className="space-y-2">
              {result.fraud_indicators.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-rose-50/80 dark:bg-slate-900 border border-rose-200 dark:border-rose-900/80 rounded-xl p-3.5 text-xs text-rose-950 dark:text-rose-100 space-y-1"
                >
                  <div className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" aria-hidden="true" />
                    {item.indicator}
                  </div>
                  {item.evidence && (
                    <div className="bg-white/90 dark:bg-slate-800 p-2 rounded border border-rose-200 dark:border-slate-700 font-mono text-[11px] text-slate-900 dark:text-slate-100">
                      Extrait suspect : <span className="text-rose-700 dark:text-rose-300 font-semibold">« {item.evidence} »</span>
                    </div>
                  )}
                  <p className="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{item.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actionable Recommendations */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            Recommandations de sécurité immédiates
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {result.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 p-3 rounded-xl flex items-start gap-2.5 text-xs text-slate-900 dark:text-slate-100"
              >
                <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5 shadow-2xs">
                  {idx + 1}
                </div>
                <span className="font-medium leading-relaxed">{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-[12px] text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-center leading-relaxed">
          « {result.disclaimer} »
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={copyReport}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-600 dark:text-slate-400" />}
              {copied ? 'Rapport copié !' : 'Copier le rapport'}
            </button>

            <button
              onClick={shareWhatsApp}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              Alerter un proche sur WhatsApp
            </button>
          </div>

          {result.report_suggested && onOpenReport && (
            <button
              onClick={onOpenReport}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <BadgeAlert className="w-4 h-4" />
              Signaler ce numéro suspect
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
