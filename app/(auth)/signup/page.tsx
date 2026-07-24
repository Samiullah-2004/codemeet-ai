"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "motion/react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"recruiter" | "candidate">("recruiter");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required.");
      return;
    }

    setIsSubmitting(true);

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Signup failed.");
      setIsSubmitting(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setError("Account created, but sign-in failed. Try logging in.");
      return;
    }

    router.push("/");
  }

  return (
    <main className="grid-bg flex flex-1 flex-col items-center justify-center gap-8 p-8">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold tracking-tight"
      >
        Create <span className="text-[var(--color-accent)]">account</span>
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="terminal-window w-full max-w-sm"
      >
        <div className="terminal-titlebar">
          <span className="terminal-dot bg-red-500/70" />
          <span className="terminal-dot bg-yellow-500/70" />
          <span className="terminal-dot bg-green-500/70" />
          <span className="ml-2 text-[10px] font-mono text-[var(--foreground)]/40">signup.sh</span>
        </div>
        <div className="flex flex-col gap-3 p-6">
          <p className="text-xs font-mono text-[var(--foreground)]/50">
            <span className="text-[var(--color-accent)]">$</span> signup --new-user
          </p>

          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 rounded-md bg-black/30 border border-[var(--border-subtle)] text-sm outline-none focus:border-[var(--color-accent)] transition-colors"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 rounded-md bg-black/30 border border-[var(--border-subtle)] text-sm outline-none focus:border-[var(--color-accent)] transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 rounded-md bg-black/30 border border-[var(--border-subtle)] text-sm outline-none focus:border-[var(--color-accent)] transition-colors"
          />

          <div className="flex gap-2">
            <button
              onClick={() => setRole("recruiter")}
              className={`flex-1 py-2 rounded-md text-sm font-medium border transition-all ${
                role === "recruiter"
                  ? "bg-[var(--color-accent)] text-black border-[var(--color-accent)] glow-accent"
                  : "border-[var(--border-subtle)] text-[var(--foreground)]/60 hover:border-[var(--border-strong)]"
              }`}
            >
              Recruiter
            </button>
            <button
              onClick={() => setRole("candidate")}
              className={`flex-1 py-2 rounded-md text-sm font-medium border transition-all ${
                role === "candidate"
                  ? "bg-[var(--color-accent)] text-black border-[var(--color-accent)] glow-accent"
                  : "border-[var(--border-subtle)] text-[var(--foreground)]/60 hover:border-[var(--border-strong)]"
              }`}
            >
              Candidate
            </button>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-primary w-full py-2.5 rounded-md text-sm disabled:opacity-50"
          >
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </motion.button>

          <p className="text-xs text-center text-[var(--foreground)]/50">
            Already have an account?{" "}
            <a href="/login" className="text-[var(--color-accent)]">Log in</a>
          </p>
        </div>
      </motion.div>
    </main>
  );
}