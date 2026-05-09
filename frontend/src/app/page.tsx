'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import StationDashboard from '@/components/ui/StationDashboard';
import MissionPanel from '@/components/ui/MissionPanel';
import MissionCreator, { MissionTemplate } from '@/components/ui/MissionCreator';
import { api, Mission, StationStats } from '@/lib/api';

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

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [stats, setStats] = useState<StationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMissionCreator, setShowMissionCreator] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch missions and agents in parallel
        const [missionsData, agentsData] = await Promise.all([
          api.fetchMissions(),
          api.fetchAgents(),
        ]);
        
        // Defensive: ensure data is arrays to prevent crashes
        const safeMissionsData = Array.isArray(missionsData) ? missionsData : [];
        const safeAgentsData = Array.isArray(agentsData) ? agentsData : [];
        
        // Transform API missions to UI format
        const transformedMissions: Mission[] = safeMissionsData.map((m: ApiMission) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          status: m.status === 'IN_PROGRESS' ? 'active' : 
                  m.status === 'COMPLETED' ? 'completed' : 
                  m.status === 'FAILED' ? 'failed' : 'active',
          reward: m.rewards?.xp || 0,
        }));
        
        setMissions(transformedMissions);
        
        // Compute stats from API data
        const computedStats = api.computeStats(safeMissionsData, safeAgentsData);
        setStats(computedStats);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleCreateMission = async (mission: Omit<MissionTemplate, 'id'>) => {
    try {
      const newMission = await api.createMission({
        title: mission.title,
        description: mission.description,
        type: mission.type.toUpperCase() as any,
        difficulty: mission.difficulty.toString() as any,
      });
      
      // Add new mission to the list
      setMissions(prev => [{
        id: newMission.id,
        title: newMission.title,
        description: newMission.description,
        status: 'active',
        reward: mission.reward,
      }, ...prev]);
      
      // Update stats
      if (stats) {
        setStats({
          ...stats,
          totalMissions: stats.totalMissions + 1,
          activeMissions: stats.activeMissions + 1,
        });
      }
      
      setShowMissionCreator(false);
    } catch (err) {
      console.error('Failed to create mission:', err);
      setError(err instanceof Error ? err.message : 'Failed to create mission');
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <span className="loading-icon">🛰️</span>
          <span className="loading-text">CONNECTING TO STATION...</span>
          <div className="loading-spinner" />
        </div>
        <style jsx>{`
          .loading-screen {
            min-height: 100vh;
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
            font-size: 0.875rem;
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #2d2d44;
            border-top-color: #7fdbca;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <div className="error-content">
          <span className="error-icon">⚠️</span>
          <span className="error-title">CONNECTION ERROR</span>
          <span className="error-message">{error}</span>
          <button 
            className="retry-btn"
            onClick={() => window.location.reload()}
          >
            RETRY CONNECTION
          </button>
        </div>
        <style jsx>{`
          .error-screen {
            min-height: 100vh;
            background: #0a0a12;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .error-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            padding: 2rem;
            border: 2px solid #e74c3c;
            background: rgba(231, 76, 60, 0.1);
          }
          .error-icon {
            font-size: 3rem;
          }
          .error-title {
            font-family: 'Courier New', monospace;
            color: #e74c3c;
            letter-spacing: 0.2em;
            font-size: 1rem;
          }
          .error-message {
            font-family: 'Courier New', monospace;
            color: #636e72;
            font-size: 0.75rem;
          }
          .retry-btn {
            background: #e74c3c;
            border: none;
            padding: 0.75rem 1.5rem;
            font-family: 'Courier New', monospace;
            color: #fff;
            cursor: pointer;
            margin-top: 1rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="home-page">
      <StationDashboard stats={stats || undefined} />
      
      <div className="missions-section">
        <div className="missions-header">
          <h2 className="section-title">◆ MISSION CONTROL</h2>
          <button 
            className="create-mission-btn"
            onClick={() => setShowMissionCreator(!showMissionCreator)}
          >
            {showMissionCreator ? '✕ CLOSE' : '+ NEW MISSION'}
          </button>
        </div>
        
        {showMissionCreator && (
          <div className="creator-overlay">
            <MissionCreator 
              onCreateMission={handleCreateMission}
              onClose={() => setShowMissionCreator(false)}
            />
          </div>
        )}
        
        <MissionPanel 
          missions={missions}
          onSelectMission={(m) => console.log('Selected:', m)}
        />
      </div>

      <div className="quick-actions">
        <a href="/game" className="action-card">
          <span className="action-icon">🚀</span>
          <span className="action-label">ENTER STATION</span>
          <span className="action-desc">Explore the orbital base</span>
        </a>
        <a href="/battle" className="action-card">
          <span className="action-icon">⚔️</span>
          <span className="action-label">AGENT BATTLE</span>
          <span className="action-desc">Test your team</span>
        </a>
      </div>

      <style jsx>{`
        .home-page {
          min-height: 100vh;
          background: #0a0a12;
        }

        .missions-section {
          padding: 2rem;
          max-width: 800px;
          margin: 0 auto;
        }

        .missions-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .section-title {
          font-family: 'Courier New', monospace;
          font-size: 1rem;
          color: #f39c12;
          letter-spacing: 0.1em;
          margin: 0;
        }

        .create-mission-btn {
          background: linear-gradient(180deg, #f39c12 0%, #e67e22 100%);
          border: none;
          padding: 0.5rem 1rem;
          font-family: 'Courier New', monospace;
          font-size: 0.75rem;
          color: #0a0a12;
          font-weight: bold;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.2s;
        }

        .create-mission-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(243, 156, 18, 0.4);
        }

        .creator-overlay {
          margin-bottom: 1rem;
        }

        .quick-actions {
          display: flex;
          gap: 1rem;
          padding: 2rem;
          justify-content: center;
        }

        .action-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%);
          border: 2px solid #3d3d5c;
          padding: 2rem;
          min-width: 200px;
          text-decoration: none;
          transition: all 0.2s;
        }

        .action-card:hover {
          border-color: #7fdbca;
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(127, 219, 202, 0.2);
        }

        .action-icon {
          font-size: 2.5rem;
        }

        .action-label {
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          color: #ecf0f1;
          letter-spacing: 0.1em;
        }

        .action-desc {
          font-size: 0.75rem;
          color: #636e72;
        }
      `}</style>
    </div>
  );
}
