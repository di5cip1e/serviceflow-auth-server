// src/components/ui/MissionCreator.tsx
'use client';

import React, { useState } from 'react';

export interface MissionTemplate {
  id: string;
  title: string;
  description: string;
  type: 'surveillance' | 'logistics' | 'repair' | 'exploration' | 'crisis';
  difficulty: number;
  reward: number;
  estimatedTime: string;
}

const MISSION_TYPES = [
  { value: 'surveillance', label: '🔍 Surveillance', desc: 'Monitor systems for anomalies' },
  { value: 'logistics', label: '📦 Logistics', desc: 'Transport resources between stations' },
  { value: 'repair', label: '🔧 Repair', desc: 'Fix broken systems and debug issues' },
  { value: 'exploration', label: '🧭 Exploration', desc: 'Discover new content and hidden areas' },
  { value: 'crisis', label: '⚠️ Crisis Response', desc: 'Handle emergencies within time limit' },
] as const;

interface MissionCreatorProps {
  onCreateMission?: (mission: Omit<MissionTemplate, 'id'>) => void;
  onClose?: () => void;
}

export default function MissionCreator({ onCreateMission, onClose }: MissionCreatorProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<MissionTemplate['type']>('surveillance');
  const [difficulty, setDifficulty] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);

  const getBaseReward = () => {
    const baseRewards = { surveillance: 10, logistics: 15, repair: 20, exploration: 12, crisis: 30 };
    return baseRewards[type] * difficulty;
  };

  const getEstimatedTime = () => {
    const times = { surveillance: '15-30 min', logistics: '20-45 min', repair: '10-25 min', exploration: '10-20 min', crisis: '5-15 min' };
    return times[type];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onCreateMission?.({
      title,
      description,
      type,
      difficulty,
      reward: getBaseReward(),
      estimatedTime: getEstimatedTime(),
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setDifficulty(1);
  };

  return (
    <div className="mission-creator">
      <div className="creator-header">
        <h2 className="creator-title">◆ CREATE NEW MISSION</h2>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">MISSION TITLE</label>
          <input
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter mission title..."
            maxLength={50}
          />
        </div>

        <div className="form-group">
          <label className="form-label">DESCRIPTION</label>
          <textarea
            className="form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief the crew on mission objectives..."
            rows={3}
            maxLength={200}
          />
        </div>

        <div className="form-group">
          <label className="form-label">MISSION TYPE</label>
          <div className="type-selector">
            {MISSION_TYPES.map((mt) => (
              <button
                key={mt.value}
                type="button"
                className={`type-btn ${type === mt.value ? 'active' : ''}`}
                onClick={() => setType(mt.value as MissionTemplate['type'])}
              >
                <span className="type-label">{mt.label}</span>
                <span className="type-desc">{mt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">DIFFICULTY: {difficulty}/5</label>
          <div className="difficulty-selector">
            {[1, 2, 3, 4, 5].map((d) => (
              <button
                key={d}
                type="button"
                className={`diff-btn ${difficulty >= d ? 'active' : ''}`}
                onClick={() => setDifficulty(d)}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="difficulty-info">
            <span className="reward-preview">💰 Reward: {getBaseReward()} XP</span>
            <span className="time-preview">⏱️ {getEstimatedTime()}</span>
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={!title.trim()}>
          LAUNCH MISSION
        </button>
      </form>

      <style jsx>{`
        .mission-creator {
          background: linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%);
          border: 2px solid #7fdbca;
          padding: 1.5rem;
          min-width: 400px;
          max-width: 500px;
        }

        .creator-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .creator-title {
          font-family: 'Courier New', monospace;
          font-size: 1rem;
          color: #7fdbca;
          letter-spacing: 0.1em;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: 1px solid #3d3d5c;
          color: #636e72;
          width: 28px;
          height: 28px;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .close-btn:hover {
          border-color: #e74c3c;
          color: #e74c3c;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-label {
          display: block;
          font-family: 'Courier New', monospace;
          font-size: 0.625rem;
          color: #636e72;
          letter-spacing: 0.15em;
          margin-bottom: 0.5rem;
        }

        .form-input,
        .form-textarea {
          width: 100%;
          background: #0a0a12;
          border: 2px solid #2d2d44;
          padding: 0.75rem;
          color: #ecf0f1;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          transition: border-color 0.2s;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #7fdbca;
        }

        .form-input::placeholder,
        .form-textarea::placeholder {
          color: #3d3d5c;
        }

        .form-textarea {
          resize: vertical;
          min-height: 60px;
        }

        .type-selector {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .type-btn {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          background: #0a0a12;
          border: 1px solid #2d2d44;
          padding: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .type-btn:hover {
          border-color: #3d3d5c;
        }

        .type-btn.active {
          border-color: #f39c12;
          background: rgba(243, 156, 18, 0.1);
        }

        .type-label {
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          color: #ecf0f1;
        }

        .type-desc {
          font-size: 0.625rem;
          color: #636e72;
        }

        .difficulty-selector {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .diff-btn {
          width: 40px;
          height: 40px;
          background: #0a0a12;
          border: 2px solid #2d2d44;
          color: #636e72;
          font-family: 'Courier New', monospace;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .diff-btn.active {
          border-color: #f39c12;
          color: #f39c12;
          background: rgba(243, 156, 18, 0.1);
        }

        .diff-btn:hover {
          border-color: #f39c12;
        }

        .difficulty-info {
          display: flex;
          gap: 1.5rem;
          font-family: 'Courier New', monospace;
          font-size: 0.75rem;
        }

        .reward-preview {
          color: #f1c40f;
        }

        .time-preview {
          color: #7fdbca;
        }

        .submit-btn {
          width: 100%;
          background: linear-gradient(180deg, #7fdbca 0%, #4ade80 100%);
          border: none;
          padding: 1rem;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          color: #0a0a12;
          font-weight: bold;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 0.5rem;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(127, 219, 202, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export type { MissionTemplate };
