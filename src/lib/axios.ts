// src/lib/axios.ts
import axios, { AxiosError } from "axios";
// import { env } from "./env";
import { ApiError } from "@/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, 
});

api.interceptors.request.use(
  (config) => {
    // In development, log every outgoing request
    // so you can see exactly what your app is calling
    if (process.env.NODE_ENV === "development") {
      console.log(`→ ${config.method?.toUpperCase()} ${config.url}`);
    }
    // FUTURE: attach auth token here if needed
    // const token = getToken()
    // if (token) config.headers.Authorization = `Bearer ${token}`

    return config;
  },
  (error) => Promise.reject(error)// pushing to tanstack query's error handling, 
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiError>) => {
    const status  = error.response?.status;
    const data    = error.response?.data;
    // Narrow the error type — ApiError.error can be string or object
    const message =
      typeof data?.error === "string"
        ? data.error
        : "Something went wrong";

    // FIX: handle timeout errors
    if (error.code === "ECONNABORTED") {
      console.error("Request timeout");
    }

    // 401 → session expired
    if (status === 401 && typeof window !== "undefined") {
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }

    // 403 → unauthorized role
    if (status === 403 && typeof window !== "undefined") {
      window.location.assign("/unauthorized");
    }

    // 429 → rate limit
    if (status === 429) {
      console.warn("Rate limited:", message);
    }

    return Promise.reject(error);
  }
);

export default api;

// Usage: apiGet<Drug[]>('/api/drugs')

export const apiGet = <T>(url: string, params?: object) =>
  api.get<T>(url, { params }).then((r) => r.data);

export const apiPost = <T>(url: string, data?: object) =>
  api.post<T>(url, data).then((r) => r.data);

export const apiPatch = <T>(url: string, data?: object) =>
  api.patch<T>(url, data).then((r) => r.data);

export const apiPut = <T>(url: string, data?: object) =>
  api.put<T>(url, data).then((r) => r.data);

export const apiDelete = <T>(url: string) =>
  api.delete<T>(url).then((r) => r.data);

// When u have to send complex payload request object then its better to use like this where u define the request and response type
// export const apiPost = <Res = unknown, Req = unknown>(
//   url: string,
//   data?: Req
// ) => api.post<Res>(url, data).then((r) => r.data);
