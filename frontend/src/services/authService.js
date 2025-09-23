// frontend/src/services/authService.js
import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/api/auth`;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

// Create a separate instance for file uploads
const apiFileUpload = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
    'Accept': 'application/json'
  },
  withCredentials: true
});

// Request interceptor to include auth token
const addAuthToken = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    const cleanToken = token.replace(/^\"|\"$/g, '');
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }
  return config;
};

// Add request interceptors
api.interceptors.request.use(addAuthToken);
apiFileUpload.interceptors.request.use(addAuthToken);

// Response interceptor to handle 401 errors
const handleUnauthorized = (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
  return Promise.reject(error);
};

api.interceptors.response.use(response => response, handleUnauthorized);
apiFileUpload.interceptors.response.use(response => response, handleUnauthorized);

// Auth service methods
const authService = {
  // Signup a new user
  async signup(userData) {
    try {
      const response = await api.post('/signup/', {
        name: userData.name.trim(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password
      });

      // Store tokens and user data
      const { user, tokens } = response.data;
      localStorage.setItem('token', tokens.access);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true, user };
    } catch (error) {
      console.error('Signup error:', error);
      throw new Error(error.response?.data?.error || 'Signup failed. Please try again.');
    }
  },

  // Login user
  async login(credentials) {
    try {
      console.log('Attempting login with:', credentials.email);
      const response = await api.post('/login/', {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password
      });

      console.log('Login response:', response.data);
      
      // Check if the response has the expected structure
      if (!response.data || !response.data.user || !response.data.tokens) {
        console.error('Unexpected login response format:', response.data);
        throw new Error('Invalid response from server. Please try again.');
      }

      // Store tokens and user data
      const { user, tokens } = response.data;
      localStorage.setItem('token', tokens.access);
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('User data stored in localStorage');
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', {
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
      throw new Error(error.response?.data?.error || 'Login failed. Please check your credentials and try again.');
    }
  },

  // Logout user
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Get current authenticated user
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Get user profile
  async getUserProfile() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('Fetching user profile...');
      const response = await api.get('/profile/', {
        headers: {
          'Authorization': `Bearer ${token.replace(/^"|"$/g, '')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: true
      });
      
      console.log('Profile API response received:', response.status, response.statusText);
      
      if (!response.data) {
        throw new Error('Empty response from server');
      }
      
      return response.data;
    } catch (error) {
      const errorDetails = {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        } : 'No response',
        request: error.request,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          baseURL: error.config?.baseURL
        }
      };
      
      console.error('Error in getUserProfile:', errorDetails);
      
      // If it's a 401 error, clear the token and redirect to login
      if (error.response?.status === 401) {
        console.log('Authentication failed, clearing token and redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      throw new Error(error.response?.data?.error || 'Failed to fetch profile. Please try again.');
    }
  },

  // Update user profile
  async updateUserProfile(profileData) {
    try {
      console.log('Preparing to update user profile...');
      
      // Determine if we're uploading files
      const isFileUpload = profileData instanceof FormData;
      const client = isFileUpload ? apiFileUpload : api;
      
      // Log the data being sent (excluding files for security)
      if (isFileUpload) {
        console.log('Uploading form data with files');
        // Log form data keys (but not file contents)
        const formDataEntries = {};
        for (let [key, value] of profileData.entries()) {
          formDataEntries[key] = value instanceof File ? `[File: ${value.name}, ${value.size} bytes]` : value;
        }
        console.log('Form data entries:', formDataEntries);
      } else {
        console.log('Updating profile with JSON data:', profileData);
      }
      
      // Send the request
      const response = await client.patch('/profile/', profileData, {
        headers: {
          'Content-Type': isFileUpload ? 'multipart/form-data' : 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Profile update successful:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
      
      // Update the user data in localStorage if the name or email was updated
      if (response.data) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        let updated = false;
        
        // Update any user data that might have changed
        const fieldsToUpdate = ['name', 'email', 'profile_picture'];
        fieldsToUpdate.forEach(field => {
          if (response.data[field] && response.data[field] !== user[field]) {
            user[field] = response.data[field];
            updated = true;
          }
        });
        
        if (updated) {
          console.log('Updating user data in localStorage');
          localStorage.setItem('user', JSON.stringify(user));
        }
      }
      
      return response.data;
      
    } catch (error) {
      console.error('Error in updateUserProfile:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        } : 'No response',
        request: error.request,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          baseURL: error.config?.baseURL,
          data: error.config?.data
        }
      });
      
      // Handle specific error cases
      if (error.response) {
        // 401 Unauthorized - Token expired or invalid
        if (error.response.status === 401) {
          console.log('Authentication failed, logging out...');
          this.logout();
          throw new Error('Your session has expired. Please log in again.');
        }
        
        // 400 Bad Request - Validation errors
        if (error.response.status === 400 && error.response.data) {
          // If there are field-specific errors, format them nicely
          if (typeof error.response.data === 'object') {
            const errorMessages = [];
            for (const [field, errors] of Object.entries(error.response.data)) {
              if (Array.isArray(errors)) {
                errorMessages.push(`${field}: ${errors.join(', ')}`);
              } else if (typeof errors === 'string') {
                errorMessages.push(errors);
              } else {
                errorMessages.push(JSON.stringify(errors));
              }
            }
            if (errorMessages.length > 0) {
              throw new Error(errorMessages.join('\n'));
            }
          }
          // If there's a simple error message
          if (error.response.data.error) {
            throw new Error(error.response.data.error);
          }
        }
      }
      
      // For all other errors, use a generic message
      throw new Error(error.response?.data?.error || 'Failed to update profile. Please check your input and try again.');
    }
  },

  // Get user profile by ID (for public profiles)
  async getUserProfileById(userId) {
    try {
      console.log(`Fetching profile for user ID: ${userId}`);
      const response = await api.get(`/profile/${userId}/`);
      console.log('Profile by ID response:', response.status, response.statusText);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile by ID:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        } : 'No response',
        request: error.request,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          baseURL: error.config?.baseURL
        }
      });
      throw new Error(error.response?.data?.error || 'Failed to fetch user profile. Please try again.');
    }
  }
};

// Export individual methods as named exports
export const signup = authService.signup.bind(authService);
export const login = authService.login.bind(authService);
export const logout = authService.logout.bind(authService);
export const getCurrentUser = authService.getCurrentUser.bind(authService);
export const isAuthenticated = authService.isAuthenticated.bind(authService);
export const getUserProfile = authService.getUserProfile.bind(authService);
export const updateUserProfile = authService.updateUserProfile.bind(authService);
export const getUserProfileById = authService.getUserProfileById.bind(authService);

// Default export
export default authService;