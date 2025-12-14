/**
 * API Client
 * 
 * Centralized HTTP client using Axios with error handling,
 * request/response interceptors, and retry logic.
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API Configuration
const API_BASE_URL = 'https://api.speedtrading.pandora.fun';
const CHAIN_ID = 2741;

// Request timeout (5 seconds)
const REQUEST_TIMEOUT = 5000;

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public originalError?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Creates and configures Axios instance
 */
const createApiClient = (): AxiosInstance => {
    const client = axios.create({
        baseURL: API_BASE_URL,
        timeout: REQUEST_TIMEOUT,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Request interceptor
    client.interceptors.request.use(
        (config) => {
            // Add any auth tokens or headers here if needed
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response interceptor with retry logic
    client.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
            const config = error.config as InternalAxiosRequestConfig & { _retry?: number };
            
            // Don't retry if already retried or if it's a non-retryable error
            if (!config || config._retry || !shouldRetry(error)) {
                return Promise.reject(createApiError(error));
            }

            config._retry = (config._retry || 0) + 1;

            // Exponential backoff
            const delay = RETRY_DELAY * Math.pow(2, config._retry - 1);
            
            await new Promise((resolve) => setTimeout(resolve, delay));

            return client(config);
        }
    );

    return client;
};

/**
 * Determines if an error should be retried
 */
const shouldRetry = (error: AxiosError): boolean => {
    if (!error.response) {
        // Network error - retry
        return true;
    }

    const status = error.response.status;
    
    // Retry on 5xx errors and 429 (rate limit)
    return status >= 500 || status === 429;
};

/**
 * Creates a standardized API error
 */
const createApiError = (error: AxiosError): ApiError => {
    if (error.response) {
        // Server responded with error
        const errorData = error.response.data as { message?: string } | undefined;
        const message = errorData?.message || `API Error: ${error.response.status}`;
        return new ApiError(
            message,
            error.response.status,
            error
        );
    } else if (error.request) {
        // Request made but no response
        return new ApiError(
            'Network error: No response from server',
            undefined,
            error
        );
    } else {
        // Error setting up request
        return new ApiError(
            error.message || 'Unknown error occurred',
            undefined,
            error
        );
    }
};

// Export configured client
export const apiClient = createApiClient();

// Export chain ID for use in queries
export { CHAIN_ID };

