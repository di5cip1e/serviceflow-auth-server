// API client for Station Command - Connected to backend
const API_BASE = '/api';

// Token management
const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(response.status, error.error || `API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// User types
export interface User {
  id: string;
  email: string;
  username: string;
  rank: string;
  xp: number;
  profile?: {
    bio?: string;
    avatar?: string;
  };
  createdAt: string;
}

// Mission types (matching backend)
export type MissionStatus = 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
export type MissionType = 'SURVEILLANCE' | 'LOGISTICS' | 'REPAIR' | 'EXPLORATION' | 'CRISIS';
export type MissionDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXTREME';

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: MissionType;
  difficulty: MissionDifficulty;
  status: MissionStatus;
  rewards: {
    xp: number;
    credits: number;
  };
  progress?: Record<string, unknown>;
  zoneId?: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

// Agent types (matching backend)
export type AgentStatus = 'IDLE' | 'WORKING' | 'COMPLETED' | 'FAILED';
export type AgentType = 'scout' | 'miner' | 'combat' | 'diplomat' | 'engineer' | 'medic';

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  level: number;
  xp: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  currentTask?: Task | null;
  createdAt: string;
  updatedAt: string;
}

// Task types
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  progress: number;
  maxProgress: number;
  xpReward: number;
  creditsReward: number;
  missionId?: string;
  agentId: string;
  agent?: Agent;
  createdAt: string;
  updatedAt: string;
}

// Station stats derived from API data
export interface StationStats {
  totalMissions: number;
  activeMissions: number;
  completedMissions: number;
  failedMissions: number;
  stationHealth: number;
  crewOnline: number;
}

// API functions
export const api = {
  // Current user
  async fetchCurrentUser(): Promise<User> {
    return fetchApi<User>('/users/me');
  },

  // Missions
  async fetchMissions(): Promise<Mission[]> {
    return fetchApi<Mission[]>('/missions');
  },

  async fetchMission(id: string): Promise<Mission> {
    return fetchApi<Mission>(`/missions/${id}`);
  },

  async createMission(data: {
    title: string;
    description: string;
    type: MissionType;
    difficulty: MissionDifficulty;
    zoneId?: string;
  }): Promise<Mission> {
    return fetchApi<Mission>('/missions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateMission(id: string, data: {
    title?: string;
    description?: string;
    status?: MissionStatus;
    progress?: Record<string, unknown>;
  }): Promise<Mission> {
    return fetchApi<Mission>(`/missions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteMission(id: string): Promise<{ success: boolean }> {
    return fetchApi<{ success: boolean }>(`/missions/${id}`, {
      method: 'DELETE',
    });
  },

  // Agents
  async fetchAgents(): Promise<Agent[]> {
    return fetchApi<Agent[]>('/agents');
  },

  async fetchAgent(id: string): Promise<Agent> {
    return fetchApi<Agent>(`/agents/${id}`);
  },

  async createAgent(data: { name: string; type: AgentType }): Promise<Agent> {
    return fetchApi<Agent>('/agents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async grantAgentXp(agentId: string, xp: number): Promise<{
    agent: Agent;
    leveledUp: boolean;
    newLevel: number;
    xpGained: number;
  }> {
    return fetchApi(`/agents/${agentId}/xp`, {
      method: 'POST',
      body: JSON.stringify({ xp }),
    });
  },

  // Tasks
  async fetchTasks(): Promise<Task[]> {
    return fetchApi<Task[]>('/tasks');
  },

  // Helper to compute station stats from missions
  computeStats(missions: Mission[], agents: Agent[]): StationStats {
    return {
      totalMissions: missions.length,
      activeMissions: missions.filter(m => m.status === 'IN_PROGRESS').length,
      completedMissions: missions.filter(m => m.status === 'COMPLETED').length,
      failedMissions: missions.filter(m => m.status === 'FAILED').length,
      stationHealth: 85 + Math.floor(Math.random() * 15), // Placeholder - could be from user data
      crewOnline: agents.filter(a => a.status === 'IDLE' || a.status === 'WORKING').length,
    };
  },
};

export default api;
