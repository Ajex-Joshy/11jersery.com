import axios from "axios";
import toast from "react-hot-toast";
import { env } from "../utils/env.js";

let openLoginModalCallback = null;
export const setOpenLoginModal = (callback) => {
  openLoginModalCallback = callback;
};

let clearUserStoreCallback = null;
export const setClearUserStore = (callback) => {
  clearUserStoreCallback = callback;
};

// Prevent repeated session expiration trigger
const AUTH_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
];

let isSessionExpiredHandled = false;

// Refresh queue handler variables
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Main Axios instance
const axiosInstance = axios.create({
  baseURL: env.VITE_BASE_URL,
  timeout: env.VITE_AXIOS_TIMEOUT,
  withCredentials: true,
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle blocked user (403)
    console.log("Error Response:", error.response);
    if (
      error.response?.status === 403 &&
      error.response?.data?.error?.code === "USER_BLOCKED"
    ) {
      localStorage.removeItem("token");

      if (clearUserStoreCallback) clearUserStoreCallback();

      toast.error(
        error.response?.data?.error?.message ||
          "Your account has been blocked by admin"
      );

      if (openLoginModalCallback) openLoginModalCallback();

      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh-token") &&
      !AUTH_ROUTES.some((route) => originalRequest.url.includes(route)) &&
      localStorage.getItem("token")
    ) {
      originalRequest._retry = true;

      try {
        if (!isRefreshing) {
          isRefreshing = true;

          const res = await axiosInstance.post("/auth/refresh-token");

          const newAccessToken = res.data.token;

          if (newAccessToken) {
            localStorage.setItem("token", newAccessToken);
            axiosInstance.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${newAccessToken}`;
            processQueue(null, newAccessToken);
          }

          return axiosInstance(originalRequest);
        }

        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            },
            reject: (err) => reject(err),
          });
        });
      } catch (err) {
        localStorage.removeItem("token");
        processQueue(err, null);

        if (!isSessionExpiredHandled) {
          isSessionExpiredHandled = true;
          toast.error("Session expired. Please log in again.");

          if (clearUserStoreCallback) clearUserStoreCallback();
          if (openLoginModalCallback) openLoginModalCallback();
        }

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
