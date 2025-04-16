import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configure } from '@vendia/serverless-express';  // NEW

let cachedHandler: ReturnType<typeof configure>;

export const handler = async (event: any, context: any) => {
  // first invocation: boot Nest and create handler
  if (!cachedHandler) {
    const app = await NestFactory.create(AppModule);
    await app.init();
    cachedHandler = configure({
      app: app.getHttpAdapter().getInstance(),
      // optional: logLevel: 'info',
    });
  }
  // Vendia adapter understands both 1.0 and 2.0 events
  return cachedHandler(event, context, () => console.log('healthy'));
};
