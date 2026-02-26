/**
 * Configuration API - Institution AL HANANE
 * URLs et paramètres pour la communication avec le backend
 */

// URL de base de l'API (à adapter selon l'environnement)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/api';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 30000,
  
  // Endpoints
  ENDPOINTS: {
    // Authentification
    AUTH_LOGIN: '/auth/login.php',
    AUTH_LOGOUT: '/auth/logout.php',
    AUTH_ME: '/auth/me.php',
    
    // Notes d'information
    INFO_LIST: '/info/list.php',
    INFO_MARK_READ: '/info/mark-read.php',
    
    // Actualités
    NEWS_LIST: '/news/list.php',
    NEWS_MARK_READ: '/news/mark-read.php',
    
    // Demandes
    REQUESTS_LIST: '/requests/list.php',
    REQUESTS_CREATE: '/requests/create.php',
    REQUESTS_DETAIL: '/requests/detail.php',
    REQUESTS_TYPES: '/requests/types.php',
    
    // Appareils FCM
    DEVICE_REGISTER: '/device/register.php',
    DEVICE_UNREGISTER: '/device/unregister.php',
    
    // Élèves
    STUDENTS_MY: '/students/my.php',
    
    // Contact
    CONTACT_GET: '/contact/get.php',
    
    // CRUD générique
    CRUD: '/crud.php'
  }
};

/**
 * Client HTTP pour les appels API
 */
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Pour les cookies de session
  };
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new ApiError(
        data.error?.message || 'Une erreur est survenue',
        response.status,
        data.error?.code
      );
    }
    
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      'Impossible de contacter le serveur. Vérifiez votre connexion.',
      0,
      'network_error'
    );
  }
}

/**
 * Classe d'erreur personnalisée pour l'API
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Helpers pour les méthodes HTTP
 */
export const api = {
  get: <T>(endpoint: string) => 
    apiCall<T>(endpoint, { method: 'GET' }),
    
  post: <T>(endpoint: string, body?: unknown) => 
    apiCall<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
    
  put: <T>(endpoint: string, body?: unknown) =>
    apiCall<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
    
  delete: <T>(endpoint: string) =>
    apiCall<T>(endpoint, { method: 'DELETE' }),
};
