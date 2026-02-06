import { createClient } from '@supabase/supabase-js';

// API base URL loaded from environment variable for flexibility. Set NEXT_PUBLIC_API_BASE_URL in your .env.local file.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3003/api";

// Review API base URL — can be a different service from the main app/API. Set NEXT_PUBLIC_REVIEW_API_URL in .env.local.
export const REVIEW_API_BASE_URL =
  process.env.NEXT_PUBLIC_REVIEW_API_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);