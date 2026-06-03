import { Award, CalendarDays, Flame, TrendingUp, Trophy, Zap, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import type { ClientOSData } from "../types";
import { metrics, buildInsights } from "../lib/analytics";
import { percentage } from "../lib/utils";
import { useClientOS } from "../hooks/useClientOS";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { ProgressRing } from "./ProgressRing";
import { Button } from "./ui/button";

type Actions = ReturnType<typeof useClientOS>;

export function DashboardPage({ data, actions }: { data: ClientOSData; actions: Actions }) {
  const stats = metrics(data);
  const insights = buildInsights(data);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-accent">ClientOS</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-normal text-white sm:text-4xl">Daily acquisition dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">Track outreach volume, streaks, lead flow, and the channels that are actually creating clients.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => actions.incrementActivity(data.activities[0]?.id ?? "")}>Quick +1</Button>
          <Button variant="primary" onClick={() => actions.incrementActivity(data.activities[2]?.id ?? "")}>
            <Zap className="h-4 w-4" />
            Website outreach
          </Button>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_1.9fr]">
        <Card className="gradient-border p-5">
          <div className="flex flex-col items-center justify-center gap-5 sm:flex-row lg:flex-col xl:flex-row">
            <ProgressRing value={stats.daily} />
            <div className="w-full flex-1 space-y-3">
              <MetricRow icon={Flame} label="Current streak" value={`${data.streak.currentStreak} days`} />
              <MetricRow icon={Trophy} label="Best streak" value={`${data.streak.bestStreak} days`} />
              <MetricRow icon={CalendarDays} label="Days missed" value={`${data.streak.daysMissed}`} />
            </div>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          <ScoreCard icon={TrendingUp} label="Weekly score" value={`${stats.weeklyScore}%`} sub="against weekly target" />
          <ScoreCard icon={Award} label="Monthly score" value={`${stats.monthlyScore}%`} sub="against monthly target" />
          <ScoreCard icon={Zap} label="Total outreach" value={String(stats.totalOutreach)} sub={`${stats.totalGoal} target today`} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="grid gap-3 sm:grid-cols-2">
          {data.activities.map((activity, index) => {
            const value = percentage(activity.count, activity.dailyGoal);
            return (
              <motion.div key={activity.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
                <Card className="p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">{activity.name}</h3>
                      <p className="mt-1 text-xs text-white/40">{activity.source}</p>
                    </div>
                    <span className="rounded-lg bg-white/[0.06] px-2 py-1 text-xs font-bold text-white">
                      {activity.count} / {activity.dailyGoal}
                    </span>
                  </div>
                  <Progress value={value} />
                  <p className="mt-2 text-xs text-white/45">{value}% complete</p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-bold">AI insights</h2>
          </div>
          <div className="space-y-3">
            {insights.map((insight) => (
              <div key={insight} className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm leading-6 text-white/75">
                {insight}
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}

function MetricRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-accent" />
        <span className="text-sm text-white/55">{label}</span>
      </div>
      <span className="text-sm font-bold text-white">{value}</span>
    </div>
  );
}

function ScoreCard({ icon: Icon, label, value, sub }: { icon: LucideIcon; label: string; value: string; sub: string }) {
  return (
    <Card className="p-5">
      <Icon className="mb-5 h-5 w-5 text-accent" />
      <p className="text-sm text-white/45">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-white">{value}</p>
      <p className="mt-1 text-xs text-white/35">{sub}</p>
    </Card>
  );
}
