// Dialogue loader utility - loads dialogue from JSON files
import type { DialogueNode, DialogueChoice } from '@/components/dialogue/DialogueBox';

// JSON dialogue file structure (from lore/dialogue/*.json)
interface DialogueFile {
  npc_id: string;
  npc_name: string;
  location: string;
  nodes: DialogueFileNode[];
}

interface DialogueFileNode {
  id: string;
  text: string;
  choices: DialogueFileChoice[];
}

interface DialogueFileChoice {
  text: string;
  next_node: string;
  action?: {
    type: string;
    params?: Record<string, string>;
  };
}

// Cache for loaded dialogue files
const dialogueCache: Map<string, DialogueFile> = new Map();

// Import all dialogue JSON files
const dialogueModules = import.meta.glob('/root/.openclaw/workspace/lore/dialogue/*.json', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/**
 * Load dialogue for a specific NPC
 * @param npcId - The NPC ID (e.g., 'director', 'engine_mechanic')
 * @returns DialogueNode for the NPC, or null if not found
 */
export async function loadDialogue(npcId: string): Promise<DialogueNode | null> {
  // Check cache first
  if (dialogueCache.has(npcId)) {
    return convertToDialogueNode(dialogueCache.get(npcId)!);
  }

  // Try to find the dialogue file
  const filePath = `/root/.openclaw/workspace/lore/dialogue/${npcId}.json`;
  
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      console.warn(`Dialogue file not found for NPC: ${npcId}`);
      return null;
    }
    
    const dialogueData: DialogueFile = await response.json();
    dialogueCache.set(npcId, dialogueData);
    return convertToDialogueNode(dialogueData);
  } catch (error) {
    console.error(`Failed to load dialogue for ${npcId}:`, error);
    return null;
  }
}

/**
 * Convert JSON dialogue format to DialogueNode format for DialogueBox
 */
function convertToDialogueNode(dialogueFile: DialogueFile): DialogueNode {
  // Create a map of nodes by ID for quick lookup
  const nodeMap = new Map<string, DialogueFileNode>();
  dialogueFile.nodes.forEach(node => nodeMap.set(node.id, node));

  // Start with the first node
  const firstNode = dialogueFile.nodes[0];
  if (!firstNode) {
    return {
      id: 'empty',
      speaker: dialogueFile.npc_name,
      text: 'No dialogue available.',
      choices: [],
    };
  }

  // Recursively build the dialogue node with resolved choices
  return buildDialogueNode(firstNode, nodeMap, dialogueFile.npc_name);
}

function buildDialogueNode(
  fileNode: DialogueFileNode,
  nodeMap: Map<string, DialogueFileNode>,
  speakerName: string
): DialogueNode {
  const choices: DialogueChoice[] = fileNode.choices.map(choice => {
    const nextNode = choice.next_node ? nodeMap.get(choice.next_node) : null;
    
    let action: (() => void) | undefined;
    if (choice.action) {
      // Create action handler based on action type
      action = () => handleDialogueAction(choice.action!, choice.next_node || 'exit');
    }

    return {
      id: choice.next_node || `choice-${Math.random().toString(36).substr(2, 9)}`,
      text: choice.text,
      nextNodeId: choice.next_node,
      action,
    };
  });

  return {
    id: fileNode.id,
    speaker: speakerName,
    text: fileNode.text,
    choices: choices.length > 0 ? choices : undefined,
  };
}

/**
 * Handle dialogue actions (e.g., close panel, start mission)
 */
function handleDialogueAction(action: { type: string; params?: Record<string, string> }, nextNodeId: string): void {
  switch (action.type) {
    case 'close':
      // Dispatch custom event to close dialogue
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('dialogue:close', { detail: { nextNodeId } }));
      }
      break;
    case 'start_mission':
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mission:start', { 
          detail: { missionId: action.params?.mission_id } 
        }));
      }
      break;
    case 'show_panel':
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('panel:show', { 
          detail: { panel: action.params?.panel } 
        }));
      }
      break;
    default:
      console.log('Unknown dialogue action:', action.type);
  }
}

/**
 * Get available NPC IDs from dialogue files
 */
export function getAvailableNPCs(): string[] {
  return Array.from(dialogueModules.keys()).map(path => {
    const match = path.match(/dialogue\/([^.]+)\.json/);
    return match ? match[1] : '';
  }).filter(Boolean);
}

export default { loadDialogue, getAvailableNPCs };
