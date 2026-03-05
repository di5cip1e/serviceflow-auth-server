'use client';

import { useEffect, useRef, useState } from 'react';

// Subagent data - 10 agents
const SUBAGENTS = [
  { id: 1, name: 'Navigator', role: 'Exploration', status: 'active', color: '#ff00ff' },
  { id: 2, name: 'Strategist', role: 'Planning', status: 'active', color: '#aa00ff' },
  { id: 3, name: 'Architect', role: 'Construction', status: 'idle', color: '#7700ff' },
  { id: 4, name: 'Analyst', role: 'Data', status: 'active', color: '#5500ff' },
  { id: 5, name: 'Messenger', role: 'Communication', status: 'busy', color: '#ff00aa' },
  { id: 6, name: 'Guardian', role: 'Security', status: 'active', color: '#aa0088' },
  { id: 7, name: 'Architect II', role: 'Design', status: 'idle', color: '#8800ff' },
  { id: 8, name: 'Curator', role: 'Memory', status: 'active', color: '#ff0088' },
  { id: 9, name: 'Weaver', role: 'Frontend', status: 'active', color: '#aa00aa' },
  { id: 10, name: 'Smith', role: 'Tools', status: 'idle', color: '#ff00ff' },
];

// Project planets data
const PLANETS = [
  { id: 1, name: 'Frontend Forge', x: 15, y: 20, radius: 8, projects: 3, color: '#ff00ff' },
  { id: 2, name: 'Memory Core', x: 75, y: 25, radius: 6, projects: 5, color: '#aa00ff' },
  { id: 3, name: 'Battle Zone', x: 45, y: 70, radius: 10, projects: 2, color: '#ff0088' },
  { id: 4, name: 'Station Hub', x: 60, y: 45, radius: 12, projects: 8, color: '#8800ff' },
  { id: 5, name: 'Dialogue Nexus', x: 25, y: 65, radius: 7, projects: 4, color: '#aa0088' },
  { id: 6, name: 'Tool Bay', x: 80, y: 75, radius: 5, projects: 6, color: '#ff00aa' },
];

interface AgentDot {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: string;
  name: string;
}

