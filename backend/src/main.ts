import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv'
import AWS from 'aws-sdk';

/* ! */
async function bootstrap() {
    AWS.config.update({
        region: process.env.AWS_REGION
      });
  const app = await NestFactory.create(AppModule);
  app.enableCors();  // Enable CORS if needed
  await app.listen(3001);  // Port where the server listens
}
dotenv.config();
bootstrap();
