import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Award,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Zap,
  Phone,
  Lock,
  Flame,
  Gift,
  Coins
} from 'lucide-react';
import { QUIZ_QUESTIONS, QuizQuestion } from '../data/quiz';

interface LearnTabProps {
  onLatencyUpdate: (ms: number) => void;
}

const TOPICS = [
  {
    id: 1,
    title: '1. Reconnaître un faux SMS',
    subtitle: 'Différence entre identifiant officiel et numéro de portable ordinaire',
    icon: <Coins className="w-5 h-5 text-amber-500" />,
  },
  {
    id: 2,
    title: '2. Comprendre les arnaques Mobile Money',
    subtitle: 'Le mécanisme du faux dépôt d’erreur et des faux transferts',
    icon: <AlertCircle className="w-5 h-5 text-red-500" />,
  },
  {
    id: 3,
    title: '3. Protéger son compte au quotidien',
    subtitle: 'Les 5 réflexes d’or pour sécuriser son portefeuille numérique',
    icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
  },
  {
    id: 4,
    title: '4. Reconnaître les faux concours & tombolas',
    subtitle: 'Pourquoi aucun gain légitime n’exige de payer des frais préalables',
    icon: <Gift className="w-5 h-5 text-purple-500" />,
  },
  {
    id: 5,
    title: '5. Identifier les manipulations psychologiques',
    subtitle: 'L’urgence artificielle, la peur de coupure et la fausse détresse',
    icon: <Flame className="w-5 h-5 text-orange-500" />,
  },
  {
    id: 6,
    title: '6. Protéger son code PIN et son code OTP',
    subtitle: 'Pourquoi même le directeur de l’opérateur n’a pas le droit de vous le demander',
    icon: <Lock className="w-5 h-5 text-blue-500" />,
  },
  {
    id: 7,
    title: '7. Que faire après une escroquerie ?',
    subtitle: 'Les démarches immédiates au Togo (Togocom 888, Moov 100, Police 117, OCRC)',
    icon: <Phone className="w-5 h-5 text-emerald-600" />,
  },
  {
    id: 8,
    title: '8. Tester mes connaissances avec un quiz',
    subtitle: '6 cas pratiques réels togolais pour tester vos réflexes d’auto-défense',
    icon: <Award className="w-5 h-5 text-amber-600" />,
    isQuiz: true,
  },
];

