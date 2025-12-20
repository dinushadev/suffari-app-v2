import React, { useState } from 'react';
import { ApiError } from '../../data/apiClient';
import { getErrorMessage, getErrorSeverity, getErrorActionText, getErrorIcon, isRetryableError, requiresAuthentication } from '../../lib/errorUtils';
import  ButtonV2  from './ButtonV2';

interface ErrorDisplayProps {
  error: unknown;
  onRetry?: () => void;
  onSignIn?: () => void;
  onDismiss?: () => void;
  className?: string;
  showIcon?: boolean;
  showAction?: boolean;
  dismissible?: boolean;
}

export function ErrorDisplay({ 
  error, 
  onRetry, 
  onSignIn, 
  onDismiss,
  className = '', 
  showIcon = true, 
  showAction = true,
  dismissible = true
}: ErrorDisplayProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const message = getErrorMessage(error);
  const severity = getErrorSeverity(error);
  const actionText = getErrorActionText(error);
  const icon = getErrorIcon(error);
  const canRetry = isRetryableError(error);
  const needsAuth = requiresAuthentication(error);
  
  const severityClasses = {
    low: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900/50',
    medium: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/50',
    high: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50'
  };
  
  const handleAction = () => {
    if (needsAuth && onSignIn) {
      onSignIn();
    } else if (canRetry && onRetry) {
      onRetry();
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  // Don't render if dismissed
  if (isDismissed) {
    return null;
  }
  
  return (
    <div className={`rounded-lg border p-4 ${severityClasses[severity]} ${className}`}>
      <div className="flex items-start gap-3">
        {showIcon && (
          <div className="flex-shrink-0 text-lg">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            {message}
          </p>
          {error instanceof Error && 'validationErrors' in error && (error as ApiError).validationErrors && (
            <div className="mt-2">
              <ul className="text-xs space-y-0.5">
                {(error as ApiError).validationErrors!.map((validationError, index) => (
                  <li key={index}>
                    {validationError.constraints.map((constraint, constraintIndex) => (
                      <div key={constraintIndex} className="text-red-600">
                        • {constraint}
                      </div>
                    ))}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss error"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {showAction && (canRetry || needsAuth) && (
        <div className="mt-3">
          <ButtonV2
            onClick={handleAction}
            variant={severity === 'high' ? 'primary' : 'secondary'}
            size="sm"
            className="text-xs"
          >
            {actionText}
          </ButtonV2>
        </div>
      )}
    </div>
  );
}

export default ErrorDisplay;
