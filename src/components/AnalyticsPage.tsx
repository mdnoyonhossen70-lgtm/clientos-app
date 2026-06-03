import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart } from "recharts";
import { Activity, BadgeCheck, GitPullRequestArrow, Percent, Send, Trophy, Users, type LucideIcon } from "lucide-react";
import type { ClientOSData } from "../types";
import { activityChart, metrics, sourceChart, statusChart, timelineChart } from "../lib/analytics";
import { Card } from "./ui/card";

export function AnalyticsPage({ data }: { data: ClientOSData }) {
  const stats = metrics(data);
  const activities = activityChart(data);
  const statuses = statusChart(data);
  const sources = sourceChart(data);
  const timeline = timelineChart(data);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-accent">Analytics</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-normal">Acquisition intelligence</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">Daily, weekly, and monthly signals from outreach activity and pipeline movement.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Send} label="Total outreach" value={stats.totalOutreach} />
        <Stat icon={Users} label="Total leads" value={stats.totalLeads} />
        <Stat icon={GitPullRequestArrow} label="Proposals sent" value={stats.proposals} />
        <Stat icon={Trophy} label="Clients won" value={stats.clientsWon} />
        <Stat icon={Activity} label="Conversations" value={stats.conversations} />
        <Stat icon={Percent} label="Conversion rate" value={`${stats.conversionRate}%`} />
        <Stat icon={BadgeCheck} label="Weekly score" value={`${stats.weeklyScore}%`} />
        <Stat icon={BadgeCheck} label="Monthly score" value={`${stats.monthlyScore}%`} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <ChartTitle title="Daily activity progress" subtitle="Current count compared with target" />
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activities} margin={{ left: -24, right: 8, top: 8, bottom: 24 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.35)" fontSize={11} angle={-18} textAnchor="end" height={70} interval={0} />
                <YAxis stroke="rgba(255,255,255,0.35)" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey="goal" fill="rgba(255,255,255,0.08)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="progress" fill="#B15CFF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <ChartTitle title="Seven day movement" subtitle="Logged outreach and CRM events" />
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ left: -24, right: 8, top: 8, bottom: 8 }}>
                <defs>
                  <linearGradient id="outreachFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#9F2BFF" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#9F2BFF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="leadFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#FF2D74" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#FF2D74" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.35)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.35)" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area dataKey="outreach" stroke="#9F2BFF" fill="url(#outreachFill)" strokeWidth={2} />
                <Area dataKey="leads" stroke="#FF2D74" fill="url(#leadFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <PiePanel title="Lead status mix" data={statuses} />
        <PiePanel title="Best performing source" data={sources} />
      </section>
    </div>
  );
}

const tooltipStyle = {
  background: "#181824",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  color: "#fff",
};

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string | number }) {
  return (
    <Card className="p-4">
      <Icon className="mb-4 h-5 w-5 text-accent" />
      <p className="text-xs font-medium text-white/45">{label}</p>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
    </Card>
  );
}

function ChartTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-1 text-xs text-white/45">{subtitle}</p>
    </div>
  );
}

function PiePanel({ title, data }: { title: string; data: { name: string; value: number; fill: string }[] }) {
  return (
    <Card className="p-5">
      <ChartTitle title={title} subtitle="Distribution from current CRM data" />
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_14rem]">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={64} outerRadius={98} paddingAngle={4}>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2 self-center">
          {data.length === 0 && <p className="text-sm text-white/45">No data yet.</p>}
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
              <span className="flex min-w-0 items-center gap-2 text-xs text-white/65">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: entry.fill }} />
                <span className="truncate">{entry.name}</span>
              </span>
              <span className="text-xs font-bold">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
