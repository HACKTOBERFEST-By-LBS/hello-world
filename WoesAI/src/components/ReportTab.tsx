import React, { useState, useEffect } from 'react';
import {
  Radio,
  Send,
  AlertTriangle,
  Search,
  CheckCircle2,
  ThumbsUp,
  MapPin,
  Calendar,
  ShieldAlert,
  Phone,
  Flame,
  Filter
} from 'lucide-react';
import { CommunityReport, OperatorType } from '../types';

const INITIAL_COMMUNITY_REPORTS: CommunityReport[] = [
  {
    id: 'rep-1',
    operator: 'T-Money',
    senderNumber: '+228 92 14 33 08',
    scamType: 'Faux dépôt d’erreur',
    messageText: 'TMONEY: Vous avez recu 35 000 FCFA de KODJO A. Nouveau solde: 58 200 FCFA. Ref: TXN99482.',
    date: '31/10/2026',
    location: 'Lomé (Agoè-Nyivé)',
    upvotes: 38,
  },
  {
    id: 'rep-2',
    operator: 'Moov Money',
    senderNumber: '+228 97 65 43 21',
    scamType: 'Vol de code PIN / Menace de blocage',
    messageText: 'ALERTE MOOV AFRICA : Anomalie sur votre compte. Pour eviter le blocage, composez *155*4*97654321*50000#.',
    date: '30/10/2026',
    location: 'Lomé (Adidogomé)',
    upvotes: 52,
  },
  {
    id: 'rep-3',
    operator: 'T-Money',
    senderNumber: '+228 70 88 41 22',
    scamType: 'Fausse tombola Togocom',
    messageText: 'FELICITATION ! Vous gagnez 500.000 FCFA. Contactez le 91223344 et envoyez 15.000 FCFA de frais de dossier.',
    date: '29/10/2026',
    location: 'Kara',
    upvotes: 24,
  },
  {
    id: 'rep-4',
    operator: 'Inconnu',
    senderNumber: '+228 93 11 00 45',
    scamType: 'Fausse tontine WhatsApp',
    messageText: 'Rejoins la grande tontine express de Lomé ! Tu cotises 20.000 FCFA et recois 60.000 FCFA en 48 heures.',
    date: '28/10/2026',
    location: 'Sokodé',
    upvotes: 19,
  },
];

