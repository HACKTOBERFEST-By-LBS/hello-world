import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Send,
  Zap,
  Sparkles,
  AlertCircle,
  X,
  FileCheck2,
  RefreshCw,
  Phone,
  HelpCircle,
  Hash
} from 'lucide-react';
import { SAMPLE_SMS_LIST, SampleSMS } from '../data/samples';
import { AnalysisResponse, AnalysisResult } from '../types';
import { VerdictCard } from './VerdictCard';

interface DetectorTabProps {
  onAnalysisDone: (latencyMs: number) => void;
  onNavigateToReports: () => void;
  onOpenEmergency: () => void;
}

export const DetectorTab: React.FC<DetectorTabProps> = ({
  onAnalysisDone,
  onNavigateToReports,
  onOpenEmergency,
}) => {
  const [smsText, setSmsText] = useState('');
  const [senderId, setSenderId] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/png');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load a preset sample
  const handleSelectSample = (sample: SampleSMS) => {
    setSmsText(sample.text);
    setSenderId(sample.sender);
    setSelectedImage(null);
    setError(null);
    setAnalysisResult(null);
  };

  // Handle image upload & base64 encoding
  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image valide (capture d’écran PNG, JPG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('L’image est trop volumineuse (max 8 Mo).');
      return;
    }

    setImageMime(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setSelectedImage(base64);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  // Run low latency analysis
  const handleAnalyze = async () => {
    if (!smsText.trim() && !selectedImage) {
      setError('Veuillez coller le texte du SMS ou téléverser une capture d’écran.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: smsText.trim(),
          senderId: senderId.trim(),
          imageBase64: selectedImage || undefined,
          imageMime: selectedImage ? imageMime : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de l’analyse.');
      }

      setAnalysisResult(data);
      if (data.latencyMs) {
        onAnalysisDone(data.latencyMs);
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur de connexion au serveur d’analyse.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSmsText('');
    setSenderId('');
    setSelectedImage(null);
    setError(null);
    setAnalysisResult(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Intro Hero with Low-Latency & Togo Focus */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Analyse Instantanée & Précise — T-Money & Moov Money</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Vérifiez un SMS Mobile Money avant d'agir
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Un inconnu vous appelle en prétendant avoir transféré de l'argent par erreur ? Vous avez reçu un avis de gain ou de blocage ? Collez le SMS ou déposez une capture d’écran pour obtenir un verdict immédiat.
            </p>
          </div>

          {/* Quick USSD Reminder Box */}
          <div className="bg-slate-950/70 border border-slate-700/80 rounded-2xl p-4 shrink-0 text-xs space-y-2 shadow-inner">
            <div className="font-bold text-amber-400 flex items-center gap-1.5">
              <Hash className="w-4 h-4" />
              Codes USSD Officiels Togo
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-300 font-medium">T-Money (Togocom)</span>
                <code className="bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
                  *145#
                </code>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-300 font-medium">Moov Money (Moov)</span>
                <code className="bg-blue-950 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-mono font-bold">
                  *155#
                </code>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
              Vérifiez toujours votre solde avant de croire un SMS !
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Samples Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Exemples concrets au Togo (cliquez pour tester instantanément) :
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">Cas réels Lomé & régions</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {SAMPLE_SMS_LIST.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-300 text-slate-700 transition shrink-0 shadow-xs cursor-pointer text-left flex items-center gap-1.5"
            >
              <span>{sample.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Analysis Input Form */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-5 sm:p-6 space-y-5">
        {/* Row 1: Sender ID & Image Upload Button */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Numéro ou Nom de l'expéditeur (optionnel mais recommandé)
            </label>
            <input
              type="text"
              value={senderId}
              onChange={(e) => setSenderId(e.target.value)}
              placeholder="Ex: +228 92 14 33 08 ou TMoney ou Inconnu"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-slate-50 text-slate-900"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Astuce : Un vrai SMS TMoney ou MoovMoney n'affiche <strong>jamais</strong> un numéro personnel à 8 chiffres (+228 9X/7X).
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Capture d’écran du SMS (optionnel)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-amber-500 hover:bg-amber-50/50 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                <Upload className="w-4 h-4 text-amber-600" />
                <span>{selectedImage ? 'Changer la capture' : 'Déposer une capture'}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleImageUpload(e.target.files[0]);
                  }
                }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Prise en charge des captures d'écran de messagerie Android / iPhone.
            </p>
          </div>
        </div>

        {/* Image Preview if uploaded */}
        {selectedImage && (
          <div className="relative rounded-xl border border-amber-200 bg-amber-50/50 p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0">
                <img src={selectedImage} alt="Capture SMS" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Capture d’écran prête pour analyse visuelle</span>
                <span className="text-[11px] text-slate-500">L'IA analysera le texte, la mise en page et les marqueurs visuels</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedImage(null)}
              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-white transition cursor-pointer"
              title="Supprimer la capture"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Text Area for SMS */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Texte exact du SMS reçu
            </label>
            <span className="text-xs text-slate-400 font-mono">{smsText.length} caractères</span>
          </div>
          <textarea
            value={smsText}
            onChange={(e) => setSmsText(e.target.value)}
            onDrop={handleDrop}
            placeholder="Collez ici le texte du SMS que vous avez reçu (ex: Vous avez recu 25000 FCFA de... ou Félicitations...)"
            rows={4}
            className="w-full text-sm p-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-slate-50 text-slate-900 leading-relaxed placeholder:text-slate-400"
          />
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-900 text-xs p-3.5 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions bar: Analyze and Reset */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            disabled={loading || (!smsText && !selectedImage && !senderId)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition disabled:opacity-40 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réinitialiser</span>
          </button>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading || (!smsText.trim() && !selectedImage)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-sm shadow-md shadow-amber-500/20 transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-900" />
                <span>Analyse ultra-rapide en cours...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
                <span>Lancer l'analyse WoèséAI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Result Card */}
      {analysisResult && (
        <VerdictCard
          result={analysisResult.data}
          latencyMs={analysisResult.latencyMs}
          modelUsed={analysisResult.modelUsed}
          onOpenReport={onNavigateToReports}
        />
      )}

      {/* Bottom Educational Tips */}
      <div className="bg-slate-100/80 rounded-2xl p-5 border border-slate-200 text-xs text-slate-600 space-y-2">
        <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
          <HelpCircle className="w-4 h-4 text-amber-600" />
          Les 3 règles d'or contre les arnaqueurs au Togo :
        </h4>
        <ul className="list-disc list-inside space-y-1 text-slate-700">
          <li>
            <strong>Ne renvoyez JAMAIS d'argent :</strong> Si quelqu'un prétend s'être trompé, dites-lui d'appeler son opérateur (888 ou 100). C'est l'opérateur seul qui effectue l'annulation officielle.
          </li>
          <li>
            <strong>Gardez votre code PIN secret :</strong> Même si la personne dit être le directeur de Togocom ou Moov, ne donnez JAMAIS vos 4 chiffres secrets.
          </li>
          <li>
            <strong>Aucun cadeau ne demande des frais :</strong> Si on vous dit que vous avez gagné 500 000 FCFA mais qu'il faut envoyer 15 000 FCFA pour débloquer, c'est une escroquerie.
          </li>
        </ul>
      </div>
    </div>
  );
};
