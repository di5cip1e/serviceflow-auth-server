// src/components/ui/StationDashboard.tsx
'use client';

import React from 'react';

interface StationStats {
  totalMissions: number;
  activeMissions: number;
  completedMissions: number;
  stationHealth: number;
  crewOnline: number;
}

interface StationDashboardProps {
  stats?: StationStats;
}

const DEFAULT_STATS: StationStats = {
  totalMissions: 24,
  activeMissions: 3,
  completedMissions: 18,
  stationHealth: 94,
  crewOnline: 7,
};

export default function StationDashboard({ stats = DEFAULT_STATS }: StationDashboardProps) {
  return (
    <div className="dashboard">
      <div className="station-header">
        <div className="station-logo">
          <span className="logo-icon">🛰️</span>
          <div className="logo-text">
            <h1>STATION COMMAND</h1>
            <span className="station-name">ORBITAL OUTPOST ALPHA-7</span>
          </div>
        </div>
        <div className="station-status">
          <span className="status-indicator online" />
          <span className="status-text">SYSTEMS NOMINAL</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">🎯</span>
          <div className="stat-content">
            <span className="stat-value">{stats.totalMissions}</span>
            <span className="stat-label">TOTAL MISSIONS</span>
          </div>
        </div>
        <div className="stat-card active">
          <span className="stat-icon">⚡</span>
          <div className="stat-content">
            <span className="stat-value">{stats.activeMissions}</span>
            <span className="stat-label">ACTIVE</span>
          </div>
        </div>
        <div className="stat-card success">
          <span className="stat-icon">✅</span>
          <div className="stat-content">
            <span className="stat-value">{stats.completedMissions}</span>
            <span className="stat-label">COMPLETED</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">❤️</span>
          <div className="stat-content">
            <span className="stat-value">{stats.stationHealth}%</span>
            <span className="stat-label">STATION HEALTH</span>
          </div>
        </div>
      </div>

      <div className="crew-section">
        <h2 className="section-title">◆ CREW STATUS</h2>
        <div className="crew-grid">
          <div className="crew-member">
            <span className="crew-avatar">🎬</span>
            <span className="crew-name">The Director</span>
            <span className="crew-role">COMMANDER</span>
            <span className="crew-status online">ONLINE</span>
          </div>
          <div className="crew-member">
            <span className="crew-avatar">🔧</span>
            <span className="crew-name">Engine Mechanic</span>
            <span className="crew-role">ENGINEERING</span>
            <span className="crew-status online">ONLINE</span>
          </div>
          <div className="crew-member">
            <span className="crew-avatar">🧵</span>
            <span className="crew-name">Front-End Weaver</span>
            <span className="crew-role">TECH LABS</span>
            <span className="crew-status online">ONLINE</span>
          </div>
          <div className="crew-member">
            <span className="crew-avatar">📋</span>
            <span className="crew-name">Blueprint Architect</span>
            <span className="crew-role">PLANNING</span>
            <span className="crew-status busy">BUSY</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          background: linear-gradient(180deg, #0d0d1a 0%, #1a1a2e 100%);
          min-height: 100vh;
          padding: 2rem;
          color: #ecf0f1;
        }

        .station-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid #2d2d44;
        }

        .station-logo {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .logo-icon {
          font-size: 3rem;
          filter: drop-shadow(0 0 20px rgba(127, 219, 202, 0.5));
        }

        .logo-text h1 {
          font-family: 'Courier New', monospace;
          font-size: 1.5rem;
          color: #7fdbca;
          letter-spacing: 0.2em;
          margin: 0;
        }

        .station-name {
          font-family: 'Courier New', monospace;
          font-size: 0.75rem;
          color: #636e72;
          letter-spacing: 0.15em;
        }

        .station-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(39, 174, 96, 0.1);
          padding: 0.5rem 1rem;
          border: 1px solid #27ae60;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .status-indicator.online {
          background: #27ae60;
          box-shadow: 0 0 10px #27ae60;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .status-text {
          font-family: 'Courier New', monospace;
          font-size: 0.75rem;
          color: #27ae60;
          letter-spacing: 0.1em;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%);
          border: 2px solid #3d3d5c;
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-card.active {
          border-color: #f39c12;
        }

        .stat-card.success {
          border-color: #27ae60;
        }

        .stat-icon {
          font-size: 2rem;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-family: 'Courier New', monospace;
          font-size: 1.5rem;
          color: #ecf0f1;
          font-weight: bold;
        }

        .stat-label {
          font-family: 'Courier New', monospace;
          font-size: 0.625rem;
          color: #636e72;
          letter-spacing: 0.15em;
        }

        .crew-section {
          background: #0f0f1a;
          border: 2px solid #3d3d5c;
          padding: 1.5rem;
        }

        .section-title {
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          color: #f39c12;
          letter-spacing: 0.1em;
          margin: 0 0 1rem 0;
        }

        .crew-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }

        .crew-member {
          background: #1a1a2e;
          border: 1px solid #2d2d44;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          text-align: center;
        }

        .crew-avatar {
          font-size: 2rem;
        }

        .crew-name {
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          color: #ecf0f1;
        }

        .crew-role {
          font-family: 'Courier New', monospace;
          font-size: 0.625rem;
          color: #636e72;
          letter-spacing: 0.1em;
        }

        .crew-status {
          font-family: 'Courier New', monospace;
          font-size: 0.625rem;
          padding: 0.25rem 0.5rem;
          border-radius: 2px;
        }

        .crew-status.online {
          background: rgba(39, 174, 96, 0.2);
          color: #27ae60;
        }

        .crew-status.busy {
          background: rgba(243, 156, 18, 0.2);
          color: #f39c12;
        }
      `}</style>
    </div>
  );
}
