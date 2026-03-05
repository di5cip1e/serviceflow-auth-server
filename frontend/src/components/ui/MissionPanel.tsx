// src/components/ui/MissionPanel.tsx
'use client';

import React from 'react';

export interface Mission {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'failed';
  reward: number;
}

interface MissionPanelProps {
  missions?: Mission[];
  onSelectMission?: (mission: Mission) => void;
}

export default function MissionPanel({ 
  missions = [], 
  onSelectMission 
}: MissionPanelProps) {
  const getStatusColor = (status: Mission['status']) => {
    switch (status) {
      case 'active': return '#f39c12';
      case 'completed': return '#27ae60';
      case 'failed': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  return (
    <div className="mission-panel">
      <h2 className="panel-title">◆ ACTIVE MISSIONS</h2>
      <div className="mission-list">
        {missions.length === 0 ? (
          <p className="empty-state">No active missions</p>
        ) : (
          missions.map((mission) => (
            <button
              key={mission.id}
              className="mission-card"
              onClick={() => onSelectMission?.(mission)}
            >
              <div className="mission-header">
                <span 
                  className="status-dot"
                  style={{ backgroundColor: getStatusColor(mission.status) }}
                />
                <span className="mission-title">{mission.title}</span>
              </div>
              <p className="mission-desc">{mission.description}</p>
              <div className="mission-footer">
                <span className="reward">💰 {mission.reward}</span>
                <span className="status">{mission.status.toUpperCase()}</span>
              </div>
            </button>
          ))
        )}
      </div>
      <style jsx>{`
        .mission-panel {
          background: #1a1a2e;
          border: 2px solid #3d3d5c;
          padding: 1rem;
          min-width: 280px;
        }

        .panel-title {
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          color: #f39c12;
          margin: 0 0 1rem 0;
          letter-spacing: 0.1em;
        }

        .mission-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .mission-card {
          background: #0f0f1a;
          border: 1px solid #2d2d44;
          padding: 0.75rem;
          cursor: pointer;
          text-align: left;
          width: 100%;
          transition: border-color 0.2s;
        }

        .mission-card:hover {
          border-color: #f39c12;
        }

        .mission-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .status-dot {
          width: 8px;
          height: 8px;
        }

        .mission-title {
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          color: #ecf0f1;
        }

        .mission-desc {
          font-size: 0.75rem;
          color: #7f8c8d;
          margin: 0 0 0.5rem 0;
        }

        .mission-footer {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
        }

        .reward {
          color: #f1c40f;
        }

        .status {
          color: #95a5a6;
        }

        .empty-state {
          color: #636e72;
          font-size: 0.875rem;
          text-align: center;
          padding: 2rem;
        }
      `}</style>
    </div>
  );
}
