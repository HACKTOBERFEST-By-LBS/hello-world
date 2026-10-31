import React from 'react';
import { X, Radio } from 'lucide-react';
import { ReportTab } from './ReportTab';

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportsModal: React.FC<ReportsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full h-[90vh] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden text-slate-900 dark:text-white">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center font-bold">
              <Radio className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Signalements & Veille Citoyenne Togo
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Alertez la communauté et vérifiez si un numéro +228 a déjà été signalé
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <ReportTab />
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
