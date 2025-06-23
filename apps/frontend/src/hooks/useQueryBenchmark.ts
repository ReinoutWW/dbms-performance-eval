import { useState, useEffect, useCallback } from 'react';
import { QueryDefinition, QueryStatus, QueryResult } from '../types';

interface QueryBenchmarkState {
  queries: QueryDefinition[];
  queryStatuses: Record<string, QueryStatus>;
  fastestQueryId?: string;
  isConnected: boolean;
  error?: string;
}

const useQueryBenchmark = () => {
  const [state, setState] = useState<QueryBenchmarkState>({
    queries: [],
    queryStatuses: {},
    isConnected: false,
  });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  // Fetch queries from the backend
  const fetchQueries = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isConnected: false, error: undefined }));
      
      console.log('API URL:', apiUrl);
      console.log('Full URL:', `${apiUrl}/query`);
      const response = await fetch(`${apiUrl}/query`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const queries: QueryDefinition[] = await response.json();
      console.log('Fetched queries:', queries);
      
      setState(prev => ({
        ...prev,
        queries,
        isConnected: true,
        queryStatuses: queries.reduce((acc, query) => ({
          ...acc,
          [query.id]: { id: query.id, status: 'idle' as const }
        }), {}),
        error: undefined,
      }));
    } catch (error) {
      console.error('Failed to fetch queries:', error);
      setState(prev => ({
        ...prev,
        isConnected: false,
        error: `Failed to connect to server: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }));
    }
  }, [apiUrl]);

  // Initialize by fetching queries
  useEffect(() => {
    fetchQueries();
  }, [fetchQueries]);

  const runQuery = useCallback(async (queryId: string) => {
    try {
      // Update status to running
      setState(prev => ({
        ...prev,
        queryStatuses: {
          ...prev.queryStatuses,
          [queryId]: {
            id: queryId,
            status: 'running',
            startedAt: new Date(),
          }
        }
      }));

      console.log('Running query:', queryId);
      const response = await fetch(`${apiUrl}/query/run/${queryId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: QueryResult = await response.json();
      console.log('Query result:', result);

      // Update status with result
      setState(prev => {
        const newStatuses = {
          ...prev.queryStatuses,
          [queryId]: {
            id: queryId,
            status: result.status,
            durationMs: result.executionTime,
            error: result.error,
            startedAt: prev.queryStatuses[queryId]?.startedAt,
            completedAt: new Date(),
          }
        };

        // Calculate fastest query
        const completedQueries = Object.values(newStatuses).filter(
          status => status.status === 'completed' && status.durationMs !== undefined && status.durationMs > 0
        );
        
        const fastestQuery = completedQueries.reduce((fastest, current) => {
          if (!fastest || (current.durationMs! < fastest.durationMs!)) {
            return current;
          }
          return fastest;
        }, null as QueryStatus | null);

        return {
          ...prev,
          queryStatuses: newStatuses,
          fastestQueryId: fastestQuery?.id,
        };
      });

    } catch (error) {
      console.error('Failed to run query:', error);
      setState(prev => ({
        ...prev,
        queryStatuses: {
          ...prev.queryStatuses,
          [queryId]: {
            id: queryId,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
            startedAt: prev.queryStatuses[queryId]?.startedAt,
            completedAt: new Date(),
          }
        }
      }));
    }
  }, [apiUrl]);

  const runAllQueries = useCallback(() => {
    state.queries.forEach((query, index) => {
      if (state.queryStatuses[query.id]?.status !== 'running') {
        // Stagger the queries to avoid overwhelming the server
        setTimeout(() => runQuery(query.id), index * 500);
      }
    });
  }, [state.queries, state.queryStatuses, runQuery]);

  const resetResults = useCallback(() => {
    setState(prev => ({
      ...prev,
      queryStatuses: Object.keys(prev.queryStatuses).reduce((acc, queryId) => ({
        ...acc,
        [queryId]: { id: queryId, status: 'idle' as const }
      }), {}),
      fastestQueryId: undefined,
    }));
  }, []);

  return {
    queries: state.queries,
    queryStatuses: state.queryStatuses,
    fastestQueryId: state.fastestQueryId,
    isConnected: state.isConnected,
    error: state.error,
    runQuery,
    runAllQueries,
    resetResults,
    refetch: fetchQueries,
  };
};

export default useQueryBenchmark; 