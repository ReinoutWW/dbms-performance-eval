import { Module } from '@nestjs/common';
import { QueryController } from './query.controller';
import { QueryService } from './query.service';
import { QueryGateway } from './query.gateway';

@Module({
  controllers: [QueryController],
  providers: [QueryService, QueryGateway],
  exports: [QueryService, QueryGateway],
})
export class QueryModule {} 