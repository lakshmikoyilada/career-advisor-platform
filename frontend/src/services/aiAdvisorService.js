// frontend/src/services/aiAdvisorService.js
import axios from 'axios';

// AI API base URL is configured via REACT_APP_AI_API_URL in .env
const AI_API_URL = process.env.REACT_APP_AI_API_URL;

if (!AI_API_URL) {
  console.error('REACT_APP_AI_API_URL is not defined in environment variables');
}

const aiApi = axios.create({
  baseURL: AI_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export async function recommendCareers(query, topN = 5) {
  const { data } = await aiApi.post('/recommend', { query, top_n: topN });
  return data; // {results, extracted_skills, top_career_roadmap, llm_used}
}

export async function createRoadmap({ career, userId, skills = [], softSkills = [], interests = [], resumeText = '' }) {
  const payload = {
    career,
    user_id: String(userId),
    skills,
    soft_skills: softSkills,
    interests,
    resume_text: resumeText
  };
  const { data } = await aiApi.post('/roadmap', payload);
  return data; // { user_id, career, roadmap }
}

export async function getUserRoadmap(userId) {
  const { data } = await aiApi.get(`/user_roadmap/${encodeURIComponent(userId)}`);
  return data;
}

export async function updateProgress({ userId, itemName, status }) {
  const { data } = await aiApi.post('/update_progress', {
    user_id: String(userId),
    item_name: itemName,
    status
  });
  return data;
}

export async function getProgress(userId) {
  const { data } = await aiApi.get(`/progress/${encodeURIComponent(userId)}`);
  return data;
}
