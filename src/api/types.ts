export interface AuthUser {
  id: string;
  email: string;
}

export type RelationshipType = 'romantic' | 'business' | 'not_sure' | 'other';

export interface Friend {
  id: string;
  displayName: string;
  relationshipType: RelationshipType;
  relationshipOther: string | null;
  latestScore: number | null;
  createdAt: string;
  updatedAt: string;
}

export type MessageRole = 'user' | 'assistant';
export type MessageKind =
  | 'text'
  | 'clarifying_question'
  | 'verdict_loading'
  | 'verdict'
  | 'suggestions'
  | 'error';

export interface ChatMessage {
  id: string;
  friendId: string;
  analysisId: string | null;
  role: MessageRole;
  kind: MessageKind;
  content: string;
  metadata: Record<string, unknown> | null;
  sequence: number;
  createdAt: string;
}

export interface FollowUpQuestion {
  question: string;
  type: 'choice' | 'open';
  choices?: string[];
  intent?: 'experience_request' | 'follow_up';
}

export interface PendingClarification {
  analysisId: string;
  question: FollowUpQuestion;
  questionIndex: number;
  totalQuestions: number;
}

export interface ChatSession {
  messages: ChatMessage[];
  pendingClarification: PendingClarification | null;
  isAnalyzing: boolean;
}

export interface AbandonAnalysisResult {
  abandonedAnalysisId: string | null;
  pendingClarification: null;
  isAnalyzing: false;
}

export interface DeleteExperienceResult {
  deletedAnalysisId: string | null;
  deletedMessageIds: string[];
  pendingClarification: null;
  isAnalyzing: false;
}

export interface EditExperienceResult {
  updatedUserMessage: ChatMessage;
  removedMessageIds: string[];
  messages: ChatMessage[];
  pendingClarification: PendingClarification | null;
  isAnalyzing: boolean;
}
