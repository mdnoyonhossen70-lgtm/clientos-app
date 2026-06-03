import type { ActivityCategory, LeadStatus } from "../types";
import { uid } from "./utils";

export const leadStatuses: LeadStatus[] = [
  "New Lead",
  "Conversation Started",
  "Interested",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Lost",
];

export const statusAccent: Record<LeadStatus, string> = {
  "New Lead": "border-white/10 bg-white/5 text-white/80",
  "Conversation Started": "border-sky-400/20 bg-sky-400/10 text-sky-100",
  Interested: "border-violet-400/20 bg-violet-400/10 text-violet-100",
  "Proposal Sent": "border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-100",
  Negotiation: "border-amber-400/20 bg-amber-400/10 text-amber-100",
  Won: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
  Lost: "border-rose-400/20 bg-rose-400/10 text-rose-100",
};

export const sourceColors = ["#B15CFF", "#FF2D74", "#38BDF8", "#34D399", "#FBBF24", "#F472B6", "#A3E635"];

export function defaultActivities(): ActivityCategory[] {
  const now = new Date().toISOString();
  return [
    ["Recommendation Posts", 5, 3, "Facebook"],
    ["Direct Client Posts", 4, 2, "Facebook"],
    ["Website-less Business Outreach", 20, 12, "Website Outreach"],
    ["LinkedIn Connections", 15, 11, "LinkedIn"],
    ["LinkedIn Comments", 5, 4, "LinkedIn"],
    ["Facebook Page Posts", 2, 1, "Facebook"],
    ["Follow Ups", 5, 2, "Follow Up"],
  ].map(([name, dailyGoal, count, source]) => ({
    id: uid("activity"),
    name: String(name),
    dailyGoal: Number(dailyGoal),
    count: Number(count),
    notes: "",
    source: String(source),
    createdAt: now,
  }));
}
