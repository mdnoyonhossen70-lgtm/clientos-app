import { Activity, BadgeCheck, Clock, Flame, GitBranch } from "lucide-react";
import type { TimelineEvent, ClientOSData } from "../types";
import { formatShortDate } from "../lib/date";
import { Card } from "./ui/card";

const iconMap = {
  activity: Activity,
  lead: GitBranch,
  streak: Flame,
  achievement: BadgeCheck,
};

export function TimelinePage({ data }: { data: ClientOSData }) {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-accent">Activity timeline</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-normal">Acquisition feed</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">Every tracked action, lead movement, streak event, and win is logged automatically.</p>
      </header>

      <Card className="p-4">
        <div className="space-y-2">
          {data.timeline.length === 0 && <p className="p-6 text-center text-sm text-white/45">No events yet.</p>}
          {data.timeline.map((item) => (
            <TimelineItem key={item.id} item={item} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function TimelineItem({ item }: { item: TimelineEvent }) {
  const Icon = iconMap[item.kind];
  const time = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(item.createdAt));

  return (
    <div className="grid grid-cols-[2.5rem_1fr] gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-3">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/[0.06]">
        <Icon className="h-5 w-5 text-accent" />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="truncate text-sm font-bold">{item.title}</h3>
          <span className="flex items-center gap-1 text-xs text-white/35">
            <Clock className="h-3 w-3" />
            {formatShortDate(item.createdAt)} at {time}
          </span>
        </div>
        <p className="mt-1 text-sm leading-6 text-white/55">{item.details}</p>
        <p className="mt-1 text-xs font-semibold text-accent">{item.source}</p>
      </div>
    </div>
  );
}
