// Type definitions
export type User = {
  id: string;
  name: string;
  role: 'teacher' | 'student';
  socketId: string;
  sessionId: string;
  createdAt: Date;
  lastActive: Date;
};

export type PollOption = {
  id: string;
  text: string;
};

export type Poll = {
  id: string;
  question: string;
  options: PollOption[];
  createdBy: string;
  timeLimit: number;
  status: 'draft' | 'active' | 'completed';
  createdAt: Date;
  activatedAt?: Date;
  completedAt?: Date;
};

export type Response = {
  id: string;
  pollId: string;
  studentId: string;
  optionId: string;
  submittedAt: Date;
};

export const users: User[] = [];
export const polls: Poll[] = [];
export const responses: Response[] = [];
