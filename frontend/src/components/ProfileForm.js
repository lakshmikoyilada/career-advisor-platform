import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile, getCurrentUser } from '../services/authService';
import { recommendCareers, createRoadmap } from '../services/aiAdvisorService';
import './ProfileForm.css';

const ProfileForm = ({ initialData = {}, onSaveSuccess, focusSection = '' }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [activeTab, setActiveTab] = useState('basic');
  const originalDataRef = useRef(initialData);
  // AI Advisor state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiResults, setAiResults] = useState([]); // from /recommend -> results
  const [aiExtractedSkills, setAiExtractedSkills] = useState([]);
  const [aiInfo, setAiInfo] = useState({ llm_used: '', top_career_roadmap: null });
  
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    gender: '',
    hobbies: '',
    
    // Education
    highest_qualification: '',
    field_of_study: '',
    passed_out_year: '',
    
    // Skills and Experience
    technical_skills: '',
    soft_skills: '',
    interests: '',
    experience: '',
    resume: null,
    
    // Career Assessment
    core_work_passion: '',
    learning_style: '',
    work_environment: '',
    key_strength: '',
    motivation_driver: '',
    decision_style: '',
    interest_domain: '',
    values_lifestyle: ''
  });

  // Preload with any provided initialData for instant UI (all fields)
  useEffect(() => {
    if (initialData && Object.keys(initialData).length) {
      originalDataRef.current = initialData;
      setFormData(prev => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  // When focusSection changes, scroll to that section
  useEffect(() => {
    if (!focusSection) return;
    const idMap = {
      basic: 'section-basic',
      education: 'section-education',
      skills: 'section-skills',
      assessment: 'section-assessment',
    };
    const el = document.getElementById(idMap[focusSection] || focusSection);
    if (el) {
      // Small timeout to ensure DOM is painted
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    }
  }, [focusSection]);

  // Helpers for AI Advisor
  const formatAiError = (err, action = 'request') => {
    try {
      // Axios error anatomy: response (server replied), request (no response), message
      if (err?.response) {
        const status = err.response.status;
        const data = err.response.data;
        const msg = typeof data === 'string' ? data : (data?.detail || data?.error || JSON.stringify(data));
        return `Server error (${status}) while trying to ${action}: ${msg}`;
      }
      if (err?.request) {
        return `Network or CORS error while trying to ${action}. Please check that the AI API is running and CORS allows your frontend origin.`;
      }
      return err?.message || `Unexpected error during ${action}.`;
    } catch (_e) {
      return 'An unknown error occurred.';
    }
  };
  const parseCsv = (val) =>
    (val || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

  const buildAiQueryFromForm = (data) => {
    const parts = [];
    parts.push(`Name: ${data.name || ''}`);
    parts.push(`Education: ${data.highest_qualification || ''}, ${data.field_of_study || ''}, Passed: ${data.passed_out_year || ''}`);
    parts.push(`Technical skills: ${data.technical_skills || ''}`);
    parts.push(`Soft skills: ${data.soft_skills || ''}`);
    parts.push(`Interests: ${data.interests || ''}`);
    parts.push(`Experience: ${data.experience || ''}`);
    // Career assessment choices
    parts.push(`Assessment: passion=${data.core_work_passion || ''}, learning=${data.learning_style || ''}, env=${data.work_environment || ''}, strength=${data.key_strength || ''}, motivation=${data.motivation_driver || ''}, decision=${data.decision_style || ''}, domain=${data.interest_domain || ''}, values=${data.values_lifestyle || ''}`);
    return parts.join(' | ');
  };

  const handleAiGetStarted = async () => {
    try {
      setAiError('');
      setAiLoading(true);
      const query = buildAiQueryFromForm(formData);
      const data = await recommendCareers(query, 5);
      setAiResults(Array.isArray(data.results) ? data.results : []);
      setAiExtractedSkills(data.extracted_skills || []);
      setAiInfo({ llm_used: data.llm_used, top_career_roadmap: data.top_career_roadmap || null });
    } catch (err) {
      setAiError(formatAiError(err, 'get recommendations'));
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
      const skills = parseCsv(formData.technical_skills);
      const softSkills = parseCsv(formData.soft_skills);
      const interests = parseCsv(formData.interests);
      await createRoadmap({
        career: careerName,
        userId,
        skills,
        softSkills,
        interests,
        resumeText: ''
      });
      setMessage({ text: `Roadmap created for ${careerName}.`, type: 'success' });
      // Navigate to Roadmap page to view it
      navigate('/roadmap');
    } catch (err) {
      setAiError(formatAiError(err, 'create roadmap'));
    } finally {
      setAiLoading(false);
      // Scroll to top to show message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderInput = (name, label, type = 'text', required = false, options = [], inputProps = {}) => {
    const value = formData[name] || '';
    const id = `form-${name}`;
    const original = originalDataRef.current || {};
    const assessmentFields = [
      'core_work_passion', 'learning_style', 'work_environment', 'key_strength',
      'motivation_driver', 'decision_style', 'interest_domain', 'values_lifestyle'
    ];
    const isAssessment = assessmentFields.includes(name);
    const requireIfEmpty = isAssessment && !original[name];
    
    const commonProps = {
      id,
      name,
      value: value || '',
      onChange: handleChange,
      // Only require assessment fields when there is no saved value yet
      required: requireIfEmpty || false,
      className: 'form-input',
      ...inputProps
    };

      // Show all fields
    const allFields = [
      'name', 'email', 'phone_number', 'date_of_birth', 'gender', 'hobbies',
      'highest_qualification', 'field_of_study', 'passed_out_year',
      'technical_skills', 'soft_skills', 'interests', 'experience', 'resume',
      'core_work_passion', 'learning_style', 'work_environment', 'key_strength',
      'motivation_driver', 'decision_style', 'interest_domain', 'values_lifestyle'
    ];
    
    if (!allFields.includes(name)) return null;

    return (
      <div className="form-group">
        <label htmlFor={id} className="form-label">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        
        {type === 'select' ? (
          <select {...commonProps} className="form-select">
            {/* Placeholder ensures nothing is pre-selected unless user had a saved value */}
            <option value="" disabled={Boolean(value)}>{`Select ${label}`}</option>
            {options.map((opt) => Array.isArray(opt) ? (
              <option key={opt[0]} value={opt[0]}>{opt[1]}</option>
            ) : (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea {...commonProps} className="form-textarea" rows="4" />
        ) : type === 'file' ? (
          <div className="file-upload">
            <input
              type="file"
              id={id}
              name={name}
              onChange={handleChange}
              className="hidden"
              accept=".pdf,.doc,.docx"
            />
            <label htmlFor={id} className="file-upload-label">
              {value ? value.name : 'Choose file...'}
            </label>
          </div>
        ) : (
          <input type={type} {...commonProps} className="form-input" />
        )}
      </div>
    );
  };

  useEffect(() => {
    let isMounted = true;
    
    const fetchProfile = async () => {
      try {
        console.log('Fetching user profile data...');
        const data = await getUserProfile();
        
        if (!isMounted) return;
        
        console.log('Profile data received:', data);
        
        // Format date for date input
        const formattedData = { ...data };
        if (formattedData.date_of_birth) {
          formattedData.date_of_birth = formattedData.date_of_birth.split('T')[0];
        }
        
        // Handle potential null/undefined values
        const sanitizedData = {};
        Object.keys(formData).forEach(key => {
          sanitizedData[key] = formattedData[key] !== undefined ? formattedData[key] : '';
        });
        
        // Merge server data with initialData from signup; prefer initialData for name/email
        setFormData(prev => ({
          ...prev,
          ...sanitizedData,
          name: initialData?.name ?? sanitizedData.name ?? prev.name,
          email: initialData?.email ?? sanitizedData.email ?? prev.email,
          // Keep the resume file if it exists
          resume: prev.resume || null
        }));
        
      } catch (error) {
        if (!isMounted) return;
        
        console.error('Error in fetchProfile:', {
          message: error.message,
          response: error.response ? {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers
          } : 'No response',
          request: error.request,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers
          }
        });
        
        let errorMessage = 'Failed to load profile. Please try again later.';
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setMessage({ 
          text: errorMessage,
          type: 'error' 
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // Build multipart/form-data payload; exclude immutable fields (name, email)
      // Only send fields that have changed (diff vs originalDataRef) to avoid refilling everything
      const formPayload = new FormData();
      const original = originalDataRef.current || {};
      let changedCount = 0;
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'name' || key === 'email') return; // skip immutable
        const origVal = original[key] ?? '';
        const isFile = value instanceof File;
        const changed = isFile ? true : String(value ?? '') !== String(origVal ?? '');
        if (changed) {
          changedCount += 1;
          if (value !== undefined && value !== null) {
            formPayload.append(key, value);
          }
        }
      });
      if (changedCount === 0) {
        setMessage({ text: 'No changes to save.', type: 'success' });
        setLoading(false);
        return;
      }
      const response = await updateUserProfile(formPayload);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Inform parent about the successful save so it can switch to dashboard view
      if (onSaveSuccess) {
        // Prefer server response data; fallback to current form data merged
        const latest = response || formData;
        onSaveSuccess(latest);
      }
    } catch (error) {
      console.error('Update error:', error);
      // Try to extract detailed validation errors from server
      let errorText = 'Failed to update profile. Please check your input and try again.';
      const serverData = error?.response?.data;
      if (typeof serverData === 'string') {
        errorText = serverData;
      } else if (serverData?.error) {
        errorText = serverData.error;
      } else if (serverData && typeof serverData === 'object') {
        // Build a readable message from field errors
        const parts = Object.entries(serverData).map(([field, msgs]) => {
          const msgText = Array.isArray(msgs) ? msgs.join(', ') : String(msgs);
          return `${field}: ${msgText}`;
        });
        if (parts.length) {
          errorText = parts.join(' | ');
        }
      } else if (error?.message) {
        errorText = error.message;
      }
      setMessage({ text: errorText, type: 'error' });
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !Object.values(formData).some(Boolean)) {
    return (
      <div className="profile-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="w-full">
      {message.text && (
        <div
          className={`mb-6 rounded-lg p-4 flex items-start justify-between ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
          role="alert"
        >
          <div className="pr-4">
            {message.type === 'success' ? (
              <strong className="font-semibold">Saved:</strong>
            ) : (
              <strong className="font-semibold">Error:</strong>
            )}{' '}
            <span>{message.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage({ text: '', type: '' })}
            className="ml-4 text-sm opacity-70 hover:opacity-100"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div id="section-basic" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-100">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('name', 'Full Name', 'text', true, [], { disabled: true, title: 'Name comes from your account and cannot be edited here.' })}
            {renderInput('email', 'Email', 'email', true, [], { disabled: true, title: 'Email comes from your account and cannot be edited here.' })}
            {renderInput('phone_number', 'Phone Number', 'tel', false)}
            {renderInput('date_of_birth', 'Date of Birth', 'date', true)}
            {renderInput('gender', 'Gender', 'select', true, [
              ['male', 'Male'],
              ['female', 'Female'],
              ['other', 'Other'],
              ['prefer_not_to_say', 'Prefer not to say']
            ])}
            {renderInput('hobbies', 'Hobbies', 'textarea', true)}
          </div>
        </div>
        {/* Education */}
        <div id="section-education" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-100">Education</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('highest_qualification', 'Highest Qualification', 'text', true)}
            {renderInput('field_of_study', 'Field of Study', 'text', false)}
            {renderInput('passed_out_year', 'Year of Passing', 'number', true)}
          </div>
        </div>

        {/* Skills and Experience */}
        <div id="section-skills" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-100">Skills and Experience</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('technical_skills', 'Technical Skills (comma separated)', 'text', true)}
            {renderInput('soft_skills', 'Soft Skills (comma separated)', 'text', true)}
            {renderInput('interests', 'Interests', 'text', true)}
            {renderInput('experience', 'Work Experience', 'textarea', false)}
            {renderInput('resume', 'Upload Resume (PDF)', 'file', false, [], { accept: '.pdf' })}
          </div>
        </div>

        {/* Career Assessment */}
        <div id="section-assessment" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-100">Career Assessment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('core_work_passion', 'Core Work Passion', 'select', true, [
              ['a', 'Analyzing/logical'],
              ['b', 'Creating/designing'],
              ['c', 'Leading/organizing'],
              ['d', 'Helping/supporting']
            ])}

            {renderInput('learning_style', 'Learning Style', 'select', true, [
              ['a', 'Through data/research'],
              ['b', 'Hands-on/experimentation'],
              ['c', 'Reading/research'],
              ['d', 'Applied/observing']
            ])}

            {renderInput('work_environment', 'Work Environment', 'select', true, [
              ['a', 'Office/data systems'],
              ['b', 'Outdoors/on-site'],
              ['c', 'Creative studio/lab'],
              ['d', 'Team/community settings']
            ])}

            {renderInput('key_strength', 'Key Strength', 'select', true, [
              ['a', 'Analytical thinking'],
              ['b', 'Creativity & innovation'],
              ['c', 'Communication & leadership'],
              ['d', 'Empathy & people skills']
            ])}

            {renderInput('motivation_driver', 'Motivation Driver', 'select', true, [
              ['a', 'Solving problems'],
              ['b', 'Creating/innovating'],
              ['c', 'Guiding/managing'],
              ['d', 'Social impact']
            ])}

            {renderInput('decision_style', 'Decision Style', 'select', true, [
              ['a', 'Break into data'],
              ['b', 'Creative approaches'],
              ['c', 'Group discussion'],
              ['d', 'People-focused']
            ])}

            {renderInput('interest_domain', 'Interest Domain', 'select', true, [
              ['a', 'Technology & Data'],
              ['b', 'Creative Arts & Media'],
              ['c', 'Business & Management'],
              ['d', 'Social Service & Care']
            ])}

            {renderInput('values_lifestyle', 'Values & Lifestyle', 'select', true, [
              ['a', 'High income & stability'],
              ['b', 'Flexibility & creativity'],
              ['c', 'Growth & leadership'],
              ['d', 'Purpose & impact']
            ])}
          </div>
        </div>

        {/* AI Career Advisor */}
        <div id="section-ai-advisor" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900">AI Career Advisor</h3>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAiGetStarted}
              disabled={aiLoading}
            >
              {aiLoading ? (<><i className="fas fa-spinner fa-spin"></i> Getting Recommendations...</>) : (<><i className="fas fa-magic"></i> Get Started</>)}
            </button>
          </div>

          {aiError && (
            <div className="mb-4 rounded-lg p-3 bg-red-50 text-red-800 border border-red-200">{aiError}</div>
          )}

          {!aiLoading && aiResults.length > 0 && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">LLM used: {aiInfo.llm_used || 'fallback'}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiResults.map((r, idx) => {
                  const name = r['Career Name'] || r.career || r.title || `Career ${idx + 1}`;
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
            </div>
          )}

          {!aiLoading && aiResults.length === 0 && !aiError && (
            <p className="text-sm text-gray-600">Click "Get Started" to generate tailored career recommendations based on your profile.</p>
          )}
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button 
            type="button" 
            className="btn btn-outline"
            onClick={() => window.history.back()}
          >
            <i className="fas fa-arrow-left"></i> Back
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
