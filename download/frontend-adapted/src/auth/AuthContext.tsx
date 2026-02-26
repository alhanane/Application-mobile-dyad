/**
 * Contexte d'authentification - Institution AL HANANE
 * Gestion de l'authentification avec l'API backend
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api, ApiError } from '@/lib/api';
import type { Parent, Student, LoginResponse, StudentsResponse } from '@/types';

// ============================================
// TYPES
// ============================================

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  parent: Parent | null;
  children: Student[];
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext<AuthContextType | null>(null);

export const AUTH_STORAGE_KEY = 'alhanane_auth_v1';

// ============================================
// PROVIDER
// ============================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    parent: null,
    children: [],
    error: null,
  });

  /**
   * Vérifier si l'utilisateur est connecté au chargement
   */
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Vérifier l'authentification existante
   */
  const checkAuth = async () => {
    try {
      const response = await api.get<{ success: boolean; data: LoginResponse }>('/auth/me.php');
      
      if (response.success && response.data) {
        setState({
          isAuthenticated: true,
          isLoading: false,
          parent: response.data.parent,
          children: response.data.children,
          error: null,
        });
        
        // Stocker l'état d'authentification
        localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      }
    } catch (error) {
      // Non connecté ou session expirée
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setState({
        isAuthenticated: false,
        isLoading: false,
        parent: null,
        children: [],
        error: null,
      });
    }
  };

  /**
   * Connexion
   */
  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await api.post<{ success: boolean; data: LoginResponse }>(
        '/auth/login.php',
        { login: username, password }
      );

      if (response.success && response.data) {
        setState({
          isAuthenticated: true,
          isLoading: false,
          parent: response.data.parent,
          children: response.data.children,
          error: null,
        });
        
        localStorage.setItem(AUTH_STORAGE_KEY, 'true');
        return true;
      }

      return false;
    } catch (error) {
      const message = error instanceof ApiError 
        ? error.message 
        : 'Une erreur est survenue lors de la connexion.';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));

      return false;
    }
  }, []);

  /**
   * Déconnexion
   */
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout.php');
    } catch (error) {
      // Ignorer les erreurs de déconnexion
    } finally {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setState({
        isAuthenticated: false,
        isLoading: false,
        parent: null,
        children: [],
        error: null,
      });
    }
  }, []);

  /**
   * Rafraîchir les données utilisateur
   */
  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get<{ success: boolean; data: LoginResponse }>('/auth/me.php');
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          parent: response.data.parent,
          children: response.data.children,
        }));
      }
    } catch (error) {
      // Session expirée
      logout();
    }
  }, [logout]);

  /**
   * Effacer l'erreur
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // ============================================
  // RENDU
  // ============================================

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    refreshUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook pour obtenir le nom complet du parent
 */
export function useParentName() {
  const { parent } = useAuth();
  
  if (!parent) return '';
  
  return `${parent.first_name} ${parent.last_name}`;
}

/**
 * Hook pour obtenir l'enfant principal
 */
export function usePrimaryChild() {
  const { children } = useAuth();
  
  return children.find(c => c.is_primary) || children[0] || null;
}
