// Central API URL configuration
// - In development: uses .env file or falls back to localhost:8000
// - In production (Vercel): uses VITE_API_URL environment variable

export const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";