import { Handler } from 'aws-lambda';
import { createServer, proxy } from 'aws-serverless-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Cache between cold starts
let cachedServer: ReturnType<typeof createServer>;

async function bootstrapServer() {
  if (cachedServer) return cachedServer;

  const app = await NestFactory.create(AppModule);
  await app.init();
  const expressApp = app.getHttpAdapter().getInstance();
  cachedServer = createServer(expressApp);
  return cachedServer;
}

// Main Lambda handler
export const handler: Handler = async (event, context) => {
  const server = await bootstrapServer();
  return proxy(server, event, context, 'PROMISE').promise;
};
