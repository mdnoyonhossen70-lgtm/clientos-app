import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { Activity, BarChart3, Flame, LayoutDashboard, LogOut, Sparkles, Target, Users } from "lucide-react";
import type { ClientOSData } from "../types";
import { metrics } from "../lib/analytics";
import { useAuth } from "../hooks/useAuth";
import { Button } from "./ui/button";
import { InstallPrompt } from "./InstallPrompt";

type AuthApi = ReturnType<typeof useAuth>;

const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Tracker", path: "/tracker", icon: Target },
  { label: "Leads", path: "/leads", icon: Users },
  { label: "Analytics", path: "/analytics", icon: BarChart3 },
  { label: "Timeline", path: "/timeline", icon: Activity },
];

export function Shell({ children, auth, data }: { children: ReactNode; auth: AuthApi; data: ClientOSData }) {
  const stats = metrics(data);

  return (
    <div className="min-h-screen text-white">
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 border-r border-white/10 bg-background/90 px-4 py-5 backdrop-blur-xl lg:block">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-[#9F2BFF] to-[#FF2D74]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-extrabold">ClientOS</p>
            <p className="text-xs text-white/45">Acquisition cockpit</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${
                  isActive ? "bg-white/[0.08] text-white" : "text-white/55 hover:bg-white/[0.06] hover:text-white"
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-5 left-4 right-4">
          <div className="mb-3 rounded-lg border border-white/10 bg-white/[0.04] p-3">
            <div className="flex items-center justify-between text-xs text-white/45">
              <span>Daily score</span>
              <Flame className="h-4 w-4 text-accent" />
            </div>
            <p className="mt-1 text-2xl font-extrabold">{stats.daily}%</p>
            <p className="text-xs text-white/40">{data.streak.currentStreak} day streak</p>
          </div>
          <InstallPrompt className="mb-2" />
          <Button variant="ghost" className="w-full justify-start" onClick={() => void auth.signOut()}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      <main className="pb-24 lg:ml-64 lg:pb-0">
        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">{children}</div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-white/10 bg-background/95 px-2 pb-3 pt-2 backdrop-blur-xl lg:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-semibold transition ${
                isActive ? "bg-white/[0.08] text-white" : "text-white/45"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <InstallPrompt mobile />
    </div>
  );
}
