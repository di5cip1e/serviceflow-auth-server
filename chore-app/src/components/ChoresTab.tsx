"use client";

import { useState, useEffect } from "react";

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
  _count?: { assignments: number };
}

interface ChoresTabProps {
  onEditChore: (chore: Chore) => void;
  onChoresChanged?: () => void;
}

export default function ChoresTab({ onEditChore, onChoresChanged }: ChoresTabProps) {
  const [chores, setChores] = useState<Chore[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchChores = async () => {
    try {
      const res = await fetch("/api/chores");
      if (res.ok) {
        const data = await res.json();
        setChores(data);
      }
    } catch (err) {
      console.error("Failed to fetch chores:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChores();
  }, []);

  // Refresh when parent signals changes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) fetchChores();
    }, 2000);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (onChoresChanged) {
      fetchChores();
    }
  }, [onChoresChanged]);

  const deleteChore = async (id: number) => {
    if (!confirm("Delete this chore? This will also remove all assignments.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/chores/${id}`, { method: "DELETE" });
      if (res.ok) {
        setChores((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete chore:", err);
    } finally {
      setDeleting(null);
    }
  };

  const difficultyColor = (rating: number) => {
    if (rating <= 3) return "text-green-400 bg-green-400/10";
    if (rating <= 6) return "text-yellow-400 bg-yellow-400/10";
    return "text-red-400 bg-red-400/10";
  };

  const difficultyLabel = (rating: number) => {
    if (rating <= 3) return "Easy";
    if (rating <= 6) return "Medium";
    return "Hard";
  };

  const categoryEmoji = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("kitchen") || n.includes("dish") || n.includes("oven") || n.includes("fridge") || n.includes("counter") || n.includes("stove") || n.includes("pantry") || n.includes("trash") || n.includes("meal")) return "🍳";
    if (n.includes("bathroom") || n.includes("toilet") || n.includes("shower") || n.includes("tub") || n.includes("sink") || n.includes("mirror") || n.includes("towel")) return "🚿";
    if (n.includes("bed") || n.includes("sheet") || n.includes("closet") || n.includes("pillow")) return "🛏️";
    if (n.includes("laundry") || n.includes("fold") || n.includes("wash") || n.includes("dry")) return "👕";
    if (n.includes("vacuum") || n.includes("mop") || n.includes("sweep") || n.includes("dust") || n.includes("floor")) return "🧹";
    if (n.includes("dog") || n.includes("cat") || n.includes("pet") || n.includes("litter") || n.includes("groom") || n.includes("walk")) return "🐾";
    if (n.includes("garden") || n.includes("lawn") || n.includes("mow") || n.includes("weed") || n.includes("rake") || n.includes("leaf") || n.includes("gutter")) return "🌱";
    if (n.includes("car") || n.includes("garage")) return "🚗";
    if (n.includes("window") || n.includes("light") || n.includes("fan") || n.includes("fixture")) return "💡";
    if (n.includes("organiz") || n.includes("declutter") || n.includes("pantry") || n.includes("junk") || n.includes("mail") || n.includes("office") || n.includes("desk")) return "📋";
    if (n.includes("winter") || n.includes("spring") || n.includes("holiday") || n.includes("decorat") || n.includes("basement") || n.includes("rug") || n.includes("bedding") || n.includes("linen")) return "🏠";
    if (n.includes("grocery") || n.includes("shop")) return "🛒";
    if (n.includes("living") || n.includes("couch") || n.includes("sofa") || n.includes("entry") || n.includes("porch") || n.includes("dining")) return "🛋️";
    if (n.includes("plan") || n.includes("schedule")) return "📅";
    return "🧹";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400">Loading chores...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-200">
          Chores ({chores.length})
        </h2>
      </div>

      {chores.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No chores yet. Click &quot;+ New Chore&quot; to create one, or browse presets below!
        </div>
      ) : (
        <div className="space-y-3">
          {chores.map((chore) => (
            <div
              key={chore.id}
              className="bg-[#1e293b] rounded-xl border border-gray-700 overflow-hidden"
            >
              {/* Chore Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#334155]/50 transition-colors"
                onClick={() =>
                  setExpandedId(expandedId === chore.id ? null : chore.id)
                }
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-xl">{categoryEmoji(chore.name)}</span>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-200 truncate">
                      {chore.name}
                    </h3>
                    {chore.description && (
                      <p className="text-sm text-gray-500 truncate">
                        {chore.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${difficultyColor(
                      chore.difficulty_rating
                    )}`}
                  >
                    {difficultyLabel(chore.difficulty_rating)}{" "}
                    {chore.difficulty_rating}/10
                  </span>
                  <span className="text-gray-500 text-sm">
                    {chore.steps.length} steps
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      expandedId === chore.id ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Expanded Steps */}
              {expandedId === chore.id && (
                <div className="border-t border-gray-700 p-4 bg-[#0f172a]/50">
                  {chore.description && (
                    <p className="text-sm text-gray-400 mb-3">{chore.description}</p>
                  )}
                  <h4 className="text-sm font-medium text-gray-400 mb-3">
                    Steps:
                  </h4>
                  {chore.steps.length > 0 ? (
                    <ol className="space-y-2">
                      {chore.steps.map((step, i) => (
                        <li key={step.id} className="flex gap-3 text-sm">
                          <span className="text-blue-400 font-mono font-bold shrink-0">
                            {i + 1}.
                          </span>
                          <span className="text-gray-300">{step.text}</span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-gray-500 text-sm">No steps defined.</p>
                  )}

                  <div className="mt-4 pt-3 border-t border-gray-700 flex justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditChore(chore);
                      }}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors cursor-pointer"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChore(chore.id);
                      }}
                      disabled={deleting === chore.id}
                      className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {deleting === chore.id ? "Deleting..." : "🗑️ Delete"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
