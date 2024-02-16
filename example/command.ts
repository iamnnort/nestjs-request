import { RequestService } from '../src';
import { Command, CommandRunner } from 'nest-commander';

@Command({ name: 'demo' })
export class DemoCommand extends CommandRunner {
  constructor(private requestService: RequestService<{ id: number }>) {
    super();
  }

  async run() {
    const todo = await this.requestService.get(1);

    console.log('Result:', todo);
  }
}
