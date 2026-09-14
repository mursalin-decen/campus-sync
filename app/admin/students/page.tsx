"use client";

// ========================================================
// CAMPUSSYNC
// ADMIN → STUDENT MANAGEMENT
// ========================================================
//
// Features:
// 1. Admin authentication
// 2. Load students
// 3. Load sections
// 4. Search students
// 5. Filter by section
// 6. Assign section
// 7. Change section
// 8. Remove section
// 9. Refresh data
//
// ========================================================



// ========================================================
// SECTION 1: IMPORTS
// ========================================================

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
    ArrowLeft,
    BookOpen,
    Check,
    ChevronDown,
    RefreshCw,
    Search,
    ShieldCheck,
    Users,
    X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";



// ========================================================
// SECTION 2: TYPES
// ========================================================

type Student = {
    id: string;
    full_name: string | null;
    student_id: string | null;
    email: string | null;
    role: string | null;
    section_id: string | null;
    created_at: string | null;

    section?: {
        id: string;
        name: string;
        code: string;
    } | null;
};


type Section = {
    id: string;
    name: string;
    code: string;
    semester: string | null;
    academic_year: string | null;
    is_active: boolean;
};



// ========================================================
// SECTION 3: SUPABASE CLIENT
// ========================================================

const supabase = createClient();



// ========================================================
// SECTION 4: ADMIN PAGE
// ========================================================

