// src/components/station/StationRoom.tsx
'use client';

import React from 'react';

export interface StationRoomData {
  id: string;
  name: string;
  type: 'command' | 'engineering' | 'tech' | 'planning' | 'archive' | 'testing' | 'hangar' | 'quarters';
  x: number;
  y: number;
  width: number;
  height: number;
  npc?: {
    name: string;
    emoji: string;
    role: string;
  };
  color: string;
}

interface StationRoomProps {
  room: StationRoomData;
  isActive?: boolean;
  onEnter?: (room: StationRoomData) => void;
}

export const STATION_ROOMS: StationRoomData[] = [
  {
    id: 'command',
    name: 'COMMAND',
    type: 'command',
    x: 20,
    y: 15,
    width: 18,
    height: 18,
    npc: { name: 'The Director', emoji: '🎬', role: 'COMMANDER' },
    color: '#7fdbca',
  },
  {
    id: 'engineering',
    name: 'ENGINEERING',
    type: 'engineering',
    x: 55,
    y: 35,
    width: 22,
    height: 18,
    npc: { name: 'Engine Mechanic', emoji: '🔧', role: 'ENGINEERING' },
    color: '#f39c12',
  },
  {
    id: 'tech',
    name: 'TECH LABS',
    type: 'tech',
    x: 8,
    y: 45,
    width: 16,
    height: 15,
    npc: { name: 'Front-End Weaver', emoji: '🧵', role: 'UI/UX' },
    color: '#9b59b6',
  },
  {
    id: 'planning',
    name: 'PLANNING',
    type: 'planning',
    x: 70,
    y: 15,
    width: 18,
    height: 15,
    npc: { name: 'Blueprint Architect', emoji: '📋', role: 'ARCHITECT' },
    color: '#3498db',
  },
  {
    id: 'archive',
    name: 'ARCHIVE',
    type: 'archive',
    x: 5,
    y: 20,
    width: 14,
    height: 12,
    npc: { name: 'Lore Master', emoji: '📚', role: 'NARRATIVE' },
    color: '#e74c3c',
  },
  {
    id: 'testing',
    name: 'TESTING',
    type: 'testing',
    x: 40,
    y: 50,
    width: 20,
    height: 15,
    npc: { name: 'QA Interrogator', emoji: '🔎', role: 'QUALITY' },
    color: '#1abc9c',
  },
];

export default function StationRoom({ room, isActive, onEnter }: StationRoomProps) {
  return (
    <div
      className={`station-room ${isActive ? 'active' : ''}`}
      style={{
        left: `${room.x}%`,
        top: `${room.y}%`,
        width: `${room.width}%`,
        height: `${room.height}%`,
        borderColor: room.color,
      }}
      onClick={() => onEnter?.(room)}
    >
      <div className="room-name" style={{ color: room.color }}>
        {room.name}
      </div>
      {room.npc && (
        <div className="room-npc">
          <span className="npc-emoji">{room.npc.emoji}</span>
          <span className="npc-name">{room.npc.name}</span>
        </div>
      )}
      <style jsx>{`
        .station-room {
          position: absolute;
          background: rgba(10, 10, 18, 0.8);
          border: 2px solid;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .station-room:hover,
        .station-room.active {
          background: rgba(20, 20, 38, 0.95);
          transform: scale(1.02);
          box-shadow: 0 0 20px currentColor;
        }

        .room-name {
          font-family: 'Courier New', monospace;
          font-size: 0.625rem;
          letter-spacing: 0.1em;
          text-align: center;
        }

        .room-npc {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .npc-emoji {
          font-size: 1.5rem;
        }

        .npc-name {
          font-family: 'Courier New', monospace;
          font-size: 0.5rem;
          color: #95a5a6;
        }
      `}</style>
    </div>
  );
}
