"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  ArrowLeft,
  RefreshCw,
  Layers3,
} from "lucide-react";

type Course = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  credit: number | null;
  created_at: string;
};

type Section = {
  id: string;
  name: string;
  code: string;
};

type SectionCourse = {
  id: string;
  section_id: string;
  course_id: string;
  teacher_name: string | null;
  is_active: boolean;
};

export default function CoursesPage() {
  const supabase = createClient();

  const [courses, setCourses] = useState<Course[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionCourses, setSectionCourses] = useState<SectionCourse[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [credit, setCredit] = useState("");

  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [teacherName, setTeacherName] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      setError("You do not have administrator access.");
      setLoading(false);
      return;
    }

    await Promise.all([
      loadCourses(),
      loadSections(),
      loadSectionCourses(),
    ]);

    setLoading(false);
  }

  async function loadCourses() {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("code", { ascending: true });

    if (error) {
      console.error(error);
      setError(error.message);
      return;
    }

    setCourses(data || []);
  }

  async function loadSections() {
    const { data, error } = await supabase
      .from("sections")
      .select("id, name, code")
      .order("name", { ascending: true });

    if (error) {
      console.error(error);
      setError(error.message);
      return;
    }

    setSections(data || []);
  }

  async function loadSectionCourses() {
    const { data, error } = await supabase
      .from("section_courses")
      .select("id, section_id, course_id, teacher_name, is_active");

    if (error) {
      console.error(error);
      setError(error.message);
      return;
    }

    setSectionCourses(data || []);
  }

  function openCreateModal() {
    setEditingCourse(null);

    setName("");
    setCode("");
    setDescription("");
    setCredit("");

    setMessage("");
    setError("");

    setShowModal(true);
  }

  function openEditModal(course: Course) {
    setEditingCourse(course);

    setName(course.name);
    setCode(course.code);
    setDescription(course.description || "");
    setCredit(
      course.credit !== null && course.credit !== undefined
        ? String(course.credit)
        : ""
    );

    setMessage("");
    setError("");

    setShowModal(true);
  }

  async function saveCourse(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    if (!name.trim() || !code.trim()) {
      setError("Course name and code are required.");
      setSaving(false);
      return;
    }

    const creditValue = credit.trim() ? Number(credit) : null;

    if (
      creditValue !== null &&
      (Number.isNaN(creditValue) || creditValue < 0)
    ) {
      setError("Credit must be a valid positive number.");
      setSaving(false);
      return;
    }

    if (editingCourse) {
      const { error } = await supabase
        .from("courses")
        .update({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          description: description.trim() || null,
          credit: creditValue,
        })
        .eq("id", editingCourse.id);

      if (error) {
        setError(error.message);
      } else {
        setMessage("Course updated successfully.");
        setShowModal(false);
        await loadCourses();
      }
    } else {
      const { error } = await supabase
        .from("courses")
        .insert({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          description: description.trim() || null,
          credit: creditValue,
        });

      if (error) {
        setError(error.message);
      } else {
        setMessage("Course created successfully.");
        setShowModal(false);
        await loadCourses();
      }
    }

    setSaving(false);
  }

  async function deleteCourse(course: Course) {
    const confirmed = window.confirm(
      `Delete "${course.code} - ${course.name}"?\n\nIf this course is already connected to a section, deletion may be blocked to protect academic records.`
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", course.id);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Course deleted successfully.");

    await Promise.all([
      loadCourses(),
      loadSectionCourses(),
    ]);
  }

  function openAssignModal(course: Course) {
    setSelectedCourse(course);
    setSelectedSectionId("");
    setTeacherName("");

    setMessage("");
    setError("");

    setShowAssignModal(true);
  }

  async function assignCourse(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedCourse || !selectedSectionId) {
      setError("Please select a section.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    const alreadyAssigned = sectionCourses.find(
      (item) =>
        item.course_id === selectedCourse.id &&
        item.section_id === selectedSectionId
    );

    if (alreadyAssigned) {
      setError("This course is already assigned to this section.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("section_courses")
      .insert({
        section_id: selectedSectionId,
        course_id: selectedCourse.id,
        teacher_name: teacherName.trim() || null,
        is_active: true,
      });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setMessage(
      `${selectedCourse.code} assigned to the selected section.`
    );

    setShowAssignModal(false);

    await loadSectionCourses();

    setSaving(false);
  }

  async function removeAssignment(item: SectionCourse) {
    const confirmed = window.confirm(
      "Remove this course from the section?"
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    const { error } = await supabase
      .from("section_courses")
      .delete()
      .eq("id", item.id);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Course assignment removed.");

    await loadSectionCourses();
  }

  function getSection(sectionId: string) {
    return sections.find((section) => section.id === sectionId);
  }

  function getCourseAssignments(courseId: string) {
    return sectionCourses.filter(
      (item) => item.course_id === courseId
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />

            <p className="text-gray-400">
              Loading Course Management...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error === "You do not have administrator access.") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-white">
        <div className="w-full max-w-md rounded-3xl border border-red-400/20 bg-red-400/[0.04] p-8 text-center">

          <BookOpen className="mx-auto h-12 w-12 text-red-400" />

          <h1 className="mt-5 text-2xl font-bold">
            Access Denied
          </h1>

          <p className="mt-3 text-gray-400">
            You do not have administrator permission to access this page.
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

  return (
    <main className="min-h-screen bg-[#050505] text-white">

      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-200px] top-[-200px] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute bottom-[-200px] right-[-200px] h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-8">

        {/* Header */}
        <header className="mb-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>

            <Link
              href="/admin"
              className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Admin Panel
            </Link>

            <div className="flex items-center gap-3">

              <div className="rounded-2xl border border-purple-400/20 bg-purple-400/10 p-3">
                <BookOpen className="h-7 w-7 text-purple-400" />
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
                  CampusSync
                </p>

                <h1 className="mt-1 text-4xl font-bold">
                  Course Management
                </h1>
              </div>

            </div>

            <p className="mt-4 text-gray-400">
              Create courses and connect them with academic sections.
            </p>

          </div>

          <div className="flex gap-3">

            <button
              onClick={() => {
                loadCourses();
                loadSections();
                loadSectionCourses();
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-cyan-300"
            >
              <Plus className="h-4 w-4" />
              Add Course
            </button>

          </div>

        </header>

        {/* Messages */}
        {message && (
          <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-4 text-sm text-emerald-300">
            {message}
          </div>
        )}

        {error && error !== "You do not have administrator access." && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Stats */}
        <section className="mb-8 grid gap-5 md:grid-cols-3">

          <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.05] p-6">
            <BookOpen className="h-6 w-6 text-cyan-400" />

            <p className="mt-5 text-sm text-gray-500">
              TOTAL COURSES
            </p>

            <p className="mt-2 text-4xl font-bold">
              {courses.length}
            </p>
          </div>

          <div className="rounded-3xl border border-purple-400/20 bg-purple-400/[0.05] p-6">
            <Layers3 className="h-6 w-6 text-purple-400" />

            <p className="mt-5 text-sm text-gray-500">
              SECTIONS
            </p>

            <p className="mt-2 text-4xl font-bold">
              {sections.length}
            </p>
          </div>

          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.05] p-6">
            <BookOpen className="h-6 w-6 text-emerald-400" />

            <p className="mt-5 text-sm text-gray-500">
              COURSE ASSIGNMENTS
            </p>

            <p className="mt-2 text-4xl font-bold">
              {sectionCourses.length}
            </p>
          </div>

        </section>

        {/* Course List */}
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">

          <div className="mb-7">
            <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
              Academic Structure
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Courses
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Manage the university course catalogue.
            </p>
          </div>

          {courses.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">

              <BookOpen className="mx-auto h-10 w-10 text-gray-700" />

              <h3 className="mt-5 text-lg font-semibold">
                No courses yet
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Create your first course.
              </p>

              <button
                onClick={openCreateModal}
                className="mt-6 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-black"
              >
                Create First Course
              </button>

            </div>

          ) : (

            <div className="grid gap-5 md:grid-cols-2">

              {courses.map((course) => {

                const assignments = getCourseAssignments(course.id);

                return (
                  <div
                    key={course.id}
                    className="rounded-2xl border border-white/10 bg-black/30 p-6 transition hover:border-cyan-400/20 hover:bg-white/[0.04]"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <div className="flex items-center gap-3">

                          <span className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-bold text-cyan-400">
                            {course.code}
                          </span>

                          {course.credit !== null && (
                            <span className="text-xs text-gray-600">
                              {course.credit} Credit
                            </span>
                          )}

                        </div>

                        <h3 className="mt-4 text-xl font-bold">
                          {course.name}
                        </h3>

                      </div>

                      <BookOpen className="h-5 w-5 text-gray-700" />

                    </div>

                    {course.description && (
                      <p className="mt-4 text-sm leading-6 text-gray-500">
                        {course.description}
                      </p>
                    )}

                    {/* Assigned Sections */}
                    <div className="mt-6">

                      <p className="text-xs uppercase tracking-wider text-gray-600">
                        Assigned Sections
                      </p>

                      {assignments.length === 0 ? (

                        <p className="mt-3 text-sm text-gray-600">
                          Not assigned to any section yet.
                        </p>

                      ) : (

                        <div className="mt-3 space-y-2">

                          {assignments.map((assignment) => {

                            const section = getSection(
                              assignment.section_id
                            );

                            return (
                              <div
                                key={assignment.id}
                                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3"
                              >

                                <div>
                                  <p className="text-sm font-medium text-gray-300">
                                    {section?.name || "Unknown Section"}
                                  </p>

                                  <p className="mt-1 text-xs text-gray-600">
                                    {section?.code || ""}
                                    {assignment.teacher_name
                                      ? ` • ${assignment.teacher_name}`
                                      : ""}
                                  </p>
                                </div>

                                <button
                                  onClick={() =>
                                    removeAssignment(assignment)
                                  }
                                  className="rounded-lg p-2 text-gray-600 transition hover:bg-red-400/10 hover:text-red-400"
                                  title="Remove assignment"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>

                              </div>
                            );
                          })}

                        </div>

                      )}

                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex gap-2">

                      <button
                        onClick={() => openEditModal(course)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-gray-300 transition hover:bg-white/[0.08] hover:text-white"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>

                      <button
                        onClick={() => openAssignModal(course)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-3 py-3 text-sm font-bold text-black transition hover:bg-cyan-300"
                      >
                        <Plus className="h-4 w-4" />
                        Assign Section
                      </button>

                      <button
                        onClick={() => deleteCourse(course)}
                        className="rounded-xl border border-red-400/10 bg-red-400/[0.05] px-3 py-3 text-red-400 transition hover:bg-red-400/10"
                        title="Delete course"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                    </div>

                  </div>
                );
              })}

            </div>

          )}

        </section>

      </div>

      {/* Create/Edit Course Modal */}
      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm">

          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b0b0b] p-7 shadow-2xl">

            <div className="mb-7">

              <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">
                {editingCourse ? "Edit Course" : "New Course"}
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                {editingCourse
                  ? "Update course"
                  : "Create academic course"}
              </h2>

            </div>

            <form
              onSubmit={saveCourse}
              className="space-y-5"
            >

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Course Name
                </label>

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Data Structures & Algorithms"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3.5 text-white outline-none placeholder:text-gray-700 focus:border-cyan-400/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Course Code
                </label>

                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="DAA"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3.5 uppercase text-white outline-none placeholder:text-gray-700 focus:border-cyan-400/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Credit
                </label>

                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={credit}
                  onChange={(e) => setCredit(e.target.value)}
                  placeholder="3"
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3.5 text-white outline-none placeholder:text-gray-700 focus:border-cyan-400/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Course description..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/50 px-4 py-3.5 text-white outline-none placeholder:text-gray-700 focus:border-cyan-400/50"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3.5 font-medium text-gray-300"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-cyan-400 px-5 py-3.5 font-bold text-black disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingCourse
                    ? "Update Course"
                    : "Create Course"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* Assign Course Modal */}
      {showAssignModal && selectedCourse && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm">

          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b0b0b] p-7 shadow-2xl">

            <div className="mb-7">

              <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">
                Assign Course
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                {selectedCourse.code} — {selectedCourse.name}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Connect this course with an academic section.
              </p>

            </div>

            <form
              onSubmit={assignCourse}
              className="space-y-5"
            >

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Section
                </label>

                <select
                  value={selectedSectionId}
                  onChange={(e) =>
                    setSelectedSectionId(e.target.value)
                  }
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3.5 text-white outline-none focus:border-cyan-400/50"
                >
                  <option value="">
                    Select a section
                  </option>

                  {sections.map((section) => (
                    <option
                      key={section.id}
                      value={section.id}
                    >
                      {section.name} ({section.code})
                    </option>
                  ))}

                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Teacher Name
                </label>

                <input
                  value={teacherName}
                  onChange={(e) =>
                    setTeacherName(e.target.value)
                  }
                  placeholder="Teacher name"
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3.5 text-white outline-none placeholder:text-gray-700 focus:border-cyan-400/50"
                />

                <p className="mt-2 text-xs text-gray-600">
                  Teacher account integration can be added later.
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3.5 font-medium text-gray-300"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-cyan-400 px-5 py-3.5 font-bold text-black disabled:opacity-50"
                >
                  {saving ? "Assigning..." : "Assign Course"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </main>
  );
}