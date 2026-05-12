#!/usr/bin/env node
// spawn-subagent.js — Spawn a subagent via ring-spawner (inclusionai/ring-2.6-1t:free)
// Usage: node spawn-subagent.js "task description" [label] [timeout]
// Example: node spawn-subagent.js "echo hello" mytest 60

const { spawn } = require('child_process');

const task = process.argv[2] || 'echo "No task provided"';
const label = process.argv[3] || 'ring-subagent';
const timeout = process.argv[4] || '300';

const result = spawn('openclaw', ['agent', '--agent', 'ring-spawner', '--message', task, '--timeout', timeout, '--json'], {
  stdio: ['ignore', 'pipe', 'inherit']
});

let output = '';
result.stdout.on('data', (data) => { output += data.toString(); });
result.on('close', (code) => {
  if (code === 0) {
    try {
      const json = JSON.parse(output);
      const text = json?.result?.payloads?.[0]?.text || json?.summary || output;
      console.log(`[${label}] ${text}`);
    } catch {
      console.log(`[${label}] ${output}`);
    }
  } else {
    console.error(`[${label}] Exit code: ${code}`);
    process.exit(code);
  }
});
