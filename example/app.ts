import { LoggerModule } from '@iamnnort/nestjs-logger';
import { Module } from '@nestjs/common';
import { RequestModule } from '../src';
import { DemoCommand } from './command';

@Module({
  imports: [
    LoggerModule,
    RequestModule.forRoot({
      name: 'JSON Placeholder',
      baseUrl: 'https://jsonplaceholder.typicode.com',
      logger: true,
    }),
  ],
  providers: [DemoCommand],
})
export class AppModule {}
