import { API_BASE_URL } from "@/config/api";
import { createApiClient } from "@/services/apiClient";

/**
 * Client API unique pour l'application.
 * 
 * IMPORTANT: la simulation Dyad utilise mockBackend (localStorage).
 * En production, l'app pointe vers l'API PHP via VITE_API_URL.
 */

export const api = createApiClient({ baseUrl: API_BASE_URL });
