import axios from "axios";
import toast from "react-hot-toast";

// Callback for opening login modal
let isSessionExpiredHandled = false;

let clearUserStoreCallback = null;
export const setClearUserStore = (callback) => {
  clearUserStoreCallback = callback;
};

// Main Axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: import.meta.env.VITE_AXIOS_TIMEOUT,
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

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh-token")
    ) {
      originalRequest._retry = true;

      try {
        // Use separate axios instance to avoid recursion
        const res = await axios({
          method: "post",
          url: `${import.meta.env.VITE_BASE_URL}/auth/refresh-token`,
          withCredentials: true,
        });

        const newAccessToken = res.data.token;

        if (newAccessToken) {
          localStorage.setItem("token", newAccessToken);
          axiosInstance.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${newAccessToken}`;
        }

        return axiosInstance(originalRequest);
      } catch (err) {
        localStorage.removeItem("token");
        if (!isSessionExpiredHandled) {
          isSessionExpiredHandled = true;
          toast.error("Session expired. Please log in again.");

          if (clearUserStoreCallback) clearUserStoreCallback();
        }

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
