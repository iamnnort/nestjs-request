import { Controller, Get } from '@nestjs/common';
import { RequestService } from '../src';

@Controller('demo')
export class AppController {
  constructor(private requestService: RequestService) {}

  @Get()
  demo() {
    return this.requestService.common<User>({
      url: '/auth/validate',
      bearerToken: '*****',
    });
  }
}
