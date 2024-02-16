## Info

Request module for NestJS - Simple - Informative - Pretty

## Installation

```bash
yarn install @iamnnort/nestjs-request
```

## Usage

```javascript
// command.ts
import { Command, CommandRunner } from 'nest-commander';
import { HttpMethods, RequestService } from '@iamnnort/nestjs-request';

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

// app.ts
import { Module } from '@nestjs/common';
import { LoggerModule } from '@iamnnort/nestjs-logger';
import { RequestModule } from '@iamnnort/nestjs-request';
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

// index.ts
import { CommandFactory } from 'nest-commander';
import { AppModule } from './app';

async function bootstrap() {
  await CommandFactory.run(AppModule);
}

bootstrap();

```

## Output

```bash
[System] Application is starting...
[System] Application started.
[System] [Request] POST /echo {"greeting":"hello"}
[System] [Response] POST /echo {"greeting":"hello"} 200 OK
```

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
