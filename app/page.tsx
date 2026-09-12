import Link from "next/link";

export default function Home() {
    return (
        <main className="min-h-screen bg-black text-white overflow-hidden">

            {/* Background Glow */}
            <div className="pointer-events-none fixed inset-0">
                <div className="absolute left-1/2 top-[-250px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[140px]" />
                <div className="absolute bottom-[-200px] right-[-100px] h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[120px]" />
            </div>

            {/* Navigation */}
            <nav className="relative z-10 flex items-center justify-between border-b border-white/10 px-6 py-5 md:px-12">

                <div>
                    <h1 className="text-xl font-bold tracking-[0.2em]">
                        CAMPUS<span className="text-cyan-400">SYNC</span>
                    </h1>

                    <p className="mt-1 text-[9px] tracking-[0.35em] text-zinc-500">
                        YOUR ACADEMIC SPACE
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/login"
                        className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-zinc-300 transition hover:border-cyan-400/40 hover:text-white"
                    >
                        Sign In
                    </Link>

                    <Link
                        href="/signup"
                        className="rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-cyan-300"
                    >
                        Get Started
                    </Link>
                </div>

            </nav>


            {/* Hero */}
            <section className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-6xl items-center px-6 py-20">

                <div className="max-w-4xl">

                    <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-xs text-cyan-300">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                        Academic system is online
                    </div>

                    <h2 className="text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
                        Everything
                        <br />
                        <span className="text-cyan-400">academic.</span>
                        <br />
                        In one place.
                    </h2>

                    <p className="mt-8 max-w-2xl text-base leading-7 text-zinc-400 md:text-lg">
                        CampusSync keeps your section, courses, CTs, assignments,
                        presentations, questions and academic updates organized in one
                        secure space.
                    </p>

                    <div className="mt-10 flex flex-wrap gap-4">

                        <Link
                            href="/signup"
                            className="rounded-2xl bg-cyan-400 px-7 py-4 font-semibold text-black transition hover:-translate-y-1 hover:bg-cyan-300"
                        >
                            Create Your Account
                        </Link>

                        <Link
                            href="/login"
                            className="rounded-2xl border border-white/10 bg-white/[0.03] px-7 py-4 font-medium text-white transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]"
                        >
                            Sign In
                        </Link>

                    </div>

                </div>

            </section>


            {/* Feature Strip */}
            <section className="relative z-10 border-t border-white/10">

                <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-white/10 md:grid-cols-3 md:divide-x md:divide-y-0">

                    <div className="p-8">
                        <p className="text-sm font-semibold text-cyan-400">
                            01
                        </p>

                        <h3 className="mt-3 text-xl font-semibold">
                            Section Spaces
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-zinc-500">
                            Keep each section's academic information organized and accessible.
                        </p>
                    </div>

                    <div className="p-8">
                        <p className="text-sm font-semibold text-cyan-400">
                            02
                        </p>

                        <h3 className="mt-3 text-xl font-semibold">
                            Academic Timeline
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-zinc-500">
                            See what's happening today, what's coming next and what's overdue.
                        </p>
                    </div>

                    <div className="p-8">
                        <p className="text-sm font-semibold text-cyan-400">
                            03
                        </p>

                        <h3 className="mt-3 text-xl font-semibold">
                            Never Lose Information
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-zinc-500">
                            Academic information stays organized instead of disappearing in
                            group chats.
                        </p>
                    </div>

                </div>

            </section>

        </main>
    );
}