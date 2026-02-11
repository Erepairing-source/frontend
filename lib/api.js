/**
 * API base URL for backend. Use in all fetch() calls so AWS/production works.
 * Set NEXT_PUBLIC_API_URL in .env.local (e.g. https://your-api.example.com/api/v1)
 */
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
