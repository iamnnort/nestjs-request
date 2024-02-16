import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { ConfigurableModuleClass } from './module-definition';
import { RequestService } from './service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [RequestService],
  exports: [RequestService],
})
export class RequestModule extends ConfigurableModuleClass {}
