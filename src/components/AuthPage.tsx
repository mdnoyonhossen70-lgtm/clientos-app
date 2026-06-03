import { useState, type FormEvent } from "react";
import { ArrowRight, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/form";

type AuthApi = ReturnType<typeof useAuth>;

export function AuthPage({ auth }: { auth: AuthApi }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitEmail(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      await auth.signInWithEmail(email);
      setMessage("Magic link sent. Check your inbox to enter ClientOS.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send login email.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br from-[#9F2BFF] to-[#FF2D74]">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-normal text-white">ClientOS</h1>
          <p className="mt-2 text-sm text-white/55">Your personal client acquisition command center.</p>
        </div>

        <Card className="gradient-border p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/[0.06]">
              <LockKeyhole className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Sign in</h2>
              <p className="text-xs text-white/45">Email magic link or Google OAuth.</p>
            </div>
          </div>

          <form onSubmit={submitEmail} className="space-y-3">
            <Input type="email" required placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />
            <Button type="submit" variant="primary" className="w-full" disabled={!auth.isSupabaseConfigured || submitting}>
              <Mail className="h-4 w-4" />
              {submitting ? "Sending..." : "Send magic link"}
            </Button>
          </form>

          <Button variant="secondary" className="mt-3 w-full" onClick={() => void auth.signInWithGoogle()} disabled={!auth.isSupabaseConfigured}>
            Continue with Google
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button variant="ghost" className="mt-2 w-full" onClick={auth.continueLocally}>
            Open local demo workspace
          </Button>

          {!auth.isSupabaseConfigured && (
            <p className="mt-4 rounded-lg border border-amber-300/20 bg-amber-300/10 p-3 text-xs leading-5 text-amber-100">
              Supabase env vars are not set. Local demo mode works now; add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for hosted auth and database sync.
            </p>
          )}

          {message && <p className="mt-4 text-xs text-emerald-200">{message}</p>}
          {error && <p className="mt-4 text-xs text-rose-200">{error}</p>}
        </Card>
      </motion.div>
    </main>
  );
}
