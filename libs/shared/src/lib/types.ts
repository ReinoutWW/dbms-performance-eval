export interface QueryDefinition {
  id: string;          // e.g. "neo4j-01"
  label: string;       // Human‑readable title
  source: "neo4j" | "es";
  statement: string;   // Cypher or ES DSL JSON
}

export interface QueryResult {
  id: string;          // matches QueryDefinition.id
  startedAt: Date;
  durationMs: number;  // ‑1 on error
  error?: string;
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
  status: QueryStatus['status'];
  durationMs?: number;
  error?: string;
  timestamp: Date;
}

export interface DatabaseConfig {
  neo4j: {
    uri: string;
    username: string;
    password: string;
  };
  elasticsearch: {
    node: string;
    username?: string;
    password?: string;
  };
} 