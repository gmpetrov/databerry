import axios, { AxiosRequestConfig } from 'axios';

export enum HTTP_METHOD {
  POST = 'POST',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export const generateActionFetcher =
  (method: HTTP_METHOD) =>
  <T>(uri: string, { arg }: { arg: T }) =>
    axios(uri, {
      method,
      data: arg,
    }).then((r) => r.data);

export const createFetcher =
  (config: AxiosRequestConfig) =>
  <T>(url: string, { arg }: { arg: T }) =>
    axios({
      url,
      ...config,
      data: arg,
    }).then((r) => r.data);

export const fetcher = (...args: Parameters<typeof axios>) =>
  axios(...args).then((r) => r.data);
