import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recommendCareers, createRoadmap } from '../services/aiAdvisorService';
import { getCurrentUser } from '../services/authService';
import './ProfileDashboard.css';

const Field = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-gray-900 font-medium break-words">{value || '—'}</span>
  </div>
);

const PillList = ({ label, items }) => {
  const list = typeof items === 'string' ? items.split(',').map(i => i.trim()).filter(Boolean) : items || [];
  return (
    <div className="flex flex-col">
      <span className="text-sm text-gray-500 mb-2">{label}</span>
      <div className="flex flex-wrap gap-2">
        {list.length ? (
          list.map((item, idx) => (
            <span key={`${item}-${idx}`} className="px-3 py-1 text-sm rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {item}
            </span>
          ))
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </div>
    </div>
  );
};

const AccordionSection = ({ id, title, isOpen, onToggle, children, onEdit }) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
    <button
      type="button"
      onClick={() => onToggle(id)}
      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50"
    >
      <span className="text-lg font-semibold text-gray-900">{title}</span>
      <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
        <i className="fas fa-chevron-down"></i>
      </span>
    </button>
    {isOpen && (
      <div className="px-5 pb-5 border-t border-gray-100">
        <div className="py-5">
          {children}
        </div>
        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button className="btn btn-primary" onClick={() => onEdit(id)}>
            <i className="fas fa-edit"/> Edit
          </button>
        </div>
      </div>
    )}
  </div>
);

const ProfileDashboard = ({ data, onEditSection }) => {
  const navigate = useNavigate();
  const {
    name,
    email,
    phone_number,
    date_of_birth,
    gender,
    hobbies,
    highest_qualification,
    field_of_study,
    passed_out_year,
    technical_skills,
    soft_skills,
    interests,
    experience,
    core_work_passion,
    learning_style,
    work_environment,
    key_strength,
    motivation_driver,
    decision_style,
    interest_domain,
    values_lifestyle,
  } = data || {};

  const [active, setActive] = useState('dashboard');
  // AI Advisor inline state (dashboard)
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiResults, setAiResults] = useState([]);
  const [aiInfo, setAiInfo] = useState({ llm_used: '' });

  const buildAiQueryFromData = (d) => {
    const parts = [];
    parts.push(`Name: ${d?.name || ''}`);
    parts.push(`Education: ${d?.highest_qualification || ''}, ${d?.field_of_study || ''}, Passed: ${d?.passed_out_year || ''}`);
    parts.push(`Technical skills: ${d?.technical_skills || ''}`);
    parts.push(`Soft skills: ${d?.soft_skills || ''}`);
    parts.push(`Interests: ${d?.interests || ''}`);
    parts.push(`Experience: ${d?.experience || ''}`);
    parts.push(`Assessment: passion=${d?.core_work_passion || ''}, learning=${d?.learning_style || ''}, env=${d?.work_environment || ''}, strength=${d?.key_strength || ''}, motivation=${d?.motivation_driver || ''}, decision=${d?.decision_style || ''}, domain=${d?.interest_domain || ''}, values=${d?.values_lifestyle || ''}`);
    return parts.join(' | ');
  };

  const parseCsv = (val) => (val || '').split(',').map(s => s.trim()).filter(Boolean);

  const handleAdvisorGetStarted = async () => {
    try {
      setAiError('');
      setAiLoading(true);
      const query = buildAiQueryFromData(data || {});
      const resp = await recommendCareers(query, 5);
      setAiResults(Array.isArray(resp.results) ? resp.results : []);
      setAiInfo({ llm_used: resp.llm_used || '' });
      // Do not open the form. Stay on dashboard and show results inline.
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to load recommendations.';
      setAiError(msg);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreateRoadmap = async (careerName) => {
    try {
      setAiError('');
      setAiLoading(true);
      const user = getCurrentUser();
      const userId = user?.id || user?._id || user?.pk || 'anonymous';
      await createRoadmap({
        career: careerName,
        userId: String(userId),
        skills: parseCsv(technical_skills),
        softSkills: parseCsv(soft_skills),
        interests: parseCsv(interests),
        resumeText: ''
      });
      // Navigate to the Roadmap page after successful creation
      navigate('/roadmap');
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to create roadmap.';
      setAiError(msg);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 profile-dashboard">
      {/* Top header strip like screenshot */}
      <div className="rounded-lg px-4 py-3 flex items-center justify-center shadow-sm pd-header pd-header-primary">
        <h2 className="text-xl md:text-2xl font-extrabold tracking-wide text-white">Profile Dashboard</h2>
      </div>

      <div className="pd-layout">
        {/* Sidebar */}
        <aside className="pd-sidebar">
          <div className="pd-sidecard">
            <div className="p-6 text-center">
              <div className="mx-auto h-20 w-20 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-2xl font-bold shadow pd-avatar">
                {String(name || '?').charAt(0).toUpperCase()}
              </div>
              <div className="mt-4">
                <div className="text-lg font-semibold text-gray-900">{name || '—'}</div>
                <div className="text-green-600 text-sm font-semibold">Member</div>
                <div className="text-gray-500 text-sm mt-1">{email || '—'}</div>
              </div>
              <div className="mt-4">
                <div className="pd-progress"><span></span></div>
                <div className="text-xs text-gray-500 mt-1">80% Complete</div>
              </div>
            </div>
            <nav className="pd-nav">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: 'fa-home' },
                { id: 'basic', label: 'Basic Information', icon: 'fa-id-card' },
                { id: 'education', label: 'Education Details', icon: 'fa-graduation-cap' },
                { id: 'skills', label: 'Skills & Experience', icon: 'fa-briefcase' },
                { id: 'assessment', label: 'Career Assessment', icon: 'fa-list-check' },
              ].map(item => (
                <button
                  key={item.id}
                  className={`w-full px-4 py-3 text-left pd-nav-item ${active === item.id ? 'pd-nav-item--active' : ''}`}
                  onClick={() => setActive(item.id)}
                >
                  <i className={`fas ${item.icon} w-5 text-center`}></i>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <section className="pd-content">
          {active === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl p-5 flex items-start gap-4 pd-metric pd-metric--primary">
                <div className="h-10 w-10 rounded-full bg-white/70 text-yellow-700 flex items-center justify-center"><i className="fas fa-folder-open"></i></div>
                <div>
                  <div className="text-3xl font-extrabold text-white">{(technical_skills || '').split(',').filter(Boolean).length}</div>
                  <div className="text-sm text-white/90">Total Technical Skills</div>
                </div>
              </div>
              <div className="rounded-xl p-5 flex items-start gap-4 pd-metric pd-metric--success">
                <div className="h-10 w-10 rounded-full bg-white/20 text-white flex items-center justify-center"><i className="fas fa-tasks"></i></div>
                <div>
                  <div className="text-3xl font-extrabold text-white">{(soft_skills || '').split(',').filter(Boolean).length}</div>
                  <div className="text-sm text-white/90">Total Soft Skills</div>
                </div>
              </div>
              <div className="rounded-xl p-5 flex items-start gap-4 pd-metric pd-metric--accent">
                <div className="h-10 w-10 rounded-full bg-white/20 text-white flex items-center justify-center"><i className="fas fa-star"></i></div>
                <div>
                  <div className="text-3xl font-extrabold text-white">{(interests || '').split(',').filter(Boolean).length}</div>
                  <div className="text-sm text-white/90">Interests</div>
                </div>
              </div>
              {/* AI Career Advisor - inline (no form open) */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center"><i className="fas fa-magic"></i></div>
                    <h3 className="text-lg font-semibold text-gray-900">AI Career Advisor</h3>
                  </div>
                  <p className="text-sm text-gray-600">Get personalized career recommendations based on your profile and instantly generate a learning roadmap.</p>
                </div>
                <div className="mt-4 flex justify-end">
                  <button className="btn btn-primary" onClick={handleAdvisorGetStarted} disabled={aiLoading}>
                    {aiLoading ? (<><i className="fas fa-spinner fa-spin"/> Loading...</>) : (<><i className="fas fa-rocket"/> Get Started</>)}
                  </button>
                </div>
              </div>
              {/* Inline results */}
              {(aiError || aiResults.length > 0) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4 md:col-span-2">
                  {aiError && (
                    <div className="rounded-md p-3 bg-red-50 text-red-700 border border-red-200">{aiError}</div>
                  )}
                  {!aiError && (
                    <>
                      <div className="text-sm text-gray-600">LLM used: {aiInfo.llm_used || 'fallback'}</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {aiResults.map((r, idx) => {
                          const name = r['Career Name'] || r.career || r.title || `Career ${idx+1}`;
                          const score = typeof r.score === 'number' ? r.score.toFixed(3) : r.score;
                          const desc = r['Description'] || r.description || '';
                          return (
                            <div key={idx} className="border rounded-lg p-4 shadow-sm bg-gray-50">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-900">{name}</h4>
                                  {score && (<div className="text-xs text-gray-500">Match score: {score}</div>)}
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-outline"
                                  onClick={() => handleCreateRoadmap(name)}
                                  disabled={aiLoading}
                                  title="Create a personalized roadmap for this career"
                                >
                                  <i className="fas fa-route"></i> Create Roadmap
                                </button>
                              </div>
                              {desc && <p className="mt-2 text-sm text-gray-700">{desc}</p>}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {active === 'basic' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 pd-card">
              <div className="pd-section-header"><i className="fas fa-user"></i> <span>Basic Information</span></div>
              <div className="pd-section-divider"></div>
              <div>
                <div className="pd-field"><div className="pd-field-label">Full Name</div><div className="pd-field-value">{name || '—'}</div></div>
                <div className="pd-field"><div className="pd-field-label">Email</div><div className="pd-field-value">{email || '—'}</div></div>
                <div className="pd-field"><div className="pd-field-label">Phone Number</div><div className="pd-field-value">{phone_number || '—'}</div></div>
                <div className="pd-field"><div className="pd-field-label">Date of Birth</div><div className="pd-field-value">{date_of_birth || '—'}</div></div>
                <div className="pd-field"><div className="pd-field-label">Gender</div><div className="pd-field-value">{gender || '—'}</div></div>
                <div className="pd-field"><div className="pd-field-label">Hobbies</div><div className="pd-field-value">{(hobbies || '').toString() || '—'}</div></div>
              </div>
              <div className="mt-6 flex justify-end">
                <button className="btn pd-edit-btn" onClick={() => onEditSection && onEditSection('basic')}><i className="fas fa-edit"/> Edit</button>
              </div>
            </div>
          )}

          {active === 'education' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 pd-card">
              <div className="pd-section-header"><i className="fas fa-graduation-cap"></i> <span>Education</span></div>
              <div className="pd-section-divider"></div>
              <div>
                <div className="pd-field"><div className="pd-field-label">Highest Qualification</div><div className="pd-field-value">{highest_qualification || '—'}</div></div>
                <div className="pd-field"><div className="pd-field-label">Field of Study</div><div className="pd-field-value">{field_of_study || '—'}</div></div>
                <div className="pd-field"><div className="pd-field-label">Year of Passing</div><div className="pd-field-value">{passed_out_year || '—'}</div></div>
              </div>
              <div className="mt-6 flex justify-end">
                <button className="btn pd-edit-btn" onClick={() => onEditSection && onEditSection('education')}><i className="fas fa-edit"/> Edit</button>
              </div>
            </div>
          )}

          {active === 'skills' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 pd-card">
              <div className="pd-section-header"><i className="fas fa-briefcase"></i> <span>Skills and Experience</span></div>
              <div className="pd-section-divider"></div>
              <div>
                <div className="pd-field"><div className="pd-field-label">Technical Skills</div><div className="pd-field-value">{(technical_skills || '') || '—'}</div></div>
                <div className="pd-field"><div className="pd-field-label">Soft Skills</div><div className="pd-field-value">{(soft_skills || '') || '—'}</div></div>
                <div className="pd-field"><div className="pd-field-label">Interests</div><div className="pd-field-value">{(interests || '') || '—'}</div></div>
                <div className="pd-field"><div className="pd-field-label">Work Experience</div><div className="pd-field-value">{experience || '—'}</div></div>
              </div>
              <div className="mt-6 flex justify-end">
                <button className="btn pd-edit-btn" onClick={() => onEditSection && onEditSection('skills')}><i className="fas fa-edit"/> Edit</button>
              </div>
            </div>
          )}

          {active === 'assessment' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 pd-card">
              <div className="pd-section-header"><i className="fas fa-list-check"></i> <span>Career Assessment</span></div>
              <div className="pd-section-divider"></div>
              <div>
                <div className="pd-field"><div className="pd-field-label">Core Work Passion</div><div className="pd-field-value">{core_work_passion || '—'}</div></div>
                <div className="pd-field"><div className="pd-field-label">Learning Style</div><div className="pd-field-value">{learning_style || '—'}</div></div>
                <div className="pd-field"><div className="pd-field-label">Work Environment</div><div className="pd-field-value">{work_environment || '—'}</div></div>
                <div className="pd-field"><div className="pd-field-label">Key Strength</div><div className="pd-field-value">{key_strength || '—'}</div></div>
                <div className="pd-field"><div className="pd-field-label">Motivation Driver</div><div className="pd-field-value">{motivation_driver || '—'}</div></div>
                <div className="pd-field"><div className="pd-field-label">Decision Style</div><div className="pd-field-value">{decision_style || '—'}</div></div>
                <div className="pd-field"><div className="pd-field-label">Interest Domain</div><div className="pd-field-value">{interest_domain || '—'}</div></div>
                <div className="pd-field"><div className="pd-field-label">Values & Lifestyle</div><div className="pd-field-value">{values_lifestyle || '—'}</div></div>
              </div>
              <div className="mt-6 flex justify-end">
                <button className="btn pd-edit-btn" onClick={() => onEditSection && onEditSection('assessment')}><i className="fas fa-edit"/> Edit</button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProfileDashboard;
