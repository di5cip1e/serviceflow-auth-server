"use client";

import { useState, useEffect, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────────────

interface Step {
  id: number;
  text: string;
  sequence_order: number;
}

interface Chore {
  id: number;
  name: string;
  description: string;
  difficulty_rating: number;
  steps: Step[];
}

interface Doer {
  id: number;
  name: string;
  role: string;
  completions: number;
  refusals: number;
}

interface Assignment {
  id: number;
  doerId: number;
  choreId: number;
  assignedDate: string;
  dueDate: string | null;
  status: string;
  completedAt: string | null;
  approvedAt: string | null;
  approvedBy: number | null;
  notes: string;
  doer: Doer;
  chore: Chore;
}

interface CalendarData {
  weekStart: string;
  weekEnd: string;
  assignments: Assignment[];
  doers: Doer[];
}

// ── Helpers ────────────────────────────────────────────────────────

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatDayName(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

function formatDayNum(date: Date): string {
  return date.toLocaleDateString("en-US", { day: "numeric" });
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case "pending":
      return "bg-yellow-400/10 text-yellow-400 border-yellow-400/30";
    case "completed":
      return "bg-blue-400/10 text-blue-400 border-blue-400/30";
    case "approved":
      return "bg-green-400/10 text-green-400 border-green-400/30";
    case "rejected":
      return "bg-red-400/10 text-red-400 border-red-400/30";
    case "refused":
      return "bg-orange-400/10 text-orange-400 border-orange-400/30";
    default:
      return "bg-gray-400/10 text-gray-400 border-gray-400/30";
  }
}

function getStatusIcon(status: string): string {
  switch (status) {
    case "pending":
      return "⏳";
    case "completed":
      return "✅";
    case "approved":
      return "🏆";
    case "rejected":
      return "❌";
    case "refused":
      return "🚫";
    default:
      return "❓";
  }
}

function difficultyColor(rating: number): string {
  if (rating <= 3) return "text-green-400 bg-green-400/10";
  if (rating <= 6) return "text-yellow-400 bg-yellow-400/10";
  return "text-red-400 bg-red-400/10";
}

// ── Main Component ─────────────────────────────────────────────────

export default function CalendarTab() {
  const [view, setView] = useState<"week" | "day" | "admin">("week");
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    getStartOfWeek(new Date())
  );
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [selectedDoerId, setSelectedDoerId] = useState<number | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedAssignment, setExpandedAssignment] = useState<number | null>(
    null
  );
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Schedule form state
  const [scheduleDoerId, setScheduleDoerId] = useState<number>(0);
  const [scheduleChoreId, setScheduleChoreId] = useState<number>(0);
  const [scheduleDate, setScheduleDate] = useState<string>("");
  const [scheduleNotes, setScheduleNotes] = useState("");
  const [chores, setChores] = useState<Chore[]>([]);

  // ── Data Fetching ──────────────────────────────────────────────

  const fetchCalendar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        weekStart: currentWeekStart.toISOString(),
      });
      if (selectedDoerId) {
        params.set("doerId", selectedDoerId.toString());
      }
      const res = await fetch(`/api/calendar?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data: CalendarData = await res.json();
      setCalendarData(data);
    } catch {
      setError("Failed to load calendar data");
    } finally {
      setLoading(false);
    }
  }, [currentWeekStart, selectedDoerId]);

  const fetchChores = useCallback(async () => {
    try {
      const res = await fetch("/api/chores");
      if (res.ok) {
        const data = await res.json();
        setChores(data);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  useEffect(() => {
    fetchChores();
  }, [fetchChores]);

  // ── Week Navigation ────────────────────────────────────────────

  const goToPrevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const goToNextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const goToToday = () => {
    setCurrentWeekStart(getStartOfWeek(new Date()));
  };

  // Get the 7 days of the current week
  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    weekDays.push(d);
  }

  // Get assignments for a specific day
  const getAssignmentsForDay = (day: Date): Assignment[] => {
    if (!calendarData) return [];
    const dayStr = day.toISOString().split("T")[0];
    return calendarData.assignments.filter((a) => {
      if (!a.dueDate) return false;
      return a.dueDate.split("T")[0] === dayStr;
    });
  };

  // ── Actions ────────────────────────────────────────────────────

  const handleStatusChange = async (
    assignmentId: number,
    newStatus: string
  ) => {
    setActionLoading(assignmentId);
    try {
      const body: Record<string, string | number> = { status: newStatus };
      if (newStatus === "approved") {
        // Find an admin doer
        const admin = calendarData?.doers.find((d) => d.role === "admin");
        if (admin) body.approvedBy = admin.id;
      }
      const res = await fetch(`/api/calendar/${assignmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        fetchCalendar();
      }
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  };

  const handleSchedule = async () => {
    if (!scheduleDoerId || !scheduleChoreId || !scheduleDate) return;
    try {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doerId: scheduleDoerId,
          choreId: scheduleChoreId,
          dueDate: scheduleDate,
          notes: scheduleNotes,
        }),
      });
      if (res.ok) {
        setShowScheduleModal(false);
        setScheduleNotes("");
        fetchCalendar();
      }
    } catch {
      // silent
    }
  };

  const handleDelete = async (assignmentId: number) => {
    if (!confirm("Delete this assignment?")) return;
    try {
      await fetch(`/api/calendar/${assignmentId}`, { method: "DELETE" });
      fetchCalendar();
    } catch {
      // silent
    }
  };

  // ── Admin Stats ────────────────────────────────────────────────

  const getAdminStats = () => {
    if (!calendarData) return null;
    const { assignments } = calendarData;
    return {
      total: assignments.length,
      pending: assignments.filter((a) => a.status === "pending").length,
      completed: assignments.filter((a) => a.status === "completed").length,
      approved: assignments.filter((a) => a.status === "approved").length,
      rejected: assignments.filter((a) => a.status === "rejected").length,
      refused: assignments.filter((a) => a.status === "refused").length,
    };
  };

  const stats = getAdminStats();

  // ── Render ─────────────────────────────────────────────────────

  if (loading && !calendarData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-200">📅 Calendar</h2>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Toggle */}
          <div className="flex bg-[#1e293b] rounded-lg border border-gray-700 overflow-hidden">
            {(["week", "day", "admin"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                  view === v
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {v === "week" ? "Week" : v === "day" ? "Day" : "Admin"}
              </button>
            ))}
          </div>

          {/* Doer Filter */}
          {calendarData && (
            <select
              value={selectedDoerId || ""}
              onChange={(e) =>
                setSelectedDoerId(
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              className="bg-[#1e293b] border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Doers</option>
              {calendarData.doers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} {d.role === "admin" ? "(Admin)" : ""}
                </option>
              ))}
            </select>
          )}

          {/* Schedule Button */}
          <button
            onClick={() => {
              setScheduleDoerId(calendarData?.doers[0]?.id || 0);
              setScheduleChoreId(chores[0]?.id || 0);
              setScheduleDate(new Date().toISOString().split("T")[0]);
              setShowScheduleModal(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            + Schedule
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {/* ── WEEK VIEW ─────────────────────────────────────────── */}
      {view === "week" && (
        <div>
          {/* Week Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPrevWeek}
              className="text-gray-400 hover:text-gray-200 px-3 py-1 rounded-lg hover:bg-[#334155] transition-colors cursor-pointer"
            >
              ← Prev
            </button>
            <div className="flex items-center gap-3">
              <span className="text-gray-200 font-medium">
                {formatDate(weekDays[0])} — {formatDate(weekDays[6])}
              </span>
              <button
                onClick={goToToday}
                className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-600/30 transition-colors cursor-pointer"
              >
                Today
              </button>
            </div>
            <button
              onClick={goToNextWeek}
              className="text-gray-400 hover:text-gray-200 px-3 py-1 rounded-lg hover:bg-[#334155] transition-colors cursor-pointer"
            >
              Next →
            </button>
          </div>

          {/* Week Grid */}
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const dayAssignments = getAssignmentsForDay(day);
              const today = isToday(day);
              return (
                <div
                  key={day.toISOString()}
                  className={`rounded-xl border overflow-hidden ${
                    today
                      ? "border-blue-500/50 bg-blue-500/5"
                      : "border-gray-700 bg-[#1e293b]"
                  }`}
                >
                  {/* Day Header */}
                  <div
                    className={`px-3 py-2 text-center border-b ${
                      today
                        ? "border-blue-500/30 bg-blue-500/10"
                        : "border-gray-700"
                    }`}
                  >
                    <div
                      className={`text-xs font-medium ${
                        today ? "text-blue-400" : "text-gray-500"
                      }`}
                    >
                      {formatDayName(day)}
                    </div>
                    <div
                      className={`text-lg font-bold ${
                        today ? "text-blue-400" : "text-gray-200"
                      }`}
                    >
                      {formatDayNum(day)}
                    </div>
                  </div>

                  {/* Day Assignments */}
                  <div className="p-2 space-y-1.5 min-h-[80px]">
                    {dayAssignments.length === 0 && (
                      <div className="text-xs text-gray-600 text-center py-3">
                        —
                      </div>
                    )}
                    {dayAssignments.map((a) => (
                      <button
                        key={a.id}
                        onClick={() =>
                          setExpandedAssignment(
                            expandedAssignment === a.id ? null : a.id
                          )
                        }
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-xs border transition-colors cursor-pointer ${getStatusColor(
                          a.status
                        )}`}
                      >
                        <div className="font-medium truncate">
                          {a.chore.name}
                        </div>
                        <div className="opacity-70 truncate">
                          {a.doer.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expanded Assignment Detail */}
          {expandedAssignment && (
            <AssignmentDetail
              assignment={
                calendarData?.assignments.find(
                  (a) => a.id === expandedAssignment
                ) || null
              }
              onClose={() => setExpandedAssignment(null)}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              actionLoading={actionLoading}
              isAdminView={false}
            />
          )}
        </div>
      )}

      {/* ── DAY VIEW ──────────────────────────────────────────── */}
      {view === "day" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <input
              type="date"
              value={selectedDay.toISOString().split("T")[0]}
              onChange={(e) => setSelectedDay(new Date(e.target.value))}
              className="bg-[#1e293b] border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => setSelectedDay(new Date())}
              className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-600/30 transition-colors cursor-pointer"
            >
              Today
            </button>
          </div>

          <div className="text-gray-200 font-medium mb-4">
            {selectedDay.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>

          <div className="space-y-3">
            {getAssignmentsForDay(selectedDay).length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No chores scheduled for this day.
              </div>
            )}
            {getAssignmentsForDay(selectedDay).map((a) => (
              <div
                key={a.id}
                className={`bg-[#1e293b] rounded-xl border p-4 ${getStatusColor(
                  a.status
                )}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getStatusIcon(a.status)}</span>
                      <h3 className="font-semibold text-gray-200">
                        {a.chore.name}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${difficultyColor(
                          a.chore.difficulty_rating
                        )}`}
                      >
                        {a.chore.difficulty_rating}/10
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Assigned to:{" "}
                      <span className="text-gray-200 font-medium">
                        {a.doer.name}
                      </span>
                    </p>
                    {a.notes && (
                      <p className="text-sm text-gray-500 mt-1">
                        📝 {a.notes}
                      </p>
                    )}
                    {a.chore.steps.length > 0 && (
                      <details className="mt-2">
                        <summary className="text-sm text-blue-400 cursor-pointer hover:text-blue-300">
                          View steps ({a.chore.steps.length})
                        </summary>
                        <ol className="mt-2 space-y-1 pl-4">
                          {a.chore.steps.map((step, i) => (
                            <li
                              key={step.id}
                              className="text-sm text-gray-400"
                            >
                              <span className="text-blue-400 font-mono mr-2">
                                {i + 1}.
                              </span>
                              {step.text}
                            </li>
                          ))}
                        </ol>
                      </details>
                    )}
                  </div>

                  {/* Resident Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    {a.status === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            handleStatusChange(a.id, "completed")
                          }
                          disabled={actionLoading === a.id}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                        >
                          ✓ Done
                        </button>
                        <button
                          onClick={() => handleStatusChange(a.id, "refused")}
                          disabled={actionLoading === a.id}
                          className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                        >
                          🚫 Refuse
                        </button>
                      </>
                    )}
                    {a.status === "completed" && (
                      <span className="text-xs text-blue-400 font-medium">
                        Awaiting approval
                      </span>
                    )}
                    {a.status === "rejected" && (
                      <button
                        onClick={() =>
                          handleStatusChange(a.id, "completed")
                        }
                        disabled={actionLoading === a.id}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      >
                        ↻ Retry
                      </button>
                    )}
                    {a.status === "approved" && (
                      <span className="text-xs text-green-400 font-medium">
                        🏆 Approved!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ADMIN VIEW ────────────────────────────────────────── */}
      {view === "admin" && stats && (
        <div>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <StatCard label="Total" value={stats.total} color="text-gray-200" />
            <StatCard
              label="Pending"
              value={stats.pending}
              color="text-yellow-400"
            />
            <StatCard
              label="Completed"
              value={stats.completed}
              color="text-blue-400"
            />
            <StatCard
              label="Approved"
              value={stats.approved}
              color="text-green-400"
            />
            <StatCard
              label="Rejected"
              value={stats.rejected}
              color="text-red-400"
            />
            <StatCard
              label="Refused"
              value={stats.refused}
              color="text-orange-400"
            />
          </div>

          {/* All Assignments Table */}
          <div className="bg-[#1e293b] rounded-xl border border-gray-700 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-700">
              <h3 className="font-semibold text-gray-200">
                All Assignments This Week
              </h3>
            </div>
            {calendarData?.assignments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No assignments scheduled.
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {calendarData?.assignments.map((a) => (
                  <div
                    key={a.id}
                    className="px-5 py-3 hover:bg-[#334155]/30 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-gray-200 font-medium">
                            {a.chore.name}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(
                              a.status
                            )}`}
                          >
                            {getStatusIcon(a.status)} {a.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-0.5">
                          {a.doer.name} •{" "}
                          {a.dueDate
                            ? new Date(a.dueDate).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })
                            : "No due date"}
                          {a.completedAt &&
                            ` • Completed: ${new Date(
                              a.completedAt
                            ).toLocaleDateString()}`}
                        </div>
                      </div>

                      {/* Admin Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {a.status === "completed" && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusChange(a.id, "approved")
                              }
                              disabled={actionLoading === a.id}
                              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() =>
                                handleStatusChange(a.id, "rejected")
                              }
                              disabled={actionLoading === a.id}
                              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                            >
                              ✗ Reject
                            </button>
                          </>
                        )}
                        {a.status === "pending" && (
                          <button
                            onClick={() =>
                              handleStatusChange(a.id, "approved")
                            }
                            disabled={actionLoading === a.id}
                            className="bg-green-600/50 hover:bg-green-600 disabled:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                          >
                            Force Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors cursor-pointer"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Schedule Modal ────────────────────────────────────── */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-2xl border border-gray-700 p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">
              Schedule a Chore
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Assign To
                </label>
                <select
                  value={scheduleDoerId}
                  onChange={(e) =>
                    setScheduleDoerId(parseInt(e.target.value))
                  }
                  className="w-full bg-[#0f172a] border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-blue-500"
                >
                  {calendarData?.doers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Chore
                </label>
                <select
                  value={scheduleChoreId}
                  onChange={(e) =>
                    setScheduleChoreId(parseInt(e.target.value))
                  }
                  className="w-full bg-[#0f172a] border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-blue-500"
                >
                  {chores.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.difficulty_rating}/10)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full bg-[#0f172a] border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={scheduleNotes}
                  onChange={(e) => setScheduleNotes(e.target.value)}
                  placeholder="e.g. Use the good cleaner"
                  className="w-full bg-[#0f172a] border border-gray-600 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-gray-200 text-sm font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSchedule}
                disabled={!scheduleDoerId || !scheduleChoreId || !scheduleDate}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-[#1e293b] rounded-xl p-4 text-center border border-gray-700">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function AssignmentDetail({
  assignment,
  onClose,
  onStatusChange,
  onDelete,
  actionLoading,
  isAdminView,
}: {
  assignment: Assignment | null;
  onClose: () => void;
  onStatusChange: (id: number, status: string) => void;
  onDelete: (id: number) => void;
  actionLoading: number | null;
  isAdminView: boolean;
}) {
  if (!assignment) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1e293b] rounded-2xl border border-gray-700 p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-200">
            {assignment.chore.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                assignment.status
              )}`}
            >
              {getStatusIcon(assignment.status)} {assignment.status}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${difficultyColor(
                assignment.chore.difficulty_rating
              )}`}
            >
              {assignment.chore.difficulty_rating}/10
            </span>
          </div>

          <p className="text-sm text-gray-400">
            <span className="text-gray-500">Assigned to:</span>{" "}
            {assignment.doer.name}
          </p>

          {assignment.dueDate && (
            <p className="text-sm text-gray-400">
              <span className="text-gray-500">Due:</span>{" "}
              {new Date(assignment.dueDate).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}

          {assignment.notes && (
            <p className="text-sm text-gray-400">
              <span className="text-gray-500">Notes:</span> {assignment.notes}
            </p>
          )}

          {assignment.chore.steps.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Steps:</h4>
              <ol className="space-y-1">
                {assignment.chore.steps.map((step, i) => (
                  <li key={step.id} className="text-sm text-gray-400 flex gap-2">
                    <span className="text-blue-400 font-mono shrink-0">
                      {i + 1}.
                    </span>
                    {step.text}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-700">
            {assignment.status === "pending" && (
              <>
                <button
                  onClick={() => onStatusChange(assignment.id, "completed")}
                  disabled={actionLoading === assignment.id}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  ✓ Mark Done
                </button>
                <button
                  onClick={() => onStatusChange(assignment.id, "refused")}
                  disabled={actionLoading === assignment.id}
                  className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  🚫 Refuse
                </button>
              </>
            )}
            {assignment.status === "completed" && isAdminView && (
              <>
                <button
                  onClick={() => onStatusChange(assignment.id, "approved")}
                  disabled={actionLoading === assignment.id}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => onStatusChange(assignment.id, "rejected")}
                  disabled={actionLoading === assignment.id}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  ✗ Reject
                </button>
              </>
            )}
            {assignment.status === "rejected" && (
              <button
                onClick={() => onStatusChange(assignment.id, "completed")}
                disabled={actionLoading === assignment.id}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                ↻ Retry
              </button>
            )}
            <button
              onClick={() => onDelete(assignment.id)}
              className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors cursor-pointer ml-auto"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
