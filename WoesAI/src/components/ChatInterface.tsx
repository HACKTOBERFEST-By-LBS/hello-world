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
  ArrowRight,
  Square
} from 'lucide-react';
import {
  ChatMessage,
  AppLanguage,
  AppMode,
  EducationalSession,
  Conversation,
  MODES
} from '../types';
import {
  LEARNING_WELCOME_MESSAGE,
  SCANNER_RETURN_MESSAGE,
  SCANNER_ALREADY_ACTIVE_MESSAGE,
  LEARNING_COMMAND_IN_SCANNER_MESSAGE
} from '../App';
import { TRANSLATIONS } from '../data/translations';
import { ChatMessageItem } from './ChatMessageItem';

interface ChatInterfaceProps {
  conversation: Conversation;
  onUpdateConversation: (updated: Partial<Conversation>) => void;
  mode: AppMode;
  onSwitchMode: (mode: AppMode) => void;
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
  conversation,
  onUpdateConversation,
  mode,
  onSwitchMode,
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
  const messages = conversation.messages || [];

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/png');
  const [uploadedCourseDoc, setUploadedCourseDoc] = useState<{ name: string; text: string } | null>(null);
  const [uploadedPdfBase64, setUploadedPdfBase64] = useState<string | null>(null);

  // AbortController for Stop Generation
  const abortControllerRef = useRef<AbortController | null>(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Adjust textarea height automatically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  // Web Speech API for voice recording
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

      const localeMap: Record<AppLanguage, string> = {
        fr: 'fr-FR',
        en: 'en-US',
        ee: 'fr-FR',
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

  // Stop Generation handler
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
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

  // Document Upload Handler (TXT, MD, and Native PDF)
  const handleDocUpload = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert('Le document dépasse la taille maximale autorisée (10 Mo).');
      return;
    }

    const isPdf = file.name.endsWith('.pdf') || file.type === 'application/pdf';
    const isText = file.name.endsWith('.txt') || file.name.endsWith('.md') || file.type.includes('text');

    if (isPdf) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result as string;
        setUploadedPdfBase64(base64Data);
        setUploadedCourseDoc({ name: file.name, text: `[Document PDF: ${file.name}]` });
        onUpdateEducationalSession({
          active: true,
          courseTitle: file.name,
          courseText: `[Document PDF de cours attaché: ${file.name}]`,
        });
      };
      reader.readAsDataURL(file);
    } else if (isText) {
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
      alert('Format de document non supporté. Veuillez importer un fichier PDF, TXT ou Markdown.');
    }
  };

  // Native Speech Synthesis Controls
  const handlePlaySpeech = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) {
      alert("La synthèse vocale n'est pas supportée par votre navigateur.");
      return;
    }

    window.speechSynthesis.cancel();

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
    const hasPdf = Boolean(uploadedPdfBase64);

    if (!messageText && !hasImage && !hasDoc && !hasPdf) return;

    const isLearningMode = mode === 'educational' || mode === 'learning';
    const lowerText = messageText.toLowerCase();

    // 1. Intercept /stop command
    if (lowerText === '/stop') {
      if (isLearningMode) {
        // Immediate termination of learning mode
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
        }
        setLoading(false);
        setInput('');
        setSelectedImage(null);
        setUploadedCourseDoc(null);
        setUploadedPdfBase64(null);
        onSwitchMode(MODES.SCANNER);
        return;
      } else {
        // Already in Scanner mode
        setInput('');
        const userMsg: ChatMessage = {
          id: `u-${Date.now()}`,
          role: 'user',
          content: '/stop',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: MODES.SCANNER,
        };
        const botMsg: ChatMessage = {
          id: `b-${Date.now()}`,
          role: 'assistant',
          content: SCANNER_ALREADY_ACTIVE_MESSAGE,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: MODES.SCANNER,
        };
        onUpdateConversation({
          messages: [...messages, userMsg, botMsg],
          updatedAt: Date.now(),
        });
        return;
      }
    }

    // 2. Intercept /apprendre command
    if (lowerText === '/apprendre') {
      if (!isLearningMode) {
        // Switch immediately to Learning mode
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
        }
        setLoading(false);
        setInput('');
        setSelectedImage(null);
        setUploadedCourseDoc(null);
        setUploadedPdfBase64(null);
        onSwitchMode(MODES.LEARNING);
        return;
      } else {
        // Already in Learning mode
        setInput('');
        const userMsg: ChatMessage = {
          id: `u-${Date.now()}`,
          role: 'user',
          content: '/apprendre',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: MODES.LEARNING,
        };
        const botMsg: ChatMessage = {
          id: `b-${Date.now()}`,
          role: 'assistant',
          content: "Tu es déjà dans ton espace d'apprentissage !\n\nVoici ce que tu peux faire :\n- 📚 **/plan** — Organiser tes révisions\n- 🧠 **/quiz** — Tester tes connaissances\n- 📝 **/resume** — Résumer tes cours\n- 🎯 **/domain** — Découvrir des filières\n- ❌ **/stop** — Revenir au mode Scanner",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: MODES.LEARNING,
        };
        onUpdateConversation({
          messages: [...messages, userMsg, botMsg],
          updatedAt: Date.now(),
        });
        return;
      }
    }

    // 3. Intercept learning commands typed while inside Scanner mode
    const isLearningCmd =
      lowerText.startsWith('/plan') ||
      lowerText.startsWith('/quiz') ||
      lowerText.startsWith('/resume') ||
      lowerText.startsWith('/résumé') ||
      lowerText.startsWith('/domain') ||
      lowerText.startsWith('/cours');

    if (!isLearningMode && isLearningCmd) {
      setInput('');
      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: messageText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: MODES.SCANNER,
      };
      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        role: 'assistant',
        content: LEARNING_COMMAND_IN_SCANNER_MESSAGE,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: MODES.SCANNER,
      };
      onUpdateConversation({
        messages: [...messages, userMsg, botMsg],
        updatedAt: Date.now(),
      });
      return;
    }

    const userMessageId = `u-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: messageText || (hasImage ? "Capture d'écran importée pour analyse." : hasPdf ? `Document PDF importé: ${uploadedCourseDoc?.name}` : "Document de cours importé."),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl: selectedImage || undefined,
      imageMime: selectedImage ? imageMime : undefined,
      courseDocName: uploadedCourseDoc?.name,
      mode,
    };

    const newMessages = [...messages, userMessage];

    // Auto-generate title if new
    let updatedTitle = conversation.title;
    if (
      !updatedTitle ||
      updatedTitle.startsWith('Nouvelle') ||
      updatedTitle.startsWith('New')
    ) {
      updatedTitle = messageText.slice(0, 36) || (hasImage ? "Analyse capture" : hasPdf ? `Cours: ${uploadedCourseDoc?.name}` : "Discussion");
    }

    onUpdateConversation({
      messages: newMessages,
      title: updatedTitle,
      updatedAt: Date.now(),
    });

    setInput('');
    const currentImg = selectedImage;
    const currentMime = imageMime;
    const currentPdf = uploadedPdfBase64;
    const currentDocName = uploadedCourseDoc?.name;

    setSelectedImage(null);
    setUploadedCourseDoc(null);
    setUploadedPdfBase64(null);
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

    const messagesWithPendingBot = [...newMessages, initialBotMessage];
    onUpdateConversation({
      messages: messagesWithPendingBot,
      updatedAt: Date.now(),
    });

    const startTime = Date.now();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
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
          pdfBase64: currentPdf || undefined,
          docName: currentDocName || undefined,
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

                  onUpdateConversation({
                    messages: messagesWithPendingBot.map((msg) =>
                      msg.id === botMessageId
                        ? { ...msg, content: accumulated, isStreaming: true }
                        : msg
                    ),
                    updatedAt: Date.now(),
                  });
                }
              } catch (e) {}
            }
          }
        }
      }

      const totalTime = Date.now() - startTime;
      onLatencyUpdate(firstChunkTime || totalTime);

      onUpdateConversation({
        messages: messagesWithPendingBot.map((msg) =>
          msg.id === botMessageId
            ? {
                ...msg,
                content: accumulated || "Désolé, je n'ai pas pu formuler de réponse.",
                isStreaming: false,
                latencyMs: firstChunkTime || totalTime,
              }
            : msg
        ),
        updatedAt: Date.now(),
      });
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User voluntarily aborted generation
        console.log('Generation stopped by user.');
      } else {
        onUpdateConversation({
          messages: messagesWithPendingBot.map((msg) =>
            msg.id === botMessageId
              ? {
                  ...msg,
                  content: `Une erreur est survenue lors de la communication. Veuillez vérifier votre connexion ou réessayer.`,
                  isStreaming: false,
                }
              : msg
          ),
          updatedAt: Date.now(),
        });
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleRetry = (msgIndex: number) => {
    if (loading) return;
    let lastUserMsg: ChatMessage | null = null;
    for (let idx = msgIndex - 1; idx >= 0; idx--) {
      if (messages[idx]?.role === 'user') {
        lastUserMsg = messages[idx];
        break;
      }
    }
    if (lastUserMsg) {
      handleSend(lastUserMsg.content);
    }
  };

  const handleSelectQuizOption = (letter: string, text: string) => {
    if (loading) return;
    handleSend(`Je choisis l'option ${letter} : ${text}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] max-w-4xl mx-auto w-full relative">
      {/* Educational Active Course Badge Banner */}
      {(mode === 'educational' || mode === 'learning') && educationalSession?.courseTitle && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 p-2.5 px-4 text-xs flex items-center justify-between text-emerald-900 dark:text-emerald-200 shrink-0">
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
                {mode === 'scanner' ? "WoèséAI Scanner" : "WoèséAI Apprentissage"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                {mode === 'scanner'
                  ? "Colle un SMS suspect ou importe une capture d'écran pour vérifier en temps réel s'il s'agit d'une arnaque T-Money ou Moov Money."
                  : "Assistant pédagogique intelligent : révise tes cours, teste tes acquis avec /quiz et planifie tes révisions avec /plan."}
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
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
                {mode === 'scanner' ? t.chat.quickStartersTitle : "Actions d'apprentissage :"}
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
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 text-left transition shadow-xs cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    <div className="font-bold text-rose-700 dark:text-rose-400 flex items-center justify-between text-[13px]">
                      <span>🚨 Faux dépôt d’erreur (35 000 FCFA)</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition text-slate-400" />
                    </div>
                    <p className="text-[12px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      L'expéditeur appelle en pleurant pour demander un remboursement immédiat.
                    </p>
                  </button>

                  <button
                    onClick={() =>
                      handleSend(
                        'FELICITATION ! Votre numero a ete tire au sort par la Direction TOGOCOM. Vous gagnez 500.000 FCFA. Pour retirer votre lot, contactez d urgence Mr AGBEKO au 91223344 et envoyez 15.000 FCFA de frais.'
                      )
                    }
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 text-left transition shadow-xs cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    <div className="font-bold text-purple-700 dark:text-purple-400 flex items-center justify-between text-[13px]">
                      <span>🚨 Fausse tombola Togocom 500k</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition text-slate-400" />
                    </div>
                    <p className="text-[12px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Promesse d'un gain important demandant des frais préalables.
                    </p>
                  </button>

                  <button
                    onClick={() =>
                      handleSend(
                        'ALERTE MOOV AFRICA : Votre compte Moov Money va être bloqué sous 24h. Transmettez votre code secret PIN à l agent ou composez *155*4*97654321*50000#.'
                      )
                    }
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 text-left transition shadow-xs cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center justify-between text-[13px]">
                      <span>🚨 Vol de code PIN Moov Money</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition text-slate-400" />
                    </div>
                    <p className="text-[12px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Menace de blocage et tentative de manipulation USSD.
                    </p>
                  </button>

                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 text-left transition shadow-xs cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-between text-[13px]">
                      <span>📸 Importer une capture d'écran</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition text-slate-400" />
                    </div>
                    <p className="text-[12px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Déposez une capture d’écran de SMS ou de conversation WhatsApp.
                    </p>
                  </button>
                </div>
              ) : (
                /* Educational mode command shortcuts */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <button
                    onClick={() => handleSend('/plan')}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-left transition shadow-xs cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    <div className="font-bold text-blue-700 dark:text-blue-400 flex items-center justify-between text-[13px]">
                      <span>📚 /plan — Organiser mes révisions</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition text-slate-400" />
                    </div>
                    <p className="text-[12px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Construire un planning d'étude structuré jusqu'à l'examen.
                    </p>
                  </button>

                  <button
                    onClick={() => handleSend('/quiz')}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-left transition shadow-xs cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center justify-between text-[13px]">
                      <span>🧠 /quiz — Tester mes connaissances</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition text-slate-400" />
                    </div>
                    <p className="text-[12px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Poser une question interactive à choix multiple pour s'entraîner.
                    </p>
                  </button>

                  <button
                    onClick={() => handleSend('/resume')}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-left transition shadow-xs cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-between text-[13px]">
                      <span>📝 /resume — Résumer mon cours</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition text-slate-400" />
                    </div>
                    <p className="text-[12px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Extraire les notions essentielles et créer des fiches claires.
                    </p>
                  </button>

                  <button
                    onClick={() => handleSend('/domain')}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-left transition shadow-xs cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    <div className="font-bold text-indigo-700 dark:text-indigo-400 flex items-center justify-between text-[13px]">
                      <span>🎯 /domain — Explorer ma filière</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition text-slate-400" />
                    </div>
                    <p className="text-[12px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Découvrir les compétences, carrières et débouchés associés.
                    </p>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Render Messages */
          messages.map((msg, index) => (
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
              onRetry={
                msg.role === 'assistant' && index === messages.length - 1
                  ? () => handleRetry(index)
                  : undefined
              }
              onSelectQuizOption={handleSelectQuizOption}
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
              onClick={() => {
                setUploadedCourseDoc(null);
                setUploadedPdfBase64(null);
              }}
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
            accept=".txt,.md,.pdf,application/pdf,text/*"
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

          {/* Course Document Import Button (Strictly in Educational/Learning Mode) */}
          {(mode === 'educational' || mode === 'learning') && (
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
              mode === 'scanner'
                ? "Colle un SMS suspect (T-Money, Moov Money...) ou décris la situation..."
                : "Pose une question sur ton cours, tape /plan, /quiz, /resume..."
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

          {/* Send / Stop Generation Button */}
          {loading ? (
            <button
              type="button"
              onClick={handleStopGeneration}
              className="p-2 sm:p-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold transition shadow-xs cursor-pointer shrink-0 animate-pulse flex items-center justify-center"
              title="Arrêter la génération"
            >
              <Square className="w-4 h-4 fill-white" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!input.trim() && !selectedImage && !uploadedCourseDoc && !uploadedPdfBase64}
              className="p-2 sm:p-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition shadow-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0"
              title={t.chat.send}
            >
              <Send className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Footer info note */}
        <div className="max-w-3xl mx-auto mt-2 flex items-center justify-between text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 px-2 flex-wrap gap-2">
          {mode === 'scanner' ? (
            <>
              <span>WoèséAI • Protection Mobile Money Togo</span>
              <button
                onClick={onOpenEmergency}
                type="button"
                className="hover:underline text-rose-700 dark:text-rose-400 font-bold cursor-pointer"
                title="Numéros d'urgence officiels"
              >
                Urgences : 888 (Togocom) • 100 (Moov) • 117 (Police)
              </button>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>WoèséAI Apprentissage • Espace d'études et de révision</span>
              </span>
              <button
                onClick={() => handleSend('/stop')}
                type="button"
                className="hover:underline text-slate-700 dark:text-slate-300 font-semibold cursor-pointer flex items-center gap-1"
                title="Quitter le mode Apprentissage"
              >
                <span>Quitter l'espace (<strong>/stop</strong>)</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
