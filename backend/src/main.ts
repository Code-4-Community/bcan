import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv'
import * as AWS from 'aws-sdk';
import { ValidationPipe } from '@nestjs/common';
import  cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

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
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  const config = new DocumentBuilder()
    .setTitle('Project BCAN Backend API Documentation')
    .setDescription('REST API for Bcan project written in nestjs using bearer auth for auth purposes.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(3001);
}
dotenv.config();
bootstrap();


