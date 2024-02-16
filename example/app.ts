import { LoggerModule } from '@iamnnort/nestjs-logger';
import { Module } from '@nestjs/common';
import { RequestModule } from '../src';
import { DemoCommand } from './command';

@Module({
  imports: [
    LoggerModule,
    RequestModule.forFeature({
      name: 'Demo Api',
      baseUrl: 'https://jsonplaceholder.typicode.com',
      url: '/todos',
      logger: true,
    }),
  ],
  providers: [DemoCommand],
})
export class AppModule {}
