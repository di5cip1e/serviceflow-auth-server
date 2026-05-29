"use client";

import { useState, useCallback } from "react";
import DoersTab from "@/components/DoersTab";
import ChoresTab from "@/components/ChoresTab";
import ChoreCreator from "@/components/ChoreCreator";
import PresetPicker from "@/components/PresetPicker";
import type { PresetChore } from "@/data/presetChores";

type Tab = "doers" | "chores" | "calendar";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("doers");
  const [showCreator, setShowCreator] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [editChore, setEditChore] = useState<{
    id: number;
    name: string;
    description: string;
    difficulty_rating: number;
    steps: { id: number; text: string; sequence_order: number }[];
  } | null>(null);
  const [choresRevision, setChoresRevision] = useState(0);

  const handleChoresChanged = useCallback(() => {
    setChoresRevision((r) => r + 1);
  }, []);

  const handleEditChore = useCallback(
    (chore: {
      id: number;
      name: string;
      description: string;
      difficulty_rating: number;
      steps: { id: number; text: string; sequence_order: number }[];
    }) => {
      setEditChore(chore);
      setShowCreator(true);
    },
    []
  );

  const handleSelectPreset = useCallback((preset: PresetChore) => {
    // Open the creator pre-filled with preset data (no id = new chore)
    setEditChore({
      id: 0, // 0 signals "this is a preset import" — the component treats it as create mode but pre-filled
      name: preset.name,
      description: preset.description,
      difficulty_rating: preset.difficulty_rating,
      steps: preset.steps.map((text, i) => ({
        id: -(i + 1), // negative IDs to avoid conflicts
        text,
        sequence_order: i,
      })),
    });
    setShowPresets(false);
    setShowCreator(true);
  }, []);

  const handleCloseCreator = useCallback(() => {
    setShowCreator(false);
    setEditChore(null);
    handleChoresChanged();
  }, [handleChoresChanged]);

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "doers", label: "Doers", icon: "👤" },
    { key: "chores", label: "Chores", icon: "🧹" },
    { key: "calendar", label: "Calendar", icon: "📅" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#1e293b] border-b border-gray-700 px-4 py-3 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-blue-400">
            🏠 Chore Manager
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPresets(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              📚 Presets
            </button>
            <button
              onClick={() => {
                setEditChore(null);
                setShowCreator(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              + New Chore
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-[#1e293b] border-b border-gray-700 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-2.5 sm:px-4 sm:py-3 text-sm font-medium rounded-t-lg transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? "bg-[#0f172a] text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400 hover:text-gray-200 hover:bg-[#334155]"
              }`}
            >
              <span className="mr-1.5">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 px-4 py-6 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {activeTab === "doers" && <DoersTab />}
          {activeTab === "chores" && (
            <ChoresTab
              onEditChore={handleEditChore}
              onChoresChanged={handleChoresChanged}
            />
          )}
          {activeTab === "calendar" && (
            <div className="text-center py-12 text-gray-500">
              📅 Calendar view coming soon!
            </div>
          )}
        </div>
      </main>

      {/* Preset Picker Modal */}
      {showPresets && (
        <PresetPicker
          onSelect={handleSelectPreset}
          onClose={() => setShowPresets(false)}
        />
      )}

      {/* Chore Creator Modal */}
      {showCreator && (
        <ChoreCreator
          onClose={handleCloseCreator}
          onSaved={handleChoresChanged}
          editChore={editChore}
        />
      )}
    </div>
  );
}
