import { AxiosRequestConfig } from 'axios';

export type RequestConfigParams = Pick<AxiosRequestConfig, 'params' | 'data'>;

export type RequestConfig = Omit<AxiosRequestConfig, 'baseURL' | 'url'> & {
  baseUrl?: string;
  url?: number | string;
  urlParts?: (number | string)[];
  urlencoded?: boolean;
  multipart?: boolean;
};

export type BaseRequestConfig = Pick<AxiosRequestConfig, 'auth' | 'headers'> & {
  name?: string;
  baseUrl?: string;
  baseUrlMap?: Record<string, string>;
  baseUrlName?: string;
  url?: number | string;
  urlParts?: (number | string)[];
  bearerToken?: string;
  xml?: boolean;
  debug?: boolean;
  logger?: boolean;
  serializer?: {
    array?: 'indices' | 'brackets' | 'repeat' | 'comma';
  };
};

export enum HttpMethods {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
}

export enum HttpStatuses {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}
