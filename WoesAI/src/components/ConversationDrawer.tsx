import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  X,
  Search,
  Shield,
  GraduationCap,
  Scale,
  PhoneCall,
  Settings,
  ArrowRight
} from 'lucide-react';
import { Conversation, AppMode, MODES } from '../types';

interface ConversationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  currentConversationId: string;
  activeMode: AppMode;
  onSelectConversation: (id: string) => void;
  onNewConversation: (mode?: AppMode) => void;
  onDeleteConversation: (id: string, e: React.MouseEvent) => void;
  onOpenComparator: () => void;
  onOpenReports: () => void;
  onOpenEmergency: () => void;
  onOpenSettings: () => void;
}

export const ConversationDrawer: React.FC<ConversationDrawerProps> = ({
  isOpen,
  onClose,
  conversations,
  currentConversationId,
  activeMode,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onOpenComparator,
  onOpenReports,
  onOpenEmergency,
  onOpenSettings,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const isLearning = activeMode === MODES.LEARNING || activeMode === 'educational';

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const scannerConversations = filteredConversations.filter(
    (c) => c.mode === MODES.SCANNER || !c.mode
  );
  const learningConversations = filteredConversations.filter(
    (c) => c.mode === MODES.LEARNING || c.mode === 'educational'
  );

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-out Sidebar Panel */}
      <div className="relative w-80 max-w-[85vw] h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-10 transition-transform duration-200">
        {/* Top Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-950 p-0.5 border border-slate-700 flex items-center justify-center text-amber-400 font-bold text-xs">
              W
            </div>
            <div>
              <span className="font-bold text-sm text-slate-950 dark:text-white block leading-tight">
                Historique WoèséAI
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {isLearning ? 'Mode Apprentissage actif' : 'Mode Scanner actif'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Actions by Mode */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-2">
          <button
            onClick={() => {
              onNewConversation(MODES.SCANNER);
              onClose();
            }}
            type="button"
            className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
              !isLearning
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Nouvelle analyse Scanner</span>
          </button>

          <button
            onClick={() => {
              onNewConversation(MODES.LEARNING);
              onClose();
            }}
            type="button"
            className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
              isLearning
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Nouvelle session Apprentissage</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher une discussion..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 text-xs py-2 pl-9 pr-3 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Conversation List Grouped by Mode */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
          {/* Active Mode Section First */}
          {isLearning ? (
            <div>
              <div className="px-2 py-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Sessions d'Apprentissage ({learningConversations.length})</span>
              </div>
              <div className="mt-1 space-y-1">
                {renderConversationItems(learningConversations)}
              </div>

              {scannerConversations.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="px-2 py-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-500" />
                    <span>Analyses Scanner ({scannerConversations.length})</span>
                  </div>
                  <div className="mt-1 space-y-1">
                    {renderConversationItems(scannerConversations)}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="px-2 py-1 text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>Analyses Scanner ({scannerConversations.length})</span>
              </div>
              <div className="mt-1 space-y-1">
                {renderConversationItems(scannerConversations)}
              </div>

              {learningConversations.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="px-2 py-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Sessions d'Apprentissage ({learningConversations.length})</span>
                  </div>
                  <div className="mt-1 space-y-1">
                    {renderConversationItems(learningConversations)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Shortcut Tools */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-1 text-xs">
          <button
            onClick={() => {
              onOpenComparator();
              onClose();
            }}
            type="button"
            className="w-full p-2 rounded-xl text-left font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
          >
            <Scale className="w-4 h-4 text-slate-400" />
            <span>Comparateur officiel T-Money & Moov</span>
          </button>

          <button
            onClick={() => {
              onOpenSettings();
              onClose();
            }}
            type="button"
            className="w-full p-2 rounded-xl text-left font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Paramètres de l'application</span>
          </button>
        </div>
      </div>
    </div>
  );

  function renderConversationItems(list: Conversation[]) {
    if (list.length === 0) {
      return (
        <p className="px-3 py-2 text-xs text-slate-400 dark:text-slate-500 italic">
          Aucune discussion enregistrée
        </p>
      );
    }

    return list.map((c) => {
      const isSelected = c.id === currentConversationId;
      const isConvLearning = c.mode === MODES.LEARNING || c.mode === 'educational';

      return (
        <div
          key={c.id}
          onClick={() => {
            onSelectConversation(c.id);
            onClose();
          }}
          className={`group flex items-center justify-between p-2.5 rounded-xl text-xs transition cursor-pointer ${
            isSelected
              ? isConvLearning
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-100 font-bold border border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-950 dark:text-amber-100 font-bold border border-amber-200 dark:border-amber-800'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {isConvLearning ? (
              <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            )}
            <span className="truncate">{c.title || 'Discussion'}</span>
          </div>

          <button
            onClick={(e) => onDeleteConversation(c.id, e)}
            type="button"
            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition"
            title="Supprimer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    });
  }
};
