import React from 'react';
import { X, Scale, BookOpen, ShieldCheck } from 'lucide-react';
import { ComparatorTab } from './ComparatorTab';
import { OFFICIAL_MODELS_REGISTRY } from '../data/officialFormats';

interface ComparatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComparatorModal: React.FC<ComparatorModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full h-[90vh] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden text-slate-900 dark:text-white">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Scale className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Comparateur Officiel & Modèles Validés Togo
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Différenciez les vrais SMS émis par TMoney et Moov Money des contrefaçons d'escrocs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <ComparatorTab />

          {/* Validated Official Models Registry (Phase 5.4 requirement) */}
          <div className="bg-slate-50 dark:bg-slate-800/80 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Registre des modèles officiels validés (Audit Réseau Togo)
              </h3>
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                {OFFICIAL_MODELS_REGISTRY.length} modèles actifs
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {OFFICIAL_MODELS_REGISTRY.map((mod) => (
                <div
                  key={mod.id}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {mod.operator} — {mod.transactionType.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      {mod.validationStatus}
                    </span>
                  </div>

                  <p className="font-mono text-[11px] p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed">
                    « {mod.referenceContent} »
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      Source : <strong className="text-slate-800 dark:text-slate-200">{mod.source}</strong>
                    </div>
                    <div className="text-right">
                      Vérifié le : <strong className="text-slate-800 dark:text-slate-200">{mod.validationDate}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0 bg-slate-50 dark:bg-slate-850">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
