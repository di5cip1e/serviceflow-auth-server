#!/usr/bin/env node
/**
 * Memory Palace Tool
 * 
 * Saves conversation snapshots to the memory palace structure.
 * 
 * Usage:
 *   node memory-palace-tool.js --room <room> --title <title> --content <content>
 *   node memory-palace-tool.js --room sessions --title "2026-03-05 MVP Push" --file /path/to/transcript.txt
 * 
 * Rooms:
 *   - commander: Derek's preferences, directives, and personal context
 *   - projects: Project-specific memories (Station Command, etc.)
 *   - agents: Agent configurations, learnings, and agent-specific notes
 *   - sessions: Session transcripts and summaries
 *   - discoveries: Findings, learnings, and interesting discoveries
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MEMORY_ROOT = path.join(__dirname, '..', 'memory-palace');

const ROOMS = {
  commander: 'Commander Derek - directives, preferences, personal context',
  projects: 'Project memories - Station Command, MVP work, technical decisions',
  agents: 'Agent system - configurations, learnings, subagent notes',
  sessions: 'Session transcripts - conversation logs and summaries',
  discoveries: 'Discoveries - learnings, findings, and interesting insights'
};

function getTimestamp() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function formatDate() {
  return new Date().toISOString().slice(0, 10);
}

function saveToRoom(room, title, content) {
  if (!ROOMS[room]) {
    console.error(`Unknown room: ${room}`);
    console.error(`Available rooms: ${Object.keys(ROOMS).join(', ')}`);
    process.exit(1);
  }
  
  const roomPath = path.join(MEMORY_ROOT, room);
  const timestamp = getTimestamp();
  const dateStr = formatDate();
  
  // Create filename from title (slugify)
  const slug = title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  const filename = `${dateStr}-${slug}.md`;
  const filePath = path.join(roomPath, filename);
  
  // Build content with header
  const fileContent = `---
room: ${room}
title: ${title}
created: ${timestamp}
---

# ${title}

${content}

---

*Saved to Memory Palace > ${room} | ${timestamp}*
`;

  fs.writeFileSync(filePath, fileContent);
  console.log(`✅ Saved to: memory-palace/${room}/${filename}`);
  return filePath;
}

function saveSessionTranscript(title, messages) {
  const roomPath = path.join(MEMORY_ROOT, 'sessions');
  const timestamp = getTimestamp();
  const dateStr = formatDate();
  
  const slug = title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  const filename = `${dateStr}-${slug}.md`;
  const filePath = path.join(roomPath, filename);
  
  // Format messages
  let content = `## Session: ${title}\n\n**Started:** ${timestamp}\n\n---\n\n`;
  
  messages.forEach((msg, i) => {
    const speaker = msg.speaker || 'Unknown';
    const text = msg.text || msg.content || '';
    content += `### ${i + 1}. ${speaker}\n${text}\n\n---\n\n`;
  });
  
  content += `*Session saved to Memory Palace | ${timestamp}*`;
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Session saved to: memory-palace/sessions/${filename}`);
  return filePath;
}

// CLI handling
const args = process.argv.slice(2);
if (args.includes('--help') || args.length === 0) {
  console.log(`
Memory Palace Tool
==================

Usage:
  node memory-palace-tool.js --room <room> --title "Title" --content "Content"
  node memory-palace-tool.js --session --title "Title" --messages "msg1|msg2"

Rooms:
  - commander  : Derek's preferences and directives
  - projects   : Project-specific memories  
  - agents     : Agent system learnings
  - sessions   : Session transcripts
  - discoveries: Findings and insights

Examples:
  node memory-palace-tool.js --room projects --title "MVP Progress" --content "Backend complete, frontend in progress"
  node memory-palace-tool.js --session --title "2026-03-05 Standup" --messages "What we built|What's next"
`);
  process.exit(0);
}

// Parse args
let room, title, content;
const sessionMode = args.includes('--session');
const messages = [];

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--room' && args[i + 1]) room = args[++i];
  if (args[i] === '--title' && args[i + 1]) title = args[++i];
  if (args[i] === '--content' && args[i + 1]) content = args[++i];
  if (args[i] === '--messages' && args[i + 1]) {
    args[i + 1].split('|').forEach(m => messages.push({ text: m, speaker: 'Participant' }));
  }
}

if (sessionMode) {
  if (!title || messages.length === 0) {
    console.error('Session mode requires --title and --messages');
    process.exit(1);
  }
  saveSessionTranscript(title, messages);
} else {
  if (!room || !title || !content) {
    console.error('Missing required arguments: --room, --title, --content');
    process.exit(1);
  }
  saveToRoom(room, title, content);
}
