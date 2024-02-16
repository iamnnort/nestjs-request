import { HttpMethods, RequestService } from '../src';
import { Command, CommandRunner } from 'nest-commander';

@Command({ name: 'demo' })
export class DemoCommand extends CommandRunner {
  constructor(private requestService: RequestService) {
    super();
  }

  async run() {
    await this.requestService.request({
      method: HttpMethods.GET,
      url: '/todos/1',
    });
  }
}
