import { NestFactory } from '@nestjs/core';
import { LoggerService } from '@iamnnort/nestjs-logger';
import { AppModule } from './app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const loggerService = await app.resolve(LoggerService);

  app.useLogger(loggerService);

  await app.listen(3000);
}

bootstrap();
