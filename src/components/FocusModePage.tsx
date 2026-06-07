import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Brain, CheckCircle2, Pause, Play, RotateCcw, Timer, Zap } from "lucide-react";
import { motion } from "framer-motion";
import type { ClientOSData, FocusSessionType } from "../types";
import { formatShortDate } from "../lib/date";
import { percentage } from "../lib/utils";
import { useClientOS } from "../hooks/useClientOS";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input, Textarea } from "./ui/form";
import { Progress } from "./ui/progress";

type Actions = ReturnType<typeof useClientOS>;
type TimerState = "idle" | "running" | "paused";

const focusDurations = [25, 30, 45, 60];
const presets = [
  { label: "Deep Work", minutes: 60 },
  { label: "Outreach Sprint", minutes: 30 },
  { label: "Quick Focus", minutes: 15 },
  { label: "Follow-Up Session", minutes: 20 },
];
const noteExamples = ["Find recommendation posts", "Website-less business outreach", "LinkedIn connections", "Follow ups"];

export function FocusModePage({ data, actions }: { data: ClientOSData; actions: Actions }) {
  const [selectedMinutes, setSelectedMinutes] = useState(30);
  const [customMinutes, setCustomMinutes] = useState(30);
  const [remainingSeconds, setRemainingSeconds] = useState(30 * 60);
  const [activeMinutes, setActiveMinutes] = useState(30);
  const [sessionType, setSessionType] = useState<FocusSessionType>("Focus");
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [message, setMessage] = useState("Ready for a focused outreach session.");
  const [sessionStartedAt, setSessionStartedAt] = useState<string | null>(null);
  const [notificationEnabled, setNotificationEnabled] = useState(Notification.permission === "granted");
  const finishLock = useRef(false);

  const stats = useMemo(() => focusStats(data), [data]);
  const dailyProgress = percentage(stats.focusTodayMinutes, data.focus.dailyGoalMinutes);
  const progress = percentage(activeMinutes * 60 - remainingSeconds, activeMinutes * 60);

  useEffect(() => {
    if (timerState !== "running") return;

    const interval = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.setTimeout(() => completeSession(), 0);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  });

  function setDuration(minutes: number) {
    setSelectedMinutes(minutes);
    if (timerState === "idle" && sessionType === "Focus") {
      setActiveMinutes(minutes);
      setRemainingSeconds(minutes * 60);
    }
  }

  async function requestNotifications() {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      setNotificationEnabled(true);
      return;
    }
    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      setNotificationEnabled(permission === "granted");
    }
  }

  async function startFocus(minutes = selectedMinutes) {
    await requestNotifications();
    finishLock.current = false;
    setSessionType("Focus");
    setActiveMinutes(minutes);
    setRemainingSeconds(minutes * 60);
    setSessionStartedAt(new Date().toISOString());
    setTimerState("running");
    setMessage("Stay locked in. One client-acquisition task at a time.");
  }

  function pauseTimer() {
    setTimerState("paused");
    setMessage("Paused. Resume when you are ready.");
  }

  function resumeTimer() {
    setTimerState("running");
    setMessage(sessionType === "Focus" ? "Focus session resumed." : "Break resumed.");
  }

  function resetTimer() {
    if (timerState !== "idle" && sessionStartedAt) {
      const elapsedMinutes = Math.max(1, Math.round((activeMinutes * 60 - remainingSeconds) / 60));
      actions.addFocusSession({
        startedAt: sessionStartedAt,
        endedAt: new Date().toISOString(),
        durationMinutes: elapsedMinutes,
        sessionType,
        note: data.focus.currentNote,
        status: "interrupted",
      });
    }
    finishLock.current = false;
    setSessionType("Focus");
    setActiveMinutes(selectedMinutes);
    setRemainingSeconds(selectedMinutes * 60);
    setTimerState("idle");
    setSessionStartedAt(null);
    setMessage("Ready for a focused outreach session.");
  }

  function completeSession() {
    if (finishLock.current || !sessionStartedAt) return;
    finishLock.current = true;

    actions.addFocusSession({
      startedAt: sessionStartedAt,
      endedAt: new Date().toISOString(),
      durationMinutes: activeMinutes,
      sessionType,
      note: data.focus.currentNote,
      status: "completed",
    });

    if (sessionType === "Focus") {
      notify("Focus session complete", "Take a break.");
      const breakMinutes = activeMinutes >= 60 ? 10 : 5;
      setMessage("Focus session complete. Take a break.");
      setSessionType("Break");
      setActiveMinutes(breakMinutes);
      setRemainingSeconds(breakMinutes * 60);
      setSessionStartedAt(new Date().toISOString());
      finishLock.current = false;
      setTimerState("running");
      return;
    }

    notify("Break complete", "Ready to focus again.");
    setMessage("Break complete. Ready to focus again.");
    setSessionType("Focus");
    setActiveMinutes(selectedMinutes);
    setRemainingSeconds(selectedMinutes * 60);
    setSessionStartedAt(null);
    setTimerState("idle");
  }

  function notify(title: string, body: string) {
    playNotificationSound();
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/icons/pwa-192x192.png" });
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold text-accent">Focus Mode</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-normal">Client acquisition focus room</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">Run distraction-free outreach sprints, follow-up blocks, and prospecting sessions.</p>
        </div>
        <Button variant="secondary" onClick={() => void requestNotifications()}>
          <Bell className="h-4 w-4" />
          {notificationEnabled ? "Notifications on" : "Enable notifications"}
        </Button>
      </header>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="gradient-border p-5 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_18rem] lg:items-center">
            <div className="grid place-items-center">
              <FocusRing value={progress} label={formatTime(remainingSeconds)} subLabel={sessionType} />
              <motion.p
                key={message}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-center text-sm font-medium text-white/60"
              >
                {message}
              </motion.p>
            </div>

            <div className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-white/35">Focus duration</p>
                <div className="grid grid-cols-2 gap-2">
                  {focusDurations.map((minutes) => (
                    <Button key={minutes} variant={selectedMinutes === minutes ? "primary" : "secondary"} onClick={() => setDuration(minutes)}>
                      {minutes} min
                    </Button>
                  ))}
                </div>
                <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
                  <Input type="number" min={5} value={customMinutes} onChange={(event) => setCustomMinutes(Number(event.target.value) || 5)} />
                  <Button variant="secondary" onClick={() => setDuration(customMinutes)}>
                    Custom
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {timerState === "idle" && (
                  <Button variant="primary" className="col-span-2" onClick={() => void startFocus()}>
                    <Play className="h-4 w-4" />
                    Start
                  </Button>
                )}
                {timerState === "running" && (
                  <Button variant="secondary" onClick={pauseTimer}>
                    <Pause className="h-4 w-4" />
                    Pause
                  </Button>
                )}
                {timerState === "paused" && (
                  <Button variant="primary" onClick={resumeTimer}>
                    <Play className="h-4 w-4" />
                    Resume
                  </Button>
                )}
                {timerState !== "idle" && (
                  <Button variant="secondary" onClick={resetTimer}>
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-bold">Quick presets</h2>
          </div>
          <div className="grid gap-2">
            {presets.map((preset) => (
              <Button key={preset.label} variant="secondary" className="justify-between" onClick={() => void startFocus(preset.minutes)}>
                <span>{preset.label}</span>
                <span className="text-white/45">{preset.minutes} min</span>
              </Button>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={Timer} label="Today" value={formatMinutes(stats.focusTodayMinutes)} />
        <StatCard icon={Brain} label="This week" value={formatMinutes(stats.focusWeekMinutes)} />
        <StatCard icon={CheckCircle2} label="Completed" value={String(stats.sessionsCompleted)} />
        <StatCard icon={Zap} label="Longest" value={formatMinutes(stats.longestSession)} />
        <StatCard icon={FlameIcon} label="Focus streak" value={`${stats.currentFocusStreak} days`} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="p-5">
          <h2 className="text-lg font-bold">Daily focus goal</h2>
          <p className="mt-1 text-xs text-white/45">Set how much focused acquisition work you want today.</p>
          <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
            <Input
              type="number"
              min={15}
              value={data.focus.dailyGoalMinutes}
              onChange={(event) => actions.updateFocusGoal(Number(event.target.value) || 15)}
            />
            <span className="grid place-items-center rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-white/55">min</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-white/45">
            <span>{formatMinutes(stats.focusTodayMinutes)} done</span>
            <span>{dailyProgress}%</span>
          </div>
          <Progress value={dailyProgress} className="mt-2" />
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-bold">Productivity notes</h2>
          <p className="mt-1 text-xs text-white/45">What will you work on?</p>
          <Textarea value={data.focus.currentNote} onChange={(event) => actions.updateFocusNote(event.target.value)} className="mt-4" />
          <div className="mt-3 flex flex-wrap gap-2">
            {noteExamples.map((note) => (
              <Button key={note} size="sm" variant="secondary" onClick={() => actions.updateFocusNote(note)}>
                {note}
              </Button>
            ))}
          </div>
        </Card>
      </section>

      <Card className="p-5">
        <h2 className="text-lg font-bold">Recent sessions</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="text-xs uppercase text-white/35">
              <tr>
                <th className="pb-3">Date</th>
                <th className="pb-3">Duration</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {data.focus.sessions.slice(0, 8).map((session) => (
                <tr key={session.id}>
                  <td className="py-3 text-white/65">{formatShortDate(session.startedAt)}</td>
                  <td className="py-3 font-semibold">{session.durationMinutes} min</td>
                  <td className="py-3 text-white/65">{session.sessionType}</td>
                  <td className="py-3">
                    <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-xs capitalize text-white/70">{session.status}</span>
                  </td>
                  <td className="py-3 text-white/55">{session.note || "No note"}</td>
                </tr>
              ))}
              {data.focus.sessions.length === 0 && (
                <tr>
                  <td className="py-6 text-center text-white/45" colSpan={5}>
                    No focus sessions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function FocusRing({ value, label, subLabel }: { value: number; label: string; subLabel: string }) {
  const size = 260;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="transparent" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#focus-progress)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={circumference}
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: "spring", stiffness: 110, damping: 20 }}
        />
        <defs>
          <linearGradient id="focus-progress" x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="#9F2BFF" />
            <stop offset="1" stopColor="#FF2D74" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <p className="text-5xl font-extrabold">{label}</p>
        <p className="mt-2 text-sm font-semibold text-accent">{subLabel}</p>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Timer; label: string; value: string }) {
  return (
    <Card className="p-4">
      <Icon className="mb-4 h-5 w-5 text-accent" />
      <p className="text-xs font-medium text-white/45">{label}</p>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
    </Card>
  );
}

function FlameIcon(props: React.ComponentProps<typeof Timer>) {
  return <Zap {...props} />;
}

function focusStats(data: ClientOSData) {
  const focusSessions = data.focus.sessions.filter((session) => session.sessionType === "Focus");
  const completedFocus = focusSessions.filter((session) => session.status === "completed");
  const todayKey = new Date().toISOString().slice(0, 10);
  const weekAgo = Date.now() - 7 * 86_400_000;

  const focusTodayMinutes = completedFocus
    .filter((session) => session.startedAt.startsWith(todayKey))
    .reduce((sum, session) => sum + session.durationMinutes, 0);
  const focusWeekMinutes = completedFocus
    .filter((session) => new Date(session.startedAt).getTime() >= weekAgo)
    .reduce((sum, session) => sum + session.durationMinutes, 0);
  const longestSession = completedFocus.reduce((max, session) => Math.max(max, session.durationMinutes), 0);

  return {
    focusTodayMinutes,
    focusWeekMinutes,
    sessionsCompleted: completedFocus.length,
    longestSession,
    currentFocusStreak: focusStreak(completedFocus.map((session) => session.startedAt)),
  };
}

function focusStreak(dates: string[]) {
  const days = new Set(dates.map((date) => date.slice(0, 10)));
  let cursor = new Date();
  let streak = 0;

  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`;
}

function playNotificationSound() {
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) return;
  const context = new AudioContextCtor();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = 660;
  gain.gain.value = 0.04;
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.18);
}
