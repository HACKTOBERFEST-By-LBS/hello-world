import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Copy,
  Check,
  Share2,
  PhoneCall,
  Clock,
  ArrowRight,
  Info,
  Flame,
  FileText,
  BadgeAlert
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
  modelUsed = 'gemini-3.1-flash-lite',
  onOpenReport,
}) => {
  const [copied, setCopied] = useState(false);

  const getVerdictConfig = (verdict: AnalysisResult['verdict']) => {
    switch (verdict) {
      case 'AUTHENTIQUE':
        return {
          title: 'CONFORME AU FORMAT OFFICIEL',
          subtitle: 'Le SMS respecte la syntaxe officielle connue',
          color: 'emerald',
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950',
          badgeBg: 'bg-emerald-600 text-white',
          borderHighlight: 'border-l-4 border-l-emerald-600',
          icon: <ShieldCheck className="w-8 h-8 text-emerald-600" />,
          statusText: 'AUTHENTIQUE (Sous réserve de vérification du solde)',
        };
      case 'SUSPECT':
        return {
          title: 'MESSAGE SUSPECT - PRUDENCE MAXIMALE',
          subtitle: 'Des anomalies ou signaux inquiétants ont été relevés',
          color: 'amber',
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-950',
          badgeBg: 'bg-amber-600 text-white',
          borderHighlight: 'border-l-4 border-l-amber-600',
          icon: <AlertTriangle className="w-8 h-8 text-amber-600" />,
          statusText: 'SUSPECT',
        };
      case 'FRAUDULEUX':
        return {
          title: 'ARNAQUE DÉTECTÉE - DANGER IMMÉDIAT',
          subtitle: 'Indices probants de tentative d’escroquerie financière',
          color: 'red',
          bg: 'bg-red-500/10 border-red-500/30 text-red-950',
          badgeBg: 'bg-red-600 text-white',
          borderHighlight: 'border-l-4 border-l-red-600',
          icon: <XCircle className="w-8 h-8 text-red-600" />,
          statusText: 'FRAUDULEUX',
        };
      case 'NON_VERIFIABLE':
      default:
        return {
          title: 'INFORMATIONS INSUFFISANTES',
          subtitle: 'Impossible de vérifier la provenance avec certitude',
          color: 'slate',
          bg: 'bg-slate-500/10 border-slate-400 text-slate-900',
          badgeBg: 'bg-slate-600 text-white',
          borderHighlight: 'border-l-4 border-l-slate-600',
          icon: <HelpCircle className="w-8 h-8 text-slate-600" />,
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

Conseil d'or : Ne renvoyez jamais d'argent sans vérifier votre solde (*145# ou *155#).`;

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
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
      {/* Top Bar with Verdict & Low Latency Telemetry */}
      <div className={`p-5 sm:p-6 border-b ${config.bg} ${config.borderHighlight}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-2.5 bg-white rounded-xl shadow-sm shrink-0">{config.icon}</div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full tracking-wider ${config.badgeBg}`}>
                  {result.verdict}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/80 border border-slate-200 text-slate-700">
                  Opérateur : <strong className="text-slate-900">{result.operator}</strong>
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/80 border border-slate-200 text-slate-700">
                  Confiance : <strong className="text-slate-900">{result.confidence}</strong>
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold mt-1.5 text-slate-900 leading-tight">
                {config.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">{config.subtitle}</p>
            </div>
          </div>

          {/* Latency badge */}
          {latencyMs && (
            <div className="sm:self-center shrink-0 flex items-center gap-1.5 bg-white/90 border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-slate-500 font-medium">Réponse :</span>
              <strong className="text-amber-600 font-mono font-bold">{latencyMs} ms</strong>
              <span className="text-[10px] text-slate-400 font-mono">({modelUsed})</span>
            </div>
          )}
        </div>
      </div>

      {/* Critical Safety Notice (Absolute Rule) */}
      <div className="bg-amber-500/10 border-b border-amber-300/40 p-4 px-6 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-amber-950 space-y-1">
          <p className="font-bold text-amber-900">
            RÈGLE DE SÉCURITÉ ABSOLUE :
          </p>
          <p>
            Même si un SMS semble conforme ou authentique,{' '}
            <strong>cela ne prouve jamais qu'un transfert a réellement eu lieu</strong>. Un escroc peut copier le texte exact d'un message officiel et vous l'envoyer depuis son numéro.
          </p>
          <p className="font-semibold text-emerald-800">
            👉 Avant toute action, vérifiez TOUJOURS votre solde réel : tapez{' '}
            <code className="bg-white px-1.5 py-0.5 rounded border border-amber-300 font-mono font-bold text-slate-900">*145#</code> (T-Money) ou{' '}
            <code className="bg-white px-1.5 py-0.5 rounded border border-amber-300 font-mono font-bold text-slate-900">*155#</code> (Moov Money).
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Simple Explanation for everyone */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-slate-700" />
            Explication en clair
          </h3>
          <p className="text-sm sm:text-base text-slate-800 font-medium leading-relaxed">
            {result.explanation}
          </p>
        </div>

        {/* Extracted Details Grid */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Informations extraites du message
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 block font-medium">Type d'opération</span>
              <strong className="text-slate-800 text-sm capitalize">
                {result.transaction?.type || 'Inconnu'}
              </strong>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 block font-medium">Montant détecté</span>
              <strong className="text-slate-900 text-sm font-mono">
                {result.transaction?.amount ? `${result.transaction.amount} ${result.transaction.currency || 'FCFA'}` : 'Aucun montant'}
              </strong>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 block font-medium">Expéditeur extrait</span>
              <strong className="text-slate-800 text-sm truncate block" title={result.transaction?.sender || ''}>
                {result.transaction?.sender || 'Non identifié'}
              </strong>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 block font-medium">Référence TXN</span>
              <strong className="text-slate-800 text-sm font-mono truncate block" title={result.transaction?.reference || ''}>
                {result.transaction?.reference || 'Aucune référence'}
              </strong>
            </div>
          </div>
        </div>

        {/* Fraud Indicators (If any) */}
        {result.fraud_indicators && result.fraud_indicators.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-600 flex items-center gap-1.5">
              <BadgeAlert className="w-4 h-4 text-red-600" />
              Indices de fraude détectés ({result.fraud_indicators.length})
            </h3>
            <div className="space-y-2">
              {result.fraud_indicators.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-red-50/70 border border-red-200/80 rounded-xl p-3.5 text-xs text-red-950 space-y-1"
                >
                  <div className="font-bold text-red-800 flex items-center gap-1.5 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                    {item.indicator}
                  </div>
                  {item.evidence && (
                    <div className="bg-white/80 p-1.5 px-2.5 rounded border border-red-200 font-mono text-[11px] text-slate-800">
                      Extrait suspect : <span className="text-red-700 font-semibold">« {item.evidence} »</span>
                    </div>
                  )}
                  <p className="text-slate-700 mt-1">{item.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Psychological Manipulation Warnings (If any) */}
        {result.psychological_manipulation && result.psychological_manipulation.length > 0 && (
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-600" />
              Pièges psychologiques utilisés par l'escroc
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-amber-950">
              {result.psychological_manipulation.map((tech, idx) => (
                <li key={idx} className="flex items-center gap-2 bg-white/80 p-2 rounded-lg border border-amber-200/60 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span>{tech}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reference Comparison Details */}
        {result.reference_comparison && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-700">Conformité au modèle officiel de l'opérateur</span>
              <span className={`font-extrabold px-2 py-0.5 rounded text-[10px] ${
                result.reference_comparison.status === 'CONFORME'
                  ? 'bg-emerald-100 text-emerald-800'
                  : result.reference_comparison.status === 'PARTIELLEMENT_CONFORME'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {result.reference_comparison.status}
              </span>
            </div>
            <p className="text-slate-600">{result.reference_comparison.details}</p>
          </div>
        )}

        {/* Actionable Recommendations */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Recommandations de sécurité immédiates
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {result.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-start gap-2.5 text-xs text-slate-800"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
                  {idx + 1}
                </div>
                <span className="font-medium">{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer as required by prompt */}
        <div className="text-[11px] text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
          « {result.disclaimer} »
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={copyReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
              {copied ? 'Rapport copié !' : 'Copier le rapport'}
            </button>

            <button
              onClick={shareWhatsApp}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              Alerter un proche sur WhatsApp
            </button>
          </div>

          {result.report_suggested && onOpenReport && (
            <button
              onClick={onOpenReport}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition shadow-sm cursor-pointer"
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
