/** URL base de la API. En desarrollo, Vite reenvía /api a http://localhost:8080. */
export const API_URL = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')
