import React from 'react';
import { X, Phone, AlertOctagon, CheckCircle2, ShieldAlert, ExternalLink, Hash } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 overflow-hidden relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 text-red-600 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Numéros d'Urgence & Démarches au Togo</h2>
            <p className="text-xs text-slate-500">Agissez immédiatement si vous êtes victime ou témoin d'une tentative d'arnaque</p>
          </div>
        </div>

        {/* Reflex Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-5 text-xs text-amber-900 space-y-1.5">
          <div className="font-bold flex items-center gap-1.5 text-amber-800">
            <AlertOctagon className="w-4 h-4 text-amber-600" />
            RÉFLEXE IMMÉDIAT EN CAS DE DOUTE :
          </div>
          <p>
            1. <strong>Ne cédez pas à la panique</strong> ni aux larmes d'un appelant inconnu.
          </p>
          <p>
            2. <strong>Vérifiez vous-même votre solde</strong> en composant le code USSD officiel sur votre téléphone.
          </p>
          <p>
            3. Si un transfert a réellement été reçu par erreur, <strong>laissez l'opérateur officiel gérer l'annulation</strong>.
          </p>
        </div>

        {/* Operators */}
        <div className="space-y-3 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Services Clients Opérateurs Mobile Money</h3>

          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900 text-sm">T-Money (Togocom)</div>
              <div className="text-xs text-slate-600">Assistance fraude & annulation officielle</div>
              <div className="text-xs text-emerald-700 font-medium mt-0.5">Code USSD : <code className="font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-300">*145#</code></div>
            </div>
            <a
              href="tel:888"
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-sm transition"
            >
              <Phone className="w-3.5 h-3.5" />
              Appeler le 888
            </a>
          </div>

          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900 text-sm">Moov Money (Moov Africa Togo)</div>
              <div className="text-xs text-slate-600">Service client & blocage de compte suspect</div>
              <div className="text-xs text-blue-700 font-medium mt-0.5">Code USSD : <code className="font-bold bg-white px-1.5 py-0.5 rounded border border-blue-300">*155#</code></div>
            </div>
            <div className="flex gap-2">
              <a
                href="tel:100"
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-sm transition"
              >
                <Phone className="w-3.5 h-3.5" />
                100
              </a>
              <a
                href="tel:155"
                className="inline-flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-sm transition"
              >
                155
              </a>
            </div>
          </div>
        </div>

        {/* Security & Authorities */}
        <div className="space-y-3 mb-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Forces de Sécurité & Cybercriminalité Togo</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">Police Secours Togo</div>
                <div className="text-[11px] text-slate-500">Intervention d'urgence</div>
              </div>
              <a
                href="tel:117"
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1"
              >
                <Phone className="w-3 h-3 text-red-400" />
                117
              </a>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">Gendarmerie Nationale</div>
                <div className="text-[11px] text-slate-500">Numéro vert d'assistance</div>
              </div>
              <a
                href="tel:172"
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1"
              >
                <Phone className="w-3 h-3 text-red-400" />
                172
              </a>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-xs font-bold text-slate-900">OCRC (Office Central de Répression de la Cybercriminalité)</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Service spécialisé de la police nationale togolaise pour le dépôt de plainte suite aux escroqueries en ligne et arnaques Mobile Money.
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
