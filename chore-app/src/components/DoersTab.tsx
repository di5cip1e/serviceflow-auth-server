"use client";

import { useState, useEffect } from "react";

interface Doer {
  id: number;
  name: string;
  role: string;
  completions: number;
  refusals: number;
  _count?: { assignments: number };
}

export default function DoersTab() {
  const [doers, setDoers] = useState<Doer[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchDoers = async () => {
    try {
      const res = await fetch("/api/doers");
      if (res.ok) {
        const data = await res.json();
        setDoers(data);
      }
    } catch (err) {
      console.error("Failed to fetch doers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoers();
  }, []);

  const addDoer = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/doers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        setNewName("");
        fetchDoers();
      }
    } catch (err) {
      console.error("Failed to add doer:", err);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400">Loading doers...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-200">
          Family Members ({doers.length})
        </h2>
      </div>

      {/* Add Doer Form */}
      <div className="bg-[#1e293b] rounded-xl p-4 mb-6 border border-gray-700">
        <div className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addDoer()}
            placeholder="Enter name..."
            className="flex-1 bg-[#0f172a] border border-gray-600 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={addDoer}
            disabled={adding || !newName.trim()}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg font-medium transition-colors cursor-pointer"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Doers Grid */}
      {doers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No family members yet. Add one above!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {doers.map((doer) => (
            <div
              key={doer.id}
              className="bg-[#1e293b] rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-lg font-bold">
                  {doer.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-200">
                    {doer.name}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${doer.role === "admin" ? "bg-yellow-400/10 text-yellow-400" : "bg-gray-400/10 text-gray-400"}`}>
                    {doer.role === "admin" ? "👑 Admin" : "👤 Resident"}
                  </span>
                </div>
                <button
                  onClick={async () => {
                    const newRole = doer.role === "admin" ? "resident" : "admin";
                    try {
                      const res = await fetch("/api/doers", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: doer.id, role: newRole }),
                      });
                      if (res.ok) fetchDoers();
                    } catch (err) {
                      console.error("Failed to update role:", err);
                    }
                  }}
                  className="text-xs bg-[#0f172a] hover:bg-[#334155] text-gray-400 hover:text-gray-200 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  {doer.role === "admin" ? "Demote" : "Make Admin"}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-[#0f172a] rounded-lg p-2.5">
                  <div className="text-xl font-bold text-green-400">
                    {doer.completions}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Completed
                  </div>
                </div>
                <div className="bg-[#0f172a] rounded-lg p-2.5">
                  <div className="text-xl font-bold text-red-400">
                    {doer.refusals}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">Refused</div>
                </div>
                <div className="bg-[#0f172a] rounded-lg p-2.5">
                  <div className="text-xl font-bold text-blue-400">
                    {doer._count?.assignments ?? 0}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">Assigned</div>
                </div>
              </div>

              {/* Reliability bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Reliability</span>
                  <span>
                    {doer.completions + doer.refusals > 0
                      ? Math.round(
                          (doer.completions /
                            (doer.completions + doer.refusals)) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="h-1.5 bg-[#0f172a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{
                      width: `${
                        doer.completions + doer.refusals > 0
                          ? (doer.completions /
                              (doer.completions + doer.refusals)) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
