// frontend/src/pages/Roadmap.js
import React, { useEffect, useState, useMemo } from 'react';
import { getUserRoadmap } from '../services/aiAdvisorService';
import { getCurrentUser } from '../services/authService';
import RoadmapGraph from '../components/RoadmapGraph';

const Section = ({ title, items, isProject = false }) => {
  if (!items || !items.length) return null;

  const icon = title.includes('Beginner')
    ? 'fa-seedling'
    : title.includes('Intermediate')
    ? 'fa-layer-group'
    : title.includes('Advanced')
    ? 'fa-mountain'
    : title.includes('Mini')
    ? 'fa-lightbulb'
    : 'fa-diagram-project';

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <i className={`fas ${icon}`}></i>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <ul className="space-y-3">
        {items.map((it, idx) => (
          <li
            key={idx}
            className="flex items-center justify-between border border-gray-100 rounded-lg p-3 hover:bg-gray-50"
          >
            <div className="text-gray-800 font-medium">
              {isProject ? (it.project || it.name || '-') : (it.skill || it.name || '-')}
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full capitalize ${
                it.status === 'completed'
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}
              title="Click items in future to update status"
            >
              {it.status || 'pending'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Roadmap = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const user = useMemo(() => getCurrentUser(), []);
  const userId = user?.id || user?._id || user?.pk;

  useEffect(() => {
    let active = true;
    const fetchRoadmap = async () => {
      try {
        setLoading(true);
        setError('');
        if (!userId) {
          setError('No user found. Please log in again.');
          return;
        }
        const res = await getUserRoadmap(String(userId));
        setData(res);
      } catch (err) {
        const msg = err?.response?.data?.detail || err?.response?.data?.error || err?.message || 'Failed to load roadmap.';
        setError(msg);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchRoadmap();
    return () => { active = false; };
  }, [userId]);

  if (loading) return <div className="max-w-6xl mx-auto py-10 px-4 md:px-6 lg:px-8">Loading roadmap...</div>;
  if (error) return <div className="max-w-6xl mx-auto py-10 px-4 md:px-6 lg:px-8 text-red-600">{error}</div>;
  if (!data) return <div className="max-w-6xl mx-auto py-10 px-4 md:px-6 lg:px-8">No roadmap found. Create one from the AI Career Advisor.</div>;

  const career = data.career || data?.roadmap?.career || '-';
  const roadmap = data.roadmap?.roadmap || data.roadmap || data; // normalize in case of different shapes

  return (
    <div className="max-w-7xl mx-auto pb-8 px-4 md:px-6 lg:px-8 space-y-8">
      <div className="text-center py-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {career ? `${career} Roadmap` : 'Career Roadmap'}
        </h1>
        <div className="mt-2 w-24 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 mx-auto rounded-full"></div>
      </div>

      {/* Graph view */}
      <RoadmapGraph career={career} roadmap={roadmap} />
    </div>
  );
};

export default Roadmap;
