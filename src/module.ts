import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { LoggerModule } from '@iamnnort/nestjs-logger';
import { ConfigurableModuleClass } from './module-definition';
import { RequestService } from './service';

@Module({
  imports: [HttpModule, LoggerModule],
  providers: [RequestService],
  exports: [RequestService],
})
export class RequestModule extends ConfigurableModuleClass {}
