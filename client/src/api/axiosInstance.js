import axios from "axios";

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: import.meta.env.VITE_AXIOS_TIMEOUT,
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
    // if (error.response) {
    //   if (error.response.status === 401) {
    //     localStorage.removeItem("token");
    //     window.location.href = "/login";
    //   }
    // }
    return Promise.reject(error);
  }
);

export default axiosInstance;
