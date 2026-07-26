/**
 * API Error Handler
 * Centralized error handling and logging
 */

export interface ApiError {
  status: number;
  message: string;
  detail?: string;
}

export class ApiErrorHandler {
  private static normalizeMessage(value: unknown, fallback: string): string {
    if (typeof value === 'string' && value.trim()) {
      return value
    }

    if (Array.isArray(value)) {
      const messages = value
        .map((item) => {
          if (typeof item === 'string') {
            return item
          }

          if (item && typeof item === 'object') {
            const msg = (item as { msg?: unknown }).msg
            if (typeof msg === 'string' && msg.trim()) {
              return msg
            }
          }

          return null
        })
        .filter((item): item is string => Boolean(item))

      if (messages.length > 0) {
        return messages.join(', ')
      }
    }

    if (value && typeof value === 'object') {
      const msg = (value as { msg?: unknown }).msg
      if (typeof msg === 'string' && msg.trim()) {
        return msg
      }

      try {
        return JSON.stringify(value)
      } catch {
        return fallback
      }
    }

    return fallback
  }

  /**
   * Parse API error response
   */
  static parse(error: any): ApiError {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;
      const fallback = this.getStatusMessage(status)

      return {
        status,
        message: this.normalizeMessage(data?.detail ?? data?.message, fallback),
        detail: this.normalizeMessage(data?.detail, ''),
      };
    } else if (error.request) {
      // Request made but no response
      return {
        status: 0,
        message: 'No response from server. Please check your connection.',
      };
    } else {
      // Error in request setup
      return {
        status: 0,
        message: error.message || 'An unexpected error occurred',
      };
    }
  }

  /**
   * Get human-readable status message
   */
  private static getStatusMessage(status: number): string {
    const statusMessages: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized - Invalid credentials',
      403: 'Forbidden - Access denied',
      404: 'Not Found',
      409: 'Conflict',
      422: 'Unprocessable Entity',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout',
    };

    return statusMessages[status] || `Error ${status}`;
  }

  /**
   * Log error for debugging
   */
  static log(error: ApiError): void {
    // Log in development environment
    if (typeof window !== 'undefined' && (window as any).__VITE_DEV__) {
      console.error('[API Error]', error);
    }
  }
}
