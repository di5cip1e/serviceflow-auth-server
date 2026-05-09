// src/components/ui/HUD.tsx
'use client';

import React, { useState } from 'react';
import { Depth, getResponsiveStyle, Button, useKeyboardHandler, ProgressBar } from '@/lib/UIBase';

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

// MiniMap is kept as separate component - could be refactored later
import MiniMap from './MiniMap';

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
  playerPosition = { x: 50, y: 50 }, // Changed to percentage for responsiveness
  interactionPrompt,
  onInteraction,
}: HUDProps) {
  const [isInteractionHovered, setIsInteractionHovered] = useState(false);

  // Keyboard handler for ESC to close interaction prompts
  useKeyboardHandler({
    onEscape: () => {
      // Could close any open interaction prompts here
      if (interactionPrompt && onInteraction) {
        onInteraction();
      }
    },
  });

  // Responsive positioning (percentage-based)
  const statsPosition = getResponsiveStyle({ x: 0, y: 0, offsetX: 16, offsetY: 16 });
  const minimapPosition = getResponsiveStyle({ x: 100, y: 0, offsetX: -16, offsetY: 16 });
  const promptPosition = getResponsiveStyle({ x: 50, y: 100, offsetX: 0, offsetY: -32 });

  return (
    <div 
      className="hud"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        padding: '1rem',
        zIndex: Depth.HUD.BACKGROUND,
      }}
    >
      {/* Top Left - Player Stats */}
      <div 
        className="player-stats"
        style={{
          ...statsPosition,
          background: 'linear-gradient(135deg, rgba(13, 13, 26, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%)',
          border: '2px solid #3d3d5c',
          padding: '1rem',
          minWidth: '200px',
          pointerEvents: 'auto',
        }}
      >
        <div style={{
          fontFamily: "'Courier New', monospace",
          fontSize: '1.125rem',
          color: '#7fdbca',
          fontWeight: 'bold',
          letterSpacing: '0.05em',
        }}>
          {player.name}
        </div>
        <div style={{
          fontFamily: "'Courier New', monospace",
          fontSize: '0.75rem',
          color: '#95a5a6',
          marginBottom: '0.75rem',
        }}>
          {player.rank} <span style={{ color: '#f39c12', marginLeft: '0.5rem' }}>Lv.{player.level}</span>
        </div>
        
        {/* XP Bar - using standardized ProgressBar */}
        <ProgressBar
          value={player.currentXp}
          max={player.maxXp}
          color="xp"
          label="XP"
        />

        {/* Health Bar - using standardized ProgressBar */}
        <ProgressBar
          value={player.health}
          max={player.maxHealth}
          color="health"
          label="HP"
        />
      </div>

      {/* Top Right - Mini Map */}
      <div 
        className="minimap-container"
        style={{
          ...minimapPosition,
          width: '180px',
          pointerEvents: 'auto',
        }}
      >
        <MiniMap playerX={playerPosition?.x ?? 50} playerY={playerPosition?.y ?? 50} />
      </div>

      {/* Bottom Center - Interaction Prompt */}
      {interactionPrompt && (
        <div
          className="interaction-prompt"
          style={{
            ...promptPosition,
            background: isInteractionHovered 
              ? 'rgba(127, 219, 202, 0.15)' 
              : 'rgba(13, 13, 26, 0.9)',
            border: '2px solid #7fdbca',
            padding: '0.75rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            pointerEvents: 'auto',
          }}
          onClick={onInteraction}
          onMouseEnter={() => setIsInteractionHovered(true)}
          onMouseLeave={() => setIsInteractionHovered(false)}
        >
          <span style={{
            fontFamily: "'Courier New', monospace",
            fontSize: '0.875rem',
            color: '#7fdbca',
            background: '#1a1a2e',
            padding: '0.25rem 0.5rem',
            border: '1px solid #3d3d5c',
          }}>
            [E]
          </span>
          <span style={{
            fontFamily: "'Courier New', monospace",
            fontSize: '0.875rem',
            color: '#ecf0f1',
          }}>
            {interactionPrompt}
          </span>
        </div>
      )}
    </div>
  );
}

export type { PlayerStats };