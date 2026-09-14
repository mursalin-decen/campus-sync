"use client";

// ============================================================
// ===== SECTION 1: IMPORTS ===================================
// ============================================================

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

import {
    Plus,
    Pencil,
    Trash2,
    Users,
    BookOpen,
    ShieldCheck,
    ArrowLeft,
    RefreshCw,
} from "lucide-react";

import Link from "next/link";


// ============================================================
// ===== SECTION 2: SECTION DATA TYPE ==========================
// ============================================================

type Section = {
    id: string;
    name: string;
    code: string;
    semester: string | null;
    academic_year: string | null;
    is_active: boolean;
    created_at: string;
};


// ============================================================
// ===== SECTION 3: ADMIN PAGE ================================
// ============================================================

export default function AdminPage() {

    // --------------------------------------------------------
    // Supabase Client
    // --------------------------------------------------------

    const supabase = createClient();


    // --------------------------------------------------------
    // Section States
    // --------------------------------------------------------

    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);


    // --------------------------------------------------------
    // Modal States
    // --------------------------------------------------------

    const [showModal, setShowModal] = useState(false);
    const [editingSection, setEditingSection] =
        useState<Section | null>(null);


    // --------------------------------------------------------
    // Form States
    // --------------------------------------------------------

    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [semester, setSemester] = useState("");
    const [academicYear, setAcademicYear] = useState("");


    // --------------------------------------------------------
    // UI States
    // --------------------------------------------------------

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");


    // ========================================================
    // ===== SECTION 4: INITIAL ADMIN CHECK ====================
    // ========================================================

    useEffect(() => {
        checkAdmin();
    }, []);


    // ========================================================
    // ===== SECTION 5: ADMIN AUTHENTICATION ====================
    // ========================================================

    async function checkAdmin() {

        setLoading(true);
        setError("");


        // ----------------------------------------------------
        // Get logged-in user
        // ----------------------------------------------------

        const {
            data: { user },
        } = await supabase.auth.getUser();


        // ----------------------------------------------------
        // If user is not logged in
        // ----------------------------------------------------

        if (!user) {
            window.location.href = "/login";
            return;
        }


        // ----------------------------------------------------
        // Get user's profile and role
        // ----------------------------------------------------

        const { data: profile, error: profileError } =
            await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();


        // ----------------------------------------------------
        // Check admin permission
        // ----------------------------------------------------

        if (
            profileError ||
            profile?.role !== "admin"
        ) {

            setError(
                "You do not have administrator access."
            );

            setLoading(false);

            return;
        }


        // ----------------------------------------------------
        // Load sections after admin verification
        // ----------------------------------------------------

        await loadSections();
    }


    // ========================================================
    // ===== SECTION 6: LOAD SECTIONS ==========================
    // ========================================================

    async function loadSections() {

        setLoading(true);


        const { data, error } = await supabase
            .from("sections")
            .select("*")
            .order("name", {
                ascending: true,
            });


        // ----------------------------------------------------
        // Handle database error
        // ----------------------------------------------------

        if (error) {

            console.error(error);

            setError(error.message);

        } else {

            setSections(data || []);
        }


        setLoading(false);
    }


    // ========================================================
    // ===== SECTION 7: CREATE SECTION MODAL ===================
    // ========================================================

    function openCreateModal() {

        setEditingSection(null);

        setName("");
        setCode("");
        setSemester("");
        setAcademicYear("");

        setMessage("");
        setError("");

        setShowModal(true);
    }


    // ========================================================
    // ===== SECTION 8: EDIT SECTION MODAL =====================
    // ========================================================

    function openEditModal(section: Section) {

        setEditingSection(section);

        setName(section.name);
        setCode(section.code);
        setSemester(section.semester || "");
        setAcademicYear(section.academic_year || "");

        setMessage("");
        setError("");

        setShowModal(true);
    }


    // ========================================================
    // ===== SECTION 9: SAVE / UPDATE SECTION ==================
    // ========================================================

    async function saveSection(
        e: React.FormEvent
    ) {

        e.preventDefault();

        setSaving(true);
        setMessage("");
        setError("");


        // ----------------------------------------------------
        // Required field validation
        // ----------------------------------------------------

        if (
            !name.trim() ||
            !code.trim()
        ) {

            setError(
                "Section name and code are required."
            );

            setSaving(false);

            return;
        }


        // ====================================================
        // UPDATE EXISTING SECTION
        // ====================================================

        if (editingSection) {

            const { error } = await supabase
                .from("sections")
                .update({
                    name: name.trim(),
                    code: code.trim().toUpperCase(),
                    semester:
                        semester.trim() || null,
                    academic_year:
                        academicYear.trim() || null,
                })
                .eq(
                    "id",
                    editingSection.id
                );


            if (error) {

                setError(error.message);

            } else {

                setMessage(
                    "Section updated successfully."
                );

                setShowModal(false);

                await loadSections();
            }


            // ====================================================
            // CREATE NEW SECTION
            // ====================================================

        } else {

            const { error } = await supabase
                .from("sections")
                .insert({
                    name: name.trim(),
                    code: code.trim().toUpperCase(),
                    semester:
                        semester.trim() || null,
                    academic_year:
                        academicYear.trim() || null,
                    is_active: true,
                });


            if (error) {

                setError(error.message);

            } else {

                setMessage(
                    "Section created successfully."
                );

                setShowModal(false);

                await loadSections();
            }
        }


        setSaving(false);
    }


    // ========================================================
    // ===== SECTION 10: DELETE SECTION ========================
    // ========================================================

    async function deleteSection(
        section: Section
    ) {

        const confirmed = window.confirm(
            `Delete "${section.name}"?\n\nThis should only be done if the section has no dependent academic data.`
        );


        if (!confirmed) return;


        setError("");
        setMessage("");


        const { error } = await supabase
            .from("sections")
            .delete()
            .eq("id", section.id);


        if (error) {

            setError(error.message);

            return;
        }


        setMessage(
            "Section deleted successfully."
        );

        await loadSections();
    }


    // ========================================================
    // ===== SECTION 11: LOADING SCREEN ========================
    // ========================================================

    if (loading) {

        return (

            <main className="min-h-screen bg-[#050505] text-white">

                <div className="flex min-h-screen items-center justify-center">

                    <div className="text-center">

                        <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />

                        <p className="text-gray-400">
                            Loading Admin Panel...
                        </p>

                    </div>

                </div>

            </main>
        );
    }


    // ========================================================
    // ===== SECTION 12: ACCESS DENIED SCREEN =================
    // ========================================================

    if (
        error ===
        "You do not have administrator access."
    ) {

        return (

            <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-white">

                <div className="w-full max-w-md rounded-3xl border border-red-400/20 bg-red-400/[0.04] p-8 text-center">

                    <ShieldCheck className="mx-auto h-12 w-12 text-red-400" />


                    <h1 className="mt-5 text-2xl font-bold">
                        Access Denied
                    </h1>


                    <p className="mt-3 text-gray-400">
                        You do not have administrator permission
                        to access this page.
                    </p>


                    <Link
                        href="/dashboard"
                        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-black"
                    >

                        <ArrowLeft className="h-4 w-4" />

                        Back to Dashboard

                    </Link>

                </div>

            </main>
        );
    }


    // ========================================================
    // ===== SECTION 13: MAIN ADMIN UI =========================
    // ========================================================

    return (

        <main className="min-h-screen bg-[#050505] text-white">


            {/* =================================================
                SECTION 13.1: BACKGROUND GLOW
            ================================================= */}

            <div className="pointer-events-none fixed inset-0 overflow-hidden">

                <div className="absolute left-[-200px] top-[-200px] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />

                <div className="absolute bottom-[-200px] right-[-200px] h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[140px]" />

            </div>


            <div className="relative mx-auto max-w-7xl px-6 py-8">


                {/* =================================================
                    SECTION 13.2: ADMIN HEADER
                ================================================= */}

                <header className="mb-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">


                    {/* ---------------------------------------------
                        Admin Title
                    --------------------------------------------- */}

                    <div>

                        <Link
                            href="/dashboard"
                            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-white"
                        >

                            <ArrowLeft className="h-4 w-4" />

                            Dashboard

                        </Link>


                        <div className="flex items-center gap-3">

                            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3">

                                <ShieldCheck className="h-7 w-7 text-cyan-400" />

                            </div>


                            <div>

                                <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
                                    CampusSync
                                </p>


                                <h1 className="mt-1 text-4xl font-bold">
                                    Admin Panel
                                </h1>

                            </div>

                        </div>


                        <p className="mt-4 text-gray-400">
                            Manage academic sections and platform structure.
                        </p>

                    </div>


                    {/* =================================================
                        SECTION 13.3: ADMIN ACTION BUTTONS

                        IMPORTANT:
                        Course Management button is added here.
                        Later if we need another admin module,
                        we can add it in this same section.
                    ================================================= */}

                    <div className="flex flex-wrap gap-3">


                        {/* ---------------------------------------------
                            COURSE MANAGEMENT BUTTON
                        --------------------------------------------- */}

                        <Link
                            href="/admin/courses"
                            className="inline-flex items-center gap-2 rounded-xl border border-purple-400/20 bg-purple-400/10 px-5 py-3 text-sm font-bold text-purple-300 transition hover:bg-purple-400/20"
                        >

                            <BookOpen className="h-4 w-4" />

                            Courses

                        </Link>
                        <Link
                            href="/admin/students"
                            className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-bold text-cyan-300 transition hover:bg-cyan-400/20"
                        >
                            <Users className="h-4 w-4" />
                            Students
                        </Link>


                        {/* ---------------------------------------------
                            REFRESH SECTIONS
                        --------------------------------------------- */}

                        <button
                            onClick={loadSections}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/[0.08] hover:text-white"
                        >

                            <RefreshCw className="h-4 w-4" />

                            Refresh

                        </button>


                        {/* ---------------------------------------------
                            ADD SECTION
                        --------------------------------------------- */}

                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-cyan-300"
                        >

                            <Plus className="h-4 w-4" />

                            Add Section

                        </button>

                    </div>

                </header>


                {/* =================================================
                    SECTION 14: SUCCESS / ERROR MESSAGES
                ================================================= */}

                {message && (

                    <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-4 text-sm text-emerald-300">

                        {message}

                    </div>
                )}


                {error &&
                    error !==
                    "You do not have administrator access." && (

                        <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-300">

                            {error}

                        </div>
                    )}


                {/* =================================================
                    SECTION 15: ADMIN STATISTICS
                ================================================= */}

                <section className="mb-8 grid gap-5 md:grid-cols-3">


                    {/* ---------------------------------------------
                        TOTAL SECTIONS
                    --------------------------------------------- */}

                    <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.05] p-6">

                        <Users className="h-6 w-6 text-cyan-400" />


                        <p className="mt-5 text-sm text-gray-500">
                            TOTAL SECTIONS
                        </p>


                        <p className="mt-2 text-4xl font-bold">
                            {sections.length}
                        </p>

                    </div>


                    {/* ---------------------------------------------
                        ACTIVE SECTIONS
                    --------------------------------------------- */}

                    <div className="rounded-3xl border border-purple-400/20 bg-purple-400/[0.05] p-6">

                        <BookOpen className="h-6 w-6 text-purple-400" />


                        <p className="mt-5 text-sm text-gray-500">
                            ACTIVE SECTIONS
                        </p>


                        <p className="mt-2 text-4xl font-bold">

                            {
                                sections.filter(
                                    (section) =>
                                        section.is_active
                                ).length
                            }

                        </p>

                    </div>


                    {/* ---------------------------------------------
                        SYSTEM STATUS
                    --------------------------------------------- */}

                    <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.05] p-6">

                        <ShieldCheck className="h-6 w-6 text-emerald-400" />


                        <p className="mt-5 text-sm text-gray-500">
                            SYSTEM STATUS
                        </p>


                        <p className="mt-2 text-xl font-bold text-emerald-400">
                            Protected
                        </p>

                    </div>

                </section>


                {/* =================================================
                    SECTION 16: SECTION MANAGEMENT
                ================================================= */}

                <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">


                    {/* ---------------------------------------------
                        Section Header
                    --------------------------------------------- */}

                    <div className="mb-7">

                        <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
                            Academic Structure
                        </p>


                        <h2 className="mt-2 text-2xl font-bold">
                            Sections
                        </h2>


                        <p className="mt-2 text-sm text-gray-500">
                            Create and manage university academic sections.
                        </p>

                    </div>


                    {/* =================================================
                        SECTION 17: EMPTY SECTION STATE
                    ================================================= */}

                    {sections.length === 0 ? (

                        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">

                            <Users className="mx-auto h-10 w-10 text-gray-700" />


                            <h3 className="mt-5 text-lg font-semibold">
                                No sections yet
                            </h3>


                            <p className="mt-2 text-sm text-gray-500">
                                Create your first academic section.
                            </p>


                            <button
                                onClick={openCreateModal}
                                className="mt-6 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-black"
                            >
                                Create First Section
                            </button>

                        </div>


                    ) : (


                        /* =================================================
                            SECTION 18: SECTION CARD LIST
                        ================================================= */

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">


                            {sections.map(
                                (section) => (

                                    <div
                                        key={section.id}
                                        className="group rounded-2xl border border-white/10 bg-black/30 p-5 transition hover:border-cyan-400/20 hover:bg-white/[0.04]"
                                    >


                                        {/* ---------------------------------
                                            Section Card Header
                                        --------------------------------- */}

                                        <div className="flex items-start justify-between">


                                            <div>

                                                <div className="flex items-center gap-2">

                                                    <h3 className="text-xl font-bold">
                                                        {section.name}
                                                    </h3>


                                                    {section.is_active && (

                                                        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[10px] uppercase tracking-wider text-emerald-400">

                                                            Active

                                                        </span>
                                                    )}

                                                </div>


                                                <p className="mt-2 text-sm font-medium text-cyan-400">
                                                    {section.code}
                                                </p>

                                            </div>


                                            <div className="rounded-xl bg-white/[0.05] p-2">

                                                <Users className="h-5 w-5 text-gray-500" />

                                            </div>

                                        </div>


                                        {/* ---------------------------------
                                            Section Information
                                        --------------------------------- */}

                                        <div className="mt-6 space-y-2 text-sm">


                                            {section.semester && (

                                                <div className="flex justify-between">

                                                    <span className="text-gray-600">
                                                        Semester
                                                    </span>


                                                    <span className="text-gray-300">
                                                        {section.semester}
                                                    </span>

                                                </div>
                                            )}


                                            {section.academic_year && (

                                                <div className="flex justify-between">

                                                    <span className="text-gray-600">
                                                        Academic Year
                                                    </span>


                                                    <span className="text-gray-300">
                                                        {section.academic_year}
                                                    </span>

                                                </div>
                                            )}

                                        </div>


                                        {/* ---------------------------------
                                            Section Actions
                                        --------------------------------- */}

                                        <div className="mt-6 flex gap-2">


                                            {/* Edit */}

                                            <button
                                                onClick={() =>
                                                    openEditModal(section)
                                                }
                                                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-gray-300 transition hover:bg-white/[0.08] hover:text-white"
                                            >

                                                <Pencil className="h-4 w-4" />

                                                Edit

                                            </button>


                                            {/* Delete */}

                                            <button
                                                onClick={() =>
                                                    deleteSection(section)
                                                }
                                                className="rounded-xl border border-red-400/10 bg-red-400/[0.05] px-3 py-2.5 text-red-400 transition hover:bg-red-400/10"
                                            >

                                                <Trash2 className="h-4 w-4" />

                                            </button>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>

            </div>


            {/* =================================================
                SECTION 19: CREATE / EDIT SECTION MODAL
            ================================================= */}

            {showModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm">


                    <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b0b0b] p-7 shadow-2xl">


                        {/* -----------------------------------------
                            Modal Header
                        ----------------------------------------- */}

                        <div className="mb-7">

                            <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">

                                {editingSection
                                    ? "Edit Section"
                                    : "New Section"}

                            </p>


                            <h2 className="mt-2 text-2xl font-bold">

                                {editingSection
                                    ? "Update academic section"
                                    : "Create academic section"}

                            </h2>

                        </div>


                        {/* -----------------------------------------
                            Section Form
                        ----------------------------------------- */}

                        <form
                            onSubmit={saveSection}
                            className="space-y-5"
                        >


                            {/* =====================================
                                SECTION 19.1: NAME
                            ===================================== */}

                            <div>

                                <label className="mb-2 block text-sm text-gray-300">
                                    Section Name
                                </label>


                                <input
                                    value={name}
                                    onChange={(e) =>
                                        setName(e.target.value)
                                    }
                                    placeholder="Section 3D"
                                    required
                                    className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3.5 text-white outline-none transition placeholder:text-gray-700 focus:border-cyan-400/50"
                                />

                            </div>


                            {/* =====================================
                                SECTION 19.2: CODE
                            ===================================== */}

                            <div>

                                <label className="mb-2 block text-sm text-gray-300">
                                    Section Code
                                </label>


                                <input
                                    value={code}
                                    onChange={(e) =>
                                        setCode(e.target.value)
                                    }
                                    placeholder="CSE-3D"
                                    required
                                    className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3.5 text-white uppercase outline-none transition placeholder:text-gray-700 focus:border-cyan-400/50"
                                />

                            </div>


                            {/* =====================================
                                SECTION 19.3: SEMESTER
                            ===================================== */}

                            <div>

                                <label className="mb-2 block text-sm text-gray-300">
                                    Semester
                                </label>


                                <input
                                    value={semester}
                                    onChange={(e) =>
                                        setSemester(e.target.value)
                                    }
                                    placeholder="6th Semester"
                                    className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3.5 text-white outline-none transition placeholder:text-gray-700 focus:border-cyan-400/50"
                                />

                            </div>


                            {/* =====================================
                                SECTION 19.4: ACADEMIC YEAR
                            ===================================== */}

                            <div>

                                <label className="mb-2 block text-sm text-gray-300">
                                    Academic Year
                                </label>


                                <input
                                    value={academicYear}
                                    onChange={(e) =>
                                        setAcademicYear(e.target.value)
                                    }
                                    placeholder="2026-2027"
                                    className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3.5 text-white outline-none transition placeholder:text-gray-700 focus:border-cyan-400/50"
                                />

                            </div>


                            {/* =====================================
                                SECTION 19.5: FORM ERROR
                            ===================================== */}

                            {error && (

                                <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">

                                    {error}

                                </div>

                            )}


                            {/* =====================================
                                SECTION 19.6: MODAL BUTTONS
                            ===================================== */}

                            <div className="flex gap-3 pt-2">


                                {/* Cancel */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowModal(false)
                                    }
                                    className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3.5 font-medium text-gray-300 transition hover:bg-white/[0.08]"
                                >
                                    Cancel
                                </button>


                                {/* Save */}

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 rounded-xl bg-cyan-400 px-5 py-3.5 font-bold text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                    {saving
                                        ? "Saving..."
                                        : editingSection
                                            ? "Update Section"
                                            : "Create Section"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </main>
    );
}