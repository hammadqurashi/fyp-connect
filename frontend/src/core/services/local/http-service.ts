import ApiClient from "@/core/lib/api-client";
import jwtService from "./jwt-service";
import { IApiClient, IHttpResponse } from "@/core/types";
// import { SIGNIN_ROUTE } from "@/core/routes";
import { AxiosRequestConfig } from "axios";
import authService from "../api/auth-service";

export class HttpService {
  httpClient: IApiClient;

  constructor() {
    this.httpClient = ApiClient;

    this.setUpInterceptors();
  }

  get<T>(url: string, config?: AxiosRequestConfig): Promise<IHttpResponse<T>> {
    return this.httpClient
      .get(url, config)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        return {
          success: false,
          msg: err.response?.msg ?? "Something went wrong!",
        };
      });
  }

  post<T>(
    url: string,
    payload?: any,
    config?: AxiosRequestConfig
  ): Promise<IHttpResponse<T>> {
    return this.httpClient
      .post(url, payload, config)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.log(err);
        return {
          success: false,
          msg: err.response?.data?.msg ?? "Something went wrong!",
        };
      });
  }

  put<T>(
    url: string,
    payload?: any,
    config?: AxiosRequestConfig
  ): Promise<IHttpResponse<T>> {
    return this.httpClient
      .put(url, payload, config)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.log(err);
        return {
          success: false,
          msg: err.response?.data?.msg ?? "Something went wrong!",
        };
      });
  }

  patch<T>(
    url: string,
    payload?: any,
    config?: AxiosRequestConfig
  ): Promise<IHttpResponse<T>> {
    return this.httpClient
      .patch(url, payload, config)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.log(err);
        return {
          success: false,
          msg: err.response?.data?.msg ?? "Something went wrong!",
        };
      });
  }

  delete<T>(url: string, config?: any): Promise<IHttpResponse<T>> {
    return this.httpClient
      .delete(url, config)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        return {
          success: false,
          msg: err.response?.data?.msg ?? "Something went wrong!",
        };
      });
  }

  setUpInterceptors() {
    this.httpClient.interceptors.request.use((config) => {
      const accessToken = jwtService.getAccessToken();

      // const url = config.url;

      // const toCheckRoutes =
      //   url.startsWith("/user") || url.startsWith("/booking");

      if (accessToken) {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
        return config;
      }

      return config;
    });

    this.httpClient.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        if (error?.response?.status === 401) {
          window.location.href = "/login";
        }
        // const originalRequest = error.config;

        // if (
        //   originalRequest.url.startsWith("/user/me") &&
        //   error?.response?.status === 401
        // ) {
        //   const hasAccessTokenError = error.response.data.data.messages.some(
        //     (msg) => msg.token_class === "AccessToken"
        //   );

        //   if (hasAccessTokenError && !originalRequest._retry) {
        //     const refreshToken = jwtService.getRefreshToken();

        //     if (!refreshToken) {
        //       window.location.href = "/login";

        //       return Promise.reject("Session expired, please login again");
        //     }

        //     originalRequest._retry = true;

        //     try {
        //       const res = await this.post<{ access: string }>(
        //         `/auth/token/refresh/`,
        //         {
        //           refresh: refreshToken,
        //         }
        //       );

        //       if (res.success && res.data?.access) {
        //         const newAccessToken = res.data.access;

        //         jwtService.updateAuthSession({
        //           accessToken: newAccessToken,
        //           refreshToken,
        //         });

        //         originalRequest.headers[
        //           "Authorization"
        //         ] = `Bearer ${newAccessToken}`;
        //       }

        //       return this.httpClient(originalRequest);
        //     } catch (refreshError) {
        //       return Promise.reject(refreshError);
        //     }
        //   }
        // }
        return Promise.reject(error);
      }
    );
  }
}

const httpService = new HttpService();

export default httpService;
