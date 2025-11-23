// API configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Helper function to build API URLs
export function apiUrl(path: string): string {
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    // If API_BASE_URL is set, use it; otherwise use relative URL
    if (API_BASE_URL) {
        return `${API_BASE_URL}/${cleanPath}`;
    }
    return `/${cleanPath}`;
}
