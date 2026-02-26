/**
 * Hook pour les actualités
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { ApiError } from '@/lib/api';
import type { News } from '@/types';

interface UseNewsReturn {
  news: News[];
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
  refresh: () => Promise<void>;
  markAsRead: (newsId: number) => Promise<void>;
}

export function useNews(): UseNewsReturn {
  const [news, setNews] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ success: boolean; data: { news: News[] } }>('/news/list.php');
      
      if (response.success && response.data) {
        setNews(response.data.news);
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erreur lors du chargement';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (newsId: number) => {
    try {
      await api.post('/news/mark-read.php', { news_id: newsId });
      
      // Mettre à jour localement
      setNews(prev => 
        prev.map(item => 
          item.id === newsId 
            ? { ...item, is_read: true, read_at: Date.now() }
            : item
        )
      );
    } catch (err) {
      console.error('Erreur lors du marquage comme lu:', err);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const unreadCount = news.filter(n => !n.is_read).length;

  return {
    news,
    isLoading,
    error,
    unreadCount,
    refresh: fetchNews,
    markAsRead,
  };
}
