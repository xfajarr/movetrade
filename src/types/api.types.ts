/**
 * API-related type definitions (Future)
 * 
 * Types for backend API integration
 */

// Request/Response types for future API integration

export interface ApiResponse<T> {
    data: T;
    error?: string;
    success: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
}

// Placeholder for future API types
export interface PlaceBetRequest {
    market: string;
    direction: string;
    amount: number;
    leverage: number;
}

export interface PlaceBetResponse {
    betId: string;
    entryPrice: number;
    timestamp: number;
}
