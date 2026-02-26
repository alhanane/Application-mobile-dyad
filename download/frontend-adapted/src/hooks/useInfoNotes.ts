/**
 * Hook pour les notes d'information
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { ApiError } from '@/lib/api';
import type { InfoNote } from '@/types';

interface UseInfoNotesReturn {
  notes: InfoNote[];
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
  refresh: () => Promise<void>;
  markAsRead: (noteId: number) => Promise<void>;
}

export function useInfoNotes(): UseInfoNotesReturn {
  const [notes, setNotes] = useState<InfoNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ success: boolean; data: { notes: InfoNote[] } }>('/info/list.php');
      
      if (response.success && response.data) {
        setNotes(response.data.notes);
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erreur lors du chargement';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (noteId: number) => {
    try {
      await api.post('/info/mark-read.php', { info_note_id: noteId });
      
      // Mettre à jour localement
      setNotes(prev => 
        prev.map(note => 
          note.id === noteId 
            ? { ...note, is_read: true, read_at: Date.now() }
            : note
        )
      );
    } catch (err) {
      console.error('Erreur lors du marquage comme lu:', err);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const unreadCount = notes.filter(n => !n.is_read).length;

  return {
    notes,
    isLoading,
    error,
    unreadCount,
    refresh: fetchNotes,
    markAsRead,
  };
}
