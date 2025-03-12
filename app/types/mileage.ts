// Types for mileage log entries
export interface MileageLogEntry {
    id: string;
    log_id: string;
    date: Date;
    start_mileage: number;
    end_mileage: number;
    miles: number;
    purpose: string;
    type: 'business' | 'personal';
    vehicle_info: string;
    business_type?: string;
    location?: string;
}

// Types for paginated responses
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
}

// Parameters for fetching entries
export interface FetchEntriesParams {
    logId: string;
    page: number;
    per_page: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    filter_type?: 'business' | 'personal';
}
