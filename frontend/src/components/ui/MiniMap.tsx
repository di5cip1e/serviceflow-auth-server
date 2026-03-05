// src/components/ui/MiniMap.tsx
'use client';

import React from 'react';

export interface StationRoom {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'corridor' | 'quarters' | 'command' | 'engineering' | 'medbay' | 'storage';
}

interface MiniMapProps {
  playerX?: number;
  playerY?: number;
  rooms?: StationRoom[];
  width?: number;
  height?: number;
}

const defaultRooms: StationRoom[] = [
  { id: 'bridge', name: 'Bridge', x: 80, y: 20, width: 40, height: 30, type: 'command' },
  { id: 'corridor-main', name: 'Main Corridor', x: 30, y: 50, width: 140, height: 20, type: 'corridor' },
  { id: 'quarters-a', name: 'Quarters A', x: 20, y: 75, width: 30, height: 20, type: 'quarters' },
  { id: 'quarters-b', name: 'Quarters B', x: 55, y: 75, width: 30, height: 20, type: 'quarters' },
  { id: 'medbay', name: 'Medbay', x: 100, y: 75, width: 35, height: 20, type: 'medbay' },
  { id: 'engineering', name: 'Engineering', x: 140, y: 75, width: 30, height: 20, type: 'engineering' },
  { id: 'storage', name: 'Storage', x: 20, y: 20, width: 25, height: 25, type: 'storage' },
];

const roomColors: Record<StationRoom['type'], string> = {
  command: '#9b59b6',
  corridor: '#34495e',
  quarters: '#3498db',
  engineering: '#e67e22',
  medbay: '#2ecc71',
  storage: '#7f8c8d',
};

export default function MiniMap({
  playerX = 100,
  playerY = 60,
  rooms = defaultRooms,
  width = 200,
  height = 120,
}: MiniMapProps) {
  return (
    <div className="mini-map">
      <div className="map-header">STATION MAP</div>
      <svg 
        viewBox="0 0 200 120" 
        className="map-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {rooms.map((room) => (
          <g key={room.id}>
            <rect
              x={room.x}
              y={room.y}
              width={room.width}
              height={room.height}
              fill={roomColors[room.type]}
              stroke="#1a1a2e"
              strokeWidth="1"
              opacity="0.8"
            />
            <text
              x={room.x + room.width / 2}
              y={room.y + room.height / 2}
              fontSize="5"
              fill="#fff"
              textAnchor="middle"
              dominantBaseline="middle"
              pointerEvents="none"
            >
              {room.name.length > 8 ? room.name.slice(0, 7) + '.' : room.name}
            </text>
          </g>
        ))}
        
        {/* Player position indicator */}
        <circle
          cx={playerX}
          cy={playerY}
          r="4"
          fill="#7fdbca"
          stroke="#fff"
          strokeWidth="1"
          className="player-dot"
        />
      </svg>

      <style jsx>{`
        .mini-map {
          background: #0d0d1a;
          border: 2px solid #3d3d5c;
          padding: 0.5rem;
        }

        .map-header {
          font-family: 'Courier New', monospace;
          font-size: 0.625rem;
          color: #7fdbca;
          letter-spacing: 0.1em;
          margin-bottom: 0.5rem;
          text-align: center;
        }

        .map-svg {
          width: 100%;
          height: auto;
        }

        :global(.player-dot) {
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { r: 4; }
          50% { r: 6; }
        }
      `}</style>
    </div>
  );
}

// Type exported separately
