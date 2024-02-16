import { HttpService } from '@nestjs/axios';
import { xml2json } from 'xml2json-light';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { catchError, lastValueFrom, map } from 'rxjs';
import { RequestBuilder } from './builder';
import { MODULE_OPTIONS_TOKEN } from './module-definition';
import { LoggerService } from '@iamnnort/nestjs-logger';
import { BaseRequestConfig, HttpMethods, RequestConfig, RequestConfigParams } from './types';

@Injectable()
export class RequestService<
  Entity extends Record<string, any> = any,
  SearchParams extends RequestConfigParams = any,
  SearchResponse extends Record<string, any> = any,
  CreateParams extends RequestConfigParams = any,
  UpdateParams extends RequestConfigParams = any,
> {
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    public config: BaseRequestConfig,
    private httpService: HttpService,
    private loggerService: LoggerService,
  ) {
    this.loggerService.setContext(config.name);
  }

  common<T>(config: RequestConfig) {
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

            if (this.config.xml) {
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

  search(config: SearchParams = {} as SearchParams) {
    return this.common<SearchResponse>({
      ...config,
      method: HttpMethods.GET,
    });
  }

  get(id: number | string, config: SearchParams = {} as SearchParams) {
    return this.common<Entity>({
      ...config,
      method: HttpMethods.GET,
      url: id,
    });
  }

  create(config: CreateParams) {
    return this.common<Entity>({
      ...config,
      method: HttpMethods.POST,
    });
  }

  bulkCreate(config: CreateParams) {
    return this.common<Entity[]>({
      ...config,
      method: HttpMethods.POST,
      url: '/bulk',
      data: {
        bulk: config.data,
      },
    });
  }

  update(config: UpdateParams) {
    return this.common<Entity>({
      ...config,
      method: HttpMethods.PUT,
    });
  }

  bulkUpdate(config: UpdateParams) {
    return this.common<Entity[]>({
      ...config,
      method: HttpMethods.PUT,
      url: '/bulk',
      data: {
        bulk: config.data,
      },
    });
  }

  remove(id: number | string, config: SearchParams = {} as SearchParams) {
    return this.common<void>({
      ...config,
      method: HttpMethods.DELETE,
      url: id,
    });
  }
}
