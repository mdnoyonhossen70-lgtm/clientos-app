import type { ClientOSData, LeadStatus } from "../types";
import { leadStatuses, sourceColors } from "./constants";
import { dateKey, formatShortDate, isWithinDays } from "./date";
import { dailyCompletion } from "./data";

export function metrics(data: ClientOSData) {
  const totalGoal = data.activities.reduce((sum, item) => sum + item.dailyGoal, 0);
  const totalOutreach = data.activities.reduce((sum, item) => sum + item.count, 0);
  const totalLeads = data.leads.length;
  const conversations = data.leads.filter((lead) => lead.status !== "New Lead").length;
  const proposals = data.leads.filter((lead) => ["Proposal Sent", "Negotiation", "Won"].includes(lead.status)).length;
  const clientsWon = data.leads.filter((lead) => lead.status === "Won").length;
  const conversionRate = totalLeads > 0 ? Math.round((clientsWon / totalLeads) * 100) : 0;
  const daily = dailyCompletion(data);
  const weeklyScore = totalGoal > 0 ? Math.min(100, Math.round((totalOutreach / (totalGoal * 7)) * 100)) : 0;
  const monthlyScore = totalGoal > 0 ? Math.min(100, Math.round((totalOutreach / (totalGoal * 30)) * 100)) : 0;
  const sourceMap = data.leads.reduce<Record<string, number>>((acc, lead) => {
    acc[lead.platform] = (acc[lead.platform] ?? 0) + 1;
    return acc;
  }, {});
  const bestSource = Object.entries(sourceMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "No source yet";

  return {
    totalGoal,
    totalOutreach,
    totalLeads,
    conversations,
    proposals,
    clientsWon,
    conversionRate,
    daily,
    weeklyScore,
    monthlyScore,
    bestSource,
  };
}

export function activityChart(data: ClientOSData) {
  return data.activities.map((item) => ({
    name: item.name.replace("Website-less Business Outreach", "Website Outreach"),
    progress: item.count,
    goal: item.dailyGoal,
  }));
}

export function statusChart(data: ClientOSData) {
  return leadStatuses
    .map((status, index) => ({
      name: status,
      value: data.leads.filter((lead) => lead.status === status).length,
      fill: sourceColors[index % sourceColors.length],
    }))
    .filter((item) => item.value > 0);
}

export function timelineChart(data: ClientOSData, days = 7) {
  return Array.from({ length: days }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - index - 1));
    const key = dateKey(date);
    return {
      day: formatShortDate(key),
      outreach: data.timeline.filter((item) => item.kind === "activity" && item.createdAt.startsWith(key)).length,
      leads: data.timeline.filter((item) => item.kind === "lead" && item.createdAt.startsWith(key)).length,
    };
  });
}

export function sourceChart(data: ClientOSData) {
  const sourceMap = data.leads.reduce<Record<string, number>>((acc, lead) => {
    acc[lead.platform] = (acc[lead.platform] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(sourceMap).map(([name, value], index) => ({
    name,
    value,
    fill: sourceColors[index % sourceColors.length],
  }));
}

export function buildInsights(data: ClientOSData) {
  const stats = metrics(data);
  const recentConversations = data.leads.filter((lead) => lead.status !== "New Lead" && isWithinDays(lead.dateAdded, 7));
  const sourceCounts = recentConversations.reduce<Record<string, number>>((acc, lead) => {
    acc[lead.platform] = (acc[lead.platform] ?? 0) + 1;
    return acc;
  }, {});
  const topConversationSource = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0];
  const lowActivity = [...data.activities].sort((a, b) => a.count / a.dailyGoal - b.count / b.dailyGoal)[0];
  const insights = [];

  if (topConversationSource && recentConversations.length > 0) {
    insights.push(
      `${topConversationSource[0]} generated ${Math.round((topConversationSource[1] / recentConversations.length) * 100)}% of your conversations this week.`,
    );
  }

  insights.push(`You completed ${stats.weeklyScore}% of your weekly outreach target.`);

  if (lowActivity) {
    insights.push(`Push ${lowActivity.name.toLowerCase()} next; it is the lowest progress channel today.`);
  }

  if (stats.conversionRate === 0 && stats.totalLeads > 0) {
    insights.push("Move one warm lead toward a proposal to start measuring conversion quality.");
  } else if (stats.clientsWon > 0) {
    insights.push(`${stats.bestSource} is your strongest source right now. Double down there tomorrow.`);
  }

  return insights.slice(0, 4);
}

export function statusValue(status: LeadStatus) {
  return leadStatuses.indexOf(status) + 1;
}
