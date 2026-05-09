#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const workspace = '/root/.openclaw/workspace';
const memoryDir = path.join(workspace, 'memory');
const watchFiles = [
  path.join(workspace, 'SOUL.md'),
  path.join(workspace, 'AGENTS.md')
];

function ensureMemoryDir() {
  if (!fs.existsSync(memoryDir)) fs.mkdirSync(memoryDir, { recursive: true });
}

function appendMemoryLine(line) {
  try {
    ensureMemoryDir();
    const date = new Date();
    const file = path.join(memoryDir, `${date.toISOString().slice(0,10)}.md`);
    const entry = `\n## Audit ${date.toISOString()}\n- ${line}\n`;
    fs.appendFileSync(file, entry, { encoding: 'utf8' });
    console.log('Appended audit to', file);
  } catch (err) {
    console.error('Failed to append memory audit', err.message);
  }
}

function summarizeChange(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return `${path.relative(workspace, filePath)} changed — size ${stats.size} bytes, mtime ${stats.mtime.toISOString()}`;
  } catch (err) {
    return `${path.relative(workspace, filePath)} changed — (could not stat: ${err.message})`;
  }
}

// Debounce map
const timers = new Map();
const DEBOUNCE_MS = 700;

watchFiles.forEach(file => {
  try {
    // ensure file exists to watch; if not, create empty placeholder so watcher can attach
    if (!fs.existsSync(file)) fs.writeFileSync(file, `# ${path.basename(file)}\n`, 'utf8');

    fs.watch(file, { persistent: true }, (eventType) => {
      if (timers.has(file)) clearTimeout(timers.get(file));
      timers.set(file, setTimeout(() => {
        const summary = summarizeChange(file);
        appendMemoryLine(summary);
        timers.delete(file);
      }, DEBOUNCE_MS));
    });
    console.log('Watching', file);
  } catch (err) {
    console.error('Watcher error for', file, err.message);
  }
});

console.log('Audit watcher started. Press Ctrl-C to stop.');

// Keep process alive
process.stdin.resume();
