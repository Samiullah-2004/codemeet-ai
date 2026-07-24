"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "motion/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setError("Invalid email or password.");
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
        Log in
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-3 w-full max-w-sm"
      >
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

        {error && <p className="text-xs text-red-400">{error}</p>}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-2 rounded-md bg-[var(--color-accent)] text-black text-sm font-medium disabled:opacity-50"
        >
          {isSubmitting ? "Logging in..." : "Log In"}
        </motion.button>

        <p className="text-xs text-center text-[var(--foreground)]/50">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-[var(--color-accent)]">Sign up</a>
        </p>
      </motion.div>
    </main>
  );
}