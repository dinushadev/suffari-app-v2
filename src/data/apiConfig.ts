import { createClient } from '@supabase/supabase-js';

// API base URL loaded from environment variable for flexibility. Set NEXT_PUBLIC_API_BASE_URL in your .env.local file.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);