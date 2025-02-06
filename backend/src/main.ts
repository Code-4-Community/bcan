import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv'
import AWS from 'aws-sdk';
import { ValidationPipe } from '@nestjs/common';
/* ! */
async function bootstrap() {
    AWS.config.update({
        region: process.env.AWS_REGION
      });
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3001);
}
dotenv.config();
bootstrap();
