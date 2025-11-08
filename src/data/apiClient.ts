import { API_BASE_URL, supabase } from "./apiConfig";

// Enhanced error types for better error handling
export interface ApiError extends Error {
  status?: number;
  statusText?: string;
  code?: string;
  details?: string;
  type?: 'network' | 'server' | 'client' | 'validation' | 'authentication' | 'authorization';
  validationErrors?: Array<{
    field: string;
    constraints: string[];
  }>;
  errorCode?: string;
  description?: string;
}

/**
 * Type guard to check if data is an object with string properties
 */
function isErrorData(data: unknown): data is Record<string, unknown> {
  return typeof data === 'object' && data !== null;
}

/**
 * Helper to safely get a string property from error data
 */
function getErrorProperty(data: unknown, key: string): string | undefined {
  if (isErrorData(data) && typeof data[key] === 'string') {
    return data[key] as string;
  }
  return undefined;
}

/**
 * Create a structured API error with appropriate type and message
 */
function createApiError(response: Response, data: unknown): ApiError {
  const status = response.status;
  const statusText = response.statusText;
  
  let errorType: ApiError['type'] = 'server';
  let userMessage = 'An unexpected error occurred. Please try again.';
  
  // Helper to get message or error from data
  const getMessage = () => getErrorProperty(data, 'message') || getErrorProperty(data, 'error');
  
  // Determine error type and user-friendly message based on status code
  if (status >= 400 && status < 500) {
    errorType = 'client';
    
    switch (status) {
      case 400:
        errorType = 'validation';
        userMessage = getMessage() || 'Invalid request. Please check your input and try again.';
        break;
      case 401:
        errorType = 'authentication';
        userMessage = 'You need to sign in to continue. Please refresh the page and try again.';
        break;
      case 403:
        errorType = 'authorization';
        userMessage = 'You don\'t have permission to perform this action.';
        break;
      case 404:
        userMessage = 'The requested resource was not found.';
        break;
      case 409:
        userMessage = 'This action conflicts with existing data. Please refresh and try again.';
        break;
      case 422:
        errorType = 'validation';
        userMessage = getMessage() || 'Please check your input and try again.';
        break;
      case 429:
        userMessage = 'Too many requests. Please wait a moment and try again.';
        break;
      default:
        userMessage = getMessage() || 'Request failed. Please try again.';
    }
  } else if (status >= 500) {
    errorType = 'server';
    switch (status) {
      case 500:
        userMessage = 'Server error. Our team has been notified. Please try again later.';
        break;
      case 502:
        userMessage = 'Service temporarily unavailable. Please try again in a few minutes.';
        break;
      case 503:
        userMessage = 'Service is temporarily down for maintenance. Please try again later.';
        break;
      case 504:
        userMessage = 'Request timeout. Please try again.';
        break;
      default:
        userMessage = 'Server error. Please try again later.';
    }
  }
  
  const error = new Error(userMessage) as ApiError;
  error.status = status;
  error.statusText = statusText;
  error.type = errorType;
  
  if (isErrorData(data)) {
    error.details = getErrorProperty(data, 'details') || getErrorProperty(data, 'error');
    error.code = getErrorProperty(data, 'code');
    error.errorCode = getErrorProperty(data, 'errorCode');
    error.description = getErrorProperty(data, 'description');
    if (Array.isArray(data.validationErrors)) {
      error.validationErrors = data.validationErrors as ApiError['validationErrors'];
    }
  }
  
  return error;
}

/**
 * Generic API client for making requests to the backend with enhanced error handling
 * @param endpoint API endpoint path (with or without leading slash)
 * @param options Request options including method and body
 * @returns Promise with the parsed JSON response
 */
export async function apiClient<T>(endpoint: string, { method = "GET", body, baseUrl }: { method?: string; body?: unknown; baseUrl?: string } = {}): Promise<T> {
  // Normalize endpoint to ensure it starts with a slash if using API_BASE_URL
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Use provided baseUrl or default to API_BASE_URL
  const url = baseUrl ? `${baseUrl}${normalizedEndpoint}` : `${API_BASE_URL}${normalizedEndpoint}`;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const headers: HeadersInit = { "Content-Type": "application/json" };

    if (session) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }
    
    const res = await fetch(url, {
      method,
      headers,
      ...(body ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}),
    });
    
    let data: unknown;
    try {
      data = await res.json();
    } catch {
      // If response is not JSON, create a generic error
      const error = new Error('Invalid response from server') as ApiError;
      error.status = res.status;
      error.statusText = res.statusText;
      error.type = res.status >= 500 ? 'server' : 'client';
      throw error;
    }
    
    // Handle error responses with enhanced error information
    if (!res.ok) {
      throw createApiError(res, data);
    }
    
    return data as T;
  } catch (error) {
    // Handle network errors and other fetch failures
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError = new Error('Network error. Please check your internet connection and try again.') as ApiError;
      networkError.type = 'network';
      throw networkError;
    }
    
    // Re-throw API errors as-is
    if (error instanceof Error && 'status' in error) {
      throw error;
    }
    
    // Handle other unexpected errors
    const unexpectedError = new Error('An unexpected error occurred. Please try again.') as ApiError;
    unexpectedError.type = 'server';
    throw unexpectedError;
  }
}