"use client";

import { useState } from "react";

// Types
interface Agent {
  id: string;
  name: string;
  role: string;
  status: "idle" | "working" | "waiting" | "error";
  color: string;
  currentTask?: string;
  x: number;
  y: number;
}

// Mock station data
const mockAgents: Agent[] = [
  { id: "1", name: "The Director", role: "Commander", status: "working", color: "#4ade80", currentTask: "Fix auth bug", x: 25, y: 50 },
  { id: "2", name: "Code Warrior", role: "Developer", status: "idle", color: "#3b82f6", x: 50, y: 30 },
  { id: "3", name: "Design Master", role: "Designer", status: "waiting", color: "#a855f7", currentTask: "UI Review", x: 75, y: 50 },
  { id: "4", name: "Bug Hunter", role: "QA", status: "working", color: "#ef4444", currentTask: "Test API", x: 50, y: 70 },
  { id: "5", name: "Doc Writer", role: "Technical Writer", status: "idle", color: "#eab308", x: 35, y: 20 },
];

const statusColors: Record<Agent["status"], string> = {
  idle: "#6b7280",
  working: "#4ade80",
  waiting: "#fbbf24",
  error: "#ef4444",
};

const statusLabels: Record<Agent["status"], string> = {
  idle: "READY",
  working: "BUSY",
  waiting: "PAUSED",
  error: "ERROR",
};

