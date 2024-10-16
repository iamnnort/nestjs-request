import { HttpService } from '@nestjs/axios';
import { xml2json } from 'xml2json-light';
import { ForbiddenException, Inject, Injectable, Scope } from '@nestjs/common';
import { catchError, lastValueFrom, map } from 'rxjs';
import { LoggerService } from '@iamnnort/nestjs-logger';
import { RequestBuilder } from './builder';
import { MODULE_OPTIONS_TOKEN } from './module-definition';
import {
  type BaseRequestConfig,
  HttpMethods,
  Pagination,
  PaginationResponse,
  RequestConfig,
  RequestConfigParams,
} from './types';

@Injectable({
  scope: Scope.TRANSIENT,
})
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

    if (this.config.debug) {
      console.log('Config: ', JSON.stringify(request));
    }

    return lastValueFrom(
      this.httpService
        .request<T>(request)
        .pipe(
          map((response) => {
            if (this.config.logger) {
              this.loggerService.logResponse(response as any);
            }

            if (config.xml) {
              return xml2json(response.data) as T;
            }

            return response.data;
          }),
        )
        .pipe(
          catchError((error) => {
            if (this.config.debug) {
              console.error('Error: ', error);
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

  async *bulkSearch(config: SearchParams = {} as SearchParams): AsyncGenerator<Entity[]> {
    let pagination: Pagination = {
      total: 0,
      currentPage: config.params?.page || 0,
      lastPage: 0,
      from: 0,
      to: 0,
      pageSize: config.params?.pageSize || 30,
    };

    do {
      const response = await this.common<PaginationResponse<Entity>>({
        ...config,
        method: HttpMethods.GET,
        params: {
          ...config.params,
          page: pagination.currentPage + 1,
          pageSize: pagination.pageSize,
        },
      });

      if (!response.data?.length) {
        return [];
      }

      yield response.data;

      pagination = response.pagination;
    } while (pagination.currentPage !== pagination.lastPage);
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

  parseId(url: string) {
    if (!url) {
      return '';
    }

    return url.substring(url.lastIndexOf('/') + 1);
  }

  makeData(data: object, options: { isStringOnly: boolean; isSorted: boolean }) {
    const dataKeys = options.isSorted ? Object.keys(data).sort() : Object.keys(data);

    const updatedObj = dataKeys.reduce((accData, dataKey) => {
      if (typeof data[dataKey] === 'object' && data[dataKey] !== null) {
        return {
          ...accData,
          [dataKey]: this.makeData(data[dataKey], options),
        };
      }

      if (options.isStringOnly) {
        return {
          ...accData,
          [dataKey]: data[dataKey].toString(),
        };
      }

      return {
        ...accData,
        [dataKey]: data[dataKey],
      };
    }, {});

    return Array.isArray(data) ? Object.values(updatedObj) : updatedObj;
  }
}
