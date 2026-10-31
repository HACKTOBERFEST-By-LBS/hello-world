import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Image as ImageIcon,
  Mic,
  MicOff,
  Paperclip,
  X,
  FileText,
  Sparkles,
  Shield,
  GraduationCap,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Hash,
  Phone,
  Zap,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import {
  ChatMessage,
  AppLanguage,
  AppMode,
  EducationalSession
} from '../types';
import { TRANSLATIONS } from '../data/translations';
import { SAMPLE_SMS_LIST } from '../data/samples';
import { ChatMessageItem } from './ChatMessageItem';

interface ChatInterfaceProps {
  mode: AppMode;
  onToggleMode: () => void;
  language: AppLanguage;
  onSelectLanguage: (lang: AppLanguage) => void;
  speechSpeed: number;
  onLatencyUpdate: (ms: number) => void;
  onOpenEmergency: () => void;
  onOpenSettings: () => void;
  educationalSession: EducationalSession;
  onUpdateEducationalSession: (session: Partial<EducationalSession>) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  mode,
  onToggleMode,
  language,
  onSelectLanguage,
  speechSpeed,
  onLatencyUpdate,
  onOpenEmergency,
  onOpenSettings,
  educationalSession,
  onUpdateEducationalSession,
}) => {
  const t = TRANSLATIONS[language];

  // Messages state persisted in localStorage
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('woeseai_chat_messages_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/png');
  const [uploadedCourseDoc, setUploadedCourseDoc] = useState<{ name: string; text: string } | null>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // Speech synthesis state
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isSpeechPaused, setIsSpeechPaused] = useState(false);

  // File input refs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Save messages to localStorage
  useEffect(() => {
    localStorage.setItem('woeseai_chat_messages_v2', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Adjust textarea height automatically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  // Initialize Web Speech API for voice recording
  const startVoiceRecording = () => {
    setMicError(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicError("La reconnaissance vocale n'est pas prise en charge par ce navigateur.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;

      // Map language to speech recognition locale
      const localeMap: Record<AppLanguage, string> = {
        fr: 'fr-FR',
        en: 'en-US',
        ee: 'fr-FR', // Fallback locale for local dialects
        kbp: 'fr-FR',
      };
      recognition.lang = localeMap[language] || 'fr-FR';

      recognition.onstart = () => {
        setIsRecording(true);
        setRecordingSeconds(0);
        timerRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setMicError(t.chat.micError);
        }
        stopVoiceRecording();
      };

      recognition.onend = () => {
        stopVoiceRecording();
      };

      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setMicError(t.chat.micError);
      stopVoiceRecording();
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  };

  // Image Upload Handler
  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image valide (PNG, JPG, JPEG).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert("L'image dépasse la limite de 8 Mo.");
      return;
    }

    setImageMime(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Document Upload Handler (for Educational Course)
  const handleDocUpload = (file: File) => {
    const isText = file.name.endsWith('.txt') || file.name.endsWith('.md') || file.type.includes('text');

    if (isText) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const textContent = (e.target?.result as string) || '';
        setUploadedCourseDoc({ name: file.name, text: textContent });
        onUpdateEducationalSession({
          active: true,
          courseTitle: file.name,
          courseText: textContent,
        });
      };
      reader.readAsText(file);
    } else {
      // PDF or binary note: store placeholder and title
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedCourseDoc({ name: file.name, text: `[Document téléversé: ${file.name}]` });
        onUpdateEducationalSession({
          active: true,
          courseTitle: file.name,
          courseText: `Fichier de cours : ${file.name}`,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Native Speech Synthesis Controls
  const handlePlaySpeech = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) {
      alert("La synthèse vocale n'est pas supportée par votre navigateur.");
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown indicators for cleaner audio listening
    const cleanText = text
      .replace(/\[ROUGE\]|\[ORANGE\]|\[VERT\]|\[BLEU\]|\[GRIS\]/g, '')
      .replace(/[*#_`-]/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = speechSpeed || 1.0;

    const voiceLangMap: Record<AppLanguage, string> = {
      fr: 'fr-FR',
      en: 'en-US',
      ee: 'fr-FR',
      kbp: 'fr-FR',
    };
    utterance.lang = voiceLangMap[language] || 'fr-FR';

    utterance.onend = () => {
      setSpeakingMessageId(null);
      setIsSpeechPaused(false);
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
      setIsSpeechPaused(false);
    };

    setSpeakingMessageId(msgId);
    setIsSpeechPaused(false);
    window.speechSynthesis.speak(utterance);
  };

  const handlePauseSpeech = () => {
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsSpeechPaused(true);
    }
  };

  const handleResumeSpeech = () => {
    if ('speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsSpeechPaused(false);
    }
  };

  const handleStopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      setIsSpeechPaused(false);
    }
  };

  // Send message
  const handleSend = async (customPrompt?: string) => {
    const messageText = (customPrompt !== undefined ? customPrompt : input).trim();
    const hasImage = Boolean(selectedImage);
    const hasDoc = Boolean(uploadedCourseDoc);

    if (!messageText && !hasImage && !hasDoc) return;

    // Intercept mode commands
    if (messageText.toLowerCase() === '/stop') {
      if (mode === 'educational') {
        onToggleMode();
      }
    } else if (messageText.toLowerCase() === '/apprendre') {
      if (mode === 'scanner') {
        onToggleMode();
      }
    }

    const userMessageId = `u-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: messageText || (hasImage ? "Capture d'écran importée pour analyse." : "Document importé."),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl: selectedImage || undefined,
      imageMime: selectedImage ? imageMime : undefined,
      courseDocName: uploadedCourseDoc?.name,
      mode,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    const currentImg = selectedImage;
    const currentMime = imageMime;
    setSelectedImage(null);
    setUploadedCourseDoc(null);
    setLoading(true);

    const botMessageId = `b-${Date.now()}`;
    const initialBotMessage: ChatMessage = {
      id: botMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
      mode,
    };

    setMessages([...newMessages, initialBotMessage]);

    const startTime = Date.now();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
            imageUrl: m.imageUrl,
            imageMime: m.imageMime,
          })),
          language,
          mode,
          educationalSession,
          imageBase64: currentImg || undefined,
          imageMime: currentImg ? currentMime : undefined,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur de communication avec le serveur.');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let firstChunkTime = 0;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (dataStr === '[DONE]') continue;

              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.text) {
                  accumulated += parsed.text;
                  if (!firstChunkTime) {
                    firstChunkTime = Date.now() - startTime;
                    onLatencyUpdate(firstChunkTime);
                  }

                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === botMessageId
                        ? { ...msg, content: accumulated, isStreaming: true }
                        : msg
                    )
                  );
                }
              } catch (e) {}
            }
          }
        }
      }

      const totalTime = Date.now() - startTime;
      onLatencyUpdate(firstChunkTime || totalTime);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? {
                ...msg,
                content: accumulated || "Désolé, je n'ai pas pu formuler de réponse.",
                isStreaming: false,
                latencyMs: firstChunkTime || totalTime,
              }
            : msg
        )
      );
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? {
                ...msg,
                content: `Une erreur est survenue lors de la communication. Veuillez vérifier votre connexion ou réessayer.`,
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto w-full relative">
      {/* Educational Active Course Badge Banner */}
      {mode === 'educational' && educationalSession?.courseTitle && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 p-2.5 px-4 text-xs flex items-center justify-between text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-2 truncate">
            <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold truncate">
              {t.chat.courseLoaded} : « {educationalSession.courseTitle} »
            </span>
          </div>
          <button
            onClick={() => {
              onUpdateEducationalSession({ courseTitle: undefined, courseText: undefined });
            }}
            className="text-[11px] underline text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 shrink-0 ml-2 cursor-pointer"
          >
            Changer de cours
          </button>
        </div>
      )}

      {/* Main Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          /* Empty Chat Welcome Hero (ChatGPT style) */
          <div className="py-6 sm:py-12 space-y-8 max-w-2xl mx-auto">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500 via-amber-500 to-red-500 p-1 mx-auto shadow-md">
                <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-amber-400">
                  {mode === 'scanner' ? (
                    <Shield className="w-8 h-8 text-amber-400" />
                  ) : (
                    <GraduationCap className="w-8 h-8 text-emerald-400" />
                  )}
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {t.chat.welcomeTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                {t.chat.welcomeSubtitle}
              </p>
            </div>

            {/* Language Selection Prompt on Start */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs space-y-2.5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block text-center">
                {t.chat.chooseLanguagePrompt}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'fr', label: 'Français' },
                  { id: 'en', label: 'English' },
                  { id: 'ee', label: 'Eʋegbe' },
                  { id: 'kbp', label: 'Kabɩyɛ' },
                ].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => onSelectLanguage(l.id as AppLanguage)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      language === l.id
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-400'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Suggestions Cards */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {t.chat.quickStartersTitle}
              </span>

              {mode === 'scanner' ? (
                /* Scanner mode sample buttons */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <button
                    onClick={() =>
                      handleSend(
                        'TMONEY: Vous avez recu 35 000 FCFA de KODJO A. Nouveau solde: 58 200 FCFA. Ref: TXN99482. (Envoyé par le +228 92 14 33 08)'
                      )
                    }
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 text-left transition shadow-xs cursor-pointer group"
                  >
                    <div className="font-bold text-red-600 dark:text-red-400 flex items-center justify-between">
                      <span>🚨 Faux dépôt d’erreur (35 000 FCFA)</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      L'expéditeur appelle en pleurant pour demander un remboursement immédiat.
                    </p>
                  </button>

                  <button
                    onClick={() =>
                      handleSend(
                        'FELICITATION ! Votre numero a ete tire au sort par la Direction TOGOCOM. Vous gagnez 500.000 FCFA. Pour retirer votre lot, contactez d urgence Mr AGBEKO au 91223344 et envoyez 15.000 FCFA de frais.'
                      )
                    }
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 text-left transition shadow-xs cursor-pointer group"
                  >
                    <div className="font-bold text-purple-600 dark:text-purple-400 flex items-center justify-between">
                      <span>🚨 Fausse tombola Togocom 500k</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Promesse d'un gain important demandant des frais préalables.
                    </p>
                  </button>

                  <button
                    onClick={() =>
                      handleSend(
                        'ALERTE MOOV AFRICA : Votre compte Moov Money va être bloqué sous 24h. Transmettez votre code secret PIN à l agent ou composez *155*4*97654321*50000#.'
                      )
                    }
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 text-left transition shadow-xs cursor-pointer group"
                  >
                    <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center justify-between">
                      <span>🚨 Vol de code PIN Moov Money</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Menace de blocage et tentative de manipulation USSD.
                    </p>
                  </button>

                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 text-left transition shadow-xs cursor-pointer group"
                  >
                    <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                      <span>📸 Importer une capture d'écran</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Déposez une capture d’écran de SMS ou de conversation WhatsApp.
                    </p>
                  </button>
                </div>
              ) : (
                /* Educational mode command shortcuts */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <button
                    onClick={() => handleSend('/apprendre')}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-left transition shadow-xs cursor-pointer group"
                  >
                    <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                      <span>📚 /apprendre</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Analyser mon cours et identifier les chapitres clés.
                    </p>
                  </button>

                  <button
                    onClick={() => handleSend('/plan')}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-left transition shadow-xs cursor-pointer group"
                  >
                    <div className="font-bold text-blue-600 dark:text-blue-400 flex items-center justify-between">
                      <span>📅 /plan</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Construire un calendrier de révision jusqu'à la date d'examen.
                    </p>
                  </button>

                  <button
                    onClick={() => handleSend('/quiz')}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-left transition shadow-xs cursor-pointer group"
                  >
                    <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center justify-between">
                      <span>🎯 /quiz</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Poser une question interactive à la fois et tester mes acquis.
                    </p>
                  </button>

                  <button
                    onClick={() => handleSend('/domain')}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-left transition shadow-xs cursor-pointer group"
                  >
                    <div className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-between">
                      <span>💼 /domain</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Découvrir les spécialisations, compétences et débouchés.
                    </p>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Render Messages */
          messages.map((msg) => (
            <ChatMessageItem
              key={msg.id}
              message={msg}
              language={language}
              speechSpeed={speechSpeed}
              isSpeaking={speakingMessageId === msg.id}
              isPaused={isSpeechPaused}
              onPlaySpeech={(text) => handlePlaySpeech(text, msg.id)}
              onPauseSpeech={handlePauseSpeech}
              onResumeSpeech={handleResumeSpeech}
              onStopSpeech={handleStopSpeech}
            />
          ))
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Recording Banner Indicator */}
      {isRecording && (
        <div className="bg-red-500 text-white p-2.5 px-4 rounded-2xl mx-4 mb-2 flex items-center justify-between animate-pulse shadow-md text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
            <span>
              {t.chat.recording} ({recordingSeconds}s)
            </span>
          </div>
          <button
            onClick={stopVoiceRecording}
            className="bg-white text-red-600 px-3 py-1 rounded-lg text-xs font-black shadow-xs hover:bg-slate-100 cursor-pointer"
          >
            Terminer
          </button>
        </div>
      )}

      {/* Mic Error */}
      {micError && (
        <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs p-2.5 px-4 rounded-xl mx-4 mb-2 flex items-center justify-between">
          <span>{micError}</span>
          <button onClick={() => setMicError(null)} className="p-1 text-slate-500">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Selected Image Chip */}
      {selectedImage && (
        <div className="px-4 pb-2">
          <div className="relative inline-flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-amber-50 dark:bg-slate-800 border border-amber-300 dark:border-slate-700">
            <img src={selectedImage} alt="Capture" className="w-10 h-10 object-cover rounded-lg" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Capture d’écran prête
            </span>
            <button
              onClick={() => setSelectedImage(null)}
              className="p-1 text-slate-400 hover:text-red-500 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Selected Course Document Chip */}
      {uploadedCourseDoc && (
        <div className="px-4 pb-2">
          <div className="relative inline-flex items-center gap-2 p-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
              {uploadedCourseDoc.name}
            </span>
            <button
              onClick={() => setUploadedCourseDoc(null)}
              className="p-1 text-slate-400 hover:text-red-500 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Docked Bottom Input Bar (ChatGPT style) */}
      <div className="p-3 sm:p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto flex items-end gap-2 bg-slate-100 dark:bg-slate-800/90 rounded-3xl p-1.5 sm:p-2 border border-slate-200 dark:border-slate-700 shadow-sm focus-within:ring-2 focus-within:ring-amber-500 dark:focus-within:ring-amber-400 focus-within:border-transparent transition">
          {/* Hidden Image Input */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleImageUpload(e.target.files[0]);
              }
            }}
          />

          {/* Hidden Document Input */}
          <input
            ref={docInputRef}
            type="file"
            accept=".txt,.md,.pdf,text/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleDocUpload(e.target.files[0]);
              }
            }}
          />

          {/* Image Import Button */}
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="p-2 sm:p-2.5 rounded-2xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 transition cursor-pointer shrink-0"
            title={t.chat.attachImage}
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* Course Document Import Button (Educational Mode) */}
          {mode === 'educational' && (
            <button
              type="button"
              onClick={() => docInputRef.current?.click()}
              className="p-2 sm:p-2.5 rounded-2xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 transition cursor-pointer shrink-0"
              title={t.chat.attachCourse}
            >
              <Paperclip className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </button>
          )}

          {/* Text Input Area */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              mode === 'scanner' ? t.chat.placeholderScanner : t.chat.placeholderEducational
            }
            className="flex-1 bg-transparent text-slate-900 dark:text-white text-xs sm:text-sm py-2 px-1 focus:outline-none resize-none leading-relaxed placeholder:text-slate-400"
          />

          {/* Microphone Voice Recording Button */}
          <button
            type="button"
            onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
            className={`p-2 sm:p-2.5 rounded-2xl transition cursor-pointer shrink-0 ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700'
            }`}
            title={isRecording ? 'Arrêter l’enregistrement' : t.chat.voiceRecord}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={loading || (!input.trim() && !selectedImage && !uploadedCourseDoc)}
            className="p-2 sm:p-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition shadow-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0"
            title={t.chat.send}
          >
            {loading ? (
              <span className="w-5 h-5 block border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Footer info note */}
        <div className="max-w-3xl mx-auto mt-1.5 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-2">
          <span>WoèséAI • Protection Mobile Money & Accompagnement Éducatif</span>
          <button
            onClick={onOpenEmergency}
            className="hover:underline text-red-500 dark:text-red-400 font-bold"
          >
            888 (Togocom) • 100 (Moov) • 117 (Police)
          </button>
        </div>
      </div>
    </div>
  );
};
