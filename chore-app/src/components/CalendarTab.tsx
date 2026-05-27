"use client";

import { useState } from "react";

interface AssignmentSummary {
  id: number;
  doer: string;
  chore: string;
  difficulty: number;
  flag?: string;
}

interface DistributionSummary {
  totalChores: number;
  totalDifficulty: number;
  targetQuotaPerDoer: number;
  assignments: AssignmentSummary[];
  doerLoads: {
    name: string;
    assignedDifficulty: number;
    variance: number;
    refusals: number;
  }[];
}

export default function CalendarTab() {
  const [result, setResult] = useState<DistributionSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const distributeChores = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/distribute-chores", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || "Failed to distribute chores");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-200">
          Weekly Distribution
        </h2>
        <button
          onClick={distributeChores}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Distributing...
            </>
          ) : (
            <>🎯 Distribute Chores</>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {!result && !loading && (
        <div className="text-center py-16 text-gray-500">
          <div className="text-5xl mb-4">📅</div>
          <p className="text-lg mb-2">Ready to distribute</p>
          <p className="text-sm">
            Click the button above to automatically assign chores to doers
            <br />
            based on balanced difficulty scoring.
          </p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#1e293b] rounded-xl p-4 text-center border border-gray-700">
              <div className="text-2xl font-bold text-blue-400">
                {result.totalChores}
              </div>
              <div className="text-xs text-gray-500 mt-1">Total Chores</div>
            </div>
            <div className="bg-[#1e293b] rounded-xl p-4 text-center border border-gray-700">
              <div className="text-2xl font-bold text-purple-400">
                {result.totalDifficulty}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Total Difficulty
              </div>
            </div>
            <div className="bg-[#1e293b] rounded-xl p-4 text-center border border-gray-700">
              <div className="text-2xl font-bold text-green-400">
                {result.targetQuotaPerDoer}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Target per Doer
              </div>
            </div>
            <div className="bg-[#1e293b] rounded-xl p-4 text-center border border-gray-700">
              <div className="text-2xl font-bold text-gray-200">
                {result.doerLoads.length}
              </div>
              <div className="text-xs text-gray-500 mt-1">Active Doers</div>
            </div>
          </div>

          {/* Doer Loads */}
          <div className="bg-[#1e293b] rounded-xl border border-gray-700 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-700">
              <h3 className="font-semibold text-gray-200">
                Doer Workload Balance
              </h3>
            </div>
            <div className="divide-y divide-gray-700">
              {result.doerLoads.map((doer) => (
                <div key={doer.name} className="px-5 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-200 font-medium">
                        {doer.name}
                      </span>
                      {doer.refusals > 0 && (
                        <span className="text-xs bg-yellow-400/10 text-yellow-400 px-2 py-0.5 rounded-full">
                          ⚠️ {doer.refusals} refusal(s)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-400">
                        Load:{" "}
                        <span className="text-gray-200 font-medium">
                          {doer.assignedDifficulty}
                        </span>
                      </span>
                      <span
                        className={
                          Math.abs(doer.variance) <= 1
                            ? "text-green-400"
                            : "text-yellow-400"
                        }
                      >
                        {doer.variance > 0 ? "+" : ""}
                        {doer.variance}
                      </span>
                    </div>
                  </div>
                  {/* Bar */}
                  <div className="h-2 bg-[#0f172a] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        Math.abs(doer.variance) <= 1
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          (doer.assignedDifficulty /
                            (result.targetQuotaPerDoer * 1.5)) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assignments */}
          <div className="bg-[#1e293b] rounded-xl border border-gray-700 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-700">
              <h3 className="font-semibold text-gray-200">
                Assignments ({result.assignments.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-700">
              {result.assignments.map((a) => (
                <div
                  key={a.id}
                  className="px-5 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-sm font-bold shrink-0">
                      {a.doer.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm text-gray-200">
                        <span className="font-medium">{a.doer}</span>
                        <span className="text-gray-500">
                          {" "}
                          → {a.chore}
                        </span>
                      </div>
                      {a.flag && (
                        <div className="text-xs text-yellow-400 mt-0.5">
                          ⚠️ {a.flag}
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ml-3 ${
                      a.difficulty <= 3
                        ? "bg-green-400/10 text-green-400"
                        : a.difficulty <= 6
                        ? "bg-yellow-400/10 text-yellow-400"
                        : "bg-red-400/10 text-red-400"
                    }`}
                  >
                    {a.difficulty}/10
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
