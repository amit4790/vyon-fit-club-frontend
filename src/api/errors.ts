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
  /**
   * Parse API error response
   */
  static parse(error: any): ApiError {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;

      return {
        status,
        message: data?.detail || data?.message || this.getStatusMessage(status),
        detail: data?.detail,
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
