import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { QueryService } from './query.service';
import { QueryExecutionEvent, QueryResult } from '@query-benchmark-ui/shared';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})
export class QueryGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(QueryGateway.name);

  constructor(private readonly queryService: QueryService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('run-query')
  async handleRunQuery(
    @MessageBody() data: { queryId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const { queryId } = data;
    
    try {
      // Emit starting status
      const startEvent: QueryExecutionEvent = {
        id: queryId,
        status: 'running',
        timestamp: new Date(),
      };
      
      this.server.emit('query-status', startEvent);
      
      // Execute the query
      const result: QueryResult = await this.queryService.executeQuery(queryId);
      
      // Emit completion status
      const completeEvent: QueryExecutionEvent = {
        id: queryId,
        status: result.error ? 'error' : 'completed',
        durationMs: result.durationMs,
        error: result.error,
        timestamp: new Date(),
      };
      
      this.server.emit('query-result', completeEvent);
      
    } catch (error) {
      this.logger.error(`Error executing query ${queryId}`, error);
      
      const errorEvent: QueryExecutionEvent = {
        id: queryId,
        status: 'error',
        error: (error as Error).message,
        timestamp: new Date(),
      };
      
      this.server.emit('query-result', errorEvent);
    }
  }

  @SubscribeMessage('get-queries')
  handleGetQueries(@ConnectedSocket() client: Socket): void {
    const queries = this.queryService.getQueries();
    client.emit('queries-list', queries);
  }

  // Method to emit query status updates from external services
  emitQueryStatus(event: QueryExecutionEvent): void {
    this.server.emit('query-status', event);
  }

  emitQueryResult(event: QueryExecutionEvent): void {
    this.server.emit('query-result', event);
  }
} 