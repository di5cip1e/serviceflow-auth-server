"use client";

import { useState } from "react";
import DoersTab from "@/components/DoersTab";
import ChoresTab from "@/components/ChoresTab";
import ChoreCreator from "@/components/ChoreCreator";
import CalendarTab from "@/components/CalendarTab";

type Tab = "doers" | "chores" | "calendar";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("doers");
  const [showCreator, setShowCreator] = useState(false);

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
          <button
            onClick={() => setShowCreator(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            + New Chore
          </button>
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
          {activeTab === "chores" && <ChoresTab />}
          {activeTab === "calendar" && <CalendarTab />}
        </div>
      </main>

      {/* Chore Creator Modal */}
      {showCreator && (
        <ChoreCreator onClose={() => setShowCreator(false)} />
      )}
    </div>
  );
}
