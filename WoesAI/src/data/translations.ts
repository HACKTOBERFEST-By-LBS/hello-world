export type AppLanguage = 'fr' | 'en' | 'ee' | 'kbp';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  modes: {
    scanner: string;
    scannerDesc: string;
    educational: string;
    educationalDesc: string;
    switchToEducational: string;
    switchToScanner: string;
  };
  navbar: {
    settings: string;
    emergency: string;
    selectLanguage: string;
  };
  chat: {
    placeholderScanner: string;
    placeholderEducational: string;
    send: string;
    attachImage: string;
    attachCourse: string;
    voiceRecord: string;
    recording: string;
    transcribing: string;
    micError: string;
    generating: string;
    listen: string;
    pause: string;
    resume: string;
    stop: string;
    clearChat: string;
    welcomeTitle: string;
    welcomeSubtitle: string;
    chooseLanguagePrompt: string;
    quickStartersTitle: string;
    educationalSessionActive: string;
    courseLoaded: string;
  };
  commands: {
    helpTitle: string;
    apprendre: string;
    plan: string;
    quiz: string;
    resume: string;
    stop: string;
    domain: string;
  };
  settings: {
    title: string;
    language: string;
    theme: string;
    themeLight: string;
    themeDark: string;
    speechSpeed: string;
    clearHistory: string;
    clearHistoryConfirm: string;
    emergencyContacts: string;
    ussdCodes: string;
    about: string;
    aboutText: string;
    close: string;
  };
  verdictLabels: {
    authentic: string;
    suspect: string;
    fraudulent: string;
    unverifiable: string;
    whySuspect: string;
    whatToDo: string;
    safeRule: string;
  };
}

