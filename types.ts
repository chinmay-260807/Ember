
export type MessageType = 'quote' | 'compliment' | 'goal_completion' | 'daily';

export interface GentleMessage {
  text: string;
  type: MessageType;
  author?: string;
}

export interface DailyQuote {
  date: string;
  message: GentleMessage;
}

export interface DailyGoal {
  id: string;
  text: string;
  isCompleted: boolean;
  currentSteps: number;
  totalSteps: number;
}

export interface AppState {
  currentMessage: GentleMessage | null;
  isLoading: boolean;
  error: string | null;
  dailyGoals: DailyGoal[];
}
