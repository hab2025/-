import { useState, useCallback } from 'react';
import { realTimeSearchAPI } from '@/services/api/realTimeSearchAPI';
import { LiveSearchResult } from '@/types/chat';

interface UseRealTimeSearchReturn {
  results: LiveSearchResult[];
  isSearching: boolean;
  error: string | null;
  search: (query: string, language?: string) => Promise<void>;
  clearResults: () => void;
  needsRealTimeSearch: (query: string) => boolean;
}

export const useRealTimeSearch = (): UseRealTimeSearchReturn => {
  const [results, setResults] = useState<LiveSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string, language: string = 'ar') => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const searchResults = await realTimeSearchAPI.smartSearch(query, language);
      setResults(searchResults);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء البحث';
      setError(errorMessage);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  const needsRealTimeSearch = useCallback((query: string) => {
    return realTimeSearchAPI.needsRealTimeSearch(query);
  }, []);

  return {
    results,
    isSearching,
    error,
    search,
    clearResults,
    needsRealTimeSearch,
  };
};

