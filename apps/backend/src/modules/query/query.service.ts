import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { performance } from 'perf_hooks';
import * as fs from 'fs';
import * as path from 'path';

// Local type definitions to avoid shared library dependency issues
interface QueryDefinition {
  id: string;
  name: string;
  description: string;
  database: 'neo4j' | 'elasticsearch';
  query: string;
  expectedResultCount?: number;
}

interface QueryResult {
  id: string;
  name: string;
  database: 'neo4j' | 'elasticsearch';
  status: 'idle' | 'running' | 'completed' | 'error';
  executionTime?: number;
  resultCount?: number;
  error?: string;
  timestamp: string;
}

@Injectable()
export class QueryService implements OnModuleInit {
  private readonly logger = new Logger(QueryService.name);
  private queries: QueryDefinition[] = [];

  async onModuleInit() {
    await this.loadQueries();
  }

  private async loadQueries() {
    try {
      const queriesPath = path.join(__dirname, 'queries.json');
      const queriesData = JSON.parse(fs.readFileSync(queriesPath, 'utf8'));
      this.queries = queriesData.queries;
      this.logger.log(`Loaded ${this.queries.length} queries`);
    } catch (error) {
      this.logger.error('Failed to load queries', error);
      // Provide fallback queries if file doesn't exist
      this.queries = [
        {
          id: 'neo4j-1',
          name: 'Neo4j Node Count',
          description: 'Count all nodes in the database',
          database: 'neo4j',
          query: 'MATCH (n) RETURN count(n) as nodeCount',
          expectedResultCount: 1
        },
        {
          id: 'es-1',
          name: 'Elasticsearch Match All',
          description: 'Match all documents',
          database: 'elasticsearch',
          query: '{"query": {"match_all": {}}}',
          expectedResultCount: 100
        }
      ];
    }
  }

  getQueries(): QueryDefinition[] {
    return this.queries;
  }

  getQueryById(id: string): QueryDefinition | undefined {
    return this.queries.find(q => q.id === id);
  }

  async executeQuery(queryId: string): Promise<QueryResult> {
    const query = this.getQueryById(queryId);
    if (!query) {
      throw new Error(`Query with id ${queryId} not found`);
    }

    const startTime = performance.now();
    const timestamp = new Date().toISOString();

    try {
      // Simulate query execution for now
      await this.simulateQueryExecution(query);

      const endTime = performance.now();
      const executionTime = Math.round(endTime - startTime);

      this.logger.log(`Query ${queryId} completed in ${executionTime}ms`);

      return {
        id: queryId,
        name: query.name,
        database: query.database,
        status: 'completed',
        executionTime,
        resultCount: query.expectedResultCount || 0,
        timestamp,
      };
    } catch (error) {
      const endTime = performance.now();
      const executionTime = Math.round(endTime - startTime);
      
      this.logger.error(`Query ${queryId} failed after ${executionTime}ms`, error);

      return {
        id: queryId,
        name: query.name,
        database: query.database,
        status: 'error',
        executionTime,
        error: (error as Error).message,
        timestamp,
      };
    }
  }

  private async simulateQueryExecution(query: QueryDefinition): Promise<void> {
    // Simulate different execution times based on query complexity
    const baseTime = query.database === 'neo4j' ? 100 : 50;
    const randomFactor = Math.random() * 2000; // 0-2000ms
    const simulatedTime = baseTime + randomFactor;
    
    await new Promise(resolve => setTimeout(resolve, simulatedTime));
    
    // Simulate occasional failures (5% chance)
    if (Math.random() < 0.05) {
      throw new Error(`Simulated ${query.database} connection error`);
    }
  }
} 