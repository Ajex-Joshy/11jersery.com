import axios from "axios";

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: "http://localhost:3000", // your backend URL
  timeout: 10000, // optional: request timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor (e.g., attach token)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // or from Redux state
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (optional: handle global errors)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // e.g., logout on 401
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