export const TRANSLATIONS: Record<AppLanguage, TranslationDictionary> = {
  fr: {
    appName: "WoèséAI",
    tagline: "Assistant Intelligent de Sécurité Mobile Money & Éducation au Togo",
    modes: {
      scanner: "Scanner d'arnaques",
      scannerDesc: "Détection des faux SMS T-Money & Moov Money",
      educational: "Mode Éducatif",
      educationalDesc: "Accompagnement d'études & révisions",
      switchToEducational: "Passer en Mode Éducatif",
      switchToScanner: "Passer au Scanner d'arnaques",
    },
    navbar: {
      settings: "Paramètres",
      emergency: "Urgences & USSD",
      selectLanguage: "Langue",
    },
    chat: {
      placeholderScanner: "Collez un SMS, posez une question ou importez une capture...",
      placeholderEducational: "Posez une question, importez votre cours ou tapez /apprendre, /plan, /quiz...",
      send: "Envoyer",
      attachImage: "Importer une capture d'écran (PNG, JPG)",
      attachCourse: "Importer un document de cours",
      voiceRecord: "Enregistrer un message vocal",
      recording: "Enregistrement en cours... Parlez clairement",
      transcribing: "Transcription du message vocal...",
      micError: "Microphone inaccessible. Veuillez autoriser le micro dans le navigateur.",
      generating: "WoèséAI analyse et prépare sa réponse...",
      listen: "Écouter la réponse",
      pause: "Mettre en pause",
      resume: "Reprendre la lecture",
      stop: "Arrêter la lecture",
      clearChat: "Nouvelle conversation",
      welcomeTitle: "Bienvenue sur WoèséAI",
      welcomeSubtitle: "Votre assistant togolais pour sécuriser vos transactions Mobile Money et vous accompagner dans vos études.",
      chooseLanguagePrompt: "Choisissez votre langue d'échange :",
      quickStartersTitle: "Suggestions rapides :",
      educationalSessionActive: "Session d'apprentissage active",
      courseLoaded: "Cours chargé en mémoire",
    },
    commands: {
      helpTitle: "Commandes éducatives disponibles :",
      apprendre: "/apprendre — Démarrer une session et analyser votre cours",
      plan: "/plan — Établir un planning de révision personnalisé jusqu'à l'examen",
      quiz: "/quiz — Tester vos connaissances avec des questions interactives",
      resume: "/resume — Générer des fiches de synthèse et résumés par chapitre",
      stop: "/stop — Quitter le mode éducatif et revenir au scanner",
      domain: "/domain — Découvrir les spécialisations et débouchés de votre filière",
    },
    settings: {
      title: "Paramètres de WoèséAI",
      language: "Langue de conversation & d'interface",
      theme: "Thème d'affichage",
      themeLight: "Clair",
      themeDark: "Sombre",
      speechSpeed: "Vitesse de lecture vocale",
      clearHistory: "Effacer l'historique des discussions",
      clearHistoryConfirm: "Voulez-vous vraiment effacer tous les messages ?",
      emergencyContacts: "Numéros d'assistance officiels Togo",
      ussdCodes: "Codes USSD indispensables",
      about: "À propos de WoèséAI",
      aboutText: "WoèséAI est un assistant conçu pour protéger les citoyens togolais contre les fraudes Mobile Money (T-Money et Moov Money) et pour accompagner les étudiants dans leurs révisions académiques.",
      close: "Fermer",
    },
    verdictLabels: {
      authentic: "AUTHENTIQUE (Format officiel)",
      suspect: "SUSPECT (Vérification requise)",
      fraudulent: "FRAUDULEUX (Arnaque confirmée)",
      unverifiable: "NON VÉRIFIABLE (Informations insuffisantes)",
      whySuspect: "Pourquoi ce message est suspect :",
      whatToDo: "Ce que tu dois faire :",
      safeRule: "Règle d'or : Ne renvoyez JAMAIS d'argent sans vérifier votre solde réel via *145# ou *155#.",
    },
  },

  en: {
    appName: "WoèséAI",
    tagline: "Intelligent Assistant for Mobile Money Security & Education in Togo",
    modes: {
      scanner: "Scam Scanner",
      scannerDesc: "Detection of fake T-Money & Moov Money SMS",
      educational: "Educational Mode",
      educationalDesc: "Study coaching & exam preparation",
      switchToEducational: "Switch to Educational Mode",
      switchToScanner: "Switch to Scam Scanner",
    },
    navbar: {
      settings: "Settings",
      emergency: "Emergency & USSD",
      selectLanguage: "Language",
    },
    chat: {
      placeholderScanner: "Paste an SMS, ask a question, or upload a screenshot...",
      placeholderEducational: "Ask a question, upload your course, or type /apprendre, /plan, /quiz...",
      send: "Send",
      attachImage: "Upload screenshot (PNG, JPG)",
      attachCourse: "Upload course document",
      voiceRecord: "Record voice message",
      recording: "Recording in progress... Speak clearly",
      transcribing: "Transcribing your voice message...",
      micError: "Microphone inaccessible. Please allow microphone access in your browser.",
      generating: "WoèséAI is analyzing and preparing a response...",
      listen: "Listen to response",
      pause: "Pause",
      resume: "Resume playback",
      stop: "Stop playback",
      clearChat: "New conversation",
      welcomeTitle: "Welcome to WoèséAI",
      welcomeSubtitle: "Your Togolese AI assistant to protect your Mobile Money and empower your academic journey.",
      chooseLanguagePrompt: "Select your preferred language:",
      quickStartersTitle: "Quick suggestions:",
      educationalSessionActive: "Educational session active",
      courseLoaded: "Course loaded in memory",
    },
    commands: {
      helpTitle: "Available Educational Commands:",
      apprendre: "/apprendre — Start session & analyze your course document",
      plan: "/plan — Build a realistic multi-day revision schedule",
      quiz: "/quiz — Test your knowledge with step-by-step interactive questions",
      resume: "/resume — Generate chapter summaries, flashcards, and key definitions",
      stop: "/stop — Exit educational mode and return to scam scanner",
      domain: "/domain — Explore career branches, tools, skills, and certifications",
    },
    settings: {
      title: "WoèséAI Settings",
      language: "Interface & Conversation Language",
      theme: "Display Theme",
      themeLight: "Light",
      themeDark: "Dark",
      speechSpeed: "Voice reading speed",
      clearHistory: "Clear conversation history",
      clearHistoryConfirm: "Are you sure you want to clear all messages?",
      emergencyContacts: "Official Togo emergency helplines",
      ussdCodes: "Essential USSD codes",
      about: "About WoèséAI",
      aboutText: "WoèséAI is designed to safeguard Togolese citizens against Mobile Money fraud (T-Money & Moov Money) while supporting students with smart study tools.",
      close: "Close",
    },
    verdictLabels: {
      authentic: "AUTHENTIC (Official format)",
      suspect: "SUSPICIOUS (Verification required)",
      fraudulent: "FRAUDULENT (Confirmed scam)",
      unverifiable: "UNVERIFIABLE (Insufficient data)",
      whySuspect: "Why this message is suspicious:",
      whatToDo: "What you must do:",
      safeRule: "Golden Rule: NEVER send money back without checking your actual balance via *145# or *155#.",
    },
  },

  ee: {
    appName: "WoèséAI",
    tagline: "Mobile Money Ga Dzesidela kple Nusɔsrɔ̃ Kpekpeɖeŋunala le Togo",
    modes: {
      scanner: "Ga kuku dzesidela",
      scannerDesc: "T-Money kple Moov Money be alakpa SMS kuku dzesidela",
      educational: "Nusɔsrɔ̃ Mɔnu",
      educationalDesc: "Sukuviwo ƒe kpekpeɖeŋu kple doɖoɖi dodokpɔ ŋuti",
      switchToEducational: "Trɔ yi Nusɔsrɔ̃ Mɔnu me",
      switchToScanner: "Trɔ yi Ga Kuku Dzesidela me",
    },
    navbar: {
      settings: "Ɖoɖowo",
      emergency: "Kpekpeɖeŋu & USSD",
      selectLanguage: "Gbe",
    },
    chat: {
      placeholderScanner: "Ɖo SMS aɖe ɖa, bia biabia aɖe alo de foto aɖe afii...",
      placeholderEducational: "Bia biabia aɖe, de wò agbalẽ alo ŋlɔ /apprendre, /plan, /quiz...",
      send: "Ɖoe ɖa",
      attachImage: "Tsɔ foto aɖe de eme (PNG, JPG)",
      attachCourse: "Tsɔ suku gbalẽ de eme",
      voiceRecord: "Ƒo nu kple gbe",
      recording: "Wole wò gbe xɔm... Ƒo nu nyuie",
      transcribing: "Wole gbea trɔm va ŋɔŋlɔ me...",
      micError: "Míete ŋu xɔ gbe o. Na mɔɖeɖe le wò mɔ̃ me.",
      generating: "WoèséAI le ŋuɖoɖoa dzram ɖo...",
      listen: "Se ŋuɖoɖoa le gbe me",
      pause: "Dzudzɔ vie",
      resume: "Yi edzi",
      stop: "Tɔ te",
      clearChat: "Dze dzeɖoɖo yeye gɔme",
      welcomeTitle: "Woezɔ va WoèséAI gbɔ",
      welcomeSubtitle: "Wò Togo kpekpeɖeŋunala hena Mobile Money ga takpɔkpɔ kple sukudede.",
      chooseLanguagePrompt: "Tia gbe si nèdi be nàzã :",
      quickStartersTitle: "Kpekpeɖeŋu kabawo :",
      educationalSessionActive: "Nusɔsrɔ̃ mɔnu le dɔ wɔm",
      courseLoaded: "Suku agbalẽ le susu me",
    },
    commands: {
      helpTitle: "Nusɔsrɔ̃ ƒe sededewo :",
      apprendre: "/apprendre — Dze nusɔsrɔ̃ gɔme kple wò agbalẽ",
      plan: "/plan — Wɔ ɖoɖo hena dodokpɔ",
      quiz: "/quiz — Bia biabiawo nàkpɔ wò nunya ɖa",
      resume: "/resume — Kpɔ kpuie kple nyagbɔgblɔ veviwo",
      stop: "/stop — Trɔ yi ga dzesidela me",
      domain: "/domain — Dɔwɔwɔ ƒe mɔnukpɔkpɔwo",
    },
    settings: {
      title: "WoèséAI Ɖoɖowo",
      language: "Dzeɖoɖo kple mɔ̃ ƒe gbe",
      theme: "Dzidzela kple yibɔɔ",
      themeLight: "Kekeli",
      themeDark: "Viviti",
      speechSpeed: "Gbe ƒe kabakaba",
      clearHistory: "Tutu dzeɖoɖowo katã ɖa",
      clearHistoryConfirm: "Èdi be yeatutu dzeɖoɖowo katã ɖaa?",
      emergencyContacts: "Togo kpekpeɖeŋu xexlẽdzesiwo",
      ussdCodes: "USSD koodu veviwo",
      about: "WoèséAI Ŋuti Nya",
      aboutText: "WoèséAI nye dɔwɔnu aɖe si woɖo be wòakpɔ Togo dukɔmeviwo ta tso T-Money kple Moov Money alakpanyawo gbɔ eye wòakpe ɖe sukuviwo ŋu.",
      close: "Tuie",
    },
    verdictLabels: {
      authentic: "NYATEƑE (Mɔnu si le se nu)",
      suspect: "KEAƊI (Ele be nàkpɔ egbɔ nyuie)",
      fraudulent: "ALAKPANYA / FIFI (Ga kuku ƒe mɔ)",
      unverifiable: "MÍETE ŊU KPƆ NYA LA GBƆ O",
      whySuspect: "Nukata gbedeasi sia le vɔvɔ̃m :",
      whatToDo: "Nu si wòle be nàwɔ :",
      safeRule: "Se vevitɔ : Mégatsɔ ga ɖo ɖa gbeɖe ne mèkpɔ wò ga le *145# alo *155# gbɔ̃ o !",
    },
  },

  kbp: {
    appName: "WoèséAI",
    tagline: "Mobile Money Lɩzɩyʊ nɛ Sukuli Sɩnɖʊ Togo Taa",
    modes: {
      scanner: "Lɩzɩyʊ (Scanner)",
      scannerDesc: "T-Money nɛ Moov Money cɛtɩm tɔm lɩzɩyʊ",
      educational: "Sukuli kpɛlɛkʊʊ mɔnu",
      educationalDesc: "Sukubiya sɩnɖʊ nɛ takayasɩ kpɛlɛkʊʊ",
      switchToEducational: "Wolo Sukuli mɔnu taa",
      switchToScanner: "Wolo Lɩzɩyʊ taa",
    },
    navbar: {
      settings: "Pɔzɩtʊ nɛ ɖoɖo",
      emergency: "Kɩcɛyɩm & USSD",
      selectLanguage: "Kʊnʊŋ",
    },
    chat: {
      placeholderScanner: "Maa SMS, pɔzɩ tɔm yaa kpaɣ foto...",
      placeholderEducational: "Pɔzɩ tɔm, sʊzɩ ña takayaɣ yaa maa /apprendre, /plan, /quiz...",
      send: "Tiyi",
      attachImage: "Kpaɣ foto (PNG, JPG)",
      attachCourse: "Sʊzɩ ña takayaɣ",
      voiceRecord: "Yɔɔdɩ nɔɔ taa",
      recording: "Pɛwɛ wò nɔɔ mʊʊ yɔɔ... Yɔɔdɩ camɩyɛ",
      transcribing: "Pɛwɛ nɔɔ tɔm lɛɛzʊʊ takayaɣ taa...",
      micError: "Nɔɔ mʊyʊ taa lakɩ. Ha mɔɖeɖe ña mɔ̃ taa.",
      generating: "WoèséAI wɛ kɔsɩtʊ tɔm ñɔɔzʊʊ...",
      listen: "Nii tɔm nɔɔ taa",
      pause: "Sɩŋ vie",
      resume: "Tasɩ nɩʊ",
      stop: "Hɛzɩ",
      clearChat: "Laba tɔm kɩfatʊ",
      welcomeTitle: "Ña-tɛ sʊʊ WoèséAI taa",
      welcomeSubtitle: "Ña Togo sɩnɖʊ Mobile Money liidiye kandɩyʊʊ nɛ sukuli kpɛlɛkʊʊ taa.",
      chooseLanguagePrompt: "Lɩzɩ ña kʊnʊŋ ŋgʊ ŋsɔɔlaa yɔ :",
      quickStartersTitle: "Lɔŋ tasʊʊ kaba :",
      educationalSessionActive: "Sukuli kpɛlɛkʊʊ wɛ lakɩ",
      courseLoaded: "Takayaɣ wɛ lɔŋ taa",
    },
    commands: {
      helpTitle: "Sukuli paɣtʊ wena awɛ yɔ :",
      apprendre: "/apprendre — Paazɩ kpɛlɛkʊʊ nɛ ña takayaɣ",
      plan: "/plan — Ñɔɔzɩ alɩwaatʊ ɖoɖo hena takayaɣ mayʊ",
      quiz: "/quiz — Pɔzɩ tɔm nɛ ŋna ña lɔŋsɩnɖɛ",
      resume: "/resume — Lɩzɩ tɔm kpuie nɛ tɔm pee vevi",
      stop: "/stop — Tɛzɩ sukuli mɔnu nɛ ŋpɩsɩ lɩzɩyʊ taa",
      domain: "/domain — Tʊma wena awɛ ña sukuli hɔɔlʊʊ taa yɔ",
    },
    settings: {
      title: "WoèséAI Ɖoɖo",
      language: "Kʊnʊŋ ŋgʊ ŋlakɩna tʊmɩyɛ yɔ",
      theme: "Ñalɩmɩyɛ nɛ cɩkpɛndʊʊ",
      themeLight: "Ñalɩm",
      themeDark: "Cɩkpɛndʊʊ",
      speechSpeed: "Nɔɔ yɔɔdʊʊ lɔŋ",
      clearHistory: "Hiisi tɔm kpeekpe",
      clearHistoryConfirm: "Ŋsɔɔlaa se ŋhiisi tɔm kpeekpe na?",
      emergencyContacts: "Togo sɩnɖaa nɔmba waa",
      ussdCodes: "USSD koodi vevi waa",
      about: "WoèséAI Tɔm",
      aboutText: "WoèséAI kɛ sɩnɖʊ weyi ɛkandɩyʊʊ Togo ɛyaa yɔɔ T-Money nɛ Moov Money cɛtɩm tɔm taa nɛ ɛsɩŋna sukubiya.",
      close: "Tɔŋ",
    },
    verdictLabels: {
      authentic: "TƆM MAAYƖ (Siɣsiɣ)",
      suspect: "PƲTƲƲTƲ (Pɔzʊʊ se ŋna camɩyɛ)",
      fraudulent: "CƐTƖM / FƲTƲ (Liidiye kuku)",
      unverifiable: "TƆM TAA TALƖ SE PANA",
      whySuspect: "Mbʊ pʊyɔɔ tɔm tʊnɛ tɩfɛyɩ kɛlɛʊ :",
      whatToDo: "Mbʊ pʊwɛɛ se ŋla yɔ :",
      safeRule: "Paɣtʊ vevi : Ta tiyi liidiye nɔyʊ kpa ne ŋtana ña liidiye *145# yaa *155# taa !",
    },
  },
};
