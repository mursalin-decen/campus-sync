import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, student_id, email, role, section_id")
        .eq("id", user.id)
        .single();

    const fullName =
        profile?.full_name ||
        user.user_metadata?.full_name ||
        "CampusSync Student";

    return (
        <main className="min-h-screen bg-[#050505] text-white">
            <div className="mx-auto max-w-7xl px-6 py-10">

                {/* Header */}
                <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="mb-2 text-sm font-medium uppercase tracking-[0.3em] text-cyan-400">
                            CampusSync
                        </p>

                        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                            Welcome, {fullName}
                        </h1>

                        <p className="mt-3 text-gray-400">
                            Your academic space, all in one place.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
                        <p className="text-xs uppercase tracking-wider text-gray-500">
                            Account
                        </p>

                        <p className="mt-1 text-sm text-gray-300">
                            {user.email}
                        </p>
                    </div>
                </div>

                {/* Status Cards */}
                <section className="grid gap-5 md:grid-cols-3">

                    <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.06] p-6 shadow-[0_0_40px_rgba(34,211,238,0.08)]">
                        <p className="text-sm text-cyan-300">
                            TODAY
                        </p>

                        <h2 className="mt-4 text-3xl font-bold">
                            0
                        </h2>

                        <p className="mt-2 text-gray-400">
                            Academic activities today
                        </p>
                    </div>

                    <div className="rounded-3xl border border-purple-400/20 bg-purple-400/[0.06] p-6 shadow-[0_0_40px_rgba(168,85,247,0.08)]">
                        <p className="text-sm text-purple-300">
                            UPCOMING
                        </p>

                        <h2 className="mt-4 text-3xl font-bold">
                            0
                        </h2>

                        <p className="mt-2 text-gray-400">
                            Upcoming academic tasks
                        </p>
                    </div>

                    <div className="rounded-3xl border border-red-400/20 bg-red-400/[0.06] p-6 shadow-[0_0_40px_rgba(248,113,113,0.08)]">
                        <p className="text-sm text-red-300">
                            OVERDUE
                        </p>

                        <h2 className="mt-4 text-3xl font-bold">
                            0
                        </h2>

                        <p className="mt-2 text-gray-400">
                            Overdue tasks
                        </p>
                    </div>

                </section>

                {/* Profile / Section */}
                <section className="mt-8 grid gap-6 md:grid-cols-2">

                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
                        <p className="text-sm uppercase tracking-wider text-gray-500">
                            Your Academic Profile
                        </p>

                        <div className="mt-6 space-y-4">

                            <div>
                                <p className="text-xs text-gray-500">
                                    Full Name
                                </p>

                                <p className="mt-1 text-lg font-medium">
                                    {fullName}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">
                                    Student ID
                                </p>

                                <p className="mt-1 text-lg font-medium">
                                    {profile?.student_id || "Not added"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">
                                    Role
                                </p>

                                <p className="mt-1 text-lg font-medium capitalize">
                                    {profile?.role || "Student"}
                                </p>
                            </div>

                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
                        <p className="text-sm uppercase tracking-wider text-gray-500">
                            Section
                        </p>

                        <div className="mt-6">

                            {profile?.section_id ? (
                                <>
                                    <h2 className="text-3xl font-bold">
                                        Assigned Section
                                    </h2>

                                    <p className="mt-3 text-gray-400">
                                        Your section has been assigned by the administrator.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-3xl font-bold">
                                        Not Assigned
                                    </h2>

                                    <p className="mt-3 text-gray-400">
                                        Your section will appear here after an administrator
                                        assigns you to a section.
                                    </p>
                                </>
                            )}

                        </div>
                    </div>

                </section>

                {/* Courses */}
                <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-7">

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm uppercase tracking-wider text-gray-500">
                                Academic Space
                            </p>

                            <h2 className="mt-2 text-2xl font-bold">
                                Your Courses
                            </h2>
                        </div>

                        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs text-cyan-300">
                            Coming next
                        </span>
                    </div>

                    <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-10 text-center">

                        <p className="text-lg font-medium text-gray-300">
                            No courses available yet
                        </p>

                        <p className="mt-2 text-sm text-gray-500">
                            Courses will appear here once your section is configured.
                        </p>

                    </div>

                </section>

            </div>
        </main>
    );
}