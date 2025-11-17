import axios from "axios";

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: import.meta.env.VITE_AXIOS_TIMEOUT,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      return axiosInstance
        .post("/auth/refresh-token")
        .then((res) => {
          const newAccessToken = res.token;
          if (newAccessToken) {
            localStorage.setItem("token", newAccessToken);
            axiosInstance.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${newAccessToken}`;
          }
          return axiosInstance(originalRequest);
        })
        .catch((refreshError) => {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
