// API client for communicating with the backend
import { getUserData, saveUserData, type UserData } from './local-storage';

const API_BASE = '/.netlify/functions/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// API functions
export async function fetchUserProgress(userId: string) {
  try {
    const response = await fetch(`${API_BASE}/progress/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch progress');
    return await response.json();
  } catch (error) {
    console.warn('Using local storage fallback for progress');
    return getUserData().progress;
  }
}

export async function updateUserProgress(userId: string, phase: number, progress: number, completedTasks: string[] = []) {
  try {
    const response = await fetch(`${API_BASE}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, phase, progress, completedTasks })
    });
    if (!response.ok) throw new Error('Failed to update progress');
    return await response.json();
  } catch (error) {
    console.warn('Using local storage fallback for progress update');
    const data = getUserData();
    const progressItem = data.progress.find(p => p.phase === phase);
    if (progressItem) {
      progressItem.progress = progress;
      progressItem.completedTasks = completedTasks;
      saveUserData(data);
    }
    return progressItem;
  }
}

export async function fetchUserSkills(userId: string) {
  try {
    const response = await fetch(`${API_BASE}/skills/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch skills');
    return await response.json();
  } catch (error) {
    console.warn('Using local storage fallback for skills');
    return getUserData().skills;
  }
}

export async function updateSkillProgress(userId: string, skillCategory: string, skillName: string, level: number) {
  try {
    const response = await fetch(`${API_BASE}/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, skillCategory, skillName, level })
    });
    if (!response.ok) throw new Error('Failed to update skill');
    return await response.json();
  } catch (error) {
    console.warn('Using local storage fallback for skill update');
    const data = getUserData();
    const skill = data.skills.find(s => s.skillName === skillName);
    if (skill) {
      skill.level = level;
      saveUserData(data);
    }
    return skill;
  }
}

export async function fetchUserIncomeStreams(userId: string) {
  try {
    const response = await fetch(`${API_BASE}/income/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch income streams');
    return await response.json();
  } catch (error) {
    console.warn('Using local storage fallback for income streams');
    return getUserData().incomeStreams;
  }
}

export async function updateIncomeStream(userId: string, streamType: string, isActive: boolean, monthlyRevenue: number = 0) {
  try {
    const response = await fetch(`${API_BASE}/income`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, streamType, isActive: isActive ? 1 : 0, monthlyRevenue })
    });
    if (!response.ok) throw new Error('Failed to update income stream');
    return await response.json();
  } catch (error) {
    console.warn('Using local storage fallback for income stream update');
    const data = getUserData();
    const stream = data.incomeStreams.find(s => s.streamType === streamType);
    if (stream) {
      stream.isActive = isActive;
      stream.monthlyRevenue = monthlyRevenue;
      saveUserData(data);
    }
    return stream;
  }
}
