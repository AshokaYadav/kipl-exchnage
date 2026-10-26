import axios from "axios";
import { clearSession, getToken } from "@/lib/session";

export const axiosInstance = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "https://api.kiplexchange.com/",
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request Interceptor (AUTO TOKEN ADD)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor (AUTO REDIRECT ON EXPIRE)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error?.response?.status === 401) {
      // Login/verify ke time 401 aaye toh redirect mat karo, error dikhao
      const url: string = error.config?.url ?? "";
      if (!url.startsWith("/auth/")) {
        clearSession();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// API error se readable message nikalna
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; error?: string; msg?: string; err?: string }
      | undefined;

      console.log("[axios-error] response:", error.response);
      if(data?.err) return data.err;
    if (data?.error) return data.error;
    if (data?.message) return data.message;
    if (data?.msg) return data.msg;
    if (!error.response) return "Network error — server tak nahi pahunch paaye (CORS / internet check karo).";
    return `Request failed (${error.response.status})`;
  }
  if (error instanceof Error) return error.message;
  return "Kuch galat ho gaya, dobara try karo.";
}
