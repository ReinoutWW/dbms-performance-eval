import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { performance } from 'perf_hooks';
import * as fs from 'fs';
import * as path from 'path';

// Local type definitions to avoid import issues
interface QueryDefinition {
  id: string;
  label: string;
  source: "neo4j" | "es";
  statement: string;
}

interface QueryResult {
  id: string;
  startedAt: Date;
  durationMs: number;
  error?: string;
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
      // Use default queries if file not found
      this.queries = this.getDefaultQueries();
    }
  }

  private getDefaultQueries(): QueryDefinition[] {
    return [
      {
        id: "neo4j-01",
        label: "Simple Node Match",
        source: "neo4j",
        statement: "MATCH (n) RETURN count(n)"
      },
      {
        id: "es-01",
        label: "Match All Query",
        source: "es",
        statement: "{\"query\": {\"match_all\": {}}, \"size\": 10}"
      }
    ];
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
    const startedAt = new Date();

    try {
      // Simulate query execution
      await this.simulateQueryExecution(query);
      
      const endTime = performance.now();
      const durationMs = Math.round(endTime - startTime);

      this.logger.log(`Query ${queryId} completed in ${durationMs}ms`);

      return {
        id: queryId,
        startedAt,
        durationMs,
      };
    } catch (error) {
      const endTime = performance.now();
      const durationMs = Math.round(endTime - startTime);
      
      this.logger.error(`Query ${queryId} failed after ${durationMs}ms`, error);

      return {
        id: queryId,
        startedAt,
        durationMs: -1,
        error: (error as Error).message,
      };
    }
  }

  private async simulateQueryExecution(query: QueryDefinition): Promise<void> {
    // Simulate query execution time
    const delay = Math.random() * 2000 + 100; // 100-2100ms
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Simulate occasional failures
    if (Math.random() < 0.1) {
      throw new Error(`Simulated ${query.source} connection error`);
    }
  }
} 