import {
  // AxiosHeaders,
  // AxiosRequestHeaders,
  AxiosInstance,
  // AxiosProgressEvent,
  // AxiosRequestConfig,
  // ResponseType,
} from "axios";

export interface IApiClient extends AxiosInstance {}

export interface IHttpResponse<T> {
  data: T;
  success: boolean;
  msg: string;
}

// export interface IHttpRequestConfig {
//   headers?: AxiosRequestHeaders
//   params?: any
//   responseType?: ResponseType
//   timeout?: number
//   timeoutErrorMessage?: string
//   onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
// }
// export interface IHttpRequestConfig :AxiosRequestConfig

export interface IReqAction<T> {
  type: string;
  payload: T;
}
