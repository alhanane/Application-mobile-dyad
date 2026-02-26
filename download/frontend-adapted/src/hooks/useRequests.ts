/**
 * Hook pour les demandes des parents
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { ApiError } from '@/lib/api';
import type { Request, RequestType, RequestDetail, RequestResponse } from '@/types';

interface UseRequestsReturn {
  requests: Request[];
  types: RequestType[];
  isLoading: boolean;
  error: string | null;
  pendingCount: number;
  refresh: () => Promise<void>;
  createRequest: (data: CreateRequestData) => Promise<number | null>;
  getDetail: (requestId: number) => Promise<RequestDetail | null>;
}

interface CreateRequestData {
  student_id: number;
  request_type_id: number;
  subject?: string;
  message: string;
}

export function useRequests(): UseRequestsReturn {
  const [requests, setRequests] = useState<Request[]>([]);
  const [types, setTypes] = useState<RequestType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Charger les demandes et les types en parallèle
      const [requestsRes, typesRes] = await Promise.all([
        api.get<{ success: boolean; data: { requests: Request[] } }>('/requests/list.php'),
        api.get<{ success: boolean; data: { types: RequestType[] } }>('/requests/types.php'),
      ]);

      if (requestsRes.success && requestsRes.data) {
        setRequests(requestsRes.data.requests);
      }

      if (typesRes.success && typesRes.data) {
        setTypes(typesRes.data.types);
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erreur lors du chargement';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createRequest = useCallback(async (data: CreateRequestData): Promise<number | null> => {
    try {
      const response = await api.post<{ success: boolean; data: { request_id: number } }>(
        '/requests/create.php',
        data
      );

      if (response.success && response.data) {
        // Rafraîchir la liste
        await fetchData();
        return response.data.request_id;
      }
      
      return null;
    } catch (err) {
      throw err;
    }
  }, [fetchData]);

  const getDetail = useCallback(async (requestId: number): Promise<RequestDetail | null> => {
    try {
      const response = await api.get<{ 
        success: boolean; 
        data: { request: RequestDetail; responses: RequestResponse[] } 
      }>(`/requests/detail.php?id=${requestId}`);

      if (response.success && response.data) {
        return response.data.request;
      }
      
      return null;
    } catch (err) {
      return null;
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pendingCount = requests.filter(r => r.status === 'pending' || r.status === 'in_progress').length;

  return {
    requests,
    types,
    isLoading,
    error,
    pendingCount,
    refresh: fetchData,
    createRequest,
    getDetail,
  };
}
