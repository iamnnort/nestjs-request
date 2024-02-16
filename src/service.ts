import { HttpService } from '@nestjs/axios';
import { xml2json } from 'xml2json-light';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { catchError, lastValueFrom, map } from 'rxjs';
import { RequestBuilder } from './builder';
import { MODULE_OPTIONS_TOKEN } from './module-definition';
import { LoggerService } from '@iamnnort/nestjs-logger';
import { BaseRequestConfig, RequestConfig } from '.';

@Injectable()
export class RequestService {
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    public config: BaseRequestConfig,
    private httpService: HttpService,
    private loggerService: LoggerService,
  ) {
    this.loggerService.setContext(config.name);
  }

  request<T>(config: RequestConfig) {
    const requestBuilder = new RequestBuilder({
      baseConfig: this.config,
      requestConfig: config,
    });

    const request = requestBuilder
      .makeContentType()
      .makeAuth()
      .makeUrl()
      .makeMethod()
      .makeParams()
      .makeData()
      .makeSerializer()
      .build();

    if (this.config.logger) {
      this.loggerService.logRequest(request as any);
    }

    return lastValueFrom(
      this.httpService
        .request<T>(request)
        .pipe(
          map((response) => {
            if (this.config.logger) {
              this.loggerService.logResponse(response as any);
            }

            if (this.config.xml || config.xml) {
              return xml2json(response.data) as T;
            }

            return response.data;
          }),
        )
        .pipe(
          catchError((error) => {
            if (this.config.debug) {
              console.log('Error:', error);
            }

            if (this.config.logger) {
              this.loggerService.logRequestError(error);
            }

            throw new ForbiddenException(`${this.config.name} is not available`);
          }),
        ),
    );
  }
}
