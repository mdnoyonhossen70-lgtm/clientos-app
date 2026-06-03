import { useEffect, useState } from "react";
import { Download, Smartphone } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

function isStandaloneMode() {
  return window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as NavigatorWithStandalone).standalone);
}

export function InstallPrompt({ className, mobile = false }: { className?: string; mobile?: boolean }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setInstalled(isStandaloneMode());

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function installApp() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  if (installed || !installPrompt) return null;

  if (mobile) {
    return (
      <div className={cn("fixed bottom-20 left-4 right-4 z-40 lg:hidden", className)}>
        <Button variant="primary" className="w-full shadow-glow" onClick={() => void installApp()}>
          <Smartphone className="h-4 w-4" />
          Install App
        </Button>
      </div>
    );
  }

  return (
    <Button variant="secondary" className={cn("w-full justify-start", className)} onClick={() => void installApp()}>
      <Download className="h-4 w-4" />
      Install App
    </Button>
  );
}
