import { Controller, Post, Get, Param, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { QueryService } from './query.service';
@Controller('query')
export class QueryController {
  private readonly logger = new Logger(QueryController.name);

  constructor(private readonly queryService: QueryService) {}

  @Get()
  getQueries() {
    return this.queryService.getQueries();
  }

  @Get(':id')
  getQueryById(@Param('id') id: string) {
    const query = this.queryService.getQueryById(id);
    if (!query) {
      throw new HttpException(`Query with id ${id} not found`, HttpStatus.NOT_FOUND);
    }
    return query;
  }

  @Post('run/:id')
  async runQuery(@Param('id') id: string) {
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