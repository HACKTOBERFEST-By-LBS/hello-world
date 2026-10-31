export type OperatorType = 'T-Money' | 'Moov Money' | 'Inconnu';

export type VerdictType = 'AUTHENTIQUE' | 'SUSPECT' | 'FRAUDULEUX' | 'NON_VERIFIABLE';

export type ReferenceStatusType = 'CONFORME' | 'PARTIELLEMENT_CONFORME' | 'NON_CONFORME' | 'AUCUNE_REFERENCE';

export type AppLanguage = 'fr' | 'en' | 'ee' | 'kbp';

export type AppMode = 'scanner' | 'learning' | 'educational';

export const MODES = {
  SCANNER: 'scanner',
  LEARNING: 'learning',
} as const;

export interface TransactionInfo {
  type: 'depot' | 'retrait' | 'transfert' | 'paiement' | 'inconnu';
  amount: string | null;
  currency: 'FCFA' | 'inconnu';
  sender: string | null;
  recipient: string | null;
  date: string | null;
  time: string | null;
  reference: string | null;
}

export interface FraudIndicator {
  indicator: string;
  evidence: string;
  explanation: string;
}

export interface ReferenceComparison {
  status: ReferenceStatusType;
  details: string;
}

export interface AnalysisResult {
  type: 'analysis';
  operator: OperatorType;
  transaction: TransactionInfo;
  verdict: VerdictType;
  reference_comparison: ReferenceComparison;
  fraud_indicators: FraudIndicator[];
  psychological_manipulation: string[];
  missing_information: string[];
  explanation: string;
  recommendations: string[];
  report_suggested: boolean;
  confidence: 'FAIBLE' | 'MOYENNE' | 'ÉLEVÉE';
  disclaimer: string;
}

export interface AnalysisResponse {
  success: boolean;
  data: AnalysisResult;
  latencyMs: number;
  modelUsed: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  imageUrl?: string;
  imageMime?: string;
  courseDocName?: string;
  isStreaming?: boolean;
  latencyMs?: number;
  mode?: AppMode;
  analysis?: AnalysisResult;
}

export interface EducationalSession {
  active: boolean;
  courseTitle?: string;
  courseText?: string;
  detectedChapters?: string[];
  examDate?: string;
  studyField?: string;
  quizScore?: { correct: number; total: number };
}

export interface Conversation {
  id: string;
  title: string;
  mode: AppMode;
  language: AppLanguage;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  educationalSession?: EducationalSession;
}

export interface CommunityReport {
  id: string;
  operator: OperatorType;
  senderNumber: string;
  scamType: string;
  messageText: string;
  date: string;
  location: string;
  upvotes: number;
}
