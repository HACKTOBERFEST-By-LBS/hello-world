/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { ChatInterface } from './components/ChatInterface';
import { ConversationDrawer } from './components/ConversationDrawer';
import { ComparatorModal } from './components/ComparatorModal';
import { ReportsModal } from './components/ReportsModal';
import { SettingsModal } from './components/SettingsModal';
import { EmergencyModal } from './components/EmergencyModal';
import { AppLanguage, AppMode, Conversation, EducationalSession, MODES } from './types';

export const LEARNING_WELCOME_MESSAGE = `Bonjour et bienvenue dans ton espace d'apprentissage !

Je suis ton assistant pédagogique. Je suis là pour t'aider à comprendre tes cours, organiser tes révisions et progresser à ton rythme.

Tu peux commencer en m'envoyant un cours au format PDF, une image ou du texte.

Voici ce que je peux faire avec toi :

📚 /plan — Organiser tes révisions sur plusieurs jours.

🧠 /quiz — Tester tes connaissances et corriger tes erreurs.

📝 /resume — Résumer tes cours et créer des fiches de révision.

🎯 /domain — Explorer les sujets de ton cours.

❌ /stop — Quitter le mode Apprentissage et revenir au mode Scanner.

Alors, quel cours souhaites-tu étudier aujourd'hui ?`;

export const SCANNER_RETURN_MESSAGE = `Tu es de retour dans WoèséAI Scanner !

Je suis prêt à t'aider à analyser les SMS et captures d'écran suspects liés au Mobile Money.

Tu peux coller un message ou importer une capture d'écran pour commencer une analyse.

Comment puis-je t'aider ?`;

export const SCANNER_ALREADY_ACTIVE_MESSAGE = `Tu es déjà dans le mode Scanner de WoèséAI.

Tu peux coller un SMS suspect ou importer une capture d'écran pour démarrer une analyse Mobile Money.`;

export const LEARNING_COMMAND_IN_SCANNER_MESSAGE = `Cette commande est réservée au mode Apprentissage.

Tape **/apprendre** pour accéder à ton espace pédagogique, analyser tes cours et lancer des quiz ou révisions.`;

function createDefaultConversation(
  mode: AppMode = MODES.SCANNER,
  language: AppLanguage = 'fr',
  withWelcomeMessage = false
): Conversation {
  const isLearning = mode === MODES.LEARNING || mode === 'educational';
  const initialMessages = withWelcomeMessage && isLearning
    ? [
        {
          id: `msg_welcome_${Date.now()}`,
          role: 'assistant' as const,
          content: LEARNING_WELCOME_MESSAGE,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: MODES.LEARNING,
        },
      ]
    : [];

  return {
    id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: isLearning ? "Session d'apprentissage" : 'Nouvelle analyse Scanner',
    mode: isLearning ? MODES.LEARNING : MODES.SCANNER,
    language,
    messages: initialMessages,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    educationalSession: { active: isLearning },
  };
}

