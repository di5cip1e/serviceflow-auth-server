/**
 * Dialogue Loader
 * Loads dialogue data from /lore/dialogue/*.json files
 */

import directorDialogue from "../../lore/dialogue/director.json";
import engineMechanicDialogue from "../../lore/dialogue/engine_mechanic.json";
import qaInterrogatorDialogue from "../../lore/dialogue/qa_interrogator.json";
import sampleQuestDialogue from "../../lore/dialogue/sample_quest.json";

export interface DialogueChoice {
  text: string;
  next_node: string;
  action?: {
    type: string;
    params?: Record<string, unknown>;
  };
}

export interface DialogueNode {
  id: string;
  text: string;
  choices: DialogueChoice[];
}

export interface DialogueData {
  npc_id: string;
  npc_name: string;
  location: string;
  nodes: DialogueNode[];
}

// Dialogue cache
const dialogueCache: Map<string, DialogueData> = new Map();

// Preload all dialogue files
function preloadDialogues() {
  if (!dialogueCache.has("director")) {
    dialogueCache.set("director", directorDialogue as DialogueData);
  }
  if (!dialogueCache.has("engine_mechanic")) {
    dialogueCache.set("engine_mechanic", engineMechanicDialogue as DialogueData);
  }
  if (!dialogueCache.has("qa_interrogator")) {
    dialogueCache.set("qa_interrogator", qaInterrogatorDialogue as DialogueData);
  }
  if (!dialogueCache.has("sample_quest")) {
    dialogueCache.set("sample_quest", sampleQuestDialogue as DialogueData);
  }
}

/**
 * Load dialogue for a specific NPC
 * @param npcId - The NPC identifier (e.g., "director", "engine_mechanic")
 * @returns DialogueData or null if not found
 */
export function loadDialogue(npcId: string): DialogueData | null {
  preloadDialogues();
  return dialogueCache.get(npcId) ?? null;
}

/**
 * Get all available NPC IDs
 * @returns Array of NPC IDs
 */
export function getAvailableNPCs(): string[] {
  preloadDialogues();
  return Array.from(dialogueCache.keys());
}

/**
 * Get a specific dialogue node from an NPC's dialogue
 * @param npcId - The NPC identifier
 * @param nodeId - The node ID to retrieve
 * @returns DialogueNode or null if not found
 */
export function getDialogueNode(npcId: string, nodeId: string): DialogueNode | null {
  const dialogue = loadDialogue(npcId);
  if (!dialogue) return null;
  
  return dialogue.nodes.find(node => node.id === nodeId) ?? null;
}

export default loadDialogue;
