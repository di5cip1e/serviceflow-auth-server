"use client";

import { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { PresetChore } from "@/data/presetChores";

interface ChoreCreatorProps {
  onClose: () => void;
  onSaved: () => void;
  editChore?: {
    id: number;
    name: string;
    description: string;
    difficulty_rating: number;
    steps: { id: number; text: string; sequence_order: number }[];
  } | null;
}

interface StepItem {
  id: string;
  text: string;
}

function SortableStep({
  step,
  onEdit,
  onDelete,
}: {
  step: StepItem;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-[#1e293b] border border-gray-600 rounded-lg p-3 flex items-center gap-2 group"
    >
      <button
        {...attributes}
        {...listeners}
        className="text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing shrink-0"
        title="Drag to reorder"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
        </svg>
      </button>
      <input
        type="text"
        value={step.text}
        onChange={(e) => onEdit(step.id, e.target.value)}
        className="flex-1 bg-transparent text-gray-200 text-sm focus:outline-none min-w-0"
        placeholder="Step description..."
      />
      <button
        onClick={() => onDelete(step.id)}
        className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
        title="Remove step"
      >
        ✕
      </button>
    </div>
  );
}

export default function ChoreCreator({ onClose, onSaved, editChore }: ChoreCreatorProps) {
  const isEditing = !!editChore && editChore.id > 0;

  const [step, setStep] = useState(1);
  const [choreName, setChoreName] = useState("");
  const [description, setDescription] = useState("");
  const [aiSteps, setAiSteps] = useState<StepItem[]>([]);
  const [orderedSteps, setOrderedSteps] = useState<StepItem[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [ratingDifficulty, setRatingDifficulty] = useState(false);
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If editing, pre-fill the form
  useEffect(() => {
    if (editChore) {
      setChoreName(editChore.name);
      setDescription(editChore.description);
      setDifficulty(editChore.difficulty_rating);
      setOrderedSteps(
        editChore.steps.map((s) => ({
          id: `existing-${s.id}`,
          text: s.text,
        }))
      );
      // Skip to step 2 (organize) since we already have everything
      setStep(2);
    }
  }, [editChore]);

  // If a preset was loaded into parent, it comes through editChore-like flow
  // but we use a separate prop for clarity
  useEffect(() => {
    // This handles the preset case — parent sets editChore with preset data
    // but without an id field, so we know it's a preset import
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const generateSteps = async () => {
    if (!description.trim()) {
      setError("Please enter a description first");
      return;
    }
    setLoadingAI(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choreName, description }),
      });
      const data = await res.json();
      if (res.ok && data.steps) {
        const items: StepItem[] = data.steps.map(
          (text: string, i: number) => ({
            id: `ai-${Date.now()}-${i}`,
            text,
          })
        );
        setAiSteps(items);
        setStep(2);
      } else {
        setError(data.error || "Failed to generate steps");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        setOrderedSteps((items) => {
          const oldIndex = items.findIndex((i) => i.id === active.id);
          const newIndex = items.findIndex((i) => i.id === over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    },
    []
  );

  const addToOrder = (step: StepItem) => {
    if (!orderedSteps.find((s) => s.id === step.id)) {
      setOrderedSteps((prev) => [...prev, step]);
    }
  };

  const removeFromOrder = (id: string) => {
    setOrderedSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const editStep = (id: string, text: string) => {
    setOrderedSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, text } : s))
    );
  };

  const deleteStep = (id: string) => {
    setOrderedSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const rateDifficulty = async () => {
    if (orderedSteps.length === 0) {
      setError("Add at least one step first");
      return;
    }
    setRatingDifficulty(true);
    setError(null);
    try {
      const res = await fetch("/api/rate-difficulty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          steps: orderedSteps.map((s) => s.text),
          choreName,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setDifficulty(data.rating);
        setStep(3);
      } else {
        setError(data.error || "Failed to rate difficulty");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setRatingDifficulty(false);
    }
  };

  const saveChore = async () => {
    if (!choreName.trim()) {
      setError("Please enter a chore name");
      return;
    }
    if (orderedSteps.length === 0) {
      setError("Please add at least one step");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: choreName.trim(),
        description: description.trim(),
        difficulty_rating: difficulty || 5,
        steps: orderedSteps.map((s) => s.text),
      };

      let res: Response;
      if (isEditing && editChore) {
        res = await fetch(`/api/chores/${editChore.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/chores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        onSaved();
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save chore");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const title = isEditing ? "Edit Chore" : "Create New Chore";

  return (
    <div className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 overflow-y-auto py-8 px-4">
      <div className="bg-[#1e293b] rounded-2xl w-full max-w-4xl border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <h2 className="text-xl font-bold text-gray-200">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 text-2xl leading-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 px-5 pt-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  step >= s
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-500"
                }`}
              >
                {s}
              </div>
              <span
                className={`text-xs hidden sm:inline ${
                  step >= s ? "text-blue-400" : "text-gray-600"
                }`}
              >
                {s === 1 ? "Describe" : s === 2 ? "Organize Steps" : "Confirm"}
              </span>
              {s < 3 && (
                <div
                  className={`flex-1 h-0.5 ${
                    step > s ? "bg-blue-600" : "bg-gray-700"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-5 mt-4 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Name + Description */}
        {step === 1 && (
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Chore Name *
              </label>
              <input
                type="text"
                value={choreName}
                onChange={(e) => setChoreName(e.target.value)}
                placeholder="e.g., Clean the Kitchen"
                className="w-full bg-[#0f172a] border border-gray-600 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the chore in detail so AI can break it into steps..."
                rows={4}
                className="w-full bg-[#0f172a] border border-gray-600 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={generateSteps}
                disabled={loadingAI || !description.trim() || !choreName.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-2"
              >
                {loadingAI ? (
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
                    Generating...
                  </>
                ) : (
                  <>🤖 Generate Steps</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Drag-and-Drop Split Screen */}
        {step === 2 && (
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left: AI-Generated Steps (only show if not editing) */}
              {!isEditing && aiSteps.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                    <span>🤖</span> AI-Generated Steps
                    <span className="text-xs text-gray-600">
                      (click to add)
                    </span>
                  </h3>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {aiSteps.map((s) => {
                      const isAdded = orderedSteps.some(
                        (os) => os.id === s.id
                      );
                      return (
                        <button
                          key={s.id}
                          onClick={() => !isAdded && addToOrder(s)}
                          disabled={isAdded}
                          className={`w-full text-left bg-[#0f172a] border rounded-lg p-3 text-sm transition-colors cursor-pointer ${
                            isAdded
                              ? "border-green-600/30 text-green-400/50 cursor-default"
                              : "border-gray-600 text-gray-300 hover:border-blue-500 hover:bg-[#1e293b]"
                          }`}
                        >
                          {isAdded ? "✓ Added" : s.text}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Right: Ordered Steps */}
              <div className={isEditing ? "md:col-span-2" : ""}>
                <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                  <span>📋</span> Your Workflow
                  <span className="text-xs text-gray-600">
                    ({orderedSteps.length} steps)
                  </span>
                </h3>
                {orderedSteps.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center text-gray-600">
                    {isEditing
                      ? "No steps yet. Add steps below."
                      : "Click steps from the left to add them here, then drag to reorder"}
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={orderedSteps.map((s) => s.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                        {orderedSteps.map((s) => (
                          <SortableStep
                            key={s.id}
                            step={s}
                            onEdit={editStep}
                            onDelete={deleteStep}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}

                {/* Add custom step */}
                <div className="mt-3">
                  <button
                    onClick={() => {
                      const text = prompt("Enter a new step:");
                      if (text && text.trim()) {
                        setOrderedSteps((prev) => [
                          ...prev,
                          { id: `custom-${Date.now()}`, text: text.trim() },
                        ]);
                      }
                    }}
                    className="w-full border border-dashed border-gray-600 rounded-lg p-2 text-sm text-gray-500 hover:border-gray-500 hover:text-gray-400 transition-colors cursor-pointer"
                  >
                    + Add Custom Step
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 mt-4 border-t border-gray-700">
              {!isEditing && (
                <button
                  onClick={() => setStep(1)}
                  className="text-gray-400 hover:text-gray-200 px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  ← Back
                </button>
              )}
              {isEditing && <div />}
              <button
                onClick={rateDifficulty}
                disabled={ratingDifficulty || orderedSteps.length === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-2"
              >
                {ratingDifficulty ? (
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
                    Rating...
                  </>
                ) : (
                  <>📊 Rate Difficulty</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm & Save */}
        {step === 3 && (
          <div className="p-5 space-y-4">
            <div className="bg-[#0f172a] rounded-xl p-5 border border-gray-700">
              <h3 className="text-lg font-semibold text-gray-200 mb-1">
                {choreName}
              </h3>
              {description && (
                <p className="text-sm text-gray-500 mb-4">{description}</p>
              )}

              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    (difficulty || 0) <= 3
                      ? "bg-green-400/10 text-green-400"
                      : (difficulty || 0) <= 6
                      ? "bg-yellow-400/10 text-yellow-400"
                      : "bg-red-400/10 text-red-400"
                  }`}
                >
                  Difficulty: {difficulty}/10
                </div>
                <div className="text-sm text-gray-500">
                  {orderedSteps.length} steps
                </div>
              </div>

              <ol className="space-y-2">
                {orderedSteps.map((s, i) => (
                  <li key={s.id} className="flex gap-3 text-sm">
                    <span className="text-blue-400 font-mono font-bold shrink-0">
                      {i + 1}.
                    </span>
                    <span className="text-gray-300">{s.text}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(2)}
                className="text-gray-400 hover:text-gray-200 px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                ← Back
              </button>
              <button
                onClick={saveChore}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-2"
              >
                {saving ? (
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
                    Saving...
                  </>
                ) : (
                  <>✅ {isEditing ? "Update Chore" : "Save Chore"}</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