export default function App() {
  // Theme: Light vs Dark
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('woeseai_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  // Speech reading speed
  const [speechSpeed, setSpeechSpeed] = useState<number>(() => {
    const saved = localStorage.getItem('woeseai_speech_speed');
    return saved ? parseFloat(saved) : 1.0;
  });

  // Global default language fallback
  const [globalLanguage, setGlobalLanguage] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem('woeseai_lang');
    return (saved as AppLanguage) || 'fr';
  });

  // Active Mode (Scanner vs Learning) - Defaults strictly to SCANNER
  const [activeMode, setActiveMode] = useState<AppMode>(() => {
    const saved = localStorage.getItem('woeseai_mode');
    if (saved === MODES.LEARNING || saved === 'educational') {
      return MODES.LEARNING;
    }
    return MODES.SCANNER;
  });

  // Conversations storage
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const savedConvs = localStorage.getItem('woeseai_conversations');
      if (savedConvs) {
        const parsed = JSON.parse(savedConvs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize modes
          return parsed.map((c) => ({
            ...c,
            mode: (c.mode === 'educational' || c.mode === 'learning') ? MODES.LEARNING : MODES.SCANNER,
          }));
        }
      }
    } catch (e) {
      console.warn('Error loading conversations from localStorage:', e);
    }

    return [
      createDefaultConversation(MODES.SCANNER, 'fr'),
      createDefaultConversation(MODES.LEARNING, 'fr', true),
    ];
  });

  // Active conversation IDs per mode for strict isolation
  const [activeScannerConvId, setActiveScannerConvId] = useState<string>(() => {
    return localStorage.getItem('woeseai_scanner_conv_id') || '';
  });

  const [activeLearningConvId, setActiveLearningConvId] = useState<string>(() => {
    return localStorage.getItem('woeseai_learning_conv_id') || '';
  });

  // Ensure both modes have valid active conversation IDs
  useEffect(() => {
    const scannerConvs = conversations.filter((c) => c.mode === MODES.SCANNER);
    const learningConvs = conversations.filter((c) => c.mode === MODES.LEARNING);

    if (scannerConvs.length === 0) {
      const freshScanner = createDefaultConversation(MODES.SCANNER, globalLanguage);
      setConversations((prev) => [freshScanner, ...prev]);
      setActiveScannerConvId(freshScanner.id);
    } else if (!scannerConvs.some((c) => c.id === activeScannerConvId)) {
      setActiveScannerConvId(scannerConvs[0].id);
    }

    if (learningConvs.length === 0) {
      const freshLearning = createDefaultConversation(MODES.LEARNING, globalLanguage, true);
      setConversations((prev) => [...prev, freshLearning]);
      setActiveLearningConvId(freshLearning.id);
    } else if (!learningConvs.some((c) => c.id === activeLearningConvId)) {
      setActiveLearningConvId(learningConvs[0].id);
    }
  }, [conversations, activeScannerConvId, activeLearningConvId, globalLanguage]);

  // Persist conversations
  useEffect(() => {
    try {
      localStorage.setItem('woeseai_conversations', JSON.stringify(conversations));
    } catch (e) {
      console.warn('Error persisting conversations:', e);
    }
  }, [conversations]);

  // Persist mode and IDs
  useEffect(() => {
    localStorage.setItem('woeseai_mode', activeMode);
  }, [activeMode]);

  useEffect(() => {
    if (activeScannerConvId) {
      localStorage.setItem('woeseai_scanner_conv_id', activeScannerConvId);
    }
  }, [activeScannerConvId]);

  useEffect(() => {
    if (activeLearningConvId) {
      localStorage.setItem('woeseai_learning_conv_id', activeLearningConvId);
    }
  }, [activeLearningConvId]);

  // Sync theme
  useEffect(() => {
    localStorage.setItem('woeseai_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Sync speech speed
  useEffect(() => {
    localStorage.setItem('woeseai_speech_speed', speechSpeed.toString());
  }, [speechSpeed]);

  // Sync global language
  useEffect(() => {
    localStorage.setItem('woeseai_lang', globalLanguage);
  }, [globalLanguage]);

  // Determine current active conversation strictly based on activeMode
  const currentConversation: Conversation = useMemo(() => {
    const isLearning = activeMode === MODES.LEARNING;
    const targetId = isLearning ? activeLearningConvId : activeScannerConvId;
    const found = conversations.find(
      (c) => c.id === targetId && (isLearning ? c.mode === MODES.LEARNING : c.mode === MODES.SCANNER)
    );

    if (found) return found;

    // Fallback to first matching mode conversation
    const matching = conversations.find(
      (c) => (isLearning ? c.mode === MODES.LEARNING : c.mode === MODES.SCANNER)
    );
    if (matching) return matching;

    return createDefaultConversation(activeMode, globalLanguage, isLearning);
  }, [conversations, activeMode, activeScannerConvId, activeLearningConvId, globalLanguage]);

  // Modals state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isComparatorOpen, setIsComparatorOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [lastLatencyMs, setLastLatencyMs] = useState<number | null>(null);

  // Update current conversation partially
  const handleUpdateCurrentConversation = useCallback(
    (updated: Partial<Conversation>) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === currentConversation.id) {
            return {
              ...c,
              ...updated,
              updatedAt: Date.now(),
            };
          }
          return c;
        })
      );
    },
    [currentConversation.id]
  );

  /**
   * Strict Mode Switching
   * Completely switches mode, resets cross-mode contexts, and displays required welcome messages
   */
  const handleSwitchMode = useCallback(
    (targetMode: AppMode, options?: { reason?: string }) => {
      const normalizedTarget = (targetMode === 'educational' || targetMode === 'learning') ? MODES.LEARNING : MODES.SCANNER;

      if (normalizedTarget === MODES.LEARNING) {
        // Entering Learning Mode
        setActiveMode(MODES.LEARNING);
        localStorage.setItem('woeseai_mode', MODES.LEARNING);

        // Find existing learning conversation or create a fresh one
        const existingLearning = conversations.find((c) => c.mode === MODES.LEARNING);
        if (existingLearning) {
          // If the conversation is empty, ensure welcome message is present
          if (existingLearning.messages.length === 0) {
            const welcomeMsg = {
              id: `msg_welcome_${Date.now()}`,
              role: 'assistant' as const,
              content: LEARNING_WELCOME_MESSAGE,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              mode: MODES.LEARNING,
            };
            setConversations((prev) =>
              prev.map((c) => (c.id === existingLearning.id ? { ...c, messages: [welcomeMsg] } : c))
            );
          }
          setActiveLearningConvId(existingLearning.id);
        } else {
          const fresh = createDefaultConversation(MODES.LEARNING, globalLanguage, true);
          setConversations((prev) => [...prev, fresh]);
          setActiveLearningConvId(fresh.id);
        }
      } else {
        // Returning to Scanner Mode (e.g. via /stop)
        setActiveMode(MODES.SCANNER);
        localStorage.setItem('woeseai_mode', MODES.SCANNER);

        // Find existing scanner conversation or create a fresh one
        const existingScanner = conversations.find((c) => c.mode === MODES.SCANNER);
        const returnMsg = {
          id: `msg_return_${Date.now()}`,
          role: 'assistant' as const,
          content: SCANNER_RETURN_MESSAGE,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: MODES.SCANNER,
        };

        if (existingScanner) {
          // Append return message so the user gets the required confirmation
          setConversations((prev) =>
            prev.map((c) =>
              c.id === existingScanner.id
                ? { ...c, messages: [...c.messages, returnMsg], updatedAt: Date.now() }
                : c
            )
          );
          setActiveScannerConvId(existingScanner.id);
        } else {
          const fresh = createDefaultConversation(MODES.SCANNER, globalLanguage);
          fresh.messages = [returnMsg];
          setConversations((prev) => [fresh, ...prev]);
          setActiveScannerConvId(fresh.id);
        }
      }
    },
    [conversations, globalLanguage]
  );

  // New conversation handler (strictly respects target mode)
  const handleNewConversation = useCallback(
    (targetMode?: AppMode) => {
      const modeToUse = targetMode || activeMode;
      const normalized = (modeToUse === 'educational' || modeToUse === 'learning') ? MODES.LEARNING : MODES.SCANNER;
      const isLearning = normalized === MODES.LEARNING;
      const fresh = createDefaultConversation(normalized, currentConversation.language || globalLanguage, isLearning);

      setConversations((prev) => [fresh, ...prev]);
      setActiveMode(normalized);
      if (isLearning) {
        setActiveLearningConvId(fresh.id);
      } else {
        setActiveScannerConvId(fresh.id);
      }
    },
    [activeMode, currentConversation.language, globalLanguage]
  );

  // Delete conversation
  const handleDeleteConversation = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setConversations((prev) => {
        const remaining = prev.filter((c) => c.id !== id);
        if (remaining.length === 0) {
          const fresh = createDefaultConversation(activeMode, globalLanguage, activeMode === MODES.LEARNING);
          if (activeMode === MODES.LEARNING) {
            setActiveLearningConvId(fresh.id);
          } else {
            setActiveScannerConvId(fresh.id);
          }
          return [fresh];
        }
        return remaining;
      });
    },
    [activeMode, globalLanguage]
  );

  // Clear current history
  const handleClearCurrentChat = useCallback(() => {
    const isLearning = activeMode === MODES.LEARNING;
    const initialMessages = isLearning
      ? [
          {
            id: `msg_welcome_${Date.now()}`,
            role: 'assistant' as const,
            content: LEARNING_WELCOME_MESSAGE,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            mode: MODES.LEARNING,
          },
        ]
      : [];

    handleUpdateCurrentConversation({
      messages: initialMessages,
      educationalSession: { active: isLearning },
      title: isLearning ? "Session d'apprentissage" : 'Nouvelle analyse Scanner',
    });
  }, [activeMode, handleUpdateCurrentConversation]);

  // Clear all conversations
  const handleClearAllHistory = useCallback(() => {
    const freshScanner = createDefaultConversation(MODES.SCANNER, globalLanguage);
    const freshLearning = createDefaultConversation(MODES.LEARNING, globalLanguage, true);
    setConversations([freshScanner, freshLearning]);
    setActiveScannerConvId(freshScanner.id);
    setActiveLearningConvId(freshLearning.id);
    setActiveMode(MODES.SCANNER);
    localStorage.removeItem('woeseai_conversations');
    localStorage.setItem('woeseai_mode', MODES.SCANNER);
  }, [globalLanguage]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        mode={activeMode}
        onSwitchMode={handleSwitchMode}
        language={currentConversation.language}
        onSelectLanguage={(lang) => {
          setGlobalLanguage(lang);
          handleUpdateCurrentConversation({ language: lang });
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onNewChat={() => handleNewConversation(activeMode)}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        lastLatencyMs={lastLatencyMs}
      />

      {/* Main Direct Chatbot Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <ChatInterface
          key={currentConversation.id}
          conversation={currentConversation}
          onUpdateConversation={handleUpdateCurrentConversation}
          mode={activeMode}
          onSwitchMode={handleSwitchMode}
          language={currentConversation.language}
          onSelectLanguage={(lang) => {
            setGlobalLanguage(lang);
            handleUpdateCurrentConversation({ language: lang });
          }}
          speechSpeed={speechSpeed}
          onLatencyUpdate={(ms) => setLastLatencyMs(ms)}
          onOpenEmergency={() => setIsEmergencyOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          educationalSession={currentConversation.educationalSession || { active: activeMode === MODES.LEARNING }}
          onUpdateEducationalSession={(session) => {
            handleUpdateCurrentConversation({
              educationalSession: {
                ...(currentConversation.educationalSession || { active: true }),
                ...session,
              },
            });
          }}
        />
      </main>

      {/* Conversation Drawer / History */}
      <ConversationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        conversations={conversations}
        currentConversationId={currentConversation.id}
        activeMode={activeMode}
        onSelectConversation={(id) => {
          const target = conversations.find((c) => c.id === id);
          if (target) {
            setActiveMode(target.mode);
            if (target.mode === MODES.LEARNING) {
              setActiveLearningConvId(target.id);
            } else {
              setActiveScannerConvId(target.id);
            }
          }
        }}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onOpenComparator={() => setIsComparatorOpen(true)}
        onOpenReports={() => setIsReportsOpen(true)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Official SMS Comparator Modal */}
      <ComparatorModal
        isOpen={isComparatorOpen}
        onClose={() => setIsComparatorOpen(false)}
      />

      {/* Community Reports Modal */}
      <ReportsModal
        isOpen={isReportsOpen}
        onClose={() => setIsReportsOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={currentConversation.language}
        onSelectLanguage={(lang) => {
          setGlobalLanguage(lang);
          handleUpdateCurrentConversation({ language: lang });
        }}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
        speechSpeed={speechSpeed}
        onSetSpeechSpeed={setSpeechSpeed}
        onClearHistory={handleClearAllHistory}
      />

      {/* Emergency & USSD Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />
    </div>
  );
}
