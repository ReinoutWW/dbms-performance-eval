import { Controller, Post, Get, Param, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { QueryService } from './query.service';

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

@Controller('query')
export class QueryController {
  private readonly logger = new Logger(QueryController.name);

  constructor(private readonly queryService: QueryService) {}

  @Get()
  getQueries(): QueryDefinition[] {
    return this.queryService.getQueries();
  }

  @Get(':id')
  getQueryById(@Param('id') id: string): QueryDefinition {
    const query = this.queryService.getQueryById(id);
    if (!query) {
      throw new HttpException(`Query with id ${id} not found`, HttpStatus.NOT_FOUND);
    }
    return query;
  }

  @Post('run/:id')
  async runQuery(@Param('id') id: string): Promise<QueryResult> {
    try {
      this.logger.log(`Starting execution of query: ${id}`);
      const result = await this.queryService.executeQuery(id);
      return result;
    } catch (error) {
      this.logger.error(`Failed to execute query ${id}`, error);
      throw new HttpException(
        (error as Error).message || 'Failed to execute query',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 