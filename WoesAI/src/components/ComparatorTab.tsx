import React, { useState } from 'react';
import { Scale, CheckCircle2, XCircle, AlertTriangle, HelpCircle, PhoneCall, Hash, Shield } from 'lucide-react';
import { OFFICIAL_FORMATS } from '../data/officialFormats';

export const ComparatorTab: React.FC = () => {
  const [operator, setOperator] = useState<'tmoney' | 'moov'>('tmoney');
  const spec = OFFICIAL_FORMATS[operator];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Intro */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
              <Scale className="w-3.5 h-3.5" />
              <span>Simulateur & Analyse Comparative Officielle</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Vrai SMS Officiel vs Faux SMS d'Arnaqueur
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Observez les différences subtiles que les escrocs tentent de dissimuler aux utilisateurs togolais.
            </p>
          </div>

          {/* Operator Switcher */}
          <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200 self-start sm:self-center">
            <button
              onClick={() => setOperator('tmoney')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                operator === 'tmoney'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              T-Money (Togocom)
            </button>
            <button
              onClick={() => setOperator('moov')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                operator === 'moov'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Moov Money (Moov Africa)
            </button>
          </div>
        </div>
      </div>

      {/* Operator Metadata Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 block font-medium">Expéditeur Réseau Officiel</span>
          <strong className="text-slate-900 text-sm font-mono mt-0.5 block">{spec.senderId}</strong>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 block font-medium">Vérification Solde Réel</span>
          <strong className="text-emerald-700 text-sm font-mono font-bold mt-0.5 block">{spec.ussdCheck}</strong>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 block font-medium">Numéro Officiel Gratuit</span>
          <strong className="text-slate-900 text-sm font-mono mt-0.5 block">{spec.customerServiceNumber}</strong>
        </div>
      </div>

      {/* Side by Side Phone Mockups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Genuine SMS Card */}
        <div className="bg-emerald-50/50 rounded-3xl border-2 border-emerald-300 p-6 shadow-md space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-emerald-200/80 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-extrabold text-emerald-950 text-sm">VRAI SMS OFFICIEL</h3>
            </div>
            <span className="text-[11px] font-bold bg-emerald-200/80 text-emerald-800 px-2 py-0.5 rounded-full">
              Émis par le serveur
            </span>
          </div>

          {/* SMS Bubble */}
          <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-900 flex items-center gap-1">
                De : <strong className="text-emerald-700 font-mono">{spec.senderId.split(' ')[0]}</strong>
              </span>
              <span>Aujourd'hui 14:32</span>
            </div>
            <p className="font-mono text-xs text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              {spec.officialDepositExample}
            </p>
          </div>

          {/* Markers */}
          <div className="space-y-2 text-xs">
            <div className="font-bold text-emerald-900">Signes d'authenticité :</div>
            <ul className="space-y-1.5 text-emerald-900 text-[11px]">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Expéditeur alphanumérique officiel (aucun numéro personnel).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Le solde de votre compte a réellement augmenté via {spec.ussdCheck.split(' ')[0]}.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Horodatage et référence TXN unique traçable par le service client.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Counterfeit SMS Card */}
        <div className="bg-red-50/50 rounded-3xl border-2 border-red-300 p-6 shadow-md space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-red-200/80 pb-3">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <h3 className="font-extrabold text-red-950 text-sm">FAUX SMS D'ESCROC</h3>
            </div>
            <span className="text-[11px] font-bold bg-red-200/80 text-red-800 px-2 py-0.5 rounded-full">
              Falsification courante
            </span>
          </div>

          {/* SMS Bubble */}
          <div className="bg-white rounded-2xl p-4 border border-red-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-900 flex items-center gap-1">
                De : <strong className="text-red-700 font-mono">+228 92 44 11 22</strong>
              </span>
              <span>Aujourd'hui 14:34</span>
            </div>
            <p className="font-mono text-xs text-slate-800 leading-relaxed bg-red-50/40 p-3 rounded-xl border border-red-100">
              {spec.fraudulentCounterfeitExample}
            </p>
          </div>

          {/* Markers */}
          <div className="space-y-2 text-xs">
            <div className="font-bold text-red-900">Pièges et anomalies visibles :</div>
            <ul className="space-y-1.5 text-red-950 text-[11px]">
              <li className="flex items-start gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                <span>Envoyé depuis un numéro togolais normal à 8 chiffres (+228 9X/7X).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                <span>Votre solde réel n'a pas bougé quand vous composez votre code USSD.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                <span>L'escroc vous téléphone immédiatement en criant à l'urgence.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Difference Breakdown Table */}
      <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-600" />
          Tableau comparatif des détails techniques
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-900 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-3.5">Élément</th>
                <th className="p-3.5 text-emerald-700">Dans un vrai message officiel</th>
                <th className="p-3.5 text-red-700">Dans un faux SMS d'arnaque</th>
                <th className="p-3.5 text-slate-600">Pourquoi c'est décisif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {spec.differences.map((diff, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80">
                  <td className="p-3.5 font-bold text-slate-900">{diff.element}</td>
                  <td className="p-3.5 text-emerald-800 bg-emerald-50/30">{diff.authentic}</td>
                  <td className="p-3.5 text-red-800 bg-red-50/30">{diff.fraudulent}</td>
                  <td className="p-3.5 text-slate-600">{diff.whyItMatters}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Critical Operator Instructions */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-3">
        <h4 className="font-bold text-sm text-amber-400">Règles impératives pour {spec.operator} :</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
          {spec.criticalRules.map((rule, idx) => (
            <div key={idx} className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <span className="text-amber-400 font-bold block mb-1">Règle #{idx + 1}</span>
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
