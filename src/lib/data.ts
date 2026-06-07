import type { ClientOSData, FocusState, Lead, LeadStatus, TimelineEvent } from "../types";
import { defaultActivities, leadStatuses } from "./constants";
import { dateKey, daysBetween } from "./date";
import { percentage, uid } from "./utils";

export function seedData(): ClientOSData {
  const now = new Date().toISOString();
  return {
    activities: defaultActivities(),
    leads: [
      {
        id: uid("lead"),
        businessName: "Northline Dental",
        contactName: "Sarah Khan",
        platform: "Facebook",
        website: "",
        email: "hello@northlinedental.com",
        phone: "",
        notes: "Needs a faster booking page and local SEO cleanup.",
        dateAdded: now,
        status: "Interested",
      },
      {
        id: uid("lead"),
        businessName: "Metro Fit Studio",
        contactName: "James Carter",
        platform: "LinkedIn",
        website: "https://metrofit.example",
        email: "",
        phone: "",
        notes: "Asked for examples of fitness studio sites.",
        dateAdded: now,
        status: "Proposal Sent",
      },
      {
        id: uid("lead"),
        businessName: "Cafe Bloom",
        contactName: "Maya Roy",
        platform: "Website Outreach",
        website: "",
        email: "owner@cafebloom.example",
        phone: "",
        notes: "No website. Good candidate for starter package.",
        dateAdded: now,
        status: "New Lead",
      },
    ],
    timeline: [
      event("activity", "+1 LinkedIn Connection", "Connected with a local business owner.", "LinkedIn"),
      event("activity", "+1 Website Outreach", "Reached a website-less business.", "Website Outreach"),
      event("lead", "Lead moved to Proposal Sent", "Metro Fit Studio is ready for pricing.", "LinkedIn"),
      event("achievement", "Weekly milestone unlocked", "You crossed 70% of today's outreach target.", "System"),
    ],
    streak: {
      currentStreak: 2,
      bestStreak: 5,
      daysMissed: 1,
      lastCompletedDate: null,
      lastMissedDate: null,
    },
    focus: defaultFocusState(),
  };
}

export function defaultFocusState(): FocusState {
  return {
    dailyGoalMinutes: 120,
    currentNote: "Website-less business outreach",
    sessions: [],
  };
}

export function event(kind: TimelineEvent["kind"], title: string, details: string, source: string): TimelineEvent {
  return {
    id: uid("event"),
    title,
    details,
    source,
    kind,
    createdAt: new Date().toISOString(),
  };
}

export function dailyCompletion(data: ClientOSData) {
  const goal = data.activities.reduce((sum, item) => sum + item.dailyGoal, 0);
  const count = data.activities.reduce((sum, item) => sum + Math.min(item.count, item.dailyGoal), 0);
  return percentage(count, goal);
}

export function normalizeData(input: unknown): ClientOSData {
  const fallback = seedData();
  if (!input || typeof input !== "object") return fallback;
  const data = input as Partial<ClientOSData>;
  return {
    activities: Array.isArray(data.activities) ? data.activities : fallback.activities,
    leads: Array.isArray(data.leads) ? data.leads : fallback.leads,
    timeline: Array.isArray(data.timeline) ? data.timeline : fallback.timeline,
    streak: data.streak ?? fallback.streak,
    focus: {
      ...fallback.focus,
      ...(data.focus ?? {}),
      sessions: Array.isArray(data.focus?.sessions) ? data.focus.sessions : fallback.focus.sessions,
    },
  };
}

export function evaluateStreak(data: ClientOSData): ClientOSData {
  const today = dateKey();
  const completion = dailyCompletion(data);
  const next = structuredClone(data);
  const lastCompleted = next.streak.lastCompletedDate;

  if (lastCompleted && daysBetween(lastCompleted, today) > 1 && next.streak.lastMissedDate !== today) {
    next.streak.currentStreak = 0;
    next.streak.daysMissed += Math.max(1, daysBetween(lastCompleted, today) - 1);
    next.streak.lastMissedDate = today;
    next.timeline.unshift(event("streak", "Streak reset", "A previous daily target was missed.", "System"));
  }

  if (completion >= 100 && next.streak.lastCompletedDate !== today) {
    next.streak.currentStreak += 1;
    next.streak.bestStreak = Math.max(next.streak.bestStreak, next.streak.currentStreak);
    next.streak.lastCompletedDate = today;
    next.timeline.unshift(event("achievement", "Perfect day completed", "All daily outreach targets are done.", "System"));
  }

  return next;
}

export function emptyLead(status: LeadStatus = "New Lead"): Lead {
  return {
    id: uid("lead"),
    businessName: "",
    contactName: "",
    platform: "Website Outreach",
    website: "",
    email: "",
    phone: "",
    notes: "",
    dateAdded: new Date().toISOString(),
    status,
  };
}

export function statusIndex(status: LeadStatus) {
  return leadStatuses.indexOf(status);
}
