import { supabase } from '@/data/apiConfig';

/**
 * Get the authentication token from Supabase session
 * @returns Promise<string | null> - JWT token or null if not authenticated
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    
    if (!session || !session.access_token) {
      return null;
    }
    
    return session.access_token;
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
}

