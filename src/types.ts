import { AxiosRequestConfig } from 'axios';

export type RequestConfig = Omit<AxiosRequestConfig, 'baseURL'> & {
  baseUrl?: string;
  baseUrlMap?: Record<string, string>;
  baseUrlName?: string;
  urlParts?: (number | string)[];
  urlencoded?: boolean;
  multipart?: boolean;
  xml?: boolean;
};

export type BaseRequestConfig = RequestConfig & {
  name?: string;
  debug?: boolean;
  logger?: boolean;
  bearerToken?: string;
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
