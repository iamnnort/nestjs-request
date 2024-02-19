import { Controller, Get } from '@nestjs/common';
import { RequestService } from '../src';

@Controller('demo')
export class AppController {
  constructor(private requestService: RequestService<{ id: number }>) {}

  @Get()
  demo() {
    return this.requestService.get(1);
  }
}
