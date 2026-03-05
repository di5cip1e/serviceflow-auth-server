// src/components/game/GameCanvas.tsx
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface GameCanvasProps {
  children?: React.ReactNode;
}

interface PlayerPosition {
  x: number;
  y: number;
}

// Player starting position (center of viewport)
const INITIAL_POSITION: PlayerPosition = { x: 400, y: 300 };
const PLAYER_SPEED = 5;
const PLAYER_SIZE = 32;

export default function GameCanvas({ children }: GameCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [playerPos, setPlayerPos] = useState<PlayerPosition>(INITIAL_POSITION);
  const keysPressed = useRef<Set<string>>(new Set());
  const animationFrameId = useRef<number | null>(null);
  const isClient = useRef(false);

  // Handle keyboard input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      keysPressed.current.add(e.key);
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      keysPressed.current.delete(e.key);
    }
  }, []);

  // Game loop - updates player position based on keys pressed
  const gameLoop = useCallback(() => {
    const keys = keysPressed.current;
    const viewport = canvasRef.current;
    
    if (viewport) {
      const viewportRect = viewport.getBoundingClientRect();
      const maxX = viewportRect.width - PLAYER_SIZE;
      const maxY = viewportRect.height - PLAYER_SIZE;

      setPlayerPos(prev => {
        let { x, y } = prev;

        if (keys.has('ArrowUp')) {
          y = Math.max(0, y - PLAYER_SPEED);
        }
        if (keys.has('ArrowDown')) {
          y = Math.min(maxY, y + PLAYER_SPEED);
        }
        if (keys.has('ArrowLeft')) {
          x = Math.max(0, x - PLAYER_SPEED);
        }
        if (keys.has('ArrowRight')) {
          x = Math.min(maxX, x + PLAYER_SPEED);
        }

        return { x, y };
      });
    }

    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, []);

  // Set up keyboard listeners and game loop
  useEffect(() => {
    isClient.current = true;
    
    // Add keyboard listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Start game loop
    animationFrameId.current = requestAnimationFrame(gameLoop);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [handleKeyDown, handleKeyUp, gameLoop]);

  return (
    <div className="game-canvas">
      <div className="game-viewport" ref={canvasRef}>
        {/* Game World Background */}
        <div className="game-world">
          {/* Grid lines for visual reference */}
          <div className="grid-overlay" />
          
          {/* Player Character */}
          {isClient.current && (
            <div
              className="player-character"
              style={{
                transform: `translate(${playerPos.x}px, ${playerPos.y}px)`,
              }}
            >
              <div className="player-sprite">
                <span className="player-emoji">🤖</span>
              </div>
            </div>
          )}
        </div>

        {/* UI Overlay */}
        <div className="game-ui">
          <div className="position-display">
            <span className="pixel-text">POS: {Math.round(playerPos.x)}, {Math.round(playerPos.y)}</span>
          </div>
          <div className="controls-hint">
            <span className="pixel-text">↑↓←→ MOVE</span>
          </div>
        </div>

        {children && <div className="children-overlay">{children}</div>}
      </div>
      <style jsx>{`
        .game-canvas {
          position: relative;
          width: 100%;
          height: 100%;
          background: linear-gradient(180deg, #0a0a12 0%, #1a1a2e 100%);
          border: 4px solid #3d3d5c;
          image-rendering: pixelated;
        }

        .game-viewport {
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
        }

        .game-world {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(circle at 30% 30%, #1a2a3a 0%, transparent 50%),
            radial-gradient(circle at 70% 70%, #2a1a2a 0%, transparent 50%),
            linear-gradient(180deg, #0a0a12 0%, #12121f 100%);
        }

        .grid-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        .player-character {
          position: absolute;
          top: 0;
          left: 0;
          width: 32px;
          height: 32px;
          transition: transform 0.05s linear;
          z-index: 10;
        }

        .player-sprite {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(180deg, #4ade80 0%, #22c55e 100%);
          border-radius: 4px;
          box-shadow: 
            0 0 10px rgba(74, 222, 128, 0.5),
            inset 0 -4px 0 rgba(0, 0, 0, 0.2);
          border: 2px solid #86efac;
        }

        .player-emoji {
          font-size: 1rem;
        }

        .game-ui {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          pointer-events: none;
          z-index: 20;
        }

        .position-display,
        .controls-hint {
          background: rgba(0, 0, 0, 0.6);
          padding: 0.5rem 0.75rem;
          border-radius: 4px;
          border: 2px solid #3d3d5c;
        }

        .pixel-text {
          font-family: 'Courier New', monospace;
          font-size: 0.75rem;
          color: #7fdbca;
          letter-spacing: 0.1em;
        }

        .children-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 30;
        }

        .children-overlay > * {
          pointer-events: auto;
        }
      `}</style>
    </div>
  );
}
