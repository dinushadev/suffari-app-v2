import { ApiError } from '../data/apiClient';

/**
 * Get user-friendly error message based on error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error && 'type' in error) {
    const apiError = error as ApiError;
    
    // Use description if available, otherwise use message
    if (apiError.description) {
      return apiError.description;
    }
    
    // Return the user-friendly message from ApiError
    return apiError.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Get error severity level for UI styling
 */
export function getErrorSeverity(error: unknown): 'low' | 'medium' | 'high' {
  if (error instanceof Error && 'type' in error) {
    const apiError = error as ApiError;
    
    switch (apiError.type) {
      case 'network':
        return 'medium';
      case 'authentication':
      case 'authorization':
        return 'high';
      case 'validation':
        // 4xx validation errors should be high severity (red) instead of low (yellow)
        return 'high';
      case 'server':
        return 'high';
      case 'client':
        // 4xx client errors should be high severity (red) instead of medium (orange)
        return 'high';
      default:
        return 'medium';
    }
  }
  
  return 'medium';
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof Error && 'type' in error) {
    const apiError = error as ApiError;
    
    // Don't retry authentication/authorization errors
    if (apiError.type === 'authentication' || apiError.type === 'authorization') {
      return false;
    }
    
    // Don't retry validation errors
    if (apiError.type === 'validation') {
      return false;
    }
    
    // Retry network and server errors
    if (apiError.type === 'network' || apiError.type === 'server') {
      return true;
    }
    
    // Retry client errors except 4xx validation errors
    if (apiError.type === 'client' && apiError.status && apiError.status >= 500) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get appropriate action text for error
 */
export function getErrorActionText(error: unknown): string {
  if (error instanceof Error && 'type' in error) {
    const apiError = error as ApiError;
    
    switch (apiError.type) {
      case 'authentication':
        return 'Sign In';
      case 'network':
        return 'Retry';
      case 'server':
        return 'Try Again';
      case 'validation':
        return 'Fix & Retry';
      default:
        return 'Try Again';
    }
  }
  
  return 'Try Again';
}

/**
 * Check if error requires user authentication
 */
export function requiresAuthentication(error: unknown): boolean {
  if (error instanceof Error && 'type' in error) {
    const apiError = error as ApiError;
    return apiError.type === 'authentication';
  }
  
  return false;
}

/**
 * Get error icon based on error type
 */
export function getErrorIcon(error: unknown): string {
  if (error instanceof Error && 'type' in error) {
    const apiError = error as ApiError;
    
    switch (apiError.type) {
      case 'network':
        return '🌐';
      case 'authentication':
        return '🔐';
      case 'authorization':
        return '🚫';
      case 'validation':
        return '⚠️';
      case 'server':
        return '🔧';
      default:
        return '❌';
    }
  }
  
  return '❌';
}
