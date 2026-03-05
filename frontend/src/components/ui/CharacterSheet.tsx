// src/components/ui/CharacterSheet.tsx
'use client';

import React from 'react';

export interface PlayerStats {
  name: string;
  level: number;
  xp: number;
  xpToNext: number;
  hp: number;
  maxHp: number;
  credits: number;
  rank: string;
}

interface CharacterSheetProps {
  stats: PlayerStats;
}

export default function CharacterSheet({ stats }: CharacterSheetProps) {
  const hpPercent = (stats.hp / stats.maxHp) * 100;

  return (
    <div className="character-sheet">
      <h2 className="panel-title">◆ OPERATOR</h2>
      
      <div className="player-info">
        <div className="avatar">
          <span className="avatar-icon">👤</span>
        </div>
        <div className="player-details">
          <h3 className="player-name">{stats.name}</h3>
          <span className="player-rank">Rank: {stats.rank}</span>
        </div>
      </div>

      <div className="stats-container">
        <div className="stat-row">
          <span className="stat-label">LVL</span>
          <span className="stat-value">{stats.level}</span>
        </div>

        <div className="stat-row">
          <span className="stat-label">XP</span>
          <span className="stat-value">{stats.xp} / {stats.xpToNext}</span>
          <div className="xp-bar">
            <div 
              className="xp-fill" 
              style={{ width: `${(stats.xp / stats.xpToNext) * 100}%` }} 
            />
          </div>
        </div>

        <div className="stat-row">
          <span className="stat-label">HP</span>
          <span className="stat-value">{stats.hp} / {stats.maxHp}</span>
          <div className="hp-bar">
            <div 
              className="hp-fill" 
              style={{ width: `${hpPercent}%` }} 
            />
          </div>
        </div>

        <div className="stat-row credits">
          <span className="stat-label">💰 CREDITS</span>
          <span className="stat-value">{stats.credits.toLocaleString()}</span>
        </div>
      </div>

      <style jsx>{`
        .character-sheet {
          background: #1a1a2e;
          border: 2px solid #3d3d5c;
          padding: 1rem;
          min-width: 240px;
        }

        .panel-title {
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          color: #9b59b6;
          margin: 0 0 1rem 0;
          letter-spacing: 0.1em;
        }

        .player-info {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #2d2d44;
        }

        .avatar {
          width: 48px;
          height: 48px;
          background: #0f0f1a;
          border: 2px solid #9b59b6;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-icon {
          font-size: 1.5rem;
        }

        .player-details {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .player-name {
          font-family: 'Courier New', monospace;
          font-size: 1rem;
          color: #ecf0f1;
          margin: 0;
        }

        .player-rank {
          font-size: 0.75rem;
          color: #9b59b6;
        }

        .stats-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .stat-row {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stat-label {
          font-family: 'Courier New', monospace;
          font-size: 0.75rem;
          color: #7f8c8d;
        }

        .stat-value {
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          color: #ecf0f1;
        }

        .hp-bar, .xp-bar {
          height: 8px;
          background: #0f0f1a;
          border: 1px solid #2d2d44;
        }

        .hp-fill {
          height: 100%;
          background: linear-gradient(90deg, #e74c3c, #c0392b);
          transition: width 0.3s ease;
        }

        .xp-fill {
          height: 100%;
          background: linear-gradient(90deg, #3498db, #2980b9);
          transition: width 0.3s ease;
        }

        .credits {
          margin-top: 0.5rem;
          padding-top: 0.75rem;
          border-top: 1px solid #2d2d44;
        }

        .credits .stat-value {
          color: #f1c40f;
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
}
