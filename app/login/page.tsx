"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // Login successful
      router.replace("/dashboard");
      router.refresh();

    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-white">

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="mb-10 text-center">
          <Link
            href="/"
            className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-400"
          >
            CampusSync
          </Link>

          <h1 className="mt-5 text-4xl font-bold tracking-tight">
            Welcome back
          </h1>

          <p className="mt-3 text-gray-400">
            Sign in to your academic space.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl backdrop-blur-xl">

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-cyan-400 px-5 py-3.5 font-semibold text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>

          {/* Signup */}
          <p className="mt-7 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-cyan-400 transition hover:text-cyan-300"
            >
              Create one
            </Link>
          </p>

        </div>

      </div>

    </main>
  );
}