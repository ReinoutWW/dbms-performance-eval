/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configure CORS
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:4000',
      'http://localhost:3001',
      process.env.CORS_ORIGIN
    ].filter(Boolean),
    methods: ['GET', 'POST'],
    credentials: true,
  });

  // Configure Socket.IO adapter
  app.useWebSocketAdapter(new IoAdapter(app));
  
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(
    `🔌 WebSocket server is running on: ws://localhost:${port}`
  );
}

bootstrap();
