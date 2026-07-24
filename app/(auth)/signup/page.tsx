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

    // Auto sign-in after successful signup
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
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 bg-[var(--background)]">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-[var(--foreground)]"
      >
        Create your account
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-3 w-full max-w-sm"
      >
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 rounded-md bg-white/5 border border-[var(--color-accent-dim)] text-sm outline-none focus:border-[var(--color-accent)] transition-colors"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 rounded-md bg-white/5 border border-[var(--color-accent-dim)] text-sm outline-none focus:border-[var(--color-accent)] transition-colors"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 rounded-md bg-white/5 border border-[var(--color-accent-dim)] text-sm outline-none focus:border-[var(--color-accent)] transition-colors"
        />

        <div className="flex gap-2">
          <button
            onClick={() => setRole("recruiter")}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium border transition-colors ${
              role === "recruiter"
                ? "bg-[var(--color-accent)] text-black border-[var(--color-accent)]"
                : "border-[var(--color-accent-dim)] text-[var(--foreground)]/60"
            }`}
          >
            Recruiter
          </button>
          <button
            onClick={() => setRole("candidate")}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium border transition-colors ${
              role === "candidate"
                ? "bg-[var(--color-accent)] text-black border-[var(--color-accent)]"
                : "border-[var(--color-accent-dim)] text-[var(--foreground)]/60"
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
          className="w-full py-2 rounded-md bg-[var(--color-accent)] text-black text-sm font-medium disabled:opacity-50"
        >
          {isSubmitting ? "Creating account..." : "Sign Up"}
        </motion.button>

        <p className="text-xs text-center text-[var(--foreground)]/50">
          Already have an account?{" "}
          <a href="/login" className="text-[var(--color-accent)]">Log in</a>
        </p>
      </motion.div>
    </main>
  );
}