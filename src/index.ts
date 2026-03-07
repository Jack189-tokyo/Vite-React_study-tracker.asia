export interface LearningRecord {
  id?: number;
  date: string; // ISO string like '2023-10-27'
  math: number;
  reading: number;
  spelling: number;
  user_id: string;
}

export interface WrongAnswer {
  id?: number;
  created_at?: string;
  date: string; // ISO string like '2023-10-27'
  subject: 'math' | 'reading' | 'spelling';
  description: string;
  user_id: string;
}