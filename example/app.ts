import { Module } from '@nestjs/common';
import { RequestModule } from '../src';
import { AppController } from './app.controller';

@Module({
  imports: [
    RequestModule.register({
      name: 'Demo Api',
      baseUrl: 'https://jsonplaceholder.typicode.com',
      url: '/todos',
      logger: true,
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
