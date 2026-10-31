/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ChatInterface } from './components/ChatInterface';
import { SettingsModal } from './components/SettingsModal';
import { EmergencyModal } from './components/EmergencyModal';
import { AppLanguage, AppMode, EducationalSession } from './types';

export default function App() {
  // Mode: Scanner d'arnaques vs Mode Éducatif
  const [mode, setMode] = useState<AppMode>(() => {
    const saved = localStorage.getItem('woeseai_mode');
    return (saved as AppMode) || 'scanner';
  });

  // Language: French (default), English, Ewe, Kabye
  const [language, setLanguage] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem('woeseai_lang');
    return (saved as AppLanguage) || 'fr';
  });

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

  // Educational session persistent context
  const [educationalSession, setEducationalSession] = useState<EducationalSession>(() => {
    const saved = localStorage.getItem('woeseai_edu_session');
    return saved ? JSON.parse(saved) : { active: false };
  });

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [lastLatencyMs, setLastLatencyMs] = useState<number | null>(null);

  // Sync theme with DOM document
  useEffect(() => {
    localStorage.setItem('woeseai_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Sync mode with localStorage
  useEffect(() => {
    localStorage.setItem('woeseai_mode', mode);
  }, [mode]);

  // Sync language with localStorage
  useEffect(() => {
    localStorage.setItem('woeseai_lang', language);
  }, [language]);

  // Sync speech speed
  useEffect(() => {
    localStorage.setItem('woeseai_speech_speed', speechSpeed.toString());
  }, [speechSpeed]);

  // Sync educational session
  useEffect(() => {
    localStorage.setItem('woeseai_edu_session', JSON.stringify(educationalSession));
  }, [educationalSession]);

  const handleToggleMode = () => {
    setMode((prev) => (prev === 'scanner' ? 'educational' : 'scanner'));
  };

  const handleUpdateEducationalSession = (updated: Partial<EducationalSession>) => {
    setEducationalSession((prev) => ({ ...prev, ...updated }));
  };

  const handleClearHistory = () => {
    localStorage.removeItem('woeseai_chat_messages_v2');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        mode={mode}
        onToggleMode={handleToggleMode}
        language={language}
        onSelectLanguage={setLanguage}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onNewChat={handleClearHistory}
        lastLatencyMs={lastLatencyMs}
      />

      {/* Main Direct Chatbot Area (ChatGPT layout) */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <ChatInterface
          mode={mode}
          onToggleMode={handleToggleMode}
          language={language}
          onSelectLanguage={setLanguage}
          speechSpeed={speechSpeed}
          onLatencyUpdate={(ms) => setLastLatencyMs(ms)}
          onOpenEmergency={() => setIsEmergencyOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          educationalSession={educationalSession}
          onUpdateEducationalSession={handleUpdateEducationalSession}
        />
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
        onSelectLanguage={setLanguage}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
        speechSpeed={speechSpeed}
        onSetSpeechSpeed={setSpeechSpeed}
        onClearHistory={handleClearHistory}
      />

      {/* Emergency & USSD Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />
    </div>
  );
}
