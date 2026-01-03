import { useCallback, useEffect } from 'react';
import { getHistory, deleteImage, clearHistory } from '../lib/db';
import { useGenerationStore } from '../store/generationStore';
import { GenerationResult } from '../types/generation';

interface UseHistoryReturn {
  history: GenerationResult[];
  isHistoryOpen: boolean;
  refreshHistory: () => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  handleClearAll: () => Promise<void>;
  openHistory: () => void;
  closeHistory: () => void;
}

/**
 * Custom hook for managing generation history.
 * Encapsulates IndexedDB operations, state synchronization,
 * and history sidebar controls.
 */
export function useHistory(): UseHistoryReturn {
  const {
    history,
    setHistory,
    isHistoryOpen,
    setIsHistoryOpen,
    removeFromHistory,
    clearAllHistory
  } = useGenerationStore();

  /**
   * Syncs history from IndexedDB to Zustand store.
   * Called on mount and after any database mutations.
   */
  const refreshHistory = useCallback(async () => {
    try {
      const stored = await getHistory();
      setHistory(stored);
    } catch (e) {
      console.error("History sync failed", e);
    }
  }, [setHistory]);

  /**
   * Deletes a single item from IndexedDB and updates store.
   */
  const handleDelete = useCallback(async (id: string) => {
    await deleteImage(id);
    removeFromHistory(id);
  }, [removeFromHistory]);

  /**
   * Clears all history after user confirmation.
   * Wipes IndexedDB and resets store state.
   */
  const handleClearAll = useCallback(async () => {
    if (window.confirm("WARNING: This will permanently erase all local archives. Continue?")) {
      await clearHistory();
      clearAllHistory();
    }
  }, [clearAllHistory]);

  /**
   * Opens the history sidebar.
   */
  const openHistory = useCallback(() => {
    setIsHistoryOpen(true);
  }, [setIsHistoryOpen]);

  /**
   * Closes the history sidebar.
   */
  const closeHistory = useCallback(() => {
    setIsHistoryOpen(false);
  }, [setIsHistoryOpen]);

  // Load history on mount
  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  return {
    history,
    isHistoryOpen,
    refreshHistory,
    handleDelete,
    handleClearAll,
    openHistory,
    closeHistory
  };
}