export const LearnTab: React.FC<LearnTabProps> = ({ onLatencyUpdate }) => {
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [lessonContent, setLessonContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quiz state
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizFinished, setQuizFinished] = useState(false);

  // Fetch lesson content via low-latency endpoint
  const handleSelectTopic = async (topic: (typeof TOPICS)[0]) => {
    setSelectedTopicId(topic.id);
    setError(null);

    if (topic.isQuiz) {
      setQuizStarted(true);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setQuizFinished(false);
      setLessonContent(null);
      return;
    }

    setQuizStarted(false);
    setLoading(true);
    setLessonContent(null);

    try {
      const response = await fetch('/api/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: topic.id,
          topicTitle: topic.title,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du chargement de la leçon.');
      }

      setLessonContent(data.content);
      if (data.latencyMs) {
        onLatencyUpdate(data.latencyMs);
      }
    } catch (err: any) {
      setError(err?.message || 'Impossible de charger la leçon.');
    } finally {
      setLoading(false);
    }
  };

  // Quiz handlers
  const handleOptionSelect = (questionId: number, optionId: string) => {
    if (selectedAnswers[questionId]) return; // locked once chosen
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizFinished(false);
  };

  // Calculate score
  const score = QUIZ_QUESTIONS.reduce((acc, q) => {
    const chosen = selectedAnswers[q.id];
    const correctOpt = q.options.find((o) => o.isCorrect);
    return chosen === correctOpt?.id ? acc + 1 : acc;
  }, 0);

  const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex];
  const chosenOptionId = selectedAnswers[currentQuestion?.id];
  const isAnswered = Boolean(chosenOptionId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Welcome Banner matching exact system prompt */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-amber-500/20">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs px-3 py-1 rounded-full font-bold">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Mode APPRENDRE de WoèséAI</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Bienvenue dans l'espace APPRENDRE de WoèséAI !
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Je vais t'aider à reconnaître les arnaques Mobile Money et à protéger ton argent au Togo. Choisis un sujet ci-dessous pour démarrer une leçon interactive ou tester tes réflexes avec notre quiz.
          </p>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {TOPICS.map((topic) => {
          const isSelected = selectedTopicId === topic.id;
          return (
            <button
              key={topic.id}
              onClick={() => handleSelectTopic(topic)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md ring-2 ring-amber-400'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-sm'
              }`}
            >
              <div className="space-y-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-slate-950 text-amber-400' : 'bg-slate-100'
                  }`}
                >
                  {topic.icon}
                </div>
                <h3 className="font-bold text-sm leading-snug">{topic.title}</h3>
                <p
                  className={`text-xs ${
                    isSelected ? 'text-slate-900 font-medium' : 'text-slate-500'
                  }`}
                >
                  {topic.subtitle}
                </p>
              </div>

              <div
                className={`mt-4 pt-2 border-t flex items-center justify-between text-xs font-bold ${
                  isSelected ? 'border-amber-600/40 text-slate-950' : 'border-slate-100 text-amber-600'
                }`}
              >
                <span>{topic.isQuiz ? 'Lancer le quiz' : 'Lire la leçon'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Lesson View Area */}
      {selectedTopicId && !quizStarted && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                {selectedTopicId}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {TOPICS.find((t) => t.id === selectedTopicId)?.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {TOPICS.find((t) => t.id === selectedTopicId)?.subtitle}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedTopicId(null)}
              className="text-xs text-slate-400 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              Fermer la leçon
            </button>
          </div>

          {loading && (
            <div className="p-12 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-600">
                Génération de la leçon adaptée au contexte togolais...
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 text-sm">
              {error}
            </div>
          )}

          {lessonContent && !loading && (
            <div className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed space-y-4">
              <div className="whitespace-pre-wrap font-sans bg-slate-50 p-6 rounded-2xl border border-slate-200">
                {lessonContent}
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-900 text-xs sm:text-sm font-medium">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Envie de tester si vous avez bien retenu les réflexes essentiels ?</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedTopicId(8);
                    setQuizStarted(true);
                    resetQuiz();
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shrink-0 cursor-pointer"
                >
                  Passer au Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interactive Quiz Area */}
      {quizStarted && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6">
          {!quizFinished ? (
            <div className="space-y-6">
              {/* Quiz progress */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs uppercase font-extrabold tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                    Question {currentQuestionIndex + 1} sur {QUIZ_QUESTIONS.length}
                  </span>
                  <span className="text-xs text-slate-400 ml-3">
                    Catégorie : {currentQuestion.category}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">
                    Score actuel : {score}
                  </span>
                  <button
                    onClick={() => {
                      setQuizStarted(false);
                      setSelectedTopicId(null);
                    }}
                    className="text-xs text-slate-400 hover:text-slate-700 ml-2 cursor-pointer"
                  >
                    Quitter
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full transition-all duration-300"
                  style={{
                    width: `${((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100}%`,
                  }}
                />
              </div>

              {/* Question Context & Title */}
              <div className="space-y-2">
                <span className="text-xs text-slate-500 font-medium italic">
                  Scénario : {currentQuestion.context}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {currentQuestion.question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((opt) => {
                  const isSelected = chosenOptionId === opt.id;
                  let optStyle = 'border-slate-200 hover:border-amber-400 bg-slate-50 text-slate-800';

                  if (isAnswered) {
                    if (opt.isCorrect) {
                      optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                    } else if (isSelected && !opt.isCorrect) {
                      optStyle = 'border-red-500 bg-red-50 text-red-950';
                    } else {
                      optStyle = 'border-slate-200 bg-slate-100/50 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleOptionSelect(currentQuestion.id, opt.id)}
                      disabled={isAnswered}
                      className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition flex items-start gap-3.5 cursor-pointer ${optStyle}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isAnswered && opt.isCorrect
                            ? 'bg-emerald-600 text-white'
                            : isAnswered && isSelected && !opt.isCorrect
                            ? 'bg-red-600 text-white'
                            : 'bg-white border border-slate-300 text-slate-700'
                        }`}
                      >
                        {opt.id.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <span>{opt.text}</span>
                        {isAnswered && (isSelected || opt.isCorrect) && (
                          <p
                            className={`mt-2 text-xs pt-2 border-t ${
                              opt.isCorrect
                                ? 'border-emerald-200 text-emerald-800'
                                : 'border-red-200 text-red-800'
                            }`}
                          >
                            {opt.explanation}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Practical Tip & Next Button */}
              {isAnswered && (
                <div className="space-y-4 pt-2">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-900 block">Astuce pratique :</strong>
                      {currentQuestion.practicalTip}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <span>
                        {currentQuestionIndex < QUIZ_QUESTIONS.length - 1
                          ? 'Question suivante'
                          : 'Voir mon score final'}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Quiz Completed View */
            <div className="text-center py-6 space-y-6">
              <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                <Award className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">Quiz Terminé !</h3>
                <p className="text-sm text-slate-500">
                  Voici votre niveau de vigilance face aux arnaques Mobile Money au Togo
                </p>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl max-w-sm mx-auto space-y-2">
                <div className="text-4xl font-black text-slate-900 font-mono">
                  {score} / {QUIZ_QUESTIONS.length}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-600">
                  {score === QUIZ_QUESTIONS.length
                    ? '🏆 Maître Bouclier Togo — Vigilance Absolue !'
                    : score >= 4
                    ? '🛡️ Vigilant — Bons réflexes acquis !'
                    : '⚠️ Prudence requise — Révisez les règles d’or !'}
                </div>
                <p className="text-xs text-slate-600 pt-2 border-t border-slate-200">
                  {score === QUIZ_QUESTIONS.length
                    ? "Félicitations ! Les escrocs T-Money et Moov Money n'ont aucune chance contre vous."
                    : "Gardez toujours le réflexe de vérifier votre solde avec *145# ou *155# avant d'agir."}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={resetQuiz}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Recommencer le quiz</span>
                </button>
                <button
                  onClick={() => {
                    setQuizStarted(false);
                    setSelectedTopicId(1);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition cursor-pointer"
                >
                  Lire les leçons
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