export const ReportTab: React.FC = () => {
  const [reports, setReports] = useState<CommunityReport[]>(() => {
    const saved = localStorage.getItem('woeseai_reports');
    return saved ? JSON.parse(saved) : INITIAL_COMMUNITY_REPORTS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterOperator, setFilterOperator] = useState<string>('all');

  // Form states
  const [formOperator, setFormOperator] = useState<OperatorType>('T-Money');
  const [formNumber, setFormNumber] = useState('');
  const [formScamType, setFormScamType] = useState('Faux dépôt d’erreur');
  const [formMessage, setFormMessage] = useState('');
  const [formLocation, setFormLocation] = useState('Lomé');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    localStorage.setItem('woeseai_reports', JSON.stringify(reports));
  }, [reports]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNumber.trim() || !formMessage.trim()) return;

    const newReport: CommunityReport = {
      id: `rep-${Date.now()}`,
      operator: formOperator,
      senderNumber: formNumber.trim(),
      scamType: formScamType,
      messageText: formMessage.trim(),
      date: new Date().toLocaleDateString('fr-FR'),
      location: formLocation.trim() || 'Togo',
      upvotes: 1,
    };

    setReports([newReport, ...reports]);
    setSubmittedSuccess(true);
    setFormNumber('');
    setFormMessage('');

    setTimeout(() => {
      setSubmittedSuccess(false);
    }, 4000);
  };

  const handleUpvote = (id: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r))
    );
  };

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.senderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.messageText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.scamType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesOperator =
      filterOperator === 'all' || r.operator.toLowerCase() === filterOperator.toLowerCase();

    return matchesSearch && matchesOperator;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-red-500/20">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-red-500/20 text-red-300 border border-red-500/30 text-xs px-3 py-1 rounded-full font-bold">
            <Radio className="w-3.5 h-3.5 text-red-400" />
            <span>Veille Citoyenne & Signalement Togo</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Alertez la communauté contre les arnaqueurs
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Chaque escroquerie signalée ici protège des milliers de concitoyens, commerçants et parents au Togo. Signalez le numéro suspect ou recherchez un numéro pour voir s'il a déjà été repéré.
          </p>
        </div>
      </div>

      {/* Grid: Form on left, Search & Feed on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Signalement Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              Signaler un nouveau SMS suspect
            </h3>
            <p className="text-xs text-slate-500">
              Contribuez à la base de données de sécurité togolais
            </p>
          </div>

          {submittedSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3.5 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Merci ! Le signalement a été enregistré avec succès pour protéger les autres citoyens.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Opérateur concerné
              </label>
              <select
                value={formOperator}
                onChange={(e) => setFormOperator(e.target.value as OperatorType)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-amber-500 text-slate-800 font-medium"
              >
                <option value="T-Money">T-Money (Togocom)</option>
                <option value="Moov Money">Moov Money (Moov Africa)</option>
                <option value="Inconnu">Opérateur Inconnu / Autre</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Numéro de l'escroc / expéditeur (+228...)
              </label>
              <input
                type="text"
                required
                value={formNumber}
                onChange={(e) => setFormNumber(e.target.value)}
                placeholder="Ex: +228 92 14 33 08"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-amber-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Type de tentative
              </label>
              <select
                value={formScamType}
                onChange={(e) => setFormScamType(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-amber-500 text-slate-800 font-medium"
              >
                <option value="Faux dépôt d’erreur">Faux dépôt d’erreur (demande de renvoyer)</option>
                <option value="Vol de code PIN / Menace">Demande de code PIN / Menace de coupure</option>
                <option value="Fausse tombola / Gain">Fausse tombola / Prétendu gain avec frais</option>
                <option value="Fausse tontine en ligne">Fausse tontine WhatsApp / Pyramide</option>
                <option value="Faux agent Togocom/Moov">Faux agent téléphonique ou d'assistance</option>
                <option value="Autre arnaque">Autre manipulation</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Ville / Quartier au Togo
              </label>
              <input
                type="text"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                placeholder="Ex: Lomé (Bè), Kara, Kpalimé, Sokodé..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-amber-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Contenu du message ou déroulement
              </label>
              <textarea
                required
                rows={3}
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                placeholder="Collez le texte du SMS ou décrivez brièvement ce que la personne vous a dit..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-amber-500 text-slate-800"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-red-600/20 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Publier l'alerte communautaire</span>
            </button>
          </form>
        </div>

        {/* Search & Community Feed */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search bar & filter */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un numéro (ex: 92 14...) ou un mot clé..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center justify-between text-xs flex-wrap gap-2">
              <span className="text-slate-500 font-medium">
                {filteredReports.length} alerte(s) répertoriée(s)
              </span>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px]">Filtrer :</span>
                {['all', 'T-Money', 'Moov Money'].map((op) => (
                  <button
                    key={op}
                    onClick={() => setFilterOperator(op)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      filterOperator === op
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {op === 'all' ? 'Tous' : op}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reports List */}
          <div className="space-y-3">
            {filteredReports.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-500 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-sm font-semibold">Aucun signalement ne correspond à votre recherche.</p>
                <p className="text-xs text-slate-400">
                  Si ce numéro tente de vous arnaquer, soyez le premier à le signaler avec le formulaire ci-contre !
                </p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5 hover:border-slate-300 transition"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                        {report.senderNumber}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {report.operator}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {report.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {report.date}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    {report.scamType}
                  </div>

                  <p className="text-xs font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-800 leading-relaxed">
                    « {report.messageText} »
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleUpvote(report.id)}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition cursor-pointer"
                    >
                      <ThumbsUp className="w-3 h-3 text-amber-600" />
                      <span>Confirmer ({report.upvotes})</span>
                    </button>

                    <a
                      href="tel:888"
                      className="text-[11px] font-bold text-emerald-700 hover:underline"
                    >
                      Signaler à Togocom (888) / Moov (100)
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
