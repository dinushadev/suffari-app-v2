import { createClient } from '@supabase/supabase-js';

export const API_BASE_URL = "https://38vuqsfjy8.execute-api.us-east-1.amazonaws.com/dev/api";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);