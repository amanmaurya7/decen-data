import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

// Type definitions
interface FileMetadata {
  description?: string;
  tags?: string[];
  isPublic?: boolean;
}

interface GetFilesOptions {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface ShareFileData {
  email: string;
  permissions?: string[];
  expiresIn?: string;
  message?: string;
}

interface AISearchOptions {
  includePublic?: boolean;
  limit?: number;
}

interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  lastLogin?: string;
}

interface FileData {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  ipfsHash: string;
  description: string;
  tags: string[];
  isPublic: boolean;
  uploadDate: string;
  downloadCount: number;
  lastAccessed?: string;
  owner: User;
  downloadUrl: string;
  shareUrl: string;
  aiAnalysis?: any;
  securityAnalysis?: any;
}

// Custom hook for API requests
export const useApi = () => {
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    };

    // For FormData requests, remove Content-Type to let browser set boundary
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return response;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  };

  return { apiRequest, getAuthHeaders };
};

// Authentication hook
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { apiRequest } = useApi();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        const userData = await apiRequest('/auth/me');
        setUser(userData.user);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const userData = await apiRequest('/auth/me');
      setUser(userData.user);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem('token', response.token);
      setUser(response.user);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      throw error;
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      setError(null);
      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });

      localStorage.setItem('token', response.token);
      setUser(response.user);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const updateProfile = async (updates) => {
    try {
      setError(null);
      const response = await apiRequest('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });

      setUser(response.user);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    checkAuthStatus,
  };
};

// File management hook
export const useFiles = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { apiRequest } = useApi();

  const uploadFile = async (file: File, metadata: FileMetadata = {}) => {
    try {
      setError(null);
      setIsLoading(true);

      const formData = new FormData();
      formData.append('file', file);
      
      if (metadata.description) formData.append('description', metadata.description);
      if (metadata.tags) formData.append('tags', JSON.stringify(metadata.tags));
      if (metadata.isPublic !== undefined) formData.append('isPublic', metadata.isPublic.toString());

      const response = await apiRequest('/files/upload', {
        method: 'POST',
        body: formData,
      });

      // Add to local files list
      setFiles(prev => [response.file, ...prev]);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getMyFiles = async (options: GetFilesOptions = {}) => {
    try {
      setError(null);
      setIsLoading(true);

      const queryParams = new URLSearchParams();
      if (options.page) queryParams.append('page', options.page.toString());
      if (options.limit) queryParams.append('limit', options.limit.toString());
      if (options.search) queryParams.append('search', options.search);
      if (options.tags) queryParams.append('tags', options.tags);
      if (options.sortBy) queryParams.append('sortBy', options.sortBy);
      if (options.sortOrder) queryParams.append('sortOrder', options.sortOrder);

      const response = await apiRequest(`/files/my-files?${queryParams}`);
      setFiles(response.files);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getSharedFiles = async (options = {}) => {
    try {
      setError(null);
      setIsLoading(true);

      const queryParams = new URLSearchParams();
      if (options.page) queryParams.append('page', options.page);
      if (options.limit) queryParams.append('limit', options.limit);

      const response = await apiRequest(`/files/shared-with-me?${queryParams}`);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getPublicFiles = async (options = {}) => {
    try {
      setError(null);
      setIsLoading(true);

      const queryParams = new URLSearchParams();
      if (options.page) queryParams.append('page', options.page);
      if (options.limit) queryParams.append('limit', options.limit);
      if (options.search) queryParams.append('search', options.search);
      if (options.tags) queryParams.append('tags', options.tags);

      const response = await apiRequest(`/files/public?${queryParams}`);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const shareFile = async (fileId, shareData) => {
    try {
      setError(null);
      const response = await apiRequest(`/files/${fileId}/share`, {
        method: 'POST',
        body: JSON.stringify(shareData),
      });
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const updateFile = async (fileId, updates) => {
    try {
      setError(null);
      const response = await apiRequest(`/files/${fileId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });

      // Update local files list
      setFiles(prev => prev.map(file => 
        file.id === fileId ? { ...file, ...response.file } : file
      ));

      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const deleteFile = async (fileId) => {
    try {
      setError(null);
      const response = await apiRequest(`/files/${fileId}`, {
        method: 'DELETE',
      });

      // Remove from local files list
      setFiles(prev => prev.filter(file => file.id !== fileId));
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const getFileDetails = async (fileId) => {
    try {
      setError(null);
      const response = await apiRequest(`/files/${fileId}`);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const respondToShare = async (fileId, action) => {
    try {
      setError(null);
      const response = await apiRequest(`/files/${fileId}/share/${action}`, {
        method: 'PATCH',
      });
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  return {
    files,
    isLoading,
    error,
    uploadFile,
    getMyFiles,
    getSharedFiles,
    getPublicFiles,
    shareFile,
    updateFile,
    deleteFile,
    getFileDetails,
    respondToShare,
  };
};

// AI Features hook
export const useAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { apiRequest } = useApi();

  const analyzeFile = async (fileId, analysisType = 'general') => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await apiRequest(`/ai/analyze/${fileId}`, {
        method: 'POST',
        body: JSON.stringify({ analysisType }),
      });

      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const searchFiles = async (query, options = {}) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await apiRequest('/ai/search', {
        method: 'POST',
        body: JSON.stringify({
          query,
          includePublic: options.includePublic || false,
          limit: options.limit || 20,
        }),
      });

      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getInsights = async () => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await apiRequest('/ai/insights');
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAIPreferences = async (preferences) => {
    try {
      setError(null);
      const response = await apiRequest('/ai/preferences', {
        method: 'PATCH',
        body: JSON.stringify(preferences),
      });
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const getAIPreferences = async () => {
    try {
      setError(null);
      const response = await apiRequest('/ai/preferences');
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  return {
    isLoading,
    error,
    analyzeFile,
    searchFiles,
    getInsights,
    updateAIPreferences,
    getAIPreferences,
  };
};

// Dashboard hook
export const useDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { apiRequest } = useApi();

  const getDashboardData = async () => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await apiRequest('/users/dashboard');
      setDashboardData(response);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getStorageAnalytics = async () => {
    try {
      setError(null);
      const response = await apiRequest('/users/storage-analytics');
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const getSharingStats = async () => {
    try {
      setError(null);
      const response = await apiRequest('/users/sharing-stats');
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const getActivity = async (options = {}) => {
    try {
      setError(null);
      const queryParams = new URLSearchParams();
      if (options.page) queryParams.append('page', options.page);
      if (options.limit) queryParams.append('limit', options.limit);

      const response = await apiRequest(`/users/activity?${queryParams}`);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const getNotifications = async () => {
    try {
      setError(null);
      const response = await apiRequest('/users/notifications');
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const searchUsers = async (query) => {
    try {
      setError(null);
      const response = await apiRequest(`/users/search?q=${encodeURIComponent(query)}`);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  return {
    dashboardData,
    isLoading,
    error,
    getDashboardData,
    getStorageAnalytics,
    getSharingStats,
    getActivity,
    getNotifications,
    searchUsers,
  };
};

export default useApi;