export default function HoloRoom() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [agents, setAgents] = useState<AgentDot[]>([]);
  const [selectedPlanet, setSelectedPlanet] = useState<typeof PLANETS[0] | null>(null);
  const [scanLinePos, setScanLinePos] = useState(0);
  const animationRef = useRef<number>(0);

  // Initialize agents
  useEffect(() => {
    const initialAgents: AgentDot[] = SUBAGENTS.map((agent) => ({
      id: agent.id,
      x: 50 + Math.random() * 30 - 15,
      y: 50 + Math.random() * 30 - 15,
      targetX: 50 + Math.random() * 30 - 15,
      targetY: 50 + Math.random() * 30 - 15,
      color: agent.color,
      name: agent.name,
    }));
    setAgents(initialAgents);
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      time += 0.016;
      setScanLinePos((time * 50) % canvas.height);

      // Clear with fade effect
      ctx.fillStyle = 'rgba(10, 10, 18, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = 'rgba(170, 0, 255, 0.1)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw radial grid
      ctx.strokeStyle = 'rgba(255, 0, 255, 0.05)';
      for (let r = 100; r < 800; r += 100) {
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw planets
      PLANETS.forEach((planet) => {
        const px = (planet.x / 100) * canvas.width;
        const py = (planet.y / 100) * canvas.height;
        
        // Planet glow
        const gradient = ctx.createRadialGradient(px, py, 0, px, py, planet.radius * 4);
        gradient.addColorStop(0, `${planet.color}44`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(px - planet.radius * 4, py - planet.radius * 4, planet.radius * 8, planet.radius * 4);

        // Planet core
        ctx.beginPath();
        ctx.arc(px, py, planet.radius, 0, Math.PI * 2);
        ctx.fillStyle = planet.color;
        ctx.shadowColor = planet.color;
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Planet ring
        ctx.strokeStyle = `${planet.color}88`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(px, py, planet.radius * 1.8, planet.radius * 0.4, time * 0.5, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Update and draw agents
      setAgents((prevAgents) => 
        prevAgents.map((agent) => {
          // Move towards target
          const dx = agent.targetX - agent.x;
          const dy = agent.targetY - agent.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 2) {
            // Pick new target
            return {
              ...agent,
              targetX: 20 + Math.random() * 60,
              targetY: 20 + Math.random() * 60,
            };
          }
          
          return {
            ...agent,
            x: agent.x + (dx / dist) * 0.3,
            y: agent.y + (dy / dist) * 0.3,
          };
        })
      );

      // Draw agents
      agents.forEach((agent) => {
        const ax = (agent.x / 100) * canvas.width;
        const ay = (agent.y / 100) * canvas.height;
        
        // Agent trail
        ctx.beginPath();
        ctx.arc(ax - 3, ay - 3, 4, 0, Math.PI * 2);
        ctx.fillStyle = `${agent.color}44`;
        ctx.fill();

        // Agent glow
        ctx.shadowColor = agent.color;
        ctx.shadowBlur = 15;
        
        // Agent dot (16-bit style square)
        ctx.fillStyle = agent.color;
        ctx.fillRect(ax - 4, ay - 4, 8, 8);
        
        // Inner highlight
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(ax - 2, ay - 2, 3, 3);
        
        ctx.shadowBlur = 0;
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [agents]);

  return (
    <div style={styles.container}>
      {/* Canvas Background */}
      <canvas ref={canvasRef} style={styles.canvas} />

      {/* Scan Lines Overlay */}
      <div style={styles.scanLines}>
        <div style={{ ...styles.scanLine, top: scanLinePos }} />
      </div>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          <span style={styles.titleGlow}>◈</span> HOLO ROOM <span style={styles.titleGlow}>◈</span>
        </h1>
        <div style={styles.subtitle}>TACTICAL GALAXY DISPLAY // SYSTEM ONLINE</div>
      </div>

      {/* Left Panel - Agent Status */}
      <div style={styles.leftPanel}>
        <div style={styles.panelHeader}>
          <span style={styles.panelIcon}>◉</span> AGENT FLEET
        </div>
        <div style={styles.agentList}>
          {SUBAGENTS.map((agent, index) => (
            <div 
              key={agent.id} 
              style={{
                ...styles.agentCard,
                borderColor: agent.status === 'active' ? agent.color : '#333',
                boxShadow: agent.status === 'active' ? `0 0 10px ${agent.color}44` : 'none',
              }}
            >
              <div style={styles.agentDot} />
              <div style={styles.agentInfo}>
                <div style={styles.agentName}>{agent.name}</div>
                <div style={styles.agentRole}>{agent.role}</div>
              </div>
              <div style={{
                ...styles.agentStatus,
                color: agent.status === 'active' ? '#00ff88' : agent.status === 'busy' ? '#ffaa00' : '#666',
              }}>
                {agent.status.toUpperCase()}
              </div>
              <div style={{ ...styles.agentBar, width: `${60 + index * 4}%` }} />
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Planet Info */}
      <div style={styles.rightPanel}>
        <div style={styles.panelHeader}>
          <span style={styles.panelIcon}>◈</span> SECTOR INTEL
        </div>
        <div style={styles.planetList}>
          {PLANETS.map((planet) => (
            <div 
              key={planet.id}
              style={{
                ...styles.planetCard,
                borderColor: planet.color,
              }}
              onClick={() => setSelectedPlanet(planet)}
            >
              <div style={{ ...styles.planetIcon, backgroundColor: planet.color }} />
              <div>
                <div style={styles.planetName}>{planet.name}</div>
                <div style={styles.planetProjects}>{planet.projects} ACTIVE PROJECTS</div>
              </div>
            </div>
          ))}
        </div>

        {selectedPlanet && (
          <div style={styles.detailPanel}>
            <div style={styles.detailHeader}>◈ {selectedPlanet.name}</div>
            <div style={styles.detailStats}>
              <div style={styles.statRow}>
                <span>SECTOR</span>
                <span>{selectedPlanet.x}:{selectedPlanet.y}</span>
              </div>
              <div style={styles.statRow}>
                <span>PROJECTS</span>
                <span>{selectedPlanet.projects}</span>
              </div>
              <div style={styles.statRow}>
                <span>STATUS</span>
                <span style={{ color: '#00ff88' }}>ONLINE</span>
              </div>
            </div>
            <div style={styles.detailBar}>
              <div style={{ ...styles.detailBarFill, width: `${selectedPlanet.projects * 12.5}%`, backgroundColor: selectedPlanet.color }} />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Stats */}
      <div style={styles.bottomBar}>
        <div style={styles.stat}>
          <span style={styles.statLabel}>FLEET SIZE</span>
          <span style={styles.statValue}>10 UNITS</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statLabel}>ACTIVE</span>
          <span style={{ ...styles.statValue, color: '#00ff88' }}>7</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statLabel}>SECTORS</span>
          <span style={styles.statValue}>6</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statLabel}>SIGNAL</span>
          <span style={{ ...styles.statValue, color: '#ff00ff' }}>█98%</span>
        </div>
      </div>

      {/* Corner Decorations */}
      <div style={{ ...styles.corner, top: 0, left: 0 }}>┌─</div>
      <div style={{ ...styles.corner, top: 0, right: 0 }}>┐</div>
      <div style={{ ...styles.corner, bottom: 0, left: 0 }}>└─</div>
      <div style={{ ...styles.corner, bottom: 0, right: 0 }}>┘</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100vw',
    height: '100vh',
    position: 'relative',
    overflow: 'hidden',
    background: 'linear-gradient(180deg, #0a0a12 0%, #1a0a2e 100%)',
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  scanLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(170, 0, 255, 0.03) 2px, rgba(170, 0, 255, 0.03) 4px)',
    zIndex: 10,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    width: '100%',
    height: '4px',
    background: 'linear-gradient(90deg, transparent, rgba(255, 0, 255, 0.4), transparent)',
    boxShadow: '0 0 20px rgba(255, 0, 255, 0.5)',
  },
  header: {
    position: 'absolute',
    top: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    textAlign: 'center',
    zIndex: 20,
  },
  title: {
    fontFamily: '"Courier New", monospace',
    fontSize: 28,
    color: '#ff00ff',
    textShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff, 0 0 40px #aa00ff',
    letterSpacing: 8,
    margin: 0,
  },
  titleGlow: {
    color: '#aa00ff',
    textShadow: '0 0 10px #aa00ff',
  },
  subtitle: {
    fontFamily: '"Courier New", monospace',
    fontSize: 10,
    color: '#666',
    letterSpacing: 4,
    marginTop: 4,
  },
  leftPanel: {
    position: 'absolute',
    left: 20,
    top: 80,
    width: 220,
    maxHeight: 'calc(100vh - 180px)',
    background: 'rgba(10, 10, 18, 0.85)',
    border: '1px solid #333',
    borderLeft: '3px solid #ff00ff',
    zIndex: 20,
    overflow: 'hidden',
  },
  rightPanel: {
    position: 'absolute',
    right: 20,
    top: 80,
    width: 240,
    maxHeight: 'calc(100vh - 180px)',
    background: 'rgba(10, 10, 18, 0.85)',
    border: '1px solid #333',
    borderRight: '3px solid #aa00ff',
    zIndex: 20,
    overflow: 'hidden',
  },
  panelHeader: {
    fontFamily: '"Courier New", monospace',
    fontSize: 12,
    color: '#ff00ff',
    padding: '12px 16px',
    borderBottom: '1px solid #333',
    background: 'linear-gradient(180deg, rgba(170, 0, 255, 0.1) 0%, transparent 100%)',
    letterSpacing: 2,
  },
  panelIcon: {
    color: '#aa00ff',
    marginRight: 8,
  },
  agentList: {
    padding: 8,
    maxHeight: 'calc(100vh - 260px)',
    overflowY: 'auto',
  },
  agentCard: {
    position: 'relative',
    padding: '10px 12px',
    marginBottom: 6,
    background: 'rgba(30, 20, 40, 0.6)',
    border: '1px solid',
    borderLeft: '3px solid',
    fontFamily: '"Courier New", monospace',
  },
  agentDot: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 6,
    height: 6,
    background: '#ff00ff',
    boxShadow: '0 0 6px #ff00ff',
  },
  agentInfo: {
    paddingLeft: 20,
  },
  agentName: {
    fontSize: 11,
    color: '#fff',
    fontWeight: 'bold',
  },
  agentRole: {
    fontSize: 9,
    color: '#666',
  },
  agentStatus: {
    position: 'absolute',
    right: 10,
    top: 10,
    fontSize: 8,
    fontWeight: 'bold',
  },
  agentBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 2,
    background: 'linear-gradient(90deg, #ff00ff, #aa00ff)',
    opacity: 0.6,
  },
  planetList: {
    padding: 8,
    maxHeight: 280,
    overflowY: 'auto',
  },
  planetCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    marginBottom: 6,
    background: 'rgba(30, 20, 40, 0.6)',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: '"Courier New", monospace',
  },
  planetIcon: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    boxShadow: '0 0 8px currentColor',
  },
  planetName: {
    fontSize: 11,
    color: '#fff',
    fontWeight: 'bold',
  },
  planetProjects: {
    fontSize: 9,
    color: '#666',
  },
  detailPanel: {
    margin: '8px',
    padding: 12,
    background: 'rgba(20, 10, 30, 0.8)',
    border: '1px solid #aa00ff',
  },
  detailHeader: {
    fontFamily: '"Courier New", monospace',
    fontSize: 11,
    color: '#aa00ff',
    marginBottom: 10,
    letterSpacing: 1,
  },
  detailStats: {
    marginBottom: 10,
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontFamily: '"Courier New", monospace',
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
  },
  detailBar: {
    height: 4,
    background: '#222',
    borderRadius: 2,
    overflow: 'hidden',
  },
  detailBarFill: {
    height: '100%',
    transition: 'width 0.3s',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: 40,
    padding: '12px 24px',
    background: 'rgba(10, 10, 18, 0.9)',
    border: '1px solid #333',
    borderBottom: '2px solid #ff00ff',
    zIndex: 20,
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: '"Courier New", monospace',
    fontSize: 9,
    color: '#666',
    letterSpacing: 2,
  },
  statValue: {
    fontFamily: '"Courier New", monospace',
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  corner: {
    position: 'absolute',
    fontFamily: '"Courier New", monospace',
    fontSize: 16,
    color: '#333',
    zIndex: 20,
  },
};
