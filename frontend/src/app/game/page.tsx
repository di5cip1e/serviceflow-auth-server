'use client';

import { useState, useEffect, useCallback } from 'react';
import GameCanvas from '@/components/game/GameCanvas';
import HUD, { PlayerStats } from '@/components/ui/HUD';
import DialogueBox from '@/components/dialogue/DialogueBox';
import StationRoom, { STATION_ROOMS, StationRoomData } from '@/components/station/StationRoom';
import MissionPanel from '@/components/ui/MissionPanel';
import { api, Mission, User, Agent } from '@/lib/api';

interface ApiMission {
  id: string;
  title: string;
  description: string;
  status: 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  rewards: {
    xp: number;
    credits: number;
  };
}

export default function GamePage() {
  const [currentDialogue, setCurrentDialogue] = useState<any>(null);
  const [activeRoom, setActiveRoom] = useState<StationRoomData | null>(null);
  const [showMissionPanel, setShowMissionPanel] = useState(false);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [player, setPlayer] = useState<PlayerStats | null>(null);
  const [playerPos, setPlayerPos] = useState({ x: 30, y: 35 }); // %
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGameData() {
      try {
        setLoading(true);
        setError(null);
        
        const [userData, missionsData, agentsData] = await Promise.all([
          api.fetchCurrentUser().catch(() => null),
          api.fetchMissions(),
          api.fetchAgents(),
        ]);
        
        // Transform missions
        const transformedMissions: Mission[] = missionsData.map((m: ApiMission) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          status: m.status === 'IN_PROGRESS' ? 'active' : 
                  m.status === 'COMPLETED' ? 'completed' : 
                  m.status === 'FAILED' ? 'failed' : 'active',
          reward: m.rewards?.xp || 0,
        }));
        
        setMissions(transformedMissions);
        
        // Set player stats from user data
        if (userData) {
          setPlayer({
            name: userData.username,
            rank: userData.rank || 'Commander',
            level: Math.floor(userData.xp / 100) + 1,
            currentXp: userData.xp % 100,
            maxXp: 100,
            health: 100,
            maxHealth: 100,
          });
        } else {
          // Default player stats if no user data
          setPlayer({
            name: 'Commander',
            rank: 'Lieutenant',
            level: 1,
            currentXp: 0,
            maxXp: 100,
            health: 100,
            maxHealth: 100,
          });
        }
      } catch (err) {
        console.error('Failed to fetch game data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load game data');
        // Set default player stats on error
        setPlayer({
          name: 'Commander',
          rank: 'Lieutenant',
          level: 1,
          currentXp: 0,
          maxXp: 100,
          health: 100,
          maxHealth: 100,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchGameData();
  }, []);

  const handleRoomEnter = useCallback((room: StationRoomData) => {
    setActiveRoom(room);
    setCurrentDialogue({
      id: 'room-dialogue',
      speaker: room.npc?.name || 'Station',
      text: `Welcome to the ${room.name} sector. How can I assist you today, ${player?.name || 'Commander'}?`,
      choices: [
        { id: '1', text: '📋 View Missions', action: 'missions' },
        { id: '2', text: '💻 Check Systems', action: 'systems' },
        { id: '3', text: '👋 Just looking around', action: 'bye' },
      ],
    });
  }, [player?.name]);

  const handleChoice = (choice: any) => {
    if (choice.action === 'missions') {
      setShowMissionPanel(true);
    }
    setCurrentDialogue(null);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <span className="loading-icon">🛰️</span>
          <span className="loading-text">LOADING STATION...</span>
        </div>
        <style jsx>{`
          .loading-screen {
            width: 100vw;
            height: 100vh;
            background: #0a0a12;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .loading-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }
          .loading-icon {
            font-size: 3rem;
            animation: pulse 2s infinite;
          }
          .loading-text {
            font-family: 'Courier New', monospace;
            color: #7fdbca;
            letter-spacing: 0.2em;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="game-page">
      <GameCanvas>
        {/* Station Rooms - clickable stations */}
        {STATION_ROOMS.map(room => (
          <StationRoom
            key={room.id}
            room={room}
            isActive={activeRoom?.id === room.id}
            onEnter={handleRoomEnter}
          />
        ))}
      </GameCanvas>

      <HUD 
        player={player || {
          name: 'Commander',
          rank: 'Unknown',
          level: 1,
          currentXp: 0,
          maxXp: 100,
          health: 100,
          maxHealth: 100,
        }}
        playerPosition={playerPos}
      />

      <DialogueBox 
        node={currentDialogue} 
        onChoice={handleChoice} 
      />

      {showMissionPanel && (
        <div className="mission-panel-overlay" onClick={() => setShowMissionPanel(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <MissionPanel 
              missions={missions}
              onSelectMission={(m) => console.log('Selected:', m)}
            />
            <button 
              className="close-mission-btn"
              onClick={() => setShowMissionPanel(false)}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      <div className="controls-hint">
        <span>Click on station rooms to interact</span>
        <span>Arrow keys to move</span>
      </div>

      <style jsx>{`
        .game-page {
          width: 100vw;
          height: 100vh;
          position: relative;
          overflow: hidden;
        }

        .mission-panel-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
        }

        .close-mission-btn {
          width: 100%;
          margin-top: 1rem;
          background: #3d3d5c;
          border: none;
          padding: 0.75rem;
          font-family: 'Courier New', monospace;
          font-size: 0.75rem;
          color: #ecf0f1;
          cursor: pointer;
          transition: background 0.2s;
        }

        .close-mission-btn:hover {
          background: #4d4d6c;
        }

        .controls-hint {
          position: absolute;
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 2rem;
          font-family: 'Courier New', monospace;
          font-size: 0.625rem;
          color: #636e72;
          letter-spacing: 0.1em;
        }
      `}</style>
    </div>
  );
}
