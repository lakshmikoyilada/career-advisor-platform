import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, isAuthenticated, getCurrentUser } from '../services/authService';
import ProfileForm from '../components/ProfileForm';
import ProfileDashboard from '../components/ProfileDashboard';

// Add this function to format the API response
export const formatProfileData = (data) => {
  if (!data) return {};
  
  // Format date for date input if it exists
  if (data.date_of_birth) {
    data.date_of_birth = data.date_of_birth.split('T')[0];
  }
  
  // Ensure all fields have default values
  const defaultValues = {
    name: '',
    email: '',
    gender: '',
    phone_number: '',
    date_of_birth: '',
    hobbies: '',
    highest_qualification: '',
    field_of_study: '',
    passed_out_year: '',
    technical_skills: '',
    soft_skills: '',
    interests: '',
    experience: '',
    core_work_passion: '',
    learning_style: '',
    work_environment: '',
    key_strength: '',
    motivation_driver: '',
    decision_style: '',
    interest_domain: '',
    values_lifestyle: ''
  };
  
  return { ...defaultValues, ...data };
};

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editSection, setEditSection] = useState('');
  const navigate = useNavigate();
  
  // Container styles
  const containerStyleForm = {
    maxWidth: '1200px',
    margin: '100px auto 50px',
    padding: '0 1.5rem',
    width: '100%',
    boxSizing: 'border-box'
  };
  const containerStyleDashboard = {
    margin: '0',
    padding: '0',
    width: '100%',
    boxSizing: 'border-box'
  };
  
  const titleStyle = {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: '2rem',
    textAlign: 'center'
  };
  
  const formContainerStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  };

  useEffect(() => {
    console.log('Profile component mounted');
    
    // Check authentication status
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      console.log('Current token in localStorage:', token);
      
      if (!token) {
        console.log('No token found, redirecting to login');
        navigate('/login');
        return false;
      }
      return true;
    };

    if (!checkAuth()) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Get current user from localStorage first for immediate UI update
        const currentUser = getCurrentUser();
        if (currentUser) {
          setProfile(formatProfileData(currentUser));
        }
        
        console.log('Fetching latest user profile...');
        const data = await getUserProfile();
        console.log('Profile data received:', data);
        
        // Format and set the profile data
        const formattedData = formatProfileData(data);
        setProfile(formattedData);
        setIsEditing(false); // default to dashboard view when data is available
        
      } catch (err) {
        console.error('Error in fetchProfile:', {
          message: err.message,
          response: err.response ? {
            status: err.response.status,
            data: err.response.data,
            headers: err.response.headers
          } : 'No response',
          stack: err.stack
        });
        
        if (err.response?.status === 401) {
          console.log('Token expired or invalid, redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
        
        setError(err.response?.data?.error || 'Failed to load profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    
    // Cleanup function
    return () => {
      console.log('Profile component unmounting');
    };
  }, [navigate]);

  if (loading) {
    return (
      <div style={containerStyleForm}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading profile data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyleForm}>
        <div style={{ color: 'red', textAlign: 'center', padding: '2rem' }}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div style={isEditing ? containerStyleForm : containerStyleDashboard}>
      {isEditing && <h1 style={titleStyle}>Edit Profile</h1>}
      {profile && (
        isEditing ? (
          <div style={formContainerStyle}>
            <ProfileForm
              initialData={profile}
              focusSection={editSection}
              onSaveSuccess={(latest) => {
                // latest may be response data from server
                const updated = formatProfileData(latest);
                setProfile(prev => ({ ...prev, ...updated }));
                setIsEditing(false);
                setEditSection('');
              }}
            />
          </div>
        ) : (
          <ProfileDashboard
            data={profile}
            onEditSection={(sectionId) => {
              setEditSection(sectionId);
              setIsEditing(true);
            }}
          />
        )
      )}
    </div>
  );
};

export default Profile;
