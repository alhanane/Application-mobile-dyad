/**
 * Configuration de l'API
 * 
 * Ce fichier contient toutes les URLs et configurations de l'API backend.
 * Modifiez API_BASE_URL pour pointer vers votre serveur de production.
 */

// URL de base de l'API backend
// En développement local: 'http://localhost:8000/api'
// En production: 'https://votre-domaine.com/mobile/api'
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://votre-domaine.com/mobile/api';

// URL de base de l'application
export const APP_BASE_URL = import.meta.env.VITE_APP_URL || 'https://votre-domaine.com/mobile';

// Configuration des endpoints
export const API_ENDPOINTS = {
  // Authentification
  AUTH: {
    LOGIN: '/auth/login.php',
    LOGOUT: '/auth/logout.php',
    ME: '/auth/me.php',
  },
  
  // Informations / Notes
  INFO: {
    LIST: '/info/list.php',
    MARK_READ: '/info/mark-read.php',
  },
  
  // Actualités
  NEWS: {
    LIST: '/news/list.php',
    MARK_READ: '/news/mark-read.php',
  },
  
  // Demandes
  REQUESTS: {
    LIST: '/requests/list.php',
    CREATE: '/requests/create.php',
  },
  
  // Profil parent
  PARENT: {
    PROFILE: '/parent/profile.php',
    UPDATE_PROFILE: '/parent/profile.update.php',
  },
  
  // Appareils (FCM)
  DEVICE: {
    REGISTER: '/device/register.php',
    UNREGISTER: '/device/unregister.php',
  },
  
  // Contact
  CONTACT: {
    GET: '/contact/get.php',
  },
} as const;

// Fonction utilitaire pour construire les URLs complètes
export function buildUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}

// Fonction utilitaire pour construire les URLs de l'application
export function buildAppUrl(path: string): string {
  return `${APP_BASE_URL}${path}`;
}

// Configuration du timeout des requêtes (en millisecondes)
export const API_TIMEOUT = 30000;

// Configuration des retries
export const API_MAX_RETRIES = 3;
export const API_RETRY_DELAY = 1000;

// Mode debug (affiche les requêtes dans la console)
export const API_DEBUG = import.meta.env.DEV || false;

export default {
  API_BASE_URL,
  APP_BASE_URL,
  API_ENDPOINTS,
  buildUrl,
  buildAppUrl,
  API_TIMEOUT,
  API_MAX_RETRIES,
  API_RETRY_DELAY,
  API_DEBUG,
};