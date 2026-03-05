// Simple battle view without styled-jsx
"use client";

import { useState, useEffect } from "react";
import { battleAudio } from "@/lib/battleAudio";

interface Agent {
  id: string;
  name: string;
  role: string;
  xp: number;
  color: string;
  sprite: string;
}

const mockAgent: Agent = {
  id: "coordinator",
  name: "Coordinator",
  role: "Task Manager",
  xp: 450,
  color: "#00ffff",
  sprite: "/sprites/agents/coordinator_idle.svg"
};

const mockTask = {
  id: "task-1",
  name: "Backend Fix",
  type: "code",
  progress: 0
};

export default function AgentBattle() {
  const [task, setTask] = useState(mockTask);
  const [isAttacking, setIsAttacking] = useState(false);

  useEffect(() => {
    battleAudio.playBattleMusic();
    return () => battleAudio.stopMusic();
  }, []);

  const handleAttack = () => {
    setIsAttacking(true);
    setTimeout(() => {
      setTask(t => ({ ...t, progress: Math.min(100, t.progress + 20) }));
      setIsAttacking(false);
      
      if (task.progress >= 80) {
        battleAudio.playVictory();
      }
    }, 600);
  };

  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    backgroundColor: "#0a0a0f",
    color: "#fff",
    padding: "20px",
    fontFamily: "'Courier New', monospace"
  };

  return (
    <div style={containerStyle}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ color: "#f59e0b", fontSize: "2rem" }}>⚔️ BATTLE ⚔️</h1>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "800px", margin: "0 auto" }}>
        {/* Agent */}
        <div style={{ textAlign: "center" }}>
          <div style={{ color: mockAgent.color, fontSize: "1.2rem", marginBottom: "10px" }}>{mockAgent.name}</div>
          <div style={{ fontSize: "0.9rem", color: "#888" }}>{mockAgent.role}</div>
          <div style={{ fontSize: "0.8rem", color: "#4ade80", marginTop: "5px" }}>XP: {mockAgent.xp}</div>
        </div>

        {/* VS */}
        <div style={{ color: "#ef4444", fontSize: "1.5rem" }}>VS</div>

        {/* Task/Enemy */}
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#ef4444", fontSize: "1.2rem", marginBottom: "10px" }}>{task.name}</div>
          <div style={{ fontSize: "0.9rem", color: "#888" }}>{task.type}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ maxWidth: "600px", margin: "40px auto" }}>
        <div style={{ backgroundColor: "#333", height: "20px", borderRadius: "4px", overflow: "hidden" }}>
          <div style={{ 
            backgroundColor: task.progress >= 100 ? "#4ade80" : "#f59e0b", 
            height: "100%", 
            width: `${task.progress}%`,
            transition: "width 0.3s ease"
          }} />
        </div>
        <div style={{ textAlign: "center", marginTop: "10px", color: "#888" }}>
          Progress: {task.progress}%
        </div>
      </div>

      {/* Action Button */}
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <button 
          onClick={handleAttack}
          disabled={task.progress >= 100}
          style={{
            padding: "15px 40px",
            fontSize: "1.2rem",
            backgroundColor: task.progress >= 100 ? "#333" : "#ef4444",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: task.progress >= 100 ? "default" : "pointer",
            opacity: task.progress >= 100 ? 0.5 : 1
          }}
        >
          {task.progress >= 100 ? "🎉 VICTORY!" : "⚔️ ATTACK"}
        </button>
      </div>
    </div>
  );
}
