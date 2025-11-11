import { Handler } from 'aws-lambda';
import serverlessExpress from '@vendia/serverless-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

let cachedHandler: any;

async function bootstrapServer() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: 'https://main.d3nms49d928y9k.amplifyapp.com',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  await app.init();
  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (event, context, callback) => {
  if (!cachedHandler) {
    cachedHandler = await bootstrapServer();
  }
  return cachedHandler(event, context, callback);
};