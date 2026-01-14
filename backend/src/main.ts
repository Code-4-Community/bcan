import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv'
import * as AWS from 'aws-sdk';
import { ValidationPipe } from '@nestjs/common';

/* ! */
async function bootstrap() {
  AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.OPEN_HATCH,
    secretAccessKey: process.env.CLOSED_HATCH
  });
  
  const app = await NestFactory.create(AppModule);
  // cors enabled for the local frontend dev server
  app.enableCors({
    origin: 'http://localhost:5173', // Your frontend URL
    credentials: true,               // Required for cookies/credentials
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3001);
}
dotenv.config();
bootstrap();


