import { HttpService } from '@nestjs/axios';
import { xml2json } from 'xml2json-light';
import { ForbiddenException, Inject, Injectable, Scope } from '@nestjs/common';
import { catchError, lastValueFrom, map } from 'rxjs';
import { RequestBuilder } from './builder';
import { MODULE_OPTIONS_TOKEN } from './module-definition';
import {
  type BaseRequestConfig,
  HttpMethods,
  PaginationResponse,
  RequestConfig,
  RequestConfigParams,
  ResponseConfig,
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
  ) {}

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

    if (this.config.debug) {
      console.log('Request Config:', JSON.stringify(request));
    }

    return lastValueFrom(
      this.httpService
        .request<T>(request)
        .pipe(
          map((response) => {
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

            throw new ForbiddenException(`${this.config.name} is not available`);
          }),
        ),
    );
  }

  async *bulkCommon<T>(requestConfig: RequestConfig, responseConfig: ResponseConfig = {}): AsyncGenerator<T[]> {
    const { params } = requestConfig;
    const { bulkCallback } = responseConfig;
    const { page, pageSize, bulkSize, ...searchDto } = params || {};

    const paginationDto = {
      page: page || 1,
      pageSize: pageSize || 30,
    };

    const maxPage = bulkSize ? paginationDto.page - 1 + bulkSize : null;

    let pagination = {
      total: 0,
      currentPage: 0,
      lastPage: 0,
      from: 0,
      to: 0,
      pageSize: 0,
    };

    do {
      const response = await this.common<PaginationResponse<T>>({
        ...requestConfig,
        params: {
          ...paginationDto,
          ...searchDto,
        },
      });

      pagination = response.pagination;

      if (!response.data?.length) {
        return;
      }

      yield response.data;

      paginationDto.page += 1;
    } while (pagination.currentPage !== pagination.lastPage && pagination.currentPage !== maxPage);

    if (pagination.currentPage !== pagination.lastPage) {
      if (bulkCallback) {
        await bulkCallback(paginationDto.page);
      }
    }
  }

  search(config: SearchParams = {} as SearchParams) {
    return this.common<SearchResponse>({
      ...config,
      method: HttpMethods.GET,
    });
  }

  bulkSearch(config: SearchParams = {} as SearchParams) {
    return this.bulkCommon<Entity>({
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

  bulkCreate(config: Omit<CreateParams, 'data'> & { data: CreateParams['data'][] }) {
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

  bulkUpdate(config: Omit<UpdateParams, 'data'> & { data: UpdateParams['data'][] }) {
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