export default function StudentsAdminPage() {

    // ------------------------------------------------------
    // STUDENT DATA
    // ------------------------------------------------------

    const [students, setStudents] = useState<Student[]>([]);


    // ------------------------------------------------------
    // SECTION DATA
    // ------------------------------------------------------

    const [sections, setSections] = useState<Section[]>([]);


    // ------------------------------------------------------
    // LOADING
    // ------------------------------------------------------

    const [loading, setLoading] = useState(true);


    // ------------------------------------------------------
    // ADMIN ACCESS
    // ------------------------------------------------------

    const [isAdmin, setIsAdmin] = useState(false);


    // ------------------------------------------------------
    // SEARCH
    // ------------------------------------------------------

    const [search, setSearch] = useState("");


    // ------------------------------------------------------
    // SECTION FILTER
    // ------------------------------------------------------

    const [sectionFilter, setSectionFilter] = useState("all");


    // ------------------------------------------------------
    // ASSIGN MODAL
    // ------------------------------------------------------

    const [showAssignModal, setShowAssignModal] = useState(false);

    const [selectedStudent, setSelectedStudent] =
        useState<Student | null>(null);

    const [selectedSectionId, setSelectedSectionId] =
        useState("");


    // ------------------------------------------------------
    // ACTION LOADING
    // ------------------------------------------------------

    const [saving, setSaving] = useState(false);


    // ------------------------------------------------------
    // MESSAGE
    // ------------------------------------------------------

    const [message, setMessage] = useState("");

    const [error, setError] = useState("");



    // ======================================================
    // SECTION 5: INITIAL ADMIN CHECK
    // ======================================================

    useEffect(() => {
        checkAdmin();
    }, []);



    // ======================================================
    // SECTION 6: ADMIN AUTHENTICATION
    // ======================================================

    async function checkAdmin() {

        setLoading(true);

        const {
            data: { user },
        } = await supabase.auth.getUser();


        if (!user) {

            setIsAdmin(false);

            setLoading(false);

            return;
        }


        const { data: profile, error } =
            await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();


        if (error || profile?.role !== "admin") {

            setIsAdmin(false);

            setLoading(false);

            return;
        }


        setIsAdmin(true);

        await loadData();

        setLoading(false);
    }



    // ======================================================
    // SECTION 7: LOAD ALL DATA
    // ======================================================

    async function loadData() {

        setError("");

        try {

            // --------------------------------------------------
            // LOAD STUDENTS
            // --------------------------------------------------

            const {
                data: studentData,
                error: studentError,
            } = await supabase
                .from("profiles")
                .select(`
          id,
          full_name,
          student_id,
          email,
          role,
          section_id,
          created_at
        `)
                .eq("role", "student")
                .order("created_at", {
                    ascending: false,
                });


            if (studentError) {
                throw studentError;
            }



            // --------------------------------------------------
            // LOAD SECTIONS
            // --------------------------------------------------

            const {
                data: sectionData,
                error: sectionError,
            } = await supabase
                .from("sections")
                .select(`
          id,
          name,
          code,
          semester,
          academic_year,
          is_active
        `)
                .order("name", {
                    ascending: true,
                });


            if (sectionError) {
                throw sectionError;
            }



            // --------------------------------------------------
            // CREATE SECTION MAP
            // --------------------------------------------------

            const sectionMap = new Map(
                (sectionData || []).map((section) => [
                    section.id,
                    section,
                ])
            );


            // --------------------------------------------------
            // CONNECT STUDENTS WITH SECTIONS
            // --------------------------------------------------

            const formattedStudents =
                (studentData || []).map((student) => {

                    const section =
                        student.section_id
                            ? sectionMap.get(student.section_id)
                            : undefined;


                    return {
                        ...student,

                        section: section
                            ? {
                                id: section.id,
                                name: section.name,
                                code: section.code,
                            }
                            : null,
                    };

                });



            setStudents(formattedStudents);

            setSections(sectionData || []);

        } catch (err: any) {

            console.error(err);

            setError(
                err?.message ||
                "Failed to load student data."
            );
        }
    }



    // ======================================================
    // SECTION 8: OPEN ASSIGN MODAL
    // ======================================================

    function openAssignModal(student: Student) {

        setSelectedStudent(student);

        setSelectedSectionId(
            student.section_id || ""
        );

        setMessage("");

        setError("");

        setShowAssignModal(true);
    }



    // ======================================================
    // SECTION 9: CLOSE ASSIGN MODAL
    // ======================================================

    function closeAssignModal() {

        if (saving) return;

        setShowAssignModal(false);

        setSelectedStudent(null);

        setSelectedSectionId("");
    }



    // ======================================================
    // SECTION 10: ASSIGN / CHANGE SECTION
    // ======================================================

    async function assignSection() {

        if (!selectedStudent) return;


        setSaving(true);

        setMessage("");

        setError("");


        try {

            const {
                error: updateError,
            } = await supabase
                .from("profiles")
                .update({
                    section_id:
                        selectedSectionId || null,
                })
                .eq("id", selectedStudent.id);


            if (updateError) {
                throw updateError;
            }



            // --------------------------------------------------
            // SUCCESS
            // --------------------------------------------------

            setMessage(
                selectedSectionId
                    ? "Section assigned successfully."
                    : "Section removed successfully."
            );


            // --------------------------------------------------
            // CLOSE MODAL
            // --------------------------------------------------

            setShowAssignModal(false);

            setSelectedStudent(null);

            setSelectedSectionId("");


            // --------------------------------------------------
            // REFRESH
            // --------------------------------------------------

            await loadData();

        } catch (err: any) {

            console.error(err);

            setError(
                err?.message ||
                "Failed to assign section."
            );

        } finally {

            setSaving(false);

        }
    }



    // ======================================================
    // SECTION 11: SEARCH + FILTER
    // ======================================================

    const filteredStudents = useMemo(() => {

        const searchValue =
            search.trim().toLowerCase();


        return students.filter((student) => {

            // --------------------------------------------------
            // SEARCH MATCH
            // --------------------------------------------------

            const matchesSearch =
                !searchValue ||
                (student.full_name || "")
                    .toLowerCase()
                    .includes(searchValue) ||
                (student.student_id || "")
                    .toLowerCase()
                    .includes(searchValue) ||
                (student.email || "")
                    .toLowerCase()
                    .includes(searchValue);



            // --------------------------------------------------
            // SECTION MATCH
            // --------------------------------------------------

            const matchesSection =
                sectionFilter === "all" ||
                student.section_id === sectionFilter;



            return (
                matchesSearch &&
                matchesSection
            );

        });

    }, [
        students,
        search,
        sectionFilter,
    ]);



    // ======================================================
    // SECTION 12: STATISTICS
    // ======================================================

    const totalStudents =
        students.length;


    const assignedStudents =
        students.filter(
            (student) => student.section_id
        ).length;


    const unassignedStudents =
        students.filter(
            (student) => !student.section_id
        ).length;



    // ======================================================
    // SECTION 13: LOADING SCREEN
    // ======================================================

    if (loading) {

        return (
            <main className="min-h-screen bg-black text-white">

                <div className="flex min-h-screen items-center justify-center">

                    <div className="text-center">

                        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-400" />

                        <p className="text-sm text-white/50">
                            Loading Student Management...
                        </p>

                    </div>

                </div>

            </main>
        );
    }



    // ======================================================
    // SECTION 14: ACCESS DENIED
    // ======================================================

    if (!isAdmin) {

        return (
            <main className="min-h-screen bg-black text-white">

                <div className="flex min-h-screen items-center justify-center px-6">

                    <div className="w-full max-w-md rounded-3xl border border-red-400/20 bg-white/[0.03] p-8 text-center">

                        <ShieldCheck className="mx-auto mb-5 h-12 w-12 text-red-400" />

                        <h1 className="text-2xl font-black">
                            Access Denied
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-white/50">
                            Only CampusSync administrators can access
                            Student Management.
                        </p>

                        <Link
                            href="/dashboard"
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-black"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Link>

                    </div>

                </div>

            </main>
        );
    }



    // ======================================================
    // SECTION 15: MAIN ADMIN UI
    // ======================================================

    return (

        <main className="min-h-screen bg-black text-white">

            {/* ==================================================
          BACKGROUND EFFECT
      ================================================== */}

            <div className="pointer-events-none fixed inset-0 overflow-hidden">

                <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[140px]" />

                <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-[140px]" />

            </div>



            {/* ==================================================
          PAGE CONTAINER
      ================================================== */}

            <div className="relative mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">



                {/* =================================================
            SECTION 15.1: HEADER
        ================================================= */}

                <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    <div>

                        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">

                            <Users className="h-4 w-4" />

                            CampusSync Admin

                        </div>


                        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">

                            Student Management

                        </h1>


                        <p className="mt-2 max-w-2xl text-sm text-white/45">

                            Manage registered students and assign them
                            to their academic sections.

                        </p>

                    </div>



                    {/* =================================================
              ADMIN ACTIONS
          ================================================= */}

                    <div className="flex flex-wrap gap-3">

                        <Link
                            href="/admin"
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white/70 transition hover:bg-white/[0.08] hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />

                            Sections

                        </Link>


                        <Link
                            href="/admin/courses"
                            className="inline-flex items-center gap-2 rounded-xl border border-purple-400/20 bg-purple-400/10 px-4 py-3 text-sm font-bold text-purple-300 transition hover:bg-purple-400/20"
                        >
                            <BookOpen className="h-4 w-4" />

                            Courses

                        </Link>


                        <button
                            onClick={loadData}
                            className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-bold text-cyan-300 transition hover:bg-cyan-400/20"
                        >
                            <RefreshCw className="h-4 w-4" />

                            Refresh

                        </button>

                    </div>

                </header>



                {/* =================================================
            SECTION 16: SUCCESS / ERROR MESSAGES
        ================================================= */}

                {message && (

                    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-4 text-sm font-semibold text-emerald-300">

                        <Check className="h-5 w-5" />

                        {message}

                    </div>

                )}


                {error && (

                    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm font-semibold text-red-300">

                        <X className="h-5 w-5" />

                        {error}

                    </div>

                )}



                {/* =================================================
            SECTION 17: STATISTICS
        ================================================= */}

                <div className="mb-8 grid gap-4 sm:grid-cols-3">

                    {/* TOTAL */}

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

                        <p className="text-xs font-bold uppercase tracking-widest text-white/35">
                            Total Students
                        </p>

                        <p className="mt-3 text-3xl font-black">
                            {totalStudents}
                        </p>

                    </div>



                    {/* ASSIGNED */}

                    <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.04] p-5">

                        <p className="text-xs font-bold uppercase tracking-widest text-cyan-300/60">
                            Assigned
                        </p>

                        <p className="mt-3 text-3xl font-black text-cyan-300">
                            {assignedStudents}
                        </p>

                    </div>



                    {/* UNASSIGNED */}

                    <div className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] p-5">

                        <p className="text-xs font-bold uppercase tracking-widest text-amber-300/60">
                            Unassigned
                        </p>

                        <p className="mt-3 text-3xl font-black text-amber-300">
                            {unassignedStudents}
                        </p>

                    </div>

                </div>



                {/* =================================================
            SECTION 18: SEARCH + FILTER
        ================================================= */}

                <div className="mb-6 grid gap-3 md:grid-cols-[1fr_240px]">

                    {/* SEARCH */}

                    <div className="relative">

                        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />

                        <input
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search by name, student ID or email..."
                            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-4 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan-400/40"
                        />

                    </div>



                    {/* SECTION FILTER */}

                    <div className="relative">

                        <select
                            value={sectionFilter}
                            onChange={(event) =>
                                setSectionFilter(event.target.value)
                            }
                            className="w-full appearance-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm font-semibold text-white outline-none focus:border-cyan-400/40"
                        >

                            <option
                                value="all"
                                className="bg-black"
                            >
                                All Sections
                            </option>


                            {sections.map((section) => (

                                <option
                                    key={section.id}
                                    value={section.id}
                                    className="bg-black"
                                >
                                    {section.code} — {section.name}
                                </option>

                            ))}

                        </select>


                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

                    </div>

                </div>



                {/* =================================================
            SECTION 19: STUDENT TABLE
        ================================================= */}

                <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">

                    {/* TABLE HEADER */}

                    <div className="hidden grid-cols-[1.4fr_1fr_1.3fr_1fr_auto] gap-4 border-b border-white/10 px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-white/30 md:grid">

                        <div>Student</div>

                        <div>Student ID</div>

                        <div>Email</div>

                        <div>Section</div>

                        <div>Action</div>

                    </div>



                    {/* STUDENT LIST */}

                    {filteredStudents.length === 0 ? (

                        <div className="px-6 py-16 text-center">

                            <Users className="mx-auto mb-4 h-10 w-10 text-white/15" />

                            <h3 className="text-lg font-bold">
                                No students found
                            </h3>

                            <p className="mt-2 text-sm text-white/35">
                                Try changing your search or section filter.
                            </p>

                        </div>

                    ) : (

                        <div className="divide-y divide-white/5">

                            {filteredStudents.map((student) => (

                                <div
                                    key={student.id}
                                    className="grid gap-4 px-6 py-5 transition hover:bg-white/[0.025] md:grid-cols-[1.4fr_1fr_1.3fr_1fr_auto] md:items-center"
                                >

                                    {/* STUDENT */}

                                    <div>

                                        <p className="font-bold text-white">
                                            {student.full_name ||
                                                "Unnamed Student"}
                                        </p>

                                        <p className="mt-1 text-xs text-white/30">
                                            {student.role || "student"}
                                        </p>

                                    </div>



                                    {/* STUDENT ID */}

                                    <div className="text-sm text-white/60">

                                        {student.student_id || (
                                            <span className="text-white/20">
                                                Not provided
                                            </span>
                                        )}

                                    </div>



                                    {/* EMAIL */}

                                    <div className="break-all text-sm text-white/50">

                                        {student.email || "No email"}

                                    </div>



                                    {/* SECTION */}

                                    <div>

                                        {student.section ? (

                                            <div className="inline-flex flex-col rounded-xl border border-cyan-400/15 bg-cyan-400/[0.06] px-3 py-2">

                                                <span className="text-sm font-black text-cyan-300">
                                                    {student.section.code}
                                                </span>

                                                <span className="text-[10px] text-white/35">
                                                    {student.section.name}
                                                </span>

                                            </div>

                                        ) : (

                                            <span className="inline-flex rounded-xl border border-amber-400/15 bg-amber-400/[0.06] px-3 py-2 text-xs font-bold text-amber-300">
                                                Unassigned
                                            </span>

                                        )}

                                    </div>



                                    {/* ACTION */}

                                    <div>

                                        <button
                                            onClick={() =>
                                                openAssignModal(student)
                                            }
                                            className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2.5 text-xs font-bold text-cyan-300 transition hover:bg-cyan-400/20"
                                        >

                                            <Users className="h-4 w-4" />

                                            {student.section_id
                                                ? "Change"
                                                : "Assign"}

                                        </button>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </div>



                {/* =================================================
            SECTION 20: RESULT COUNT
        ================================================= */}

                <div className="mt-4 text-xs text-white/25">

                    Showing {filteredStudents.length} of{" "}
                    {students.length} students

                </div>

            </div>



            {/* ==================================================
          SECTION 21: ASSIGN SECTION MODAL
      ================================================== */}

            {showAssignModal && selectedStudent && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-5 backdrop-blur-md">

                    <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#080808] p-6 shadow-2xl sm:p-8">

                        {/* MODAL HEADER */}

                        <div className="mb-7 flex items-start justify-between">

                            <div>

                                <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                                    Section Assignment
                                </p>

                                <h2 className="mt-2 text-2xl font-black">
                                    Assign Student
                                </h2>

                            </div>


                            <button
                                onClick={closeAssignModal}
                                className="rounded-xl border border-white/10 p-2 text-white/40 transition hover:bg-white/5 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>

                        </div>



                        {/* STUDENT INFO */}

                        <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">

                            <p className="font-bold">
                                {selectedStudent.full_name ||
                                    "Unnamed Student"}
                            </p>

                            <p className="mt-1 text-sm text-white/40">
                                {selectedStudent.student_id ||
                                    selectedStudent.email ||
                                    "No student information"}
                            </p>

                        </div>



                        {/* SECTION SELECT */}

                        <div>

                            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/40">
                                Select Section
                            </label>

                            <div className="relative">

                                <select
                                    value={selectedSectionId}
                                    onChange={(event) =>
                                        setSelectedSectionId(
                                            event.target.value
                                        )
                                    }
                                    className="w-full appearance-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 pr-12 text-sm font-semibold text-white outline-none focus:border-cyan-400/40"
                                >

                                    <option
                                        value=""
                                        className="bg-black"
                                    >
                                        — Unassigned —
                                    </option>


                                    {sections
                                        .filter(
                                            (section) =>
                                                section.is_active
                                        )
                                        .map((section) => (

                                            <option
                                                key={section.id}
                                                value={section.id}
                                                className="bg-black"
                                            >
                                                {section.code} —{" "}
                                                {section.name}
                                            </option>

                                        ))}

                                </select>


                                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

                            </div>

                        </div>



                        {/* MODAL ERROR */}

                        {error && (

                            <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                                {error}
                            </div>

                        )}



                        {/* MODAL BUTTONS */}

                        <div className="mt-7 flex gap-3">

                            <button
                                onClick={closeAssignModal}
                                disabled={saving}
                                className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white/60 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
                            >
                                Cancel
                            </button>


                            <button
                                onClick={assignSection}
                                disabled={saving}
                                className="flex-1 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-black text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                {saving
                                    ? "Saving..."
                                    : "Save Section"}

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </main>
    );
}