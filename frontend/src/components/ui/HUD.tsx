// src/components/ui/HUD.tsx
'use client';

import React from 'react';
import MiniMap from './MiniMap';

interface PlayerStats {
  name: string;
  rank: string;
  level: number;
  currentXp: number;
  maxXp: number;
  health: number;
  maxHealth: number;
}

interface PlayerPosition {
  x: number;
  y: number;
}

interface HUDProps {
  player?: PlayerStats;
  playerPosition?: PlayerPosition;
  interactionPrompt?: string;
  onInteraction?: () => void;
}

export default function HUD({
  player = {
    name: 'Commander',
    rank: 'Lieutenant',
    level: 1,
    currentXp: 0,
    maxXp: 100,
    health: 100,
    maxHealth: 100,
  },
  playerPosition = { x: 100, y: 55 },
  interactionPrompt,
  onInteraction,
}: HUDProps) {
  const xpPercent = (player.currentXp / player.maxXp) * 100;
  const healthPercent = (player.health / player.maxHealth) * 100;

  return (
    <div className="hud">
      {/* Top Left - Player Stats */}
      <div className="player-stats">
        <div className="player-name">{player.name}</div>
        <div className="player-rank">
          {player.rank} <span className="level">Lv.{player.level}</span>
        </div>
        
        {/* XP Bar */}
        <div className="xp-bar-container">
          <div className="xp-label">XP</div>
          <div className="xp-bar">
            <div 
              className="xp-fill" 
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          <div className="xp-values">
            {player.currentXp} / {player.maxXp}
          </div>
        </div>

        {/* Health Bar */}
        <div className="health-bar-container">
          <div className="health-label">HP</div>
          <div className="health-bar">
            <div 
              className="health-fill" 
              style={{ width: `${healthPercent}%` }}
            />
          </div>
          <div className="health-values">
            {player.health} / {player.maxHealth}
          </div>
        </div>
      </div>

      {/* Top Right - Mini Map */}
      <div className="minimap-container">
        <MiniMap playerX={playerPosition?.x ?? 100} playerY={playerPosition?.y ?? 55} />
      </div>

      {/* Bottom - Interaction Prompt */}
      {interactionPrompt && (
        <div className="interaction-prompt" onClick={onInteraction}>
          <span className="prompt-key">[E]</span>
          <span className="prompt-text">{interactionPrompt}</span>
        </div>
      )}

      <style jsx>{`
        .hud {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .hud > * {
          pointer-events: auto;
        }

        .top-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .player-stats {
          background: linear-gradient(135deg, rgba(13, 13, 26, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%);
          border: 2px solid #3d3d5c;
          padding: 1rem;
          min-width: 200px;
        }

        .player-name {
          font-family: 'Courier New', monospace;
          font-size: 1.125rem;
          color: #7fdbca;
          font-weight: bold;
          letter-spacing: 0.05em;
        }

        .player-rank {
          font-family: 'Courier New', monospace;
          font-size: 0.75rem;
          color: #95a5a6;
          margin-bottom: 0.75rem;
        }

        .level {
          color: #f39c12;
          margin-left: 0.5rem;
        }

        .xp-bar-container,
        .health-bar-container {
          margin-bottom: 0.5rem;
        }

        .xp-label,
        .health-label {
          font-family: 'Courier New', monospace;
          font-size: 0.625rem;
          color: #636e72;
          letter-spacing: 0.1em;
          margin-bottom: 0.25rem;
        }

        .xp-bar,
        .health-bar {
          height: 8px;
          background: #0f0f1a;
          border: 1px solid #2d2d44;
          position: relative;
        }

        .xp-fill {
          height: 100%;
          background: linear-gradient(90deg, #3498db 0%, #9b59b6 100%);
          transition: width 0.3s ease;
        }

        .health-fill {
          height: 100%;
          background: linear-gradient(90deg, #27ae60 0%, #2ecc71 100%);
          transition: width 0.3s ease;
        }

        .xp-values,
        .health-values {
          font-family: 'Courier New', monospace;
          font-size: 0.625rem;
          color: #7f8c8d;
          text-align: right;
          margin-top: 0.25rem;
        }

        .minimap-container {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 180px;
        }

        .interaction-prompt {
          align-self: center;
          background: rgba(13, 13, 26, 0.9);
          border: 2px solid #7fdbca;
          padding: 0.75rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .interaction-prompt:hover {
          background: rgba(127, 219, 202, 0.1);
          border-color: #fff;
        }

        .prompt-key {
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          color: #7fdbca;
          background: #1a1a2e;
          padding: 0.25rem 0.5rem;
          border: 1px solid #3d3d5c;
        }

        .prompt-text {
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          color: #ecf0f1;
        }
      `}</style>
    </div>
  );
}

export type { PlayerStats };
