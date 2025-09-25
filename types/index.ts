// Shared types for the CutCraft AI application

export type Page = 'landing' | 'auth' | 'dashboard' | 'payment' | 'settings';

export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro';
  video_edits_used: number;
  subscription_status: string;
}

export interface Video {
  id: string;
  file_name: string;
  file_size: number;
  status: 'uploaded' | 'processing' | 'completed' | 'error';
  processing_progress: number;
  created_at: string;
}

export interface BillingRecord {
  user_id: string;
  amount: number;
  plan: string;
  status: string;
  date: string;
}