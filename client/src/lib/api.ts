import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    `http://${window.location.hostname}:8000/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor — attach Bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — redirect on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      // Only redirect if not already on login/signup pages
      const path = window.location.pathname;
      if (
        !path.startsWith("/login") &&
        !path.startsWith("/signup") &&
        !path.startsWith("/forgot-password")
      ) {
        window.location.href = "/login";
      }
    }
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    } else if (error.message?.includes("status code")) {
      error.message = `Something went wrong (Error ${error.response?.status || 500})`;
    }
    return Promise.reject(error);
  },
);

export default api;

