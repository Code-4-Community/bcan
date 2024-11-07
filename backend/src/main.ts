import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv'
import AWS from 'aws-sdk';

/* ! */
async function bootstrap() {
  AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.OPEN_HATCH,
    secretAccessKey: process.env.CLOSED_HATCH
  });  
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3001);
}
dotenv.config();
bootstrap();
