export type ActivityCategory = {
  id: string;
  name: string;
  dailyGoal: number;
  count: number;
  notes: string;
  source: string;
  createdAt: string;
};

export type LeadStatus =
  | "New Lead"
  | "Conversation Started"
  | "Interested"
  | "Proposal Sent"
  | "Negotiation"
  | "Won"
  | "Lost";

export type Lead = {
  id: string;
  businessName: string;
  contactName: string;
  platform: string;
  website: string;
  email: string;
  phone: string;
  notes: string;
  dateAdded: string;
  status: LeadStatus;
};

export type TimelineEvent = {
  id: string;
  title: string;
  details: string;
  source: string;
  createdAt: string;
  kind: "activity" | "lead" | "streak" | "achievement";
};

export type FocusSessionStatus = "completed" | "interrupted";

export type FocusSessionType = "Focus" | "Break";

export type FocusSession = {
  id: string;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  sessionType: FocusSessionType;
  note: string;
  status: FocusSessionStatus;
};

export type FocusState = {
  dailyGoalMinutes: number;
  currentNote: string;
  sessions: FocusSession[];
};

export type StreakState = {
  currentStreak: number;
  bestStreak: number;
  daysMissed: number;
  lastCompletedDate: string | null;
  lastMissedDate: string | null;
};

export type ClientOSData = {
  activities: ActivityCategory[];
  leads: Lead[];
  timeline: TimelineEvent[];
  streak: StreakState;
  focus: FocusState;
};
