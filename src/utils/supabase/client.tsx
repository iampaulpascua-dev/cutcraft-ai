import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseAnonKey = publicAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// API base URL
export const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-95bd8cbb`;

// API helper functions
export class ApiClient {
  private static async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : `Bearer ${publicAnonKey}`,
    };
  }

  private static async getFileHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    return {
      'Authorization': token ? `Bearer ${token}` : `Bearer ${publicAnonKey}`,
    };
  }

  static async post(endpoint: string, data: any = {}) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }
      
      return result;
    } catch (error) {
      console.error(`API POST ${endpoint} error:`, error);
      throw error;
    }
  }

  static async get(endpoint: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }
      
      return result;
    } catch (error) {
      console.error(`API GET ${endpoint} error:`, error);
      throw error;
    }
  }

  static async uploadFile(endpoint: string, file: File, onProgress?: (progress: number) => void) {
    try {
      const headers = await this.getFileHeaders();
      const formData = new FormData();
      formData.append('video', file);

      // For progress tracking, we'll use a simple timeout simulation
      // In a real app, you'd implement proper upload progress tracking
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }
      
      return result;
    } catch (error) {
      console.error(`API UPLOAD ${endpoint} error:`, error);
      throw error;
    }
  }
}

// Auth helper functions
export const authHelpers = {
  async signUp(email: string, password: string, name?: string) {
    try {
      // First create the user via our API
      await ApiClient.post('/signup', { email, password, name });
      
      // Then sign them in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  },

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// User profile functions
export const userApi = {
  async getProfile() {
    return ApiClient.get('/profile');
  },

  async upgradeSubscription(plan: 'free' | 'pro') {
    return ApiClient.post('/upgrade', { plan });
  },

  async getBillingHistory() {
    return ApiClient.get('/billing');
  }
};

// Video processing functions
export const videoApi = {
  async uploadVideo(file: File, onProgress?: (progress: number) => void) {
    return ApiClient.uploadFile('/upload', file, onProgress);
  },

  async startProcessing(videoId: string) {
    return ApiClient.post(`/process/${videoId}`);
  },

  async getVideoStatus(videoId: string) {
    return ApiClient.get(`/video/${videoId}`);
  },

  async getDownloadUrl(videoId: string) {
    return ApiClient.get(`/download/${videoId}`);
  },

  async getUserVideos() {
    return ApiClient.get('/videos');
  }
};