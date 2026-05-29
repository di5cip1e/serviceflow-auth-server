"use client";

import { useState } from "react";
import { presetChores, type PresetChore } from "@/data/presetChores";

interface PresetPickerProps {
  onSelect: (chore: PresetChore) => void;
  onClose: () => void;
}

const categories = [
  "All",
  "Kitchen",
  "Bathroom",
  "Bedroom",
  "Living Room",
  "Laundry",
  "Outdoor",
  "Pets",
  "Seasonal",
  "Organization",
];

const categoryEmoji: Record<string, string> = {
  Kitchen: "🍳",
  Bathroom: "🚿",
  Bedroom: "🛏️",
  "Living Room": "🛋️",
  Laundry: "👕",
  Outdoor: "🌱",
  Pets: "🐾",
  Seasonal: "🏠",
  Organization: "📋",
};

export default function PresetPicker({ onSelect, onClose }: PresetPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const filtered = presetChores.filter((c) => {
    const matchesCategory =
      selectedCategory === "All" || c.category === selectedCategory;
    const matchesSearch =
      search === "" ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 overflow-y-auto py-8 px-4">
      <div className="bg-[#1e293b] rounded-2xl w-full max-w-3xl border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-200">📚 Preset Chores</h2>
            <p className="text-sm text-gray-500 mt-1">
              Browse and import chores, then customize them
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 text-2xl leading-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-4 border-b border-gray-700 space-y-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chores..."
            className="w-full bg-[#0f172a] border border-gray-600 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white"
                    : "bg-[#0f172a] text-gray-400 hover:bg-gray-700"
                }`}
              >
                {cat !== "All" && <span className="mr-1">{categoryEmoji[cat]}</span>}
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Chore List */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No chores found. Try a different search or category.
            </div>
          ) : (
            filtered.map((chore, idx) => (
              <div
                key={chore.name}
                className="bg-[#0f172a] rounded-xl border border-gray-700 overflow-hidden"
              >
                <div
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-[#1e293b] transition-colors"
                  onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-lg">{categoryEmoji[chore.category] || "🧹"}</span>
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-200 text-sm truncate">
                        {chore.name}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        {chore.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        chore.difficulty_rating <= 3
                          ? "bg-green-400/10 text-green-400"
                          : chore.difficulty_rating <= 6
                          ? "bg-yellow-400/10 text-yellow-400"
                          : "bg-red-400/10 text-red-400"
                      }`}
                    >
                      {chore.difficulty_rating}/10
                    </span>
                    <span className="text-xs text-gray-500">
                      {chore.steps.length} steps
                    </span>
                  </div>
                </div>

                {expandedIdx === idx && (
                  <div className="border-t border-gray-700 p-3 bg-[#1e293b]/50">
                    <ol className="space-y-1 mb-3">
                      {chore.steps.map((step, i) => (
                        <li key={i} className="flex gap-2 text-xs">
                          <span className="text-blue-400 font-mono font-bold shrink-0">
                            {i + 1}.
                          </span>
                          <span className="text-gray-400">{step}</span>
                        </li>
                      ))}
                    </ol>
                    <button
                      onClick={() => onSelect(chore)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                    >
                      ✏️ Import & Customize
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-700 text-center text-xs text-gray-500">
          {filtered.length} preset chore{filtered.length !== 1 ? "s" : ""} available
        </div>
      </div>
    </div>
  );
}