export default function StationMap() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(selectedAgent?.id === agent.id ? null : agent);
  };

  return (
    <div className="station-map-container">
      {/* Header */}
      <div className="station-header pixel-font">
        <span className="station-title">🏢 STATION COMMAND</span>
        <span className="station-subtitle">Agent Status Overview</span>
      </div>

      {/* Map Area */}
      <div className="station-map">
        {/* Grid Background */}
        <div className="grid-lines" />
        
        {/* Room Labels */}
        <div className="room room-ops" style={{ left: "10%", top: "35%" }}>
          <span className="room-label pixel-font">COMMAND</span>
        </div>
        <div className="room room-dev" style={{ left: "40%", top: "15%" }}>
          <span className="room-label pixel-font">DEV BAY</span>
        </div>
        <div className="room room-qa" style={{ left: "40%", top: "55%" }}>
          <span className="room-label pixel-font">QA LAB</span>
        </div>
        <div className="room room-design" style={{ left: "70%", top: "35%" }}>
          <span className="room-label pixel-font">DESIGN</span>
        </div>

        {/* Agent Markers */}
        {mockAgents.map((agent) => (
          <div
            key={agent.id}
            className={`agent-marker ${selectedAgent?.id === agent.id ? "selected" : ""}`}
            style={{
              left: `${agent.x}%`,
              top: `${agent.y}%`,
              backgroundColor: agent.color,
              boxShadow: `0 0 20px ${agent.color}60`,
            }}
            onClick={() => handleAgentClick(agent)}
          >
            <div
              className="agent-status-dot"
              style={{ backgroundColor: statusColors[agent.status] }}
            />
            <span className="agent-marker-emoji">
              {agent.role === "Commander" ? "🎬" : 
               agent.role === "Developer" ? "💻" :
               agent.role === "Designer" ? "🎨" :
               agent.role === "QA" ? "🔍" : "📝"}
            </span>
          </div>
        ))}

        {/* Connection Lines */}
        <svg className="connection-lines">
          <line x1="25%" y1="50%" x2="50%" y2="30%" stroke="#4ade8040" strokeWidth="2" strokeDasharray="5,5" />
          <line x1="25%" y1="50%" x2="50%" y2="70%" stroke="#4ade8040" strokeWidth="2" strokeDasharray="5,5" />
          <line x1="50%" y1="30%" x2="75%" y2="50%" stroke="#4ade8040" strokeWidth="2" strokeDasharray="5,5" />
          <line x1="25%" y1="50%" x2="35%" y2="20%" stroke="#4ade8040" strokeWidth="2" strokeDasharray="5,5" />
        </svg>
      </div>

      {/* Agent Info Panel */}
      <div className="agent-panel">
        <div className="panel-header pixel-font">
          <span>AGENT ROSTER</span>
          <span className="agent-count">{mockAgents.length} ACTIVE</span>
        </div>
        
        <div className="agent-list">
          {mockAgents.map((agent) => (
            <div
              key={agent.id}
              className={`agent-card ${selectedAgent?.id === agent.id ? "selected" : ""}`}
              onClick={() => handleAgentClick(agent)}
            >
              <div
                className="agent-card-color"
                style={{ backgroundColor: agent.color }}
              />
              <div className="agent-card-info">
                <span className="agent-card-name pixel-font">{agent.name}</span>
                <span className="agent-card-role">{agent.role}</span>
              </div>
              <div className="agent-card-status">
                <span
                  className="status-badge pixel-font"
                  style={{ 
                    color: statusColors[agent.status],
                    borderColor: statusColors[agent.status],
                  }}
                >
                  {statusLabels[agent.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Agent Detail */}
      {selectedAgent && (
        <div className="agent-detail-panel">
          <div className="detail-header pixel-font">
            <span style={{ color: selectedAgent.color }}>{selectedAgent.name}</span>
            <button className="close-btn" onClick={() => setSelectedAgent(null)}>×</button>
          </div>
          <div className="detail-content">
            <div className="detail-row">
              <span className="detail-label">Role:</span>
              <span className="detail-value">{selectedAgent.role}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <span className="detail-value" style={{ color: statusColors[selectedAgent.status] }}>
                {statusLabels[selectedAgent.status]}
              </span>
            </div>
            {selectedAgent.currentTask && (
              <div className="detail-row">
                <span className="detail-label">Task:</span>
                <span className="detail-value">{selectedAgent.currentTask}</span>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">Position:</span>
              <span className="detail-value">x:{selectedAgent.x} y:{selectedAgent.y}</span>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .station-map-container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
          position: relative;
          overflow: hidden;
        }

        .station-header {
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(180deg, #1a1a2e 0%, transparent 100%);
          border-bottom: 1px solid #2d2d3e;
        }

        .station-title {
          font-size: 1.25rem;
          color: #fbbf24;
          text-shadow: 0 0 10px #fbbf2480;
        }

        .station-subtitle {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .station-map {
          flex: 1;
          position: relative;
          margin: 1rem;
          border-radius: 12px;
          background: linear-gradient(180deg, #15151f 0%, #1e1e2d 100%);
          border: 2px solid #2d2d3e;
          overflow: hidden;
        }

        .grid-lines {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .room {
          position: absolute;
          padding: 0.5rem 1rem;
          border: 1px dashed #4b5563;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.02);
        }

        .room-label {
          font-size: 0.65rem;
          color: #4b5563;
        }

        .agent-marker {
          position: absolute;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 3px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
          z-index: 5;
        }

        .agent-marker:hover, .agent-marker.selected {
          transform: translate(-50%, -50%) scale(1.15);
          border-color: white;
        }

        .agent-marker.selected {
          z-index: 10;
        }

        .agent-status-dot {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid #1a1a2e;
        }

        .agent-marker-emoji {
          font-size: 1.5rem;
        }

        .connection-lines {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .agent-panel {
          background: #15151f;
          border-top: 2px solid #2d2d3e;
          max-height: 200px;
          display: flex;
          flex-direction: column;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #2d2d3e;
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .agent-count {
          color: #4ade80;
        }

        .agent-list {
          display: flex;
          gap: 0.5rem;
          padding: 0.75rem;
          overflow-x: auto;
        }

        .agent-card {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0.75rem;
          background: #1e1e2d;
          border-radius: 8px;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
          min-width: 160px;
        }

        .agent-card:hover, .agent-card.selected {
          border-color: #4b5563;
          background: #252535;
        }

        .agent-card.selected {
          border-color: #fbbf24;
        }

        .agent-card-color {
          width: 8px;
          height: 32px;
          border-radius: 4px;
        }

        .agent-card-info {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .agent-card-name {
          font-size: 0.8rem;
          color: #f3f4f6;
        }

        .agent-card-role {
          font-size: 0.65rem;
          color: #6b7280;
        }

        .status-badge {
          font-size: 0.6rem;
          padding: 0.125rem 0.5rem;
          border: 1px solid;
          border-radius: 4px;
          white-space: nowrap;
        }

        .agent-detail-panel {
          position: absolute;
          right: 1rem;
          top: 80px;
          width: 220px;
          background: #1a1a2e;
          border-radius: 12px;
          border: 2px solid #fbbf24;
          box-shadow: 0 0 30px rgba(251, 191, 36, 0.2);
          z-index: 20;
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #2d2d3e;
          font-size: 1rem;
        }

        .close-btn {
          background: none;
          border: none;
          color: #6b7280;
          font-size: 1.25rem;
          cursor: pointer;
        }

        .close-btn:hover {
          color: #ef4444;
        }

        .detail-content {
          padding: 0.75rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
        }

        .detail-label {
          color: #6b7280;
        }

        .detail-value {
          color: #f3f4f6;
        }
      `}</style>
    </div>
  );
}
