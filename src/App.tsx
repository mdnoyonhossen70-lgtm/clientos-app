import { Navigate, Route, Routes } from "react-router-dom";
import { AuthPage } from "./components/AuthPage";
import { AnalyticsPage } from "./components/AnalyticsPage";
import { DashboardPage } from "./components/DashboardPage";
import { LeadCRMPage } from "./components/LeadCRMPage";
import { Shell } from "./components/Shell";
import { TimelinePage } from "./components/TimelinePage";
import { TrackerPage } from "./components/TrackerPage";
import { useAuth } from "./hooks/useAuth";
import { useClientOS } from "./hooks/useClientOS";

export default function App() {
  const auth = useAuth();
  const clientOS = useClientOS(auth.user, auth.localMode);

  if (auth.loading) {
    return <div className="grid min-h-screen place-items-center text-sm text-white/60">Loading ClientOS...</div>;
  }

  if (!auth.isAuthenticated) {
    return <AuthPage auth={auth} />;
  }

  if (clientOS.isLoading || !clientOS.data) {
    return <div className="grid min-h-screen place-items-center text-sm text-white/60">Syncing workspace...</div>;
  }

  return (
    <Shell auth={auth} data={clientOS.data}>
      <Routes>
        <Route path="/" element={<DashboardPage data={clientOS.data} actions={clientOS} />} />
        <Route path="/tracker" element={<TrackerPage data={clientOS.data} actions={clientOS} />} />
        <Route path="/leads" element={<LeadCRMPage data={clientOS.data} actions={clientOS} />} />
        <Route path="/analytics" element={<AnalyticsPage data={clientOS.data} />} />
        <Route path="/timeline" element={<TimelinePage data={clientOS.data} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}
