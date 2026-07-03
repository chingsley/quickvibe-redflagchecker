// ─── Shared domain types (client + legacy references) ───

export type FollowUpQuestionType = 'choice' | 'open';

export interface FollowUpQuestion {
  question: string;
  type: FollowUpQuestionType;
  choices?: string[];
}

export interface AnalysisResult {
  score: number;
  category: string;
  label: string;
  advice: string;
  reasons: string[];
  followUpQuestions?: FollowUpQuestion[];
}
