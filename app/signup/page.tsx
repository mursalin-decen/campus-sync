"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function SignupPage() {
    const [fullName, setFullName] = useState("");
    const [studentId, setStudentId] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    async function handleSignup(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setLoading(true);
        setError("");
        setMessage("");

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            setLoading(false);
            return;
        }

        const supabase = createClient();

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    student_id: studentId,
                },
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        setMessage(
            "Account created. Please check your email if email confirmation is enabled."
        );

        setFullName("");
        setStudentId("");
        setEmail("");
        setPassword("");

        setLoading(false);
    }

    return (
        <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-10">

            <div className="w-full max-w-md">

                <div className="mb-8 text-center">
                    <p className="text-sm tracking-[0.35em] text-cyan-400 uppercase">
                        CampusSync
                    </p>

                    <h1 className="mt-4 text-4xl font-bold">
                        Create Account
                    </h1>

                    <p className="mt-3 text-zinc-400">
                        Join your academic space.
                    </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl">

                    <form onSubmit={handleSignup} className="space-y-5">

                        <div>
                            <label className="mb-2 block text-sm text-zinc-300">
                                Full Name
                            </label>

                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Your full name"
                                required
                                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-cyan-400"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm text-zinc-300">
                                Student ID
                            </label>

                            <input
                                type="text"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                placeholder="Your student ID"
                                required
                                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-cyan-400"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm text-zinc-300">
                                Email
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="student@example.com"
                                required
                                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-cyan-400"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm text-zinc-300">
                                Password
                            </label>

                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Minimum 6 characters"
                                minLength={6}
                                required
                                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-cyan-400"
                            />
                        </div>

                        {error && (
                            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-black transition hover:bg-cyan-300 disabled:opacity-50"
                        >
                            {loading ? "Creating account..." : "Create Account"}
                        </button>

                    </form>

                    <div className="mt-7 border-t border-white/10 pt-6 text-center text-sm text-zinc-400">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="font-medium text-cyan-400 hover:text-cyan-300"
                        >
                            Sign in
                        </Link>
                    </div>

                </div>
            </div>

        </main>
    );
}