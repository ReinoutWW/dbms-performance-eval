// Local type definitions for the frontend
export interface QueryDefinition {
  id: string;
  name: string;
  description: string;
  database: 'neo4j' | 'elasticsearch';
  query: string;
  expectedResultCount?: number;
}

export interface QueryResult {
  id: string;
  name: string;
  database: 'neo4j' | 'elasticsearch';
  status: 'idle' | 'running' | 'completed' | 'error';
  executionTime?: number;
  resultCount?: number;
  error?: string;
  timestamp: string;
}

export interface QueryStatus {
  id: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  durationMs?: number;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface QueryExecutionEvent {
  id: string;
  status: 'running' | 'completed' | 'error';
  durationMs?: number;
  error?: string;
} 